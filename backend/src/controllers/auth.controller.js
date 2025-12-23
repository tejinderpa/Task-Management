import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.models.js";
import { AuditLog } from "../models/auditLog.models.js";
import { AUDIT_ACTIONS } from "../constants.js";
import jwt from "jsonwebtoken";

/**
 * Generate Access and Refresh Tokens
 */
const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        user.lastLogin = new Date();
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating tokens");
    }
};

/**
 * @desc    Register new user
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
const registerUser = asyncHandler(async (req, res) => {
    const { email, password, firstName, lastName, role } = req.body;

    // Validate input
    if ([email, password, firstName, lastName].some(field => !field?.trim())) {
        throw new ApiError(400, "All fields are required");
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new ApiError(409, "User with this email already exists");
    }

    // Validate password strength
    if (password.length < 8) {
        throw new ApiError(400, "Password must be at least 8 characters long");
    }

    // Create user - only admins can set roles other than 'user'
    const userData = {
        email,
        password,
        firstName,
        lastName,
        role: 'user' // Default role, can be changed by admin
    };

    const user = await User.create(userData);

    // Generate email verification token
    const verificationToken = user.generateEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    // TODO: Send verification email
    // await sendVerificationEmail(user.email, verificationToken);

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken -emailVerificationToken -passwordResetToken"
    );

    // Create audit log
    await AuditLog.createLog({
        userId: user._id,
        action: AUDIT_ACTIONS.CREATE,
        resourceType: 'User',
        resourceId: user._id,
        details: { email: user.email },
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
    });

    return res.status(201).json(
        new ApiResponse(201, {
            user: createdUser,
            message: "Registration successful. Please verify your email."
        }, "User registered successfully")
    );
});

/**
 * @desc    Login user
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError(400, "Email and password are required");
    }

    const user = await User.findOne({ email });

    if (!user) {
        throw new ApiError(401, "Invalid credentials");
    }

    if (!user.isActive) {
        throw new ApiError(403, "Your account has been deactivated. Please contact support.");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken -emailVerificationToken -passwordResetToken"
    );

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    };

    // Create audit log
    await AuditLog.createLog({
        userId: user._id,
        action: AUDIT_ACTIONS.LOGIN,
        resourceType: 'Auth',
        details: { email: user.email },
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
    });

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200, {
                user: loggedInUser,
                accessToken,
                refreshToken
            }, "Login successful")
        );
});

/**
 * @desc    Logout user
 * @route   POST /api/v1/auth/logout
 * @access  Private
 */
const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: null
            }
        },
        { new: true }
    );

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    };

    // Create audit log
    await AuditLog.createLog({
        userId: req.user._id,
        action: AUDIT_ACTIONS.LOGOUT,
        resourceType: 'Auth',
        details: { email: req.user.email },
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
    });

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, null, "Logout successful"));
});

/**
 * @desc    Refresh access token
 * @route   POST /api/v1/auth/refresh
 * @access  Public
 */
const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Refresh token is required");
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        const user = await User.findById(decodedToken?.id);

        if (!user) {
            throw new ApiError(401, "Invalid refresh token");
        }

        if (incomingRefreshToken !== user.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used");
        }

        const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshTokens(user._id);

        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        };

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(200, {
                    accessToken,
                    refreshToken: newRefreshToken
                }, "Access token refreshed successfully")
            );
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token");
    }
});

/**
 * @desc    Verify email
 * @route   POST /api/v1/auth/verify-email
 * @access  Public
 */
const verifyEmail = asyncHandler(async (req, res) => {
    const { token } = req.body;

    if (!token) {
        throw new ApiError(400, "Verification token is required");
    }

    try {
        const decoded = jwt.verify(token, process.env.EMAIL_VERIFICATION_SECRET || 'email-secret');
        
        const user = await User.findOne({
            _id: decoded.id,
            emailVerificationToken: token
        });

        if (!user) {
            throw new ApiError(400, "Invalid or expired verification token");
        }

        if (user.emailVerificationExpires < new Date()) {
            throw new ApiError(400, "Verification token has expired");
        }

        user.isEmailVerified = true;
        user.emailVerificationToken = null;
        user.emailVerificationExpires = null;
        await user.save({ validateBeforeSave: false });

        return res.status(200).json(
            new ApiResponse(200, null, "Email verified successfully")
        );
    } catch (error) {
        throw new ApiError(400, "Invalid or expired verification token");
    }
});

/**
 * @desc    Change password
 * @route   POST /api/v1/auth/change-password
 * @access  Private
 */
const changePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
        throw new ApiError(400, "Old password and new password are required");
    }

    if (newPassword.length < 8) {
        throw new ApiError(400, "New password must be at least 8 characters long");
    }

    const user = await User.findById(req.user._id);

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) {
        throw new ApiError(401, "Old password is incorrect");
    }

    user.password = newPassword;
    await user.save();

    // Create audit log
    await AuditLog.createLog({
        userId: user._id,
        action: AUDIT_ACTIONS.UPDATE,
        resourceType: 'User',
        resourceId: user._id,
        details: { action: 'password_change' },
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
    });

    return res.status(200).json(
        new ApiResponse(200, null, "Password changed successfully")
    );
});

/**
 * @desc    Get current user
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
const getCurrentUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select(
        "-password -refreshToken -emailVerificationToken -passwordResetToken"
    );

    return res.status(200).json(
        new ApiResponse(200, user, "User retrieved successfully")
    );
});

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    verifyEmail,
    changePassword,
    getCurrentUser
};

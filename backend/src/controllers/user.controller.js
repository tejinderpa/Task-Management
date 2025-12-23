import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.models.js";
import { AuditLog } from "../models/auditLog.models.js";
import { AUDIT_ACTIONS, USER_ROLES, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from "../constants.js";

/**
 * @desc    Get all users (Admin/Manager for task assignment)
 * @route   GET /api/v1/users
 * @access  Private/Admin/Manager
 */
const getAllUsers = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = DEFAULT_PAGE_SIZE,
        role,
        isActive,
        search
    } = req.query;

    const query = {};

    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (search) {
        query.$or = [
            { firstName: { $regex: search, $options: 'i' } },
            { lastName: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
        ];
    }

    const options = {
        page: parseInt(page),
        limit: Math.min(parseInt(limit), MAX_PAGE_SIZE),
        select: '-password -refreshToken -emailVerificationToken -passwordResetToken',
        sort: { createdAt: -1 }
    };

    const users = await User.find(query)
        .select(options.select)
        .sort(options.sort)
        .limit(options.limit)
        .skip((options.page - 1) * options.limit);

    const total = await User.countDocuments(query);

    return res.status(200).json(
        new ApiResponse(200, {
            users,
            pagination: {
                page: options.page,
                limit: options.limit,
                total,
                pages: Math.ceil(total / options.limit)
            }
        }, "Users retrieved successfully")
    );
});

/**
 * @desc    Get user by ID
 * @route   GET /api/v1/users/:id
 * @access  Private
 */
const getUserById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Users can only view their own profile unless they're admin/manager
    if (req.user.role === USER_ROLES.USER && req.user._id.toString() !== id) {
        throw new ApiError(403, "You don't have permission to view this user");
    }

    const user = await User.findById(id).select(
        '-password -refreshToken -emailVerificationToken -passwordResetToken'
    );

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return res.status(200).json(
        new ApiResponse(200, user, "User retrieved successfully")
    );
});

/**
 * @desc    Update user profile
 * @route   PUT /api/v1/users/:id
 * @access  Private
 */
const updateUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { firstName, lastName, email } = req.body;

    // Users can only update their own profile unless they're admin
    if (req.user.role !== USER_ROLES.ADMIN && req.user._id.toString() !== id) {
        throw new ApiError(403, "You don't have permission to update this user");
    }

    const user = await User.findById(id);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Check if email is already taken by another user
    if (email && email !== user.email) {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new ApiError(409, "Email is already in use");
        }
    }

    // Update fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email) user.email = email;

    await user.save();

    const updatedUser = await User.findById(id).select(
        '-password -refreshToken -emailVerificationToken -passwordResetToken'
    );

    // Create audit log
    await AuditLog.createLog({
        userId: req.user._id,
        action: AUDIT_ACTIONS.UPDATE,
        resourceType: 'User',
        resourceId: user._id,
        details: { updatedFields: { firstName, lastName, email } },
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
    });

    return res.status(200).json(
        new ApiResponse(200, updatedUser, "User updated successfully")
    );
});

/**
 * @desc    Update user role (Admin only)
 * @route   PATCH /api/v1/users/:id/role
 * @access  Private/Admin
 */
const updateUserRole = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;

    if (!Object.values(USER_ROLES).includes(role)) {
        throw new ApiError(400, "Invalid role");
    }

    const user = await User.findById(id);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const oldRole = user.role;
    user.role = role;
    await user.save();

    const updatedUser = await User.findById(id).select(
        '-password -refreshToken -emailVerificationToken -passwordResetToken'
    );

    // Create audit log
    await AuditLog.createLog({
        userId: req.user._id,
        action: AUDIT_ACTIONS.UPDATE,
        resourceType: 'User',
        resourceId: user._id,
        details: { oldRole, newRole: role },
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
    });

    return res.status(200).json(
        new ApiResponse(200, updatedUser, "User role updated successfully")
    );
});

/**
 * @desc    Deactivate/Activate user (Admin only)
 * @route   PATCH /api/v1/users/:id/status
 * @access  Private/Admin
 */
const updateUserStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
        throw new ApiError(400, "isActive must be a boolean");
    }

    const user = await User.findById(id);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Prevent admin from deactivating themselves
    if (req.user._id.toString() === id && !isActive) {
        throw new ApiError(400, "You cannot deactivate your own account");
    }

    user.isActive = isActive;
    await user.save();

    const updatedUser = await User.findById(id).select(
        '-password -refreshToken -emailVerificationToken -passwordResetToken'
    );

    // Create audit log
    await AuditLog.createLog({
        userId: req.user._id,
        action: AUDIT_ACTIONS.UPDATE,
        resourceType: 'User',
        resourceId: user._id,
        details: { action: isActive ? 'activate' : 'deactivate' },
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
    });

    return res.status(200).json(
        new ApiResponse(200, updatedUser, `User ${isActive ? 'activated' : 'deactivated'} successfully`)
    );
});

/**
 * @desc    Update user avatar
 * @route   PATCH /api/v1/users/:id/avatar
 * @access  Private
 */
const updateAvatar = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Users can only update their own avatar unless they're admin
    if (req.user.role !== USER_ROLES.ADMIN && req.user._id.toString() !== id) {
        throw new ApiError(403, "You don't have permission to update this user's avatar");
    }

    if (!req.file) {
        throw new ApiError(400, "Avatar file is required");
    }

    const user = await User.findById(id);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Store the file path (in production, you'd upload to Cloudinary here)
    const avatarUrl = `/temp/${req.file.filename}`;
    user.avatar = avatarUrl;
    await user.save();

    const updatedUser = await User.findById(id).select(
        '-password -refreshToken -emailVerificationToken -passwordResetToken'
    );

    return res.status(200).json(
        new ApiResponse(200, updatedUser, "Avatar updated successfully")
    );
});

/**
 * @desc    Get user activity logs
 * @route   GET /api/v1/users/:id/activity
 * @access  Private
 */
const getUserActivity = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { page = 1, limit = DEFAULT_PAGE_SIZE } = req.query;

    // Users can only view their own activity unless they're admin/manager
    if (req.user.role === USER_ROLES.USER && req.user._id.toString() !== id) {
        throw new ApiError(403, "You don't have permission to view this user's activity");
    }

    const user = await User.findById(id);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const activities = await AuditLog.find({ userId: id })
        .sort({ timestamp: -1 })
        .limit(parseInt(limit))
        .skip(skip)
        .populate('resourceId');

    const total = await AuditLog.countDocuments({ userId: id });

    return res.status(200).json(
        new ApiResponse(200, {
            activities,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        }, "User activity retrieved successfully")
    );
});

export {
    getAllUsers,
    getUserById,
    updateUser,
    updateUserRole,
    updateUserStatus,
    getUserActivity,
    updateAvatar
};

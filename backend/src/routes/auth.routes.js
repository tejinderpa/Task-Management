import { Router } from "express";
import {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    verifyEmail,
    changePassword,
    getCurrentUser
} from "../controllers/auth.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    registerValidation,
    loginValidation,
    changePasswordValidation
} from "../middlewares/validation.middleware.js";
import { authLimiter } from "../middlewares/rateLimiter.middleware.js";

const router = Router();

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register new user
 * @access  Public
 */
router.route("/register")
    .post(authLimiter, registerValidation, registerUser);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login user
 * @access  Public
 */
router.route("/login")
    .post(authLimiter, loginValidation, loginUser);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.route("/logout")
    .post(verifyJWT, logoutUser);

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.route("/refresh")
    .post(refreshAccessToken);

/**
 * @route   POST /api/v1/auth/verify-email
 * @desc    Verify user email
 * @access  Public
 */
router.route("/verify-email")
    .post(verifyEmail);

/**
 * @route   POST /api/v1/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.route("/change-password")
    .post(verifyJWT, changePasswordValidation, changePassword);

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current user
 * @access  Private
 */
router.route("/me")
    .get(verifyJWT, getCurrentUser);

export default router;

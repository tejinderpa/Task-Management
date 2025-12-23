import { Router } from "express";
import {
    getAllUsers,
    getUserById,
    updateUser,
    updateUserRole,
    updateUserStatus,
    getUserActivity,
    updateAvatar
} from "../controllers/user.controller.js";
import { verifyJWT, isAdmin, isAdminOrManager } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
    updateUserValidation,
    updateUserRoleValidation,
    updateUserStatusValidation,
    userIdValidation,
    paginationValidation
} from "../middlewares/validation.middleware.js";

const router = Router();

// All user routes require authentication
router.use(verifyJWT);

/**
 * @route   GET /api/v1/users
 * @desc    Get all users (Admin/Manager for assignment dropdown)
 * @access  Private/Admin/Manager
 */
router.route("/")
    .get(isAdminOrManager, paginationValidation, getAllUsers);

/**
 * @route   GET /api/v1/users/:id
 * @desc    Get user by ID
 * @access  Private
 */
router.route("/:id")
    .get(userIdValidation, getUserById)
    .put(updateUserValidation, updateUser)
    .patch(updateUserValidation, updateUser);

/**
 * @route   PATCH /api/v1/users/:id/avatar
 * @desc    Update user avatar
 * @access  Private
 */
router.route("/:id/avatar")
    .patch(upload.single("avatar"), updateAvatar);

/**
 * @route   PATCH /api/v1/users/:id/role
 * @desc    Update user role (Admin only)
 * @access  Private/Admin
 */
router.route("/:id/role")
    .patch(isAdmin, updateUserRoleValidation, updateUserRole);

/**
 * @route   PATCH /api/v1/users/:id/status
 * @desc    Activate/Deactivate user (Admin only)
 * @access  Private/Admin
 */
router.route("/:id/status")
    .patch(isAdmin, updateUserStatusValidation, updateUserStatus);

/**
 * @route   GET /api/v1/users/:id/activity
 * @desc    Get user activity logs
 * @access  Private
 */
router.route("/:id/activity")
    .get(paginationValidation, getUserActivity);

export default router;
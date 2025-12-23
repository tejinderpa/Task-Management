import { Router } from "express";
import {
    getTasks,
    getTaskById,
    createTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
    getTaskStats
} from "../controllers/task.controller.js";
import { verifyJWT, isAdminOrManager } from "../middlewares/auth.middleware.js";
import {
    createTaskValidation,
    updateTaskValidation,
    updateTaskStatusValidation,
    taskIdValidation,
    paginationValidation
} from "../middlewares/validation.middleware.js";
import { createTaskLimiter } from "../middlewares/rateLimiter.middleware.js";

const router = Router();

// All task routes require authentication
router.use(verifyJWT);

/**
 * @route   GET /api/v1/tasks
 * @desc    Get all tasks with filtering and pagination
 * @access  Private
 */
router.route("/")
    .get(paginationValidation, getTasks)
    .post(createTaskLimiter, createTaskValidation, createTask);

/**
 * @route   GET /api/v1/tasks/stats
 * @desc    Get task statistics
 * @access  Private
 */
router.route("/stats")
    .get(getTaskStats);

/**
 * @route   GET /api/v1/tasks/:id
 * @desc    Get single task, update task, delete task
 * @access  Private
 */
router.route("/:id")
    .get(taskIdValidation, getTaskById)
    .put(updateTaskValidation, updateTask)
    .delete(taskIdValidation, deleteTask);

/**
 * @route   PATCH /api/v1/tasks/:id/status
 * @desc    Update task status
 * @access  Private
 */
router.route("/:id/status")
    .patch(updateTaskStatusValidation, updateTaskStatus);

export default router;

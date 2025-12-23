import { body, param, query, validationResult } from 'express-validator';
import { ApiError } from '../utils/ApiError.js';
import { TASK_STATUS, TASK_PRIORITY, USER_ROLES } from '../constants.js';

/**
 * Middleware to handle validation errors
 */
export const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(err => err.msg).join(', ');
        throw new ApiError(400, errorMessages);
    }
    next();
};

/**
 * Auth validation rules
 */
export const registerValidation = [
    body('email')
        .isEmail()
        .withMessage('Please provide a valid email')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    body('firstName')
        .trim()
        .notEmpty()
        .withMessage('First name is required')
        .isLength({ max: 50 })
        .withMessage('First name cannot exceed 50 characters'),
    body('lastName')
        .trim()
        .notEmpty()
        .withMessage('Last name is required')
        .isLength({ max: 50 })
        .withMessage('Last name cannot exceed 50 characters'),
    handleValidationErrors
];

export const loginValidation = [
    body('email')
        .isEmail()
        .withMessage('Please provide a valid email')
        .normalizeEmail(),
    body('password')
        .notEmpty()
        .withMessage('Password is required'),
    handleValidationErrors
];

export const changePasswordValidation = [
    body('oldPassword')
        .notEmpty()
        .withMessage('Old password is required'),
    body('newPassword')
        .isLength({ min: 8 })
        .withMessage('New password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    handleValidationErrors
];

/**
 * Task validation rules
 */
export const createTaskValidation = [
    body('title')
        .trim()
        .notEmpty()
        .withMessage('Task title is required')
        .isLength({ max: 200 })
        .withMessage('Title cannot exceed 200 characters'),
    body('description')
        .trim()
        .notEmpty()
        .withMessage('Task description is required')
        .isLength({ max: 2000 })
        .withMessage('Description cannot exceed 2000 characters'),
    body('priority')
        .optional()
        .isIn(Object.values(TASK_PRIORITY))
        .withMessage('Invalid priority value'),
    body('dueDate')
        .notEmpty()
        .withMessage('Due date is required')
        .isISO8601()
        .withMessage('Invalid date format')
        .custom((value) => {
            if (new Date(value) < new Date()) {
                throw new Error('Due date cannot be in the past');
            }
            return true;
        }),
    body('assignedTo')
        .optional()
        .isMongoId()
        .withMessage('Invalid user ID'),
    body('tags')
        .optional()
        .isArray()
        .withMessage('Tags must be an array'),
    handleValidationErrors
];

export const updateTaskValidation = [
    param('id')
        .isMongoId()
        .withMessage('Invalid task ID'),
    body('title')
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage('Title cannot exceed 200 characters'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 2000 })
        .withMessage('Description cannot exceed 2000 characters'),
    body('priority')
        .optional()
        .isIn(Object.values(TASK_PRIORITY))
        .withMessage('Invalid priority value'),
    body('dueDate')
        .optional()
        .isISO8601()
        .withMessage('Invalid date format'),
    body('assignedTo')
        .optional()
        .isMongoId()
        .withMessage('Invalid user ID'),
    body('tags')
        .optional()
        .isArray()
        .withMessage('Tags must be an array'),
    handleValidationErrors
];

export const updateTaskStatusValidation = [
    param('id')
        .isMongoId()
        .withMessage('Invalid task ID'),
    body('status')
        .notEmpty()
        .withMessage('Status is required')
        .isIn(Object.values(TASK_STATUS))
        .withMessage('Invalid status value'),
    handleValidationErrors
];

export const taskIdValidation = [
    param('id')
        .isMongoId()
        .withMessage('Invalid task ID'),
    handleValidationErrors
];

/**
 * User validation rules
 */
export const updateUserValidation = [
    param('id')
        .isMongoId()
        .withMessage('Invalid user ID'),
    body('firstName')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('First name cannot exceed 50 characters'),
    body('lastName')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('Last name cannot exceed 50 characters'),
    body('email')
        .optional()
        .isEmail()
        .withMessage('Please provide a valid email')
        .normalizeEmail(),
    handleValidationErrors
];

export const updateUserRoleValidation = [
    param('id')
        .isMongoId()
        .withMessage('Invalid user ID'),
    body('role')
        .notEmpty()
        .withMessage('Role is required')
        .isIn(Object.values(USER_ROLES))
        .withMessage('Invalid role value'),
    handleValidationErrors
];

export const updateUserStatusValidation = [
    param('id')
        .isMongoId()
        .withMessage('Invalid user ID'),
    body('isActive')
        .isBoolean()
        .withMessage('isActive must be a boolean'),
    handleValidationErrors
];

export const userIdValidation = [
    param('id')
        .isMongoId()
        .withMessage('Invalid user ID'),
    handleValidationErrors
];

/**
 * Query validation rules
 */
export const paginationValidation = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
    handleValidationErrors
];

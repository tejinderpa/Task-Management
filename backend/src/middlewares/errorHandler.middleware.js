import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

/**
 * Global error handler middleware
 */
export const errorHandler = (err, req, res, next) => {
    let error = err;

    // Handle Mongoose validation errors
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message).join(', ');
        error = new ApiError(400, message);
    }

    // Handle Mongoose duplicate key errors
    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0];
        const message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
        error = new ApiError(409, message);
    }

    // Handle Mongoose cast errors
    if (err.name === 'CastError') {
        const message = `Invalid ${err.path}: ${err.value}`;
        error = new ApiError(400, message);
    }

    // Handle JWT errors
    if (err.name === 'JsonWebTokenError') {
        error = new ApiError(401, 'Invalid token');
    }

    if (err.name === 'TokenExpiredError') {
        error = new ApiError(401, 'Token expired');
    }

    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';

    // Log error for debugging (in production, use proper logging service)
    if (process.env.NODE_ENV === 'development') {
        console.error('Error:', {
            statusCode,
            message,
            stack: err.stack,
            errors: error.errors
        });
    }

    res.status(statusCode).json(
        new ApiResponse(
            statusCode,
            null,
            message,
            error.errors || []
        )
    );
};

/**
 * Handle 404 errors
 */
export const notFound = (req, res, next) => {
    const error = new ApiError(404, `Route not found: ${req.originalUrl}`);
    next(error);
};

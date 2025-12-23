import rateLimit from 'express-rate-limit';
import { ApiError } from '../utils/ApiError.js';

/**
 * General API rate limiter - 500 requests per 15 minutes (increased for development)
 */
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        throw new ApiError(429, 'Too many requests from this IP, please try again later.');
    }
});

/**
 * Strict rate limiter for auth endpoints - 20 requests per 15 minutes (increased for development)
 */
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20,
    message: 'Too many authentication attempts, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    handler: (req, res) => {
        throw new ApiError(429, 'Too many authentication attempts, please try again later.');
    }
});

/**
 * Moderate rate limiter for task creation - 100 per hour (increased for development)
 */
export const createTaskLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 100,
    message: 'Too many tasks created, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        throw new ApiError(429, 'Too many tasks created, please try again later.');
    }
});

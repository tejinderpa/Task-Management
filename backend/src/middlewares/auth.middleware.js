import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import jwt from "jsonwebtoken"
import { User } from "../models/user.models.js"
import { USER_ROLES } from "../constants.js"

/**
 * Verify JWT token and attach user to request
 */
export const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")

        if (!token) {
            throw new ApiError(401, "Unauthorized - No token provided")
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findById(decodedToken?.id).select("-password -refreshToken")

        if (!user) {
            throw new ApiError(401, "Invalid access token")
        }

        if (!user.isActive) {
            throw new ApiError(403, "Your account has been deactivated")
        }

        req.user = user;
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")
    }
})

/**
 * Check if user is admin
 */
export const isAdmin = asyncHandler(async (req, res, next) => {
    if (req.user.role !== USER_ROLES.ADMIN) {
        throw new ApiError(403, "Access denied. Admin privileges required.")
    }
    next()
})

/**
 * Check if user is admin or manager
 */
export const isAdminOrManager = asyncHandler(async (req, res, next) => {
    if (req.user.role !== USER_ROLES.ADMIN && req.user.role !== USER_ROLES.MANAGER) {
        throw new ApiError(403, "Access denied. Admin or Manager privileges required.")
    }
    next()
})

/**
 * Check if user has specific roles
 */
export const hasRole = (...roles) => {
    return asyncHandler(async (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            throw new ApiError(403, `Access denied. Required roles: ${roles.join(', ')}`)
        }
        next()
    })
}
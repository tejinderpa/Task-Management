import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import helmet from "helmet"
import morgan from "morgan"
import { errorHandler, notFound } from "./middlewares/errorHandler.middleware.js"
import { apiLimiter } from "./middlewares/rateLimiter.middleware.js"

const app = express()

// Security middleware
app.use(helmet())

// CORS configuration
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}))

// Request logging in development
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}

// Body parsing middleware
app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static("public"))
app.use(cookieParser())

// Apply rate limiting to all API routes
app.use('/api/', apiLimiter)

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString()
    })
})

// API routes
import authRouter from "./routes/auth.routes.js"
import taskRouter from "./routes/task.routes.js"
import userRouter from "./routes/user.routes.js"

app.use("/api/v1/auth", authRouter)
app.use("/api/v1/tasks", taskRouter)
app.use("/api/v1/users", userRouter)

// 404 handler
app.use(notFound)

// Global error handler
app.use(errorHandler)

export default app;

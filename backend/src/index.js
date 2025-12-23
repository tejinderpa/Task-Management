import dotenv from "dotenv"
import connectDB from "./db/index.js"
import app from "./app.js"
import logger from "./utils/logger.js"
import { startEmailJobs } from "./jobs/emailNotifications.job.js"

// Load environment variables
dotenv.config({
    path: '../.env'
})

// Verify critical environment variables
const requiredEnvVars = [
    'PORT',
    'MONGODB_URI',
    'ACCESS_TOKEN_SECRET',
    'REFRESH_TOKEN_SECRET'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
    logger.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
    process.exit(1);
}

// Connect to database and start server
connectDB()
    .then(() => {
        const PORT = process.env.PORT || 8000;
        
        app.on("error", (error) => {
            logger.error("Express app error:", error);
            throw error;
        });

        app.listen(PORT, () => {
            logger.info(`✅ Server is running on PORT: ${PORT}`);
            logger.info(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
            logger.info(`✅ Health check: http://localhost:${PORT}/health`);
            
            // Start email notification jobs (disabled by default in development)
            startEmailJobs();
        });
    })
    .catch((err) => {
        logger.error("MongoDB connection failed:", err);
        process.exit(1);
    });

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    logger.error('Unhandled Promise Rejection:', err);
    process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception:', err);
    process.exit(1);
}); 

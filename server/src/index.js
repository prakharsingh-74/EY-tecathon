import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { checkDatabaseConnection } from './config/database.js';
import { checkN8nConnection } from './config/n8n.js';
import logger from './utils/logger.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimiter.js';

// Import routes
import authRoutes from './routes/auth.js';
import rfpRoutes from './routes/rfps.js';
import agentRoutes from './routes/agents.js';
import reportRoutes from './routes/reports.js';
import settingsRoutes from './routes/settings.js';
import webhookRoutes from './routes/webhooks.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply rate limiting to all API routes
app.use('/api', apiLimiter);

// Health check endpoint
app.get('/api/health', async (req, res) => {
    const dbHealth = await checkDatabaseConnection();
    const n8nHealth = await checkN8nConnection();

    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: dbHealth ? 'Connected' : 'Disconnected',
        n8n: n8nHealth ? 'Connected' : 'Disconnected',
        environment: process.env.NODE_ENV || 'development'
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/rfps', rfpRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/settings', settingsRoutes);

// Webhook routes (no auth required)
app.use('/api/webhooks', webhookRoutes);

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'AI-Powered RFP Automation Dashboard API',
        version: '1.0.0',
        documentation: '/api/docs',
        endpoints: {
            health: 'GET /api/health',
            auth: {
                register: 'POST /api/auth/register',
                login: 'POST /api/auth/login',
                me: 'GET /api/auth/me',
                logout: 'POST /api/auth/logout'
            },
            rfps: {
                list: 'GET /api/rfps',
                get: 'GET /api/rfps/:id',
                create: 'POST /api/rfps',
                update: 'PUT /api/rfps/:id',
                delete: 'DELETE /api/rfps/:id'
            },
            agents: {
                list: 'GET /api/agents',
                get: 'GET /api/agents/:id',
                tasks: 'GET /api/agents/:id/tasks',
                execute: 'POST /api/agents/:id/execute'
            },
            reports: {
                list: 'GET /api/reports',
                get: 'GET /api/reports/:id',
                create: 'POST /api/reports',
                update: 'PUT /api/reports/:id'
            },
            settings: {
                get: 'GET /api/settings',
                update: 'PUT /api/settings',
                webhook: 'POST /api/settings/webhooks'
            }
        }
    });
});

// 404 handler
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

// Start server
async function startServer() {
    try {
        // Check database connection
        logger.info('Checking database connection...');
        const dbConnected = await checkDatabaseConnection();

        if (!dbConnected) {
            logger.warn('⚠️  Database connection failed, but server will start anyway');
        }

        // Check n8n connection
        logger.info('Checking n8n connection...');
        const n8nConnected = await checkN8nConnection();

        if (!n8nConnected) {
            logger.warn('⚠️  n8n connection failed. Agent workflows will not work.');
            logger.info('ℹ️  To enable n8n: cd server/n8n && docker-compose up -d');
        }

        // Start listening
        app.listen(PORT, () => {
            logger.info(`🚀 Server running on http://localhost:${PORT}`);
            logger.info(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
            logger.info(`🔗 CORS enabled for: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}`);
            logger.info(`\n📚 API Documentation: http://localhost:${PORT}/`);
            logger.info(`💚 Health Check: http://localhost:${PORT}/api/health\n`);
        });

    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down gracefully...');
    process.exit(0);
});

// Start the server
startServer();

export default app;

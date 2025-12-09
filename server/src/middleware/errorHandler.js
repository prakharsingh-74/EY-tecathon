import logger from '../utils/logger.js';

/**
 * Global error handler middleware
 */
export function errorHandler(err, req, res, next) {
    // Log the error
    logger.error('Error occurred:', {
        message: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method
    });

    // Handle specific error types
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            error: 'Validation Error',
            message: err.message,
            details: err.details || []
        });
    }

    if (err.name === 'UnauthorizedError') {
        return res.status(401).json({
            error: 'Unauthorized',
            message: err.message || 'Authentication required'
        });
    }

    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
            error: 'File Too Large',
            message: 'The uploaded file exceeds the maximum allowed size.'
        });
    }

    // Default error response
    const statusCode = err.statusCode || 500;
    const message = process.env.NODE_ENV === 'production'
        ? 'An internal server error occurred'
        : err.message;

    res.status(statusCode).json({
        error: statusCode === 500 ? 'Internal Server Error' : err.name || 'Error',
        message: message,
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    });
}

/**
 * 404 handler for undefined routes
 */
export function notFoundHandler(req, res) {
    res.status(404).json({
        error: 'Not Found',
        message: `Cannot ${req.method} ${req.path}`,
        availableEndpoints: [
            'GET /api/health',
            'POST /api/auth/register',
            'POST /api/auth/login',
            'GET /api/auth/me',
            'GET /api/rfps',
            'GET /api/agents',
            'GET /api/reports',
            'GET /api/settings'
        ]
    });
}

export default { errorHandler, notFoundHandler };

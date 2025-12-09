import rateLimit from 'express-rate-limit';

// Rate limiter for authentication endpoints
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per window
    message: {
        error: 'Too Many Requests',
        message: 'Too many authentication attempts. Please try again in 15 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Rate limiter for general API endpoints
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message: {
        error: 'Too Many Requests',
        message: 'Too many requests. Please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

export default { authLimiter, apiLimiter };

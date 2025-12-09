import jwt from 'jsonwebtoken';
import logger from '../utils/logger.js';

/**
 * Authentication middleware - verifies JWT token
 */
export function authenticate(req, res, next) {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'No token provided. Please include a valid authentication token.'
            });
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach user info to request object
        req.user = {
            id: decoded.userId,
            email: decoded.email,
            role: decoded.role
        };

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Invalid token. Please login again.'
            });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Token expired. Please login again.'
            });
        }

        logger.error('Authentication error:', error);
        return res.status(500).json({
            error: 'Internal Server Error',
            message: 'An error occurred during authentication.'
        });
    }
}

/**
 * Optional authentication - attaches user if token is valid, continues otherwise
 */
export function optionalAuth(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = {
                id: decoded.userId,
                email: decoded.email,
                role: decoded.role
            };
        }
    } catch (error) {
        // Silently fail for optional auth
        logger.debug('Optional auth failed:', error.message);
    }

    next();
}

export default { authenticate, optionalAuth };

import express from 'express';
import { register, login, getCurrentUser, logout } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Public routes (with rate limiting)
router.post('/register', authLimiter, validate(schemas.register), register);
router.post('/login', authLimiter, validate(schemas.login), login);

// Protected routes
router.get('/me', authenticate, getCurrentUser);
router.post('/logout', authenticate, logout);

export default router;

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import supabase from '../config/database.js';
import logger from '../utils/logger.js';

/**
 * Register a new user
 */
export async function register(req, res, next) {
    try {
        const { email, password, name } = req.validatedBody;

        // Check if user already exists
        const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .single();

        if (existingUser) {
            return res.status(409).json({
                error: 'Conflict',
                message: 'User with this email already exists'
            });
        }

        // Hash password
        const password_hash = await bcrypt.hash(password, 10);

        // Create user
        const { data: newUser, error } = await supabase
            .from('users')
            .insert({
                email,
                password_hash,
                name,
                role: 'user'
            })
            .select('id, email, name, role, created_at')
            .single();

        if (error) {
            logger.error('Error creating user:', error);
            throw error;
        }

        // Create default user settings
        await supabase.from('user_settings').insert({
            user_id: newUser.id,
            rfp_source_urls: ['thomasnet.com', 'alibaba.com', 'made-in-china.com', 'globalspec.com'],
            auto_scan_enabled: true,
            scan_interval_hours: 6,
            match_threshold: 70,
            auto_response_enabled: false
        });

        // Generate JWT token
        const token = jwt.sign(
            {
                userId: newUser.id,
                email: newUser.email,
                role: newUser.role
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        logger.info(`New user registered: ${email}`);

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: newUser.id,
                email: newUser.email,
                name: newUser.name,
                role: newUser.role
            }
        });

    } catch (error) {
        next(error);
    }
}

/**
 * Login user
 */
export async function login(req, res, next) {
    try {
        const { email, password } = req.validatedBody;

        // Find user
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (error || !user) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Invalid email or password'
            });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);

        if (!isValidPassword) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Invalid email or password'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                userId: user.id,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        logger.info(`User logged in: ${email}`);

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        });

    } catch (error) {
        next(error);
    }
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser(req, res, next) {
    try {
        const { data: user, error } = await supabase
            .from('users')
            .select('id, email, name, role, created_at')
            .eq('id', req.user.id)
            .single();

        if (error || !user) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'User not found'
            });
        }

        res.json({
            user
        });

    } catch (error) {
        next(error);
    }
}

/**
 * Logout (client-side primarily, but we can log it)
 */
export async function logout(req, res) {
    logger.info(`User logged out: ${req.user.email}`);

    res.json({
        message: 'Logout successful'
    });
}

export default { register, login, getCurrentUser, logout };

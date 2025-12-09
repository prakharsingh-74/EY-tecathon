import { z } from 'zod';

/**
 * Validation middleware factory
 * @param {z.ZodSchema} schema - Zod schema to validate against
 * @param {string} source - Where to get data from: 'body', 'query', 'params'
 */
export function validate(schema, source = 'body') {
    return (req, res, next) => {
        try {
            const data = req[source];
            const validated = schema.parse(data);
            req[`validated${source.charAt(0).toUpperCase() + source.slice(1)}`] = validated;
            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    error: 'Validation Error',
                    message: 'Invalid request data',
                    details: error.errors.map(err => ({
                        field: err.path.join('.'),
                        message: err.message
                    }))
                });
            }
            next(error);
        }
    };
}

// Common validation schemas
export const schemas = {
    // Auth schemas
    register: z.object({
        email: z.string().email('Invalid email address'),
        password: z.string().min(6, 'Password must be at least 6 characters'),
        name: z.string().min(1, 'Name is required')
    }),

    login: z.object({
        email: z.string().email('Invalid email address'),
        password: z.string().min(1, 'Password is required')
    }),

    // RFP schemas
    createRFP: z.object({
        title: z.string().min(1, 'Title is required'),
        source: z.string().optional(),
        source_url: z.string().url().optional(),
        submission_date: z.string().optional()
    }),

    updateRFP: z.object({
        title: z.string().optional(),
        status: z.enum(['pending', 'processed', 'submitted']).optional(),
        match_score: z.number().min(0).max(100).optional()
    }),

    // Settings schema
    updateSettings: z.object({
        rfp_source_urls: z.array(z.string()).optional(),
        auto_scan_enabled: z.boolean().optional(),
        scan_interval_hours: z.number().min(1).optional(),
        webhook_url: z.string().url().optional().or(z.literal('')),
        match_threshold: z.number().min(0).max(100).optional(),
        auto_response_enabled: z.boolean().optional()
    }),

    // UUID param validation
    uuidParam: z.object({
        id: z.string().uuid('Invalid ID format')
    }),

    // Pagination query
    pagination: z.object({
        page: z.string().regex(/^\d+$/).optional().transform(val => val ? parseInt(val) : 1),
        limit: z.string().regex(/^\d+$/).optional().transform(val => val ? parseInt(val) : 20),
        sort: z.string().optional(),
        order: z.enum(['asc', 'desc']).optional()
    })
};

export default { validate, schemas };

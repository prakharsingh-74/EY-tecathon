import supabase from '../config/database.js';
import logger from '../utils/logger.js';

/**
 * Get all RFPs with filtering, search, sorting, and pagination
 */
export async function getAllRFPs(req, res, next) {
    try {
        const { page = 1, limit = 20, status, search, sort = 'detected_date', order = 'desc' } = req.query;
        const userId = req.user.id;

        // Build query
        let query = supabase
            .from('rfps')
            .select('*', { count: 'exact' })
            .eq('user_id', userId);

        // Apply filters
        if (status && status !== 'all') {
            query = query.eq('status', status);
        }

        if (search) {
            query = query.ilike('title', `%${search}%`);
        }

        // Apply sorting
        query = query.order(sort, { ascending: order === 'asc' });

        // Apply pagination
        const from = (page - 1) * limit;
        const to = from + limit - 1;
        query = query.range(from, to);

        const { data: rfps, error, count } = await query;

        if (error) {
            logger.error('Error fetching RFPs:', error);
            throw error;
        }

        res.json({
            rfps,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: count,
                totalPages: Math.ceil(count / limit)
            }
        });

    } catch (error) {
        next(error);
    }
}

/**
 * Get single RFP by ID
 */
export async function getRFPById(req, res, next) {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const { data: rfp, error } = await supabase
            .from('rfps')
            .select('*')
            .eq('id', id)
            .eq('user_id', userId)
            .single();

        if (error || !rfp) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'RFP not found'
            });
        }

        res.json({ rfp });

    } catch (error) {
        next(error);
    }
}

/**
 * Create new RFP
 */
export async function createRFP(req, res, next) {
    try {
        const userId = req.user.id;
        const rfpData = {
            user_id: userId,
            ...req.validatedBody,
            detected_date: new Date().toISOString(),
            status: 'pending',
            match_score: 0,
            specs: [],
            products: [],
            pricing: {}
        };

        // If file was uploaded
        if (req.file) {
            rfpData.file_path = req.file.path;
            // TODO: Extract content from file (PDF/DOCX parsing)
        }

        const { data: rfp, error } = await supabase
            .from('rfps')
            .insert(rfpData)
            .select()
            .single();

        if (error) {
            logger.error('Error creating RFP:', error);
            throw error;
        }

        logger.info(`RFP created: ${rfp.id}`);

        res.status(201).json({
            message: 'RFP created successfully',
            rfp
        });

    } catch (error) {
        next(error);
    }
}

/**
 * Update RFP
 */
export async function updateRFP(req, res, next) {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const updates = req.validatedBody;

        // Verify RFP belongs to user
        const { data: existing } = await supabase
            .from('rfps')
            .select('id')
            .eq('id', id)
            .eq('user_id', userId)
            .single();

        if (!existing) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'RFP not found'
            });
        }

        const { data: rfp, error } = await supabase
            .from('rfps')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            logger.error('Error updating RFP:', error);
            throw error;
        }

        logger.info(`RFP updated: ${id}`);

        res.json({
            message: 'RFP updated successfully',
            rfp
        });

    } catch (error) {
        next(error);
    }
}

/**
 * Delete RFP
 */
export async function deleteRFP(req, res, next) {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Verify RFP belongs to user
        const { data: existing } = await supabase
            .from('rfps')
            .select('id')
            .eq('id', id)
            .eq('user_id', userId)
            .single();

        if (!existing) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'RFP not found'
            });
        }

        const { error } = await supabase
            .from('rfps')
            .delete()
            .eq('id', id);

        if (error) {
            logger.error('Error deleting RFP:', error);
            throw error;
        }

        logger.info(`RFP deleted: ${id}`);

        res.json({
            message: 'RFP deleted successfully'
        });

    } catch (error) {
        next(error);
    }
}

export default {
    getAllRFPs,
    getRFPById,
    createRFP,
    updateRFP,
    deleteRFP
};

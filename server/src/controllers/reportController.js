import supabase from '../config/database.js';
import logger from '../utils/logger.js';

/**
 * Get all reports
 */
export async function getAllReports(req, res, next) {
    try {
        const { page = 1, limit = 20 } = req.query;
        const userId = req.user.id;

        const from = (page - 1) * limit;
        const to = from + limit - 1;

        const { data: reports, error, count } = await supabase
            .from('reports')
            .select('*, rfps(title)', { count: 'exact' })
            .eq('user_id', userId)
            .order('generated_at', { ascending: false })
            .range(from, to);

        if (error) {
            logger.error('Error fetching reports:', error);
            throw error;
        }

        res.json({
            reports,
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
 * Get report by ID
 */
export async function getReportById(req, res, next) {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const { data: report, error } = await supabase
            .from('reports')
            .select('*, rfps(title, source, submission_date)')
            .eq('id', id)
            .eq('user_id', userId)
            .single();

        if (error || !report) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Report not found'
            });
        }

        res.json({ report });

    } catch (error) {
        next(error);
    }
}

/**
 * Create/generate a new report from RFP analysis
 */
export async function createReport(req, res, next) {
    try {
        const userId = req.user.id;
        const { rfp_id, content, summary } = req.body;

        if (!rfp_id) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'rfp_id is required'
            });
        }

        // Verify RFP exists and belongs to user
        const { data: rfp } = await supabase
            .from('rfps')
            .select('*')
            .eq('id', rfp_id)
            .eq('user_id', userId)
            .single();

        if (!rfp) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'RFP not found or access denied'
            });
        }

        // Create report
        const reportData = {
            rfp_id,
            user_id: userId,
            rfp_name: `${rfp.title} Response`,
            content: content || `Detailed RFP response for ${rfp.title}`,
            summary: summary || {
                clientName: rfp.source || 'Unknown Client',
                totalValue: rfp.pricing?.totalPrice || 0,
                products: rfp.products?.map(p => `${p.sku}: ${p.name}`) || [],
                deliveryTimeline: rfp.pricing?.leadTime || 'TBD',
                keyHighlights: []
            },
            match_score: rfp.match_score,
            status: 'completed'
        };

        const { data: report, error } = await supabase
            .from('reports')
            .insert(reportData)
            .select()
            .single();

        if (error) {
            logger.error('Error creating report:', error);
            throw error;
        }

        logger.info(`Report generated: ${report.id} for RFP ${rfp.title}`);

        res.status(201).json({
            message: 'Report generated successfully',
            report
        });

    } catch (error) {
        next(error);
    }
}

/**
 * Update report
 */
export async function updateReport(req, res, next) {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const updates = req.body;

        // Verify report belongs to user
        const { data: existing } = await supabase
            .from('reports')
            .select('id')
            .eq('id', id)
            .eq('user_id', userId)
            .single();

        if (!existing) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Report not found'
            });
        }

        const { data: report, error } = await supabase
            .from('reports')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            logger.error('Error updating report:', error);
            throw error;
        }

        logger.info(`Report updated: ${id}`);

        res.json({
            message: 'Report updated successfully',
            report
        });

    } catch (error) {
        next(error);
    }
}

export default {
    getAllReports,
    getReportById,
    createReport,
    updateReport
};

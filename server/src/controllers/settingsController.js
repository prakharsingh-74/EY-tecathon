import supabase from '../config/database.js';
import logger from '../utils/logger.js';

/**
 * Get user settings
 */
export async function getSettings(req, res, next) {
    try {
        const userId = req.user.id;

        const { data: settings, error } = await supabase
            .from('user_settings')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
            logger.error('Error fetching settings:', error);
            throw error;
        }

        // If no settings exist, create default settings
        if (!settings) {
            const defaultSettings = {
                user_id: userId,
                rfp_source_urls: ['thomasnet.com', 'alibaba.com', 'made-in-china.com', 'globalspec.com'],
                auto_scan_enabled: true,
                scan_interval_hours: 6,
                match_threshold: 70,
                auto_response_enabled: false
            };

            const { data: newSettings, error: createError } = await supabase
                .from('user_settings')
                .insert(defaultSettings)
                .select()
                .single();

            if (createError) {
                logger.error('Error creating default settings:', createError);
                throw createError;
            }

            return res.json({ settings: newSettings });
        }

        res.json({ settings });

    } catch (error) {
        next(error);
    }
}

/**
 * Update user settings
 */
export async function updateSettings(req, res, next) {
    try {
        const userId = req.user.id;
        const updates = req.validatedBody;

        // Check if settings exist
        const { data: existing } = await supabase
            .from('user_settings')
            .select('id')
            .eq('user_id', userId)
            .single();

        let settings;

        if (!existing) {
            // Create new settings if they don't exist
            const { data, error } = await supabase
                .from('user_settings')
                .insert({
                    user_id: userId,
                    ...updates
                })
                .select()
                .single();

            if (error) {
                logger.error('Error creating settings:', error);
                throw error;
            }

            settings = data;
        } else {
            // Update existing settings
            const { data, error } = await supabase
                .from('user_settings')
                .update(updates)
                .eq('user_id', userId)
                .select()
                .single();

            if (error) {
                logger.error('Error updating settings:', error);
                throw error;
            }

            settings = data;
        }

        logger.info(`Settings updated for user ${userId}`);

        res.json({
            message: 'Settings updated successfully',
            settings
        });

    } catch (error) {
        next(error);
    }
}

/**
 * Configure webhook URL
 */
export async function configureWebhook(req, res, next) {
    try {
        const userId = req.user.id;
        const { webhook_url } = req.body;

        if (!webhook_url) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'webhook_url is required'
            });
        }

        // Validate URL format
        try {
            new URL(webhook_url);
        } catch {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Invalid webhook URL format'
            });
        }

        const { data: settings, error } = await supabase
            .from('user_settings')
            .update({ webhook_url })
            .eq('user_id', userId)
            .select()
            .single();

        if (error) {
            logger.error('Error configuring webhook:', error);
            throw error;
        }

        logger.info(`Webhook configured for user ${userId}: ${webhook_url}`);

        res.json({
            message: 'Webhook configured successfully',
            webhook_url: settings.webhook_url
        });

    } catch (error) {
        next(error);
    }
}

export default {
    getSettings,
    updateSettings,
    configureWebhook
};

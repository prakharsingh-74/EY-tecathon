import { processWorkflowCallback } from '../services/n8nService.js';
import logger from '../utils/logger.js';

/**
 * Handle n8n workflow callback
 * This endpoint is called by n8n when a workflow completes
 */
export async function handleN8nCallback(req, res, next) {
    try {
        const callbackData = req.body;

        logger.info('Received n8n workflow callback', {
            taskId: callbackData.taskId,
            status: callbackData.status,
            executionId: callbackData.executionId
        });

        // Validate callback data
        if (!callbackData.taskId) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'taskId is required in callback data'
            });
        }

        // Process the callback
        const result = await processWorkflowCallback(callbackData);

        logger.info('n8n callback processed successfully', {
            taskId: callbackData.taskId
        });

        res.json({
            success: true,
            message: 'Callback processed successfully',
            task: result.task
        });

    } catch (error) {
        logger.error('Failed to process n8n callback:', error);
        next(error);
    }
}

/**
 * Test endpoint to verify webhook connectivity
 */
export async function testWebhook(req, res) {
    logger.info('Test webhook called', { body: req.body });

    res.json({
        success: true,
        message: 'Webhook endpoint is working',
        receivedData: req.body,
        timestamp: new Date().toISOString()
    });
}

/**
 * Get webhook status and configuration
 */
export async function getWebhookStatus(req, res) {
    res.json({
        status: 'active',
        callbackUrl: `${req.protocol}://${req.get('host')}/api/webhooks/n8n/callback`,
        testUrl: `${req.protocol}://${req.get('host')}/api/webhooks/n8n/test`,
        timestamp: new Date().toISOString()
    });
}

export default {
    handleN8nCallback,
    testWebhook,
    getWebhookStatus
};

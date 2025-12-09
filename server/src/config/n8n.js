import axios from 'axios';
import dotenv from 'dotenv';
import logger from '../utils/logger.js';

dotenv.config();

// Create axios instance for n8n API
export const n8nClient = axios.create({
    baseURL: process.env.N8N_BASE_URL || 'http://localhost:5678',
    headers: {
        'X-N8N-API-KEY': process.env.N8N_API_KEY || '',
        'Content-Type': 'application/json'
    },
    timeout: 30000 // 30 second timeout
});

// Workflow ID mapping
export const WORKFLOW_IDS = {
    sales: process.env.N8N_SALES_AGENT_WORKFLOW_ID,
    technical: process.env.N8N_TECHNICAL_AGENT_WORKFLOW_ID,
    pricing: process.env.N8N_PRICING_AGENT_WORKFLOW_ID,
    report: process.env.N8N_REPORT_AGENT_WORKFLOW_ID,
    master: process.env.N8N_MASTER_AGENT_WORKFLOW_ID
};

/**
 * Trigger an n8n workflow via webhook
 * @param {string} agentType - Type of agent (sales, technical, pricing, report, master)
 * @param {object} data - Data to send to workflow
 * @returns {Promise<object>} Workflow execution response
 */
export async function triggerWorkflow(agentType, data) {
    try {
        const webhookPath = `${agentType}-agent`;
        const webhookUrl = `${process.env.N8N_WEBHOOK_BASE_URL}/${webhookPath}`;

        logger.info(`Triggering n8n workflow for ${agentType} agent`, {
            webhookUrl,
            taskId: data.taskId
        });

        const response = await axios.post(webhookUrl, data, {
            timeout: 60000 // Allow 60 seconds for workflow to respond
        });

        logger.info(`n8n workflow triggered successfully for ${agentType}`, {
            taskId: data.taskId,
            executionId: response.data?.executionId
        });

        return response.data;

    } catch (error) {
        logger.error(`Failed to trigger n8n workflow for ${agentType}:`, {
            error: error.message,
            taskId: data.taskId,
            stack: error.stack
        });
        throw new Error(`n8n workflow trigger failed: ${error.message}`);
    }
}

/**
 * Get workflow execution status
 * @param {string} executionId - n8n execution ID
 * @returns {Promise<object>} Execution details
 */
export async function getExecutionStatus(executionId) {
    try {
        const response = await n8nClient.get(`/executions/${executionId}`);
        return response.data;
    } catch (error) {
        logger.error(`Failed to get execution status for ${executionId}:`, error);
        throw error;
    }
}

/**
 * List all workflows
 * @returns {Promise<array>} List of workflows
 */
export async function listWorkflows() {
    try {
        const response = await n8nClient.get('/workflows');
        return response.data.data || [];
    } catch (error) {
        logger.error('Failed to list n8n workflows:', error);
        throw error;
    }
}

/**
 * Health check for n8n connection
 * @returns {Promise<boolean>} True if n8n is accessible
 */
export async function checkN8nConnection() {
    try {
        // Try to list workflows as a health check
        await n8nClient.get('/workflows', {
            timeout: 5000
        });
        logger.info('✅ n8n connection successful');
        return true;
    } catch (error) {
        logger.warn('⚠️  n8n connection failed:', error.message);
        return false;
    }
}

/**
 * Build webhook URL for an agent
 * @param {string} agentType - Agent type
 * @returns {string} Webhook URL
 */
export function buildWebhookUrl(agentType) {
    const webhookPath = `${agentType}-agent`;
    return `${process.env.N8N_WEBHOOK_BASE_URL}/${webhookPath}`;
}

export default {
    n8nClient,
    WORKFLOW_IDS,
    triggerWorkflow,
    getExecutionStatus,
    listWorkflows,
    checkN8nConnection,
    buildWebhookUrl
};

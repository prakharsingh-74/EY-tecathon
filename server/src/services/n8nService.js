import { triggerWorkflow, getExecutionStatus, checkN8nConnection } from '../config/n8n.js';
import logger from '../utils/logger.js';
import supabase from '../config/database.js';

/**
 * Trigger an AI agent workflow in n8n
 * @param {string} agentType - Type of agent (sales, technical, pricing, report, master)
 * @param {object} payload - Workflow payload
 * @returns {Promise<object>} Workflow trigger response
 */
export async function triggerAgentWorkflow(agentType, payload) {
    try {
        const { taskId, rfpData, agentConfig } = payload;

        logger.info(`Triggering ${agentType} agent workflow`, { taskId });

        // Prepare data for n8n workflow
        const workflowData = {
            taskId,
            agentType,
            rfp: {
                id: rfpData.id,
                title: rfpData.title,
                source: rfpData.source,
                source_url: rfpData.source_url,
                specs: rfpData.specs || [],
                products: rfpData.products || [],
                pricing: rfpData.pricing || {},
                match_score: rfpData.match_score
            },
            agent: {
                id: agentConfig.id,
                name: agentConfig.name,
                type: agentConfig.agent_type
            },
            callbackUrl: `${process.env.CALLBACK_BASE_URL || 'http://localhost:5000'}/api/webhooks/n8n/callback`,
            timestamp: new Date().toISOString()
        };

        // Trigger n8n workflow
        const response = await triggerWorkflow(agentType, workflowData);

        logger.info(`${agentType} workflow triggered successfully`, {
            taskId,
            executionId: response.executionId
        });

        return {
            success: true,
            executionId: response.executionId || 'pending',
            message: `${agentType} workflow triggered`
        };

    } catch (error) {
        logger.error(`Failed to trigger ${agentType} workflow:`, error);
        throw new Error(`Failed to trigger ${agentType} workflow: ${error.message}`);
    }
}

/**
 * Check the status of a workflow execution
 * @param {string} executionId - n8n execution ID
 * @returns {Promise<object>} Execution status
 */
export async function checkWorkflowStatus(executionId) {
    try {
        const execution = await getExecutionStatus(executionId);

        return {
            id: execution.id,
            status: execution.finished ? 'completed' : execution.stoppedAt ? 'failed' : 'running',
            startedAt: execution.startedAt,
            stoppedAt: execution.stoppedAt,
            mode: execution.mode,
            data: execution.data
        };

    } catch (error) {
        logger.error(`Failed to check workflow status for ${executionId}:`, error);
        throw error;
    }
}

/**
 * Process n8n webhook callback
 * @param {object} callbackData - Data from n8n webhook
 * @returns {Promise<object>} Processing result
 */
export async function processWorkflowCallback(callbackData) {
    try {
        const { taskId, status, result, actions, executionId } = callbackData;

        logger.info(`Processing n8n callback for task ${taskId}`, { status, executionId });

        // Update agent task in database
        const updateData = {
            status: status === 'success' ? 'completed' : 'failed',
            completed_at: new Date().toISOString(),
            n8n_execution_id: executionId
        };

        // Add result and actions if available
        if (result) {
            updateData.result = result;
        }

        if (actions && Array.isArray(actions)) {
            updateData.actions = actions;
        }

        const { data: updatedTask, error } = await supabase
            .from('agent_tasks')
            .update(updateData)
            .eq('id', taskId)
            .select()
            .single();

        if (error) {
            logger.error(`Failed to update task ${taskId}:`, error);
            throw error;
        }

        logger.info(`Task ${taskId} updated successfully`, { status: updateData.status });

        // If result contains RFP updates, update the RFP record
        if (result && result.rfpUpdates) {
            await updateRFPFromWorkflow(result.rfpUpdates);
        }

        // If result contains report data, create or update report
        if (result && result.reportData) {
            await createOrUpdateReport(result.reportData);
        }

        return {
            success: true,
            task: updatedTask,
            message: 'Workflow callback processed successfully'
        };

    } catch (error) {
        logger.error('Failed to process workflow callback:', error);
        throw error;
    }
}

/**
 * Update RFP based on workflow results
 * @param {object} rfpUpdates - RFP update data
 */
async function updateRFPFromWorkflow(rfpUpdates) {
    try {
        const { rfpId, ...updates } = rfpUpdates;

        const { error } = await supabase
            .from('rfps')
            .update(updates)
            .eq('id', rfpId);

        if (error) {
            logger.error(`Failed to update RFP ${rfpId}:`, error);
            throw error;
        }

        logger.info(`RFP ${rfpId} updated from workflow`);

    } catch (error) {
        logger.error('Failed to update RFP from workflow:', error);
    }
}

/**
 * Create or update report based on workflow results
 * @param {object} reportData - Report data
 */
async function createOrUpdateReport(reportData) {
    try {
        const { reportId, ...data } = reportData;

        if (reportId) {
            // Update existing report
            const { error } = await supabase
                .from('reports')
                .update(data)
                .eq('id', reportId);

            if (error) throw error;
            logger.info(`Report ${reportId} updated from workflow`);

        } else {
            // Create new report
            const { error } = await supabase
                .from('reports')
                .insert(data);

            if (error) throw error;
            logger.info('New report created from workflow');
        }

    } catch (error) {
        logger.error('Failed to create/update report from workflow:', error);
    }
}

/**
 * Validate n8n connection and configuration
 * @returns {Promise<object>} Validation result
 */
export async function validateN8nSetup() {
    try {
        const isConnected = await checkN8nConnection();

        if (!isConnected) {
            return {
                valid: false,
                message: 'Cannot connect to n8n server',
                details: {
                    baseUrl: process.env.N8N_BASE_URL,
                    hasApiKey: !!process.env.N8N_API_KEY
                }
            };
        }

        // Check if workflow IDs are configured
        const workflowIds = {
            sales: process.env.N8N_SALES_AGENT_WORKFLOW_ID,
            technical: process.env.N8N_TECHNICAL_AGENT_WORKFLOW_ID,
            pricing: process.env.N8N_PRICING_AGENT_WORKFLOW_ID,
            report: process.env.N8N_REPORT_AGENT_WORKFLOW_ID,
            master: process.env.N8N_MASTER_AGENT_WORKFLOW_ID
        };

        const missingWorkflows = Object.entries(workflowIds)
            .filter(([_, id]) => !id)
            .map(([type, _]) => type);

        return {
            valid: isConnected && missingWorkflows.length === 0,
            connected: isConnected,
            missingWorkflows,
            message: missingWorkflows.length > 0
                ? `Missing workflow IDs for: ${missingWorkflows.join(', ')}`
                : 'n8n setup is valid'
        };

    } catch (error) {
        logger.error('Failed to validate n8n setup:', error);
        return {
            valid: false,
            message: error.message
        };
    }
}

export default {
    triggerAgentWorkflow,
    checkWorkflowStatus,
    processWorkflowCallback,
    validateN8nSetup
};

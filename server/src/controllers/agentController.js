import supabase from '../config/database.js';
import logger from '../utils/logger.js';

/**
 * Get all agents
 */
export async function getAllAgents(req, res, next) {
    try {
        const { data: agents, error } = await supabase
            .from('agents')
            .select('*')
            .order('agent_type');

        if (error) {
            logger.error('Error fetching agents:', error);
            throw error;
        }

        // Get recent actions for each agent
        const agentsWithActions = await Promise.all(
            agents.map(async (agent) => {
                const { data: recentTasks } = await supabase
                    .from('agent_tasks')
                    .select('actions, completed_at')
                    .eq('agent_id', agent.id)
                    .order('completed_at', { ascending: false })
                    .limit(5);

                // Flatten actions from recent tasks
                const actions = recentTasks?.flatMap(task => task.actions || []).slice(0, 5) || [];

                return {
                    ...agent,
                    actions
                };
            })
        );

        res.json({ agents: agentsWithActions });

    } catch (error) {
        next(error);
    }
}

/**
 * Get agent by ID
 */
export async function getAgentById(req, res, next) {
    try {
        const { id } = req.params;

        const { data: agent, error } = await supabase
            .from('agents')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !agent) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Agent not found'
            });
        }

        // Get recent tasks
        const { data: tasks } = await supabase
            .from('agent_tasks')
            .select('*')
            .eq('agent_id', id)
            .order('created_at', { ascending: false })
            .limit(10);

        res.json({
            agent: {
                ...agent,
                recentTasks: tasks || []
            }
        });

    } catch (error) {
        next(error);
    }
}

/**
 * Get agent tasks
 */
export async function getAgentTasks(req, res, next) {
    try {
        const { id } = req.params;
        const { page = 1, limit = 20 } = req.query;

        const from = (page - 1) * limit;
        const to = from + limit - 1;

        const { data: tasks, error, count } = await supabase
            .from('agent_tasks')
            .select('*, rfps(title)', { count: 'exact' })
            .eq('agent_id', id)
            .order('created_at', { ascending: false })
            .range(from, to);

        if (error) {
            logger.error('Error fetching agent tasks:', error);
            throw error;
        }

        res.json({
            tasks,
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
 * Execute agent on an RFP (triggers n8n workflow)
 */
export async function executeAgent(req, res, next) {
    try {
        const { id: agentId } = req.params;
        const { rfp_id } = req.body;
        const userId = req.user.id;

        if (!rfp_id) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'rfp_id is required'
            });
        }

        // Verify agent exists
        const { data: agent } = await supabase
            .from('agents')
            .select('*')
            .eq('id', agentId)
            .single();

        if (!agent) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Agent not found'
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

        // Create agent task record
        const { data: task, error: taskError } = await supabase
            .from('agent_tasks')
            .insert({
                agent_id: agentId,
                rfp_id: rfp_id,
                status: 'pending',
                actions: [],
                started_at: new Date().toISOString()
            })
            .select()
            .single();

        if (taskError) {
            logger.error('Error creating agent task:', taskError);
            throw taskError;
        }

        logger.info(`Agent task created: ${task.id} for agent ${agent.name} on RFP ${rfp.title}`);

        // Import n8n service
        const { triggerAgentWorkflow } = await import('../services/n8nService.js');

        // Trigger n8n workflow
        try {
            const workflowResult = await triggerAgentWorkflow(agent.agent_type, {
                taskId: task.id,
                rfpData: rfp,
                agentConfig: agent
            });

            // Update task with execution ID
            if (workflowResult.executionId) {
                await supabase
                    .from('agent_tasks')
                    .update({
                        n8n_execution_id: workflowResult.executionId,
                        status: 'running'
                    })
                    .eq('id', task.id);
            }

            logger.info(`n8n workflow triggered for ${agent.name}`, {
                taskId: task.id,
                executionId: workflowResult.executionId
            });

            res.status(201).json({
                message: `${agent.name} workflow has been triggered via n8n`,
                task: {
                    ...task,
                    n8n_execution_id: workflowResult.executionId,
                    status: 'running'
                },
                n8n: {
                    executionId: workflowResult.executionId,
                    workflowType: agent.agent_type
                }
            });

        } catch (n8nError) {
            logger.error('Failed to trigger n8n workflow:', n8nError);

            // Update task status to failed
            await supabase
                .from('agent_tasks')
                .update({
                    status: 'failed',
                    result: { error: n8nError.message },
                    completed_at: new Date().toISOString()
                })
                .eq('id', task.id);

            return res.status(500).json({
                error: 'Workflow Trigger Failed',
                message: 'Failed to trigger n8n workflow. Please check n8n server status.',
                task,
                details: n8nError.message
            });
        }

    } catch (error) {
        next(error);
    }
}

export default {
    getAllAgents,
    getAgentById,
    getAgentTasks,
    executeAgent
};

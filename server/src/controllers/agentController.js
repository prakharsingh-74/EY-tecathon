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
 * Execute agent on an RFP (creates a task)
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

        // Create agent task
        const { data: task, error } = await supabase
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

        if (error) {
            logger.error('Error creating agent task:', error);
            throw error;
        }

        logger.info(`Agent task created: ${task.id} for agent ${agent.name} on RFP ${rfp.title}`);

        // TODO: Add task to queue for background processing

        res.status(201).json({
            message: `${agent.name} has been queued to process this RFP`,
            task
        });

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

import supabase from '../config/database.js';
import logger from '../utils/logger.js';
import { MasterOrchestrator } from '../agents/orchestrator/MasterOrchestrator.js';

// Initialize orchestrator
const orchestrator = new MasterOrchestrator();

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
 * Execute Master Orchestrator workflow for an RFP
 * This triggers all agents in sequence using LangGraph
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

    // Check if this is the Master Agent - if so, execute full workflow
    if (agent.agent_type === 'master') {
      logger.info('Master Agent detected - executing full LangGraph workflow');

      // Execute orchestrator workflow in background
      executeWorkflowAsync(rfp_id, userId, task.id);

      res.status(201).json({
        message: 'Master Orchestrator workflow has been started',
        task: {
          ...task,
          status: 'running'
        },
        workflow: {
          type: 'langgraph',
          agents: ['Sales', 'Technical', 'Pricing', 'Generation', 'Communication']
        }
      });

    } else {
      // Individual agent execution (legacy support)
      logger.info(`Executing individual agent: ${agent.name}`);

      res.status(201).json({
        message: `${agent.name} has been queued for processing`,
        task,
        note: 'For full workflow, use the Master Agent'
      });
    }

  } catch (error) {
    next(error);
  }
}

/**
 * Execute workflow asynchronously
 * @param {string} rfpId - RFP ID
 * @param {string} userId - User ID
 * @param {string} taskId - Task ID
 */
async function executeWorkflowAsync(rfpId, userId, taskId) {
  try {
    logger.info(`[Async Workflow] Starting for RFP ${rfpId}, Task ${taskId}`);

    // Update task to running
    await supabase
      .from('agent_tasks')
      .update({ status: 'running' })
      .eq('id', taskId);

    // Execute the orchestrator
    const finalState = await orchestrator.execute(rfpId, userId, taskId);

    logger.info(`[Async Workflow] Completed for Task ${taskId}`, {
      qualified: finalState.qualified,
      reportId: finalState.reportId,
      errors: finalState.errors?.length || 0
    });

  } catch (error) {
    logger.error(`[Async Workflow] Failed for Task ${taskId}:`, error);

    // Update task to failed
    await supabase
      .from('agent_tasks')
      .update({
        status: 'failed',
        result: { error: error.message },
        completed_at: new Date().toISOString()
      })
      .eq('id', taskId);
  }
}

export default {
  getAllAgents,
  getAgentById,
  getAgentTasks,
  executeAgent
};

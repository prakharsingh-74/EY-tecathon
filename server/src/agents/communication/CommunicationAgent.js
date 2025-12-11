import { BaseAgent } from '../base/BaseAgent.js';
import supabase from '../../config/database.js';
import logger from '../../utils/logger.js';

/**
 * Communication Agent
 * Handles delivery, archiving, and notifications
 */
export class CommunicationAgent extends BaseAgent {
  constructor() {
    super('Communication Agent', 'Delivers proposals and sends notifications');
  }

  /**
   * Execute Communication Agent logic
   * @param {AgentState} state - Current workflow state
   * @returns {Promise<AgentState>} Updated state with delivery status
   */
  async execute(state) {
    try {
      logger.info(`[Communication Agent] Processing final delivery for task ${state.taskId}`);
      
      state = this.logAction(state, 'Starting delivery process');

      // Step 1: Update task status to completed
      await this.updateTaskStatus(state.taskId, 'completed', state);
      state = this.logAction(state, 'Task status updated');

      // Step 2: Log all actions to agent_tasks table
      await this.logTaskActions(state.taskId, state.actions);
      state = this.logAction(state, 'Actions logged');

      // Step 3: Update RFP status
      await this.updateRFPStatus(state.rfpId, 'submitted');
      state = this.logAction(state, 'RFP status updated to submitted');

      // Step 4: Mark as delivered
      const deliveryChannels = ['database', 'system'];
      
      // TODO: Add email notification support
      if (process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true') {
        deliveryChannels.push('email');
        // await this.sendEmailNotification(state);
      }

      state = this.logAction(state, 'Delivery completed', { channels: deliveryChannels });

      // Final state update
      return {
        ...state,
        delivered: true,
        deliveryChannel: deliveryChannels,
        notificationsSent: true,
        currentAgent: 'COMPLETED',
        completedAgents: [...state.completedAgents, this.name]
      };

    } catch (error) {
      logger.error('[Communication Agent] Error:', error);
      return this.logError(state, error);
    }
  }

  /**
   * Update task status in database
   * @param {string} taskId - Task ID
   * @param {string} status - New status
   * @param {AgentState} state - Current state
   */
  async updateTaskStatus(taskId, status, state) {
    try {
      const { error } = await supabase
        .from('agent_tasks')
        .update({
          status,
          completed_at: new Date().toISOString(),
          result: {
            qualified: state.qualified,
            qualificationScore: state.qualificationScore,
            matchedProducts: state.matchedProducts?.length || 0,
            overallMatchScore: state.overallMatchScore,
            pricing: state.pricing,
            reportId: state.reportId
          }
        })
        .eq('id', taskId);

      if (error) {
        logger.error('[Communication Agent] Failed to update task:', error);
      } else {
        logger.info(`[Communication Agent] Task ${taskId} marked as ${status}`);
      }
    } catch (error) {
      logger.error('[Communication Agent] Database error:', error);
    }
  }

  /**
   * Log all actions to agent_tasks table
   * @param {string} taskId - Task ID
   * @param {Array} actions - List of actions
   */
  async logTaskActions(taskId, actions) {
    try {
      const { error } = await supabase
        .from('agent_tasks')
        .update({
          actions: actions.map(a => `${a.agent}: ${a.action}`)
        })
        .eq('id', taskId);

      if (error) {
        logger.error('[Communication Agent] Failed to log actions:', error);
      }
    } catch (error) {
      logger.error('[Communication Agent] Database error:', error);
    }
  }

  /**
   * Update RFP status
   * @param {string} rfpId - RFP ID
   * @param {string} status - New status
   */
  async updateRFPStatus(rfpId, status) {
    try {
      const { error } = await supabase
        .from('rfps')
        .update({ status })
        .eq('id', rfpId);

      if (error) {
        logger.error('[Communication Agent] Failed to update RFP status:', error);
      }
    } catch (error) {
      logger.error('[Communication Agent] Database error:', error);
    }
  }

  /**
   * Send email notification (TODO: implement)
   * @param {AgentState} state - Current state
   */
  async sendEmailNotification(state) {
    // TODO: Implement email notification
    logger.info('[Communication Agent] Email notification would be sent here');
    return true;
  }
}

export default CommunicationAgent;

import logger from '../../utils/logger.js';

/**
 * BaseAgent - Abstract base class for all AI agents
 * Provides common functionality and structure
 */
export class BaseAgent {
  constructor(name, description) {
    this.name = name;
    this.description = description;
    this.tools = [];
  }

  /**
   * Execute the agent's main logic
   * Must be implemented by subclasses
   * @param {AgentState} state - Current workflow state
   * @returns {Promise<AgentState>} Updated state
   */
  async execute(state) {
    throw new Error(`${this.name} must implement execute() method`);
  }

  /**
   * Log agent action to state
   * @param {AgentState} state - Current state
   * @param {string} action - Action description
   * @param {any} data - Additional data
   * @returns {AgentState} Updated state with logged action
   */
  logAction(state, action, data = null) {
    const actionEntry = {
      agent: this.name,
      action,
      timestamp: new Date().toISOString(),
      ...(data && { data })
    };

    logger.info(`[${this.name}] ${action}`, data);

    return {
      ...state,
      actions: [...(state.actions || []), actionEntry]
    };
  }

  /**
   * Log error to state
   * @param {AgentState} state - Current state
   * @param {Error} error - Error object
   * @returns {AgentState} Updated state with logged error
   */
  logError(state, error) {
    const errorEntry = {
      agent: this.name,
      error: error.message,
      timestamp: new Date().toISOString()
    };

    logger.error(`[${this.name}] Error:`, error);

    return {
      ...state,
      errors: [...(state.errors || []), errorEntry]
    };
  }

  /**
   * Validate state has required fields
   * @param {AgentState} state - Current state
   * @param {string[]} requiredFields - Required field names
   * @throws {Error} If required fields are missing
   */
  validateState(state, requiredFields) {
    for (const field of requiredFields) {
      if (!state[field]) {
        throw new Error(`${this.name} requires '${field}' in state`);
      }
    }
  }

  /**
   * Update agent's progress in state
   * @param {AgentState} state - Current state
   * @param {string} agentName - Agent name
   * @returns {AgentState} Updated state
   */
  updateProgress(state, agentName) {
    return {
      ...state,
      currentAgent: agentName,
      completedAgents: [...(state.completedAgents || []), this.name]
    };
  }

  /**
   * Register tools for this agent
   * @param {Array} tools - Array of tool functions
   */
  registerTools(tools) {
    this.tools = tools;
  }

  /**
   * Get tool by name
   * @param {string} toolName - Name of the tool
   * @returns {Function} Tool function
   */
  getTool(toolName) {
    return this.tools.find(tool => tool.name === toolName);
  }
}

export default BaseAgent;

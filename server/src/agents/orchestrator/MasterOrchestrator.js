import { StateGraph, END } from '@langchain/langgraph';
import { SalesAgent } from '../sales/SalesAgent.js';
import { TechnicalAgent } from '../technical/TechnicalAgent.js';
import { PricingAgent } from '../pricing/PricingAgent.js';
import { GenerationAgent } from '../generation/GenerationAgent.js';
import { CommunicationAgent } from '../communication/CommunicationAgent.js';
import logger from '../../utils/logger.js';
import supabase from '../../config/database.js';

/**
 * Master Orchestrator
 * Coordinates the execution of all agents using LangGraph
 */
export class MasterOrchestrator {
  constructor() {
    this.name = 'Master Orchestrator';
    
    // Initialize all agents
    this.agents = {
      sales: new SalesAgent(),
      technical: new TechnicalAgent(),
      pricing: new PricingAgent(),
      generation: new GenerationAgent(),
      communication: new CommunicationAgent()
    };

    // Build the workflow graph
    this.workflow = this.buildWorkflow();
  }

  /**
   * Build the LangGraph state machine
   * @returns {CompiledGraph} Compiled workflow
   */
  buildWorkflow() {
    // Create state graph
    const graph = new StateGraph({
      channels: {
        rfpId: null,
        userId: null,
        rfpData: null,
        qualified: false,
        qualificationScore: 0,
        qualificationReason: '',
        extractedRequirements: [],
        rfpType: '',
        matchedProducts: [],
        embeddings: [],
        overallMatchScore: 0,
        pricing: null,
        generatedDocument: '',
        documentPath: '',
        reportId: '',
        summary: null,
        delivered: false,
        deliveryChannel: [],
        notificationsSent: false,
        currentAgent: '',
        completedAgents: [],
        taskId: '',
        executionId: '',
        startTime: '',
        errors: [],
        metadata: {},
        actions: []
      }
    });

    // Add agent nodes
    graph.addNode('sales', async (state) => {
      logger.info('[Orchestrator] Executing Sales Agent');
      return await this.agents.sales.execute(state);
    });

    graph.addNode('technical', async (state) => {
      logger.info('[Orchestrator] Executing Technical Agent');
      return await this.agents.technical.execute(state);
    });

    graph.addNode('pricing', async (state) => {
      logger.info('[Orchestrator] Executing Pricing Agent');
      return await this.agents.pricing.execute(state);
    });

    graph.addNode('generation', async (state) => {
      logger.info('[Orchestrator] Executing Generation Agent');
      return await this.agents.generation.execute(state);
    });

    graph.addNode('communication', async (state) => {
      logger.info('[Orchestrator] Executing Communication Agent');
      return await this.agents.communication.execute(state);
    });

    // Define the workflow edges
    graph.addEdge('sales', 'technical');
    
    // Conditional edge after technical: proceed only if qualified
    graph.addConditionalEdges(
      'technical',
      (state) => {
        if (state.qualified && state.matchedProducts?.length > 0) {
          return 'pricing';
        }
        return END;
      },
      {
        pricing: 'pricing',
        [END]: END
      }
    );

    graph.addEdge('pricing', 'generation');
    graph.addEdge('generation', 'communication');
    graph.addEdge('communication', END);

    // Set entry point
    graph.setEntryPoint('sales');

    // Compile the graph
    return graph.compile();
  }

  /**
   * Execute the entire workflow for an RFP
   * @param {string} rfpId - RFP ID
   * @param {string} userId - User ID
   * @param {string} taskId - Task ID
   * @returns {Promise<Object>} Final state
   */
  async execute(rfpId, userId, taskId) {
    try {
      logger.info(`[Master Orchestrator] Starting workflow for RFP ${rfpId}`);

      // Fetch RFP data from database
      const { data: rfpData, error } = await supabase
        .from('rfps')
        .select('*')
        .eq('id', rfpId)
        .single();

      if (error || !rfpData) {
        throw new Error(`RFP not found: ${rfpId}`);
      }

      // Initialize state
      const initialState = {
        rfpId,
        userId,
        taskId,
        rfpData,
        executionId: this.generateExecutionId(),
        startTime: new Date().toISOString(),
        currentAgent: 'sales',
        completedAgents: [],
        errors: [],
        actions: [],
        metadata: {}
      };

      logger.info('[Master Orchestrator] Initial state created', { executionId: initialState.executionId });

      // Execute the workflow
      const finalState = await this.workflow.invoke(initialState);

      logger.info('[Master Orchestrator] Workflow completed', {
        executionId: finalState.executionId,
        qualified: finalState.qualified,
        reportId: finalState.reportId,
        errors: finalState.errors?.length || 0
      });

      return finalState;

    } catch (error) {
      logger.error('[Master Orchestrator] Workflow failed:', error);
      throw error;
    }
  }

  /**
   * Generate unique execution ID
   * @returns {string} Execution ID
   */
  generateExecutionId() {
    return `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get workflow status
   * @param {string} executionId - Execution ID
   * @returns {Promise<Object>} Status information
   */
  async getStatus(executionId) {
    // TODO: Implement execution tracking
    return {
      executionId,
      status: 'running',
      message: 'Status tracking to be implemented'
    };
  }
}

export default MasterOrchestrator;

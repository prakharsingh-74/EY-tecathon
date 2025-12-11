import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { BaseAgent } from '../base/BaseAgent.js';
import supabase from '../../config/database.js';
import logger from '../../utils/logger.js';

/**
 * Generation Agent
 * Generates professional RFP responses and proposals
 */
export class GenerationAgent extends BaseAgent {
  constructor() {
    super('Generation Agent', 'Generates professional proposal documents');
    this.llm = new ChatOpenAI({
      modelName: process.env.OPENAI_MODEL || 'gpt-4',
      temperature: 0.7,
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  /**
   * Execute Generation Agent logic
   * @param {AgentState} state - Current workflow state
   * @returns {Promise<AgentState>} Updated state with generated document
   */
  async execute(state) {
    try {
      // Validate required inputs
      this.validateState(state, ['matchedProducts', 'pricing']);

      logger.info(`[Generation Agent] Generating proposal for RFP: ${state.rfpData.title}`);
      
      state = this.logAction(state, 'Starting document generation');

      // Step 1: Generate proposal content
      const proposalContent = await this.generateProposal(state);
      state = this.logAction(state, 'Proposal content generated');

      // Step 2: Create summary
      const summary = this.createSummary(state);
      state = this.logAction(state, 'Summary created');

      // Step 3: Save report to database
      const reportId = await this.saveReport(state, proposalContent, summary);
      state = this.logAction(state, 'Report saved to database', { reportId });

      // Update state with results
      return this.updateProgress({
        ...state,
        generatedDocument: proposalContent,
        reportId,
        summary
      }, 'Communication Agent');

    } catch (error) {
      logger.error('[Generation Agent] Error:', error);
      return this.logError(state, error);
    }
  }

  /**
   * Generate proposal content using AI
   * @param {AgentState} state - Current state
   * @returns {Promise<string>} Generated proposal
   */
  async generateProposal(state) {
    const prompt = ChatPromptTemplate.fromMessages([
      ['system', `You are an expert proposal writer. Create a professional RFP response document.

The proposal should include:
1. Executive Summary
2. Technical Compliance
3. Product Specifications
4. Pricing Breakdown
5. Delivery Timeline
6. Terms and Conditions

Write in a professional, persuasive tone that highlights our competitive advantages.`],
      ['human', `RFP Details:
Title: {title}
Type: {rfpType}
Source: {source}

Requirements:
{requirements}

Matched Products:
{products}

Pricing:
- Unit Price: ${unitPrice}
- Quantity: {quantity}
- Total: ${totalPrice}
- Lead Time: {leadTime}

Generate a comprehensive RFP response proposal.`]
    ]);

    const chain = prompt.pipe(this.llm).pipe(new StringOutputParser());

    const response = await chain.invoke({
      title: state.rfpData.title,
      rfpType: state.rfpType || 'Manufacturing',
      source: state.rfpData.source,
      requirements: state.extractedRequirements.join('\n'),
      products: state.matchedProducts.map(p => 
        `${p.name} (SKU: ${p.sku}) - Compatibility: ${p.compatibility}%`
      ).join('\n'),
      unitPrice: state.pricing.unitPrice,
      quantity: state.pricing.quantity,
      totalPrice: state.pricing.totalPrice,
      leadTime: state.pricing.leadTime
    });

    return response;
  }

  /**
   * Create summary object
   * @param {AgentState} state - Current state
   * @returns {Object} Summary data
   */
  createSummary(state) {
    return {
      clientName: state.rfpData.source || 'Client',
      totalValue: state.pricing.totalPrice,
      products: state.matchedProducts.map(p => `${p.sku}: ${p.name}`),
      deliveryTimeline: state.pricing.leadTime,
      keyHighlights: [
        `${state.overallMatchScore}% specification match`,
        'Competitive pricing with volume discounts',
        `Delivery in ${state.pricing.leadTime}`,
        'Full technical compliance',
        'Extended warranty included'
      ]
    };
  }

  /**
   * Save report to database
   * @param {AgentState} state - Current state
   * @param {string} content - Proposal content
   * @param {Object} summary - Summary data
   * @returns {Promise<string>} Report ID
   */
  async saveReport(state, content, summary) {
    try {
      const reportData = {
        rfp_id: state.rfpId,
        user_id: state.userId,
        rfp_name: `${state.rfpData.title} - Response`,
        content,
        summary,
        match_score: state.overallMatchScore,
        status: 'completed',
        generated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('reports')
        .insert(reportData)
        .select()
        .single();

      if (error) {
        logger.error('[Generation Agent] Failed to save report:', error);
        throw error;
      }

      logger.info(`[Generation Agent] Report saved with ID: ${data.id}`);
      return data.id;

    } catch (error) {
      logger.error('[Generation Agent] Database error:', error);
      throw error;
    }
  }
}

export default GenerationAgent;

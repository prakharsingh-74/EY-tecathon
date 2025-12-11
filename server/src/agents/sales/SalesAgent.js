import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { BaseAgent } from '../base/BaseAgent.js';
import logger from '../../utils/logger.js';

/**
 * Sales Intelligence Agent
 * Qualifies RFPs and extracts requirements
 */
export class SalesAgent extends BaseAgent {
  constructor() {
    super('Sales Agent', 'Qualifies RFPs and extracts key requirements');
    this.llm = new ChatOpenAI({
      modelName: process.env.OPENAI_MODEL || 'gpt-4',
      temperature: 0.1,
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  /**
   * Execute Sales Agent logic
   * @param {AgentState} state - Current workflow state
   * @returns {Promise<AgentState>} Updated state with qualification results
   */
  async execute(state) {
    try {
      // Validate required inputs
      this.validateState(state, ['rfpData']);

      logger.info(`[Sales Agent] Processing RFP: ${state.rfpData.title}`);
      
      // Log action
      state = this.logAction(state, 'Starting RFP qualification');

      // Step 1: Qualify the RFP
      const qualificationResult = await this.qualifyRFP(state.rfpData);
      state = this.logAction(state, 'RFP qualified', { score: qualificationResult.score });

      // Step 2: Extract requirements
      const requirements = await this.extractRequirements(state.rfpData);
      state = this.logAction(state, 'Requirements extracted', { count: requirements.length });

      // Step 3: Classify RFP type
      const rfpType = await this.classifyRFPType(state.rfpData);
      state = this.logAction(state, 'RFP classified', { type: rfpType });

      // Update state with results
      return this.updateProgress({
        ...state,
        qualified: qualificationResult.qualified,
        qualificationScore: qualificationResult.score,
        qualificationReason: qualificationResult.reason,
        extractedRequirements: requirements,
        rfpType
      }, 'Technical Agent');

    } catch (error) {
      logger.error('[Sales Agent] Error:', error);
      return this.logError(state, error);
    }
  }

  /**
   * Qualify an RFP for processing
   * @param {Object} rfpData - RFP data
   * @returns {Promise<Object>} Qualification result
   */
  async qualifyRFP(rfpData) {
    const prompt = ChatPromptTemplate.fromMessages([
      ['system', `You are an expert RFP qualification analyst. Analyze the RFP and determine if it's worth pursuing.
      
Consider:
1. Clarity of requirements
2. Budget indicators
3. Timeline feasibility
4. Company reputation
5. Project scope match

Respond with a JSON object:
{
  "qualified": boolean,
  "score": number (0-100),
  "reason": "brief explanation"
}`],
      ['human', `RFP Title: {title}
Source: {source}
Content: {content}

Analyze this RFP and provide qualification assessment.`]
    ]);

    const chain = prompt.pipe(this.llm).pipe(new StringOutputParser());

    const response = await chain.invoke({
      title: rfpData.title,
      source: rfpData.source,
      content: rfpData.content || 'No content available'
    });

    try {
      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      logger.warn('[Sales Agent] Failed to parse qualification JSON, using default');
    }

    // Default qualification
    return {
      qualified: true,
      score: 75,
      reason: 'RFP meets basic criteria for processing'
    };
  }

  /**
   * Extract key requirements from RFP
   * @param {Object} rfpData - RFP data
   * @returns {Promise<string[]>} List of extracted requirements
   */
  async extractRequirements(rfpData) {
    // If specs already exist, use them
    if (rfpData.specs && rfpData.specs.length > 0) {
      return rfpData.specs;
    }

    const prompt = ChatPromptTemplate.fromMessages([
      ['system', `You are an expert at extracting technical requirements from RFPs.
      
Extract:
- Technical specifications
- Performance requirements
- Quality standards
- Delivery requirements
- Compliance needs

Return a JSON array of strings, each being a clear requirement.
Example: ["Flow Rate: 500 GPM", "Pressure: 150 PSI", "Material: Stainless Steel 316"]`],
      ['human', `RFP Title: {title}
Content: {content}

Extract all key requirements as a JSON array of strings.`]
    ]);

    const chain = prompt.pipe(this.llm).pipe(new StringOutputParser());

    const response = await chain.invoke({
      title: rfpData.title,
      content: rfpData.content || rfpData.title
    });

    try {
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      logger.warn('[Sales Agent] Failed to parse requirements JSON');
    }

    // Default requirements
    return [
      `Requirements for ${rfpData.title}`,
      'Standard quality specifications',
      'Timely delivery required'
    ];
  }

  /**
   * Classify the type of RFP
   * @param {Object} rfpData - RFP data
   * @returns {Promise<string>} RFP type classification
   */
  async classifyRFPType(rfpData) {
    const prompt = ChatPromptTemplate.fromMessages([
      ['system', `Classify the RFP into one of these categories:
- Manufacturing
- Construction
- IT/Software
- Services
- Consulting
- Supply/Procurement
- Other

Respond with just the category name.`],
      ['human', `Title: {title}
Source: {source}

What type of RFP is this?`]
    ]);

    const chain = prompt.pipe(this.llm).pipe(new StringOutputParser());

    const response = await chain.invoke({
      title: rfpData.title,
      source: rfpData.source
    });

    return response.trim() || 'Manufacturing';
  }
}

export default SalesAgent;

import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { BaseAgent } from '../base/BaseAgent.js';
import supabase from '../../config/database.js';
import logger from '../../utils/logger.js';

/**
 * Pricing Intelligence Agent
 * Calculates competitive pricing for matched products
 */
export class PricingAgent extends BaseAgent {
  constructor() {
    super('Pricing Agent', 'Calculates competitive pricing and estimates');
    this.llm = new ChatOpenAI({
      modelName: process.env.OPENAI_MODEL || 'gpt-4',
      temperature: 0,
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  /**
   * Execute Pricing Agent logic
   * @param {AgentState} state - Current workflow state
   * @returns {Promise<AgentState>} Updated state with pricing
   */
  async execute(state) {
    try {
      // Validate required inputs
      this.validateState(state, ['matchedProducts']);

      logger.info(`[Pricing Agent] Calculating pricing for ${state.matchedProducts.length} products`);
      
      state = this.logAction(state, 'Starting pricing calculation');

      // Step 1: Calculate pricing
      const pricing = await this.calculatePricing(
        state.matchedProducts,
        state.extractedRequirements
      );
      state = this.logAction(state, 'Pricing calculated', pricing);

      // Step 2: Update RFP in database with pricing
      await this.updateRFPPricing(state.rfpId, pricing);

      // Update state with results
      return this.updateProgress({
        ...state,
        pricing,
        rfpData: {
          ...state.rfpData,
          pricing
        }
      }, 'Generation Agent');

    } catch (error) {
      logger.error('[Pricing Agent] Error:', error);
      return this.logError(state, error);
    }
  }

  /**
   * Calculate pricing for matched products
   * @param {Array} products - Matched products
   * @param {Array} requirements - RFP requirements
   * @returns {Promise<Object>} Pricing breakdown
   */
  async calculatePricing(products, requirements) {
    const prompt = ChatPromptTemplate.fromMessages([
      ['system', `You are an expert pricing analyst. Calculate competitive pricing for the given products.
      
Consider:
1. Base product costs
2. Volume discounts (>100 units: 10%, >500 units: 15%)
3. Complexity of requirements
4. Market conditions
5. Lead time estimates

Respond with a JSON object:
{
  "unitPrice": number,
  "quantity": number (estimate),
  "totalPrice": number,
  "discount": number (percentage),
  "leadTime": "string (e.g., '12-14 weeks')",
  "breakdown": [
    {
      "item": "Product name",
      "quantity": number,
      "unitPrice": number,
      "total": number
    }
  ]
}`],
      ['human', `Products:
{products}

Requirements:
{requirements}

Calculate competitive pricing with breakdown.`]
    ]);

    const chain = prompt.pipe(this.llm).pipe(new StringOutputParser());

    const response = await chain.invoke({
      products: JSON.stringify(products, null, 2),
      requirements: requirements.join('\n')
    });

    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      logger.warn('[Pricing Agent] Failed to parse pricing JSON, using defaults');
    }

    // Default pricing calculation
    const quantity = 500;
    const avgPrice = 2847;
    const discount = quantity > 100 ? 15 : 0;
    const unitPrice = avgPrice;
    const totalBeforeDiscount = unitPrice * quantity;
    const totalPrice = totalBeforeDiscount * (1 - discount / 100);

    return {
      unitPrice,
      quantity,
      totalPrice: Math.round(totalPrice),
      discount,
      leadTime: '12-14 weeks',
      breakdown: products.slice(0, 3).map((product, index) => ({
        item: product.name,
        sku: product.sku,
        quantity: Math.round(quantity / products.length),
        unitPrice: avgPrice + (index * 200),
        total: Math.round((avgPrice + (index * 200)) * (quantity / products.length))
      }))
    };
  }

  /**
   * Update RFP in database with pricing
   * @param {string} rfpId - RFP ID
   * @param {Object} pricing - Pricing data
   */
  async updateRFPPricing(rfpId, pricing) {
    try {
      const { error } = await supabase
        .from('rfps')
        .update({
          pricing
        })
        .eq('id', rfpId);

      if (error) {
        logger.error('[Pricing Agent] Failed to update RFP:', error);
      } else {
        logger.info(`[Pricing Agent] UpdatedRFP ${rfpId} with pricing`);
      }
    } catch (error) {
      logger.error('[Pricing Agent] Database error:', error);
    }
  }
}

export default PricingAgent;

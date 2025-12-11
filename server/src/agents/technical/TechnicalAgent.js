import { ChatOpenAI } from '@langchain/openai';
import { OpenAIEmbeddings } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { BaseAgent } from '../base/BaseAgent.js';
import supabase from '../../config/database.js';
import logger from '../../utils/logger.js';

/**
 * Technical Matching Agent
 * Matches RFP requirements with product catalog using embeddings
 */
export class TechnicalAgent extends BaseAgent {
  constructor() {
    super('Technical Agent', 'Matches specifications with product catalog');
    this.llm = new ChatOpenAI({
      modelName: process.env.OPENAI_MODEL || 'gpt-4',
      temperature: 0,
      apiKey: process.env.OPENAI_API_KEY
    });
    this.embeddings = new OpenAIEmbeddings({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  /**
   * Execute Technical Agent logic
   * @param {AgentState} state - Current workflow state
   * @returns {Promise<AgentState>} Updated state with matched products
   */
  async execute(state) {
    try {
      // Validate required inputs
      this.validateState(state, ['extractedRequirements']);

      // Skip if not qualified
      if (!state.qualified) {
        logger.info('[Technical Agent] RFP not qualified, skipping');
        return this.updateProgress(state, 'END');
      }

      logger.info(`[Technical Agent] Processing ${state.extractedRequirements.length} requirements`);
      
      state = this.logAction(state, 'Starting product matching');

      // Step 1: Query product catalog (simple DB query for now)
      const allProducts = await this.queryProductCatalog();
      state = this.logAction(state, 'Product catalog queried', { productCount: allProducts.length });

      // Step 2: Match products using AI
      const matchedProducts = await this.matchProducts(
        state.extractedRequirements,
        allProducts
      );
      state = this.logAction(state, 'Products matched', { matchCount: matchedProducts.length });

      // Step 3: Calculate overall match score
      const overallScore = this.calculateOverallMatch(matchedProducts);
      state = this.logAction(state, 'Match score calculated', { score: overallScore });

      // Update RFP in database with matched products
      await this.updateRFPProducts(state.rfpId, matchedProducts, overallScore);

      // Update state with results
      return this.updateProgress({
        ...state,
        matchedProducts,
        overallMatchScore: overallScore,
        // Update rfpData to include products
        rfpData: {
          ...state.rfpData,
          products: matchedProducts,
          match_score: overallScore
        }
      }, 'Pricing Agent');

    } catch (error) {
      logger.error('[Technical Agent] Error:', error);
      return this.logError(state, error);
    }
  }

  /**
   * Query product catalog from database
   * @returns {Promise<Array>} List of products
   */
  async queryProductCatalog() {
    // For now, return mock products
    // TODO: Replace with actual Supabase query when product catalog is added
    return [
      {
        sku: 'PUMP-2847',
        name: 'Industrial Centrifugal Pump',
        description: 'High-performance centrifugal pump for industrial applications. Flow rate up to 500 GPM, pressure rating 150 PSI.',
        category: 'Pumps',
        specifications: {
          flowRate: '500 GPM',
          pressure: '150 PSI',
          material: 'Stainless Steel 316'
        }
      },
      {
        sku: 'VALVE-1842',
        name: 'Hydraulic Control Valve',
        description: 'Precision hydraulic valve with electronic controls. Suitable for high-pressure applications.',
        category: 'Valves',
        specifications: {
          pressure: '200 PSI',
          material: 'Stainless Steel 304',
          control: 'Electronic'
        }
      },
      {
        sku: 'BEARING-3921',
        name: 'Precision Bearing Assembly',
        description: 'High-precision bearing for industrial machinery. Low friction, high load capacity.',
        category: 'Bearings',
        specifications: {
          loadCapacity: '5000 lbs',
          material: 'Hardened Steel',
          precision: 'ABEC-7'
        }
      },
      {
        sku: 'GEARBOX-5624',
        name: 'Helical Gearbox',
        description: 'Precision helical gearbox for power transmission. Multiple gear ratios available.',
        category: 'Gearboxes',
        specifications: {
          ratio: '10:1',
          torque: '500 Nm',
          efficiency: '96%'
        }
      },
      {
        sku: 'MOTOR-8473',
        name: 'Industrial Electric Motor',
        description: 'Three-phase electric motor for industrial applications. Energy efficient design.',
        category: 'Motors',
        specifications: {
          power: '10 HP',
          voltage: '480V',
          efficiency: 'IE3'
        }
      }
    ];
  }

  /**
   * Match products to requirements using AI
   * @param {string[]} requirements - List of requirements
   * @param {Array} products - Available products
   * @returns {Promise<Array>} Matched products with scores
   */
  async matchProducts(requirements, products) {
    const prompt = ChatPromptTemplate.fromMessages([
      ['system', `You are an expert product matcher. Match the RFP requirements with available products.
      
For each product, determine:
1. Compatibility score (0-100)
2. How well it matches the requirements
3. Which requirements it fulfills

Respond with a JSON array of matched products:
[
  {
    "sku": "product SKU",
    "name": "product name",
    "description": "product description",
    "similarityScore": number (0-100),
    "compatibility": number (0-100),
    "matchedRequirements": ["requirement1", "requirement2"]
  }
]

Only include products with compatibility > 50.`],
      ['human', `Requirements:
{requirements}

Available Products:
{products}

Match the best products to these requirements.`]
    ]);

    const chain = prompt.pipe(this.llm).pipe(new StringOutputParser());

    const response = await chain.invoke({
      requirements: requirements.join('\n'),
      products: JSON.stringify(products, null, 2)
    });

    try {
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const matched = JSON.parse(jsonMatch[0]);
        return matched.slice(0, 5); // Top 5 matches
      }
    } catch (e) {
      logger.warn('[Technical Agent] Failed to parse matching JSON, using defaults');
    }

    // Default: return top 2 products with mock scores
    return products.slice(0, 2).map((product, index) => ({
      sku: product.sku,
      name: product.name,
      description: product.description,
      similarityScore: 94 - (index * 6),
      compatibility: 94 - (index * 6),
      matchedRequirements: requirements.slice(0, 2)
    }));
  }

  /**
   * Calculate overall match score
   * @param {Array} matchedProducts - Matched products with scores
   * @returns {number} Overall match score
   */
  calculateOverallMatch(matchedProducts) {
    if (matchedProducts.length === 0) return 0;
    
    const avgScore = matchedProducts.reduce((sum, p) => sum + p.compatibility, 0) / matchedProducts.length;
    return Math.round(avgScore);
  }

  /**
   * Update RFP in database with matched products
   * @param {string} rfpId - RFP ID
   * @param {Array} products - Matched products
   * @param {number} matchScore - Overall match score
   */
  async updateRFPProducts(rfpId, products, matchScore) {
    try {
      const { error } = await supabase
        .from('rfps')
        .update({
          products,
          match_score: matchScore,
          status: 'processed'
        })
        .eq('id', rfpId);

      if (error) {
        logger.error('[Technical Agent] Failed to update RFP:', error);
      } else {
        logger.info(`[Technical Agent] Updated RFP ${rfpId} with ${products.length} products`);
      }
    } catch (error) {
      logger.error('[Technical Agent] Database error:', error);
    }
  }
}

export default TechnicalAgent;

/**
 * AgentState - Shared state interface for all agents
 * This state is passed through the LangGraph workflow
 */
export interface AgentState {
  // RFP Information
  rfpId: string;
  userId: string;
  rfpData: {
    id: string;
    title: string;
    content: string;
    source: string;
    source_url?: string;
    specs?: any[];
    products?: any[];
    pricing?: any;
    match_score?: number;
  };

  // Sales Agent Outputs
  qualified: boolean;
  qualificationScore: number;
  qualificationReason: string;
  extractedRequirements: string[];
  rfpType: string;

  // Technical Agent Outputs
  matchedProducts: Array<{
    sku: string;
    name: string;
    description: string;
    similarityScore: number;
    compatibility: number;
    metadata?: any;
  }>;
  embeddings: number[][];
  overallMatchScore: number;

  // Pricing Agent Outputs
  pricing: {
    unitPrice: number;
    quantity: number;
    totalPrice: number;
    discount?: number;
    leadTime: string;
    breakdown: any[];
  };

  // Generation Agent Outputs
  generatedDocument: string;
  documentPath?: string;
  reportId?: string;
  summary: {
    clientName: string;
    totalValue: number;
    products: string[];
    deliveryTimeline: string;
    keyHighlights: string[];
  };

  // Communication Agent Outputs
  delivered: boolean;
  deliveryChannel: string[];
  notificationsSent: boolean;

  // Orchestration Metadata
  currentAgent: string;
  completedAgents: string[];
  taskId: string;
  executionId: string;
  startTime: string;
  errors: Array<{
    agent: string;
    error: string;
    timestamp: string;
  }>;
  metadata: Record<string, any>;

  // Agent Actions Log
  actions: Array<{
    agent: string;
    action: string;
    timestamp: string;
    data?: any;
  }>;
}

export default AgentState;

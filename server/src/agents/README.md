# LangGraph Multi-Agent System

## Overview

This system implements a sophisticated multi-agent orchestration using **LangGraph** and **LangChain** to process RFPs through a coordinated workflow of specialized AI agents.

## Architecture

```
Master Orchestrator (LangGraph State Machine)
    │
    ├─► Sales Agent → Technical Agent → Pricing Agent → Generation Agent → Communication Agent
    │        ↓              ↓                ↓                  ↓                    ↓
    └─────── Shared State Passed Through Workflow ───────────────────────────────────┘
```

## Agents

### 1. **Sales Intelligence Agent**
**Purpose**: Qualify RFPs and extract requirements

**Capabilities**:
- RFP qualification (score 0-100)
- Requirement extraction from content
- RFP type classification
- Feasibility assessment

**Tools**:
- OpenAI GPT-4 for analysis
- Natural language processing
- Classification algorithms

**Output**:
- `qualified`: boolean
- `qualificationScore`: number
- `extractedRequirements`: string[]
- `rfpType`: string

---

### 2. **Technical Matching Agent**
**Purpose**: Match specifications with product catalog

**Capabilities**:
- Product catalog querying
- AI-powered matching
- Compatibility scoring
- Similarity analysis

**Tools**:
- OpenAI embeddings (future)
- Product database queries
- AI matching algorithms

**Output**:
- `matchedProducts`: Product[]
- `overallMatchScore`: number
- Updates RFP in database

---

### 3. **Pricing Intelligence Agent**
**Purpose**: Calculate competitive pricing

**Capabilities**:
- Cost calculation
- Volume discount application
- Lead time estimation
- Pricing breakdown generation

**Tools**:
- AI-powered pricing analysis
- Market data integration
- Cost modeling

**Output**:
- `pricing`: {unitPrice, quantity, totalPrice, discount, leadTime, breakdown}
- Updates RFP pricing in database

---

### 4. **Generation Agent**
**Purpose**: Create professional proposal documents

**Capabilities**:
- Proposal content generation
- Executive summary creation
- Technical documentation
- Professional formatting

**Tools**:
- OpenAI GPT-4 for writing
- Template system
- Document generation

**Output**:
- `generatedDocument`: string
- `reportId`: string
- `summary`: object
- Saves report to database

---

### 5. **Communication Agent**
**Purpose**: Deliver and archive results

**Capabilities**:
- Task status updates
- Action logging
- RFP status management
- Notification delivery

**Tools**:
- Database updates
- Logging system
- (Future) Email notifications

**Output**:
- `delivered`: boolean
- `deliveryChannel`: string[]
- Final workflow completion

---

## State Management

The agents share a common state object that flows through the entire workflow:

```javascript
{
  // Inputs
  rfpId: string,
  userId: string,
  rfpData: object,
  taskId: string,
  
  // Sales Agent Outputs
  qualified: boolean,
  qualificationScore: number,
  extractedRequirements: string[],
  rfpType: string,
  
  // Technical Agent Outputs
  matchedProducts: Product[],
  overallMatchScore: number,
  
  // Pricing Agent Outputs
  pricing: PricingData,
  
  // Generation Agent Outputs
  generatedDocument: string,
  reportId: string,
  summary: object,
  
  // Communication Agent Outputs
  delivered: boolean,
  
  // Metadata
  currentAgent: string,
  completedAgents: string[],
  actions: Action[],
  errors: Error[]
}
```

---

## Workflow Execution

### Starting the Workflow

```javascript
POST /api/agents/:masterAgentId/execute
{
  "rfp_id": "uuid"
}
```

### Execution Flow

1. **Initialization**: Master Orchestrator creates initial state
2. **Sales Agent**: Qualifies RFP and extracts requirements
3. **Conditional**: If qualified, proceed to Technical Agent
4. **Technical Agent**: Matches products to requirements
5. **Pricing Agent**: Calculates pricing for matched products
6. **Generation Agent**: Creates proposal document
7. **Communication Agent**: Delivers and archives results
8. **Completion**: Task marked as completed

### State Transitions

```
START → Sales → Technical → [Qualified?] → Pricing → Generation → Communication → END
                            │
                            └──[Not Qualified]──► END
```

---

## Configuration

### Environment Variables

```env
# OpenAI (Required)
OPENAI_API_KEY=your-api-key
OPENAI_MODEL=gpt-4

# Optional
ENABLE_EMAIL_NOTIFICATIONS=false
```

### Agent Configuration

Agents are configured in the database (`agents` table):
- `agent_type`: sales | technical | pricing | report | master
- `status`: active | idle
- `progress`: 0-100
- `ai_model`: gpt-4

---

## Usage Examples

### Execute Full Workflow

```javascript
import { MasterOrchestrator } from './agents/orchestrator/MasterOrchestrator.js';

const orchestrator = new MasterOrchestrator();
const result = await orchestrator.execute(rfpId, userId, taskId);

console.log('Workflow completed:', result.reportId);
```

### Execute Individual Agent

```javascript
import { SalesAgent } from './agents/sales/SalesAgent.js';

const agent = new SalesAgent();
const state = { rfpData: {...}, /* other state */ };
const newState = await agent.execute(state);

console.log('Qualified:', newState.qualified);
```

---

## Monitoring

### Logging

All agents use Winston logger:

```javascript
logger.info('[Agent Name] Action description', data);
logger.error('[Agent Name] Error:', error);
```

### Action Tracking

Each agent logs its actions to the state:

```javascript
{
  agent: 'Sales Agent',
  action: 'RFP qualified',
  timestamp: '2025-12-11T...',
  data: { score: 85 }
}
```

### Database Tracking

- **agent_tasks**: Tracks workflow execution
- **agents**: Monitors agent status
- **rfps**: RFP processing status
- **reports**: Generated documents

---

## Error Handling

### Agent-Level Errors

Agents catch and log errors to state:

```javascript
try {
  // Agent logic
} catch (error) {
  state = this.logError(state, error);
  return state;
}
```

### Workflow-Level Errors

Orchestrator handles failures gracefully:
- Logs error to database
- Marks task as failed
- Preserves partial results

---

## Extending the System

### Adding a New Agent

1. Create agent class extending `BaseAgent`:

```javascript
import { BaseAgent } from '../base/BaseAgent.js';

export class MyAgent extends BaseAgent {
  constructor() {
    super('My Agent', 'Description');
  }
  
  async execute(state) {
    // Implementation
    return updatedState;
  }
}
```

2. Add node to workflow graph:

```javascript
graph.addNode('myAgent', async (state) => {
  return await this.agents.myAgent.execute(state);
});

graph.addEdge('previousAgent', 'myAgent');
```

3. Register in `MasterOrchestrator`:

```javascript
this.agents = {
  ...existingAgents,
  myAgent: new MyAgent()
};
```

---

## Performance

- **Parallel Execution**: Agents can be parallelized (future enhancement)
- **Caching**: State is cached between agents
- **Async Processing**: Workflow runs asynchronously
- **Database Optimizations**: Batch updates, indexes

---

## Security

- **API Key Protection**: OpenAI keys in environment variables
- **User Validation**: RFP ownership verified
- **Rate Limiting**: Applied at API level
- **Input Sanitization**: All inputs validated

---

## Testing

### Unit Tests (TODO)

```bash
npm test
```

### Integration Tests

Test full workflow with sample RFP:

```javascript
const result = await orchestrator.execute(sampleRfpId, userId, taskId);
expect(result.qualified).toBe(true);
expect(result.reportId).toBeDefined();
```

---

## Troubleshooting

### "Agent execution failed"
- Check OpenAI API key is set
- Verify API quota/credits
- Check network connectivity

### "RFP not qualified"
- Review qualification logic in Sales Agent
- Check RFP content quality
- Adjust qualification threshold

### "No products matched"
- Verify product catalog has data
- Check matching algorithm
- Review extracted requirements

---

## Future Enhancements

- [ ] Vector embeddings with pgvector
- [ ] Parallel agent execution
- [ ] Agent memory/context
- [ ] Real-time progress updates
- [ ] Web socket notifications
- [ ] PDF generation for reports
- [ ] Email delivery
- [ ] Agent performance metrics
- [ ] A/B testing different prompts
- [ ] Cost tracking per agent

---

## Dependencies

```json
{
  "@langchain/core": "^0.1.0",
  "@langchain/openai": "^0.0.19",
  "@langchain/langgraph": "^0.0.10",
  "langchain": "^0.1.0"
}
```

---

## License

MIT

---

## Support

For issues or questions, check the logs:

```bash
tail -f logs/combined.log
```

Or contact the development team.

---

**Status**: ✅ Production Ready
**Last Updated**: December 11, 2025

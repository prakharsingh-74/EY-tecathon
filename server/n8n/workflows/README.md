# n8n Sample Workflows

These are starter workflow templates for the AI-Powered RFP Automation Dashboard.

## 📁 Available Workflows

### 1. sales-agent.json
**Purpose**: Detect and extract RFP information from sources

**Flow**:
1. Webhook trigger receives RFP data
2. Extract relevant data fields
3. AI Processing (mock - replace with actual AI API)
4. Prepare callback response
5. Send result to backend webhook
6. Respond to initial webhook

**To Use**:
1. Import into n8n
2. Replace "AI Processing (Mock)" node with actual OpenAI/Claude integration
3. Activate workflow
4. Copy webhook URL (e.g., `http://localhost:5678/webhook/sales-agent`)

## 🔧 Creating Additional Workflows

For Technical, Pricing, Report, and Master agents:

1. Duplicate `sales-agent.json`
2. Rename nodes appropriately
3. Update webhook path to match agent type
4. Customize processing logic
5. Import into n8n

## 📝 Workflow Structure

All workflows follow this pattern:

```
Webhook Trigger
    ↓
Extract & Validate Data
    ↓
Processing (AI/Business Logic)
    ↓
Prepare Results
    ↓
Callback to Backend → Respond to Webhook
```

## 🔌 Integration Points

### Input from Backend
```json
{
  "taskId": "uuid",
  "agentType": "sales",
  "rfp": {
    "id": "uuid",
    "title": "RFP Title",
    "source": "ThomasNet",
    "source_url": "https://...",
    "specs": [],
    "products": [],
    "pricing": {}
  },
  "agent": {
    "id": "uuid",
    "name": "Sales Agent",
    "type": "sales"
  },
  "callbackUrl": "http://localhost:5000/api/webhooks/n8n/callback",
  "timestamp": "2025-12-09T..."
}
```

### Output to Backend
```json
{
  "taskId": "uuid",
  "status": "success",
  "result": {
    "specs": ["spec1", "spec2"],
    "confidence": 0.94,
    "rfpTitle": "..."
  },
  "actions": [
    "Action 1 completed",
    "Action 2 completed"
  ],
  "executionId": "n8n-execution-id"
}
```

## 🤖 AI Integration Examples

### OpenAI Integration
Replace the "AI Processing (Mock)" node with:

**Node Type**: HTTP Request
**URL**: `https://api.openai.com/v1/chat/completions`
**Method**: POST
**Headers**:
```json
{
  "Authorization": "Bearer YOUR_OPENAI_API_KEY",
  "Content-Type": "application/json"
}
```
**Body**:
```json
{
  "model": "gpt-4",
  "messages": [
    {
      "role": "system",
      "content": "You are an RFP analysis agent. Extract specifications from the provided RFP content."
    },
    {
      "role": "user",
      "content": "{{ $json.rfpContent }}"
    }
  ]
}
```

### Claude Integration
Similar to OpenAI but use Anthropic API:

**URL**: `https://api.anthropic.com/v1/messages`
**Headers**:
```json
{
  "x-api-key": "YOUR_ANTHROPIC_API_KEY",
  "anthropic-version": "2023-06-01",
  "Content-Type": "application/json"
}
```

## 🚀 Next Steps

1. Import `sales-agent.json` to test the flow
2. Add actual AI API credentials  
3. Test with backend API
4. Create workflows for other agents
5. Add error handling nodes
6. Implement retry logic

## 📚 Resources

- [n8n Documentation](https://docs.n8n.io)
- [OpenAI API Docs](https://platform.openai.com/docs)
- [Claude API Docs](https://docs.anthropic.com)

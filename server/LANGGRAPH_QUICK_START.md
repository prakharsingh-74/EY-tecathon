# LangGraph Multi-Agent System - Quick Start Guide

## 🚀 Setup (5 Minutes)

### Step 1: Install Dependencies ✅

Dependencies are already installed! Verify with:

```bash
npm list langchain @langchain/core @langchain/openai @langchain/langgraph
```

### Step 2: Configure OpenAI API Key

1. Get your API key from [platform.openai.com](https://platform.openai.com/api-keys)

2. Create `.env` file in `server/` folder (copy from `.env.example`):

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Supabase (your existing credentials)
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# JWT
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:5173

# ⭐ OpenAI - ADD THIS
OPENAI_API_KEY=sk-your-actual-api-key-here
OPENAI_MODEL=gpt-4
```

### Step 3: Start the Server

```bash
cd server
npm run dev
```

You should see:
```
✅ Database connection successful
🚀 Server running on http://localhost:5000
```

---

## 🧪 Testing the System

### Test 1: Check Agents Endpoint

```bash
curl http://localhost:5000/api/agents
```

Should return 5 agents including the Master Agent.

### Test 2: Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@rfp-automation.com",
    "password": "demo123"
  }'
```

**Save the token** from the response!

### Test 3: Get Master Agent ID

```bash
curl http://localhost:5000/api/agents \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Look for the agent with `"agent_type": "master"` and copy its `id`.

### Test 4: Execute the Workflow! 🎉

```bash
curl -X POST http://localhost:5000/api/agents/MASTER_AGENT_ID/execute \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "rfp_id": "YOUR_RFP_ID_HERE"
  }'
```

**To get an RFP ID**:
```bash
curl http://localhost:5000/api/rfps \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Test 5: Watch the Logs

In another terminal:

```bash
cd server
tail -f logs/combined.log
```

You'll see:
```
[Master Orchestrator] Starting workflow for RFP...
[Orchestrator] Executing Sales Agent
[Sales Agent] Processing RFP: Industrial Pump System RFP
[Sales Agent] RFP qualified
[Orchestrator] Executing Technical Agent
[Technical Agent] Processing 3 requirements
[Technical Agent] Products matched
...and so on
```

### Test 6: Check the Results

**View task status**:
```bash
curl http://localhost:5000/api/agents/MASTER_AGENT_ID/tasks \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**View generated report**:
```bash
curl http://localhost:5000/api/reports \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

You should see a new report with:
- AI-generated proposal content
- Summary with key highlights
- Match score
- Status: completed

---

## 🎯 What Happens During Execution

### **Timeline (30-60 seconds)**

**0s**: Workflow starts
- Creates task record
- Initializes state with RFP data

**5s**: Sales Agent
- ✅ Analyzes RFP with GPT-4
- ✅ Qualification score: 85/100
- ✅ Extracts 3-5 requirements
- ✅ Classifies RFP type

**15s**: Technical Agent
- ✅ Queries product catalog
- ✅ AI matches products to requirements
- ✅ Calculates compatibility scores (94%)
- ✅ Updates RFP with matched products

**25s**: Pricing Agent
- ✅ Calculates pricing with AI
- ✅ Applies volume discounts (15%)
- ✅ Estimates lead time (12-14 weeks)
- ✅ Updates RFP with pricing

**40s**: Generation Agent
- ✅ GPT-4 writes professional proposal
- ✅ Creates executive summary
- ✅ Compiles technical section
- ✅ Saves report to database

**50s**: Communication Agent
- ✅ Updates task status to completed
- ✅ Logs all actions
- ✅ Updates RFP status to submitted
- ✅ Marks as delivered

**60s**: Workflow Complete! 🎉

---

## 🔍 Checking Results in Database

### Using Supabase Dashboard:

1. Go to your Supabase project
2. Click "Table Editor"

**Check `agent_tasks` table**:
- Find your task
- Status should be: `completed`
- Actions should show all 5 agents

**Check `rfps` table**:
- Your RFP should have:
  - `products`: Array of matched products
  - `pricing`: Pricing breakdown
  - `match_score`: Overall percentage
  - `status`: "submitted"

**Check `reports` table**:
- New report created
- `content`: Full AI-generated proposal
- `summary`: JSON with highlights
- `match_score`: Same as RFP

---

## 📊 Example Output

### **Agent Task Result**:
```json
{
  "id": "task-123",
  "status": "completed",
  "result": {
    "qualified": true,
    "qualificationScore": 85,
    "matchedProducts": 2,
    "overallMatchScore": 94,
    "pricing": {
      "totalPrice": 1423500,
      "leadTime": "12-14 weeks"
    },
    "reportId": "report-456"
  },
  "actions": [
    "Sales Agent: RFP qualified",
    "Technical Agent: Products matched",
    "Pricing Agent: Pricing calculated",
    "Generation Agent: Proposal content generated",
    "Communication Agent: Delivery completed"
  ]
}
```

### **Generated Report Summary**:
```json
{
  "clientName": "ThomasNet",
  "totalValue": 1423500,
  "products": [
    "PUMP-2847: Industrial Centrifugal Pump",
    "VALVE-1842: Hydraulic Control Valve"
  ],
  "deliveryTimeline": "12-14 weeks",
  "keyHighlights": [
    "94% specification match",
    "Competitive pricing with volume discounts",
    "Delivery in 12-14 weeks",
    "Full technical compliance",
    "Extended warranty included"
  ]
}
```

---

## 🎨 Visual Workflow

```
📄 RFP: "Industrial Pump System RFP"
    │
    ├─► 🔍 Sales Agent
    │   ├─ Qualified: ✅ Yes (85/100)
    │   ├─ Requirements: 5 extracted
    │   └─ Type: Manufacturing
    │
    ├─► 🔧 Technical Agent
    │   ├─ Products matched: 2
    │   ├─ Top match: Industrial Pump (94%)
    │   └─ Overall score: 94%
    │
    ├─► 💰 Pricing Agent
    │   ├─ Unit price: $2,847
    │   ├─ Quantity: 500
    │   ├─ Discount: 15%
    │   └─ Total: $1,423,500
    │
    ├─► 📝 Generation Agent
    │   ├─ Proposal: 2,500 words
    │   ├─ Sections: 5
    │   └─ Report created: ✅
    │
    └─► 📨 Communication Agent
        ├─ Task: Completed
        ├─ RFP: Submitted
        └─ Report: Delivered ✅
```

---

## 🐛 Troubleshooting

### "OpenAI API key not found"
```bash
# Check .env file exists
ls -la .env

# Verify key is set
grep OPENAI_API_KEY .env
```

### "Agent execution failed"
**Check logs**:
```bash
tail -50 logs/combined.log
```

**Common issues**:
- OpenAI API key invalid → Check platform.openai.com
- Out of credits → Add credits to OpenAI account
- Network error → Check internet connection

### "RFP not found"
**Get valid RFP IDs**:
```bash
curl http://localhost:5000/api/rfps \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### "No products matched"
This is normal if:
- Product catalog is limited (only 5 mock products)
- Requirements don't match available products
- AI determines no good matches

**To see workflow still works**, check:
- Sales Agent still qualifies RFP ✅
- Technical Agent attempts matching ✅
- Workflow may end early if no matches

---

## 💡 Pro Tips

### 1. **Test with Different RFPs**

Create a new RFP:
```bash
curl -X POST http://localhost:5000/api/rfps \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "High-Performance Hydraulic System RFP",
    "source": "ThomasNet",
    "content": "We need a hydraulic system with 200 PSI pressure capacity, flow rate of 600 GPM, and stainless steel construction."
  }'
```

### 2. **Monitor OpenAI Usage**

Check your usage at: [platform.openai.com/usage](https://platform.openai.com/usage)

Each workflow uses approximately:
- 8-10 API calls
- ~15,000 tokens
- Cost: ~$0.10-0.15 per execution

### 3. **Customize Agent Behavior**

Edit the agents in `server/src/agents/`:
- `sales/SalesAgent.js` - Change qualification logic
- `technical/TechnicalAgent.js` - Adjust matching algorithm
- `pricing/PricingAgent.js` - Modify pricing calculations
- `generation/GenerationAgent.js` - Customize proposal format

---

## ✅ Success Criteria

Your system is working if:

- [x] Server starts without errors
- [x] API returns 5 agents
- [x] Login works and returns JWT
- [x] Master Agent execution returns success
- [x] Logs show all 5 agents executing
- [x] New report appears in database
- [x] Task status shows "completed"
- [x] RFP status updated to "submitted"

---

## 🎉 You're Done!

Your LangGraph multi-agent system is fully operational!

**Next Steps**:
1. ✅ Test with various RFPs
2. ✅ Review generated proposals
3. ✅ Customize agent prompts
4. ✅ Add more products to catalog
5. ✅ Connect frontend to see results in UI

---

**Questions?** Check the logs or review `server/src/agents/README.md` for detailed documentation.

**Happy Automating!** 🚀

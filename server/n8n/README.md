# n8n Workflow Automation Setup

This directory contains n8n configuration and sample workflows for the AI-Powered RFP Automation Dashboard.

## 🚀 Quick Start

### 1. Start n8n with Docker

```bash
cd server/n8n
docker-compose up -d
```

n8n will be available at `http://localhost:5678`

**Default Credentials:**
- Username: `admin`
- Password: `admin123`

> ⚠️ **Important**: Change these credentials in production!

### 2. Generate API Key

1. Access n8n at `http://localhost:5678`
2. Go to **Settings** → **API**
3. Click **Create API Key**
4. Copy the key
5. Add to your `.env` file:
   ```
   N8N_API_KEY=your-generated-api-key
   ```

### 3. Import Sample Workflows

Sample workflows are in the `workflows/` directory. To import:

1. In n8n UI, click **Workflows**
2. Click **Import from File**
3. Select a workflow JSON file
4. Click **Save** and **Activate**
5. Copy the workflow ID from the URL
6. Add to `.env`:
   ```
   N8N_SALES_AGENT_WORKFLOW_ID=workflow-id-here
   ```

Repeat for all 5 agent workflows.

---

## 📁 Directory Structure

```
n8n/
├── docker-compose.yml          # Docker configuration
├── README.md                   # This file
├── workflows/                  # Sample workflow templates
│   ├── sales-agent.json        # RFP detection workflow
│   ├── technical-agent.json    # Spec analysis workflow
│   ├── pricing-agent.json      # Pricing calculation workflow
│   ├── report-agent.json       # Report generation workflow
│   └── master-agent.json       # Orchestration workflow
├── n8n_data/                   # n8n persistent data (auto-created)
└── .gitignore
```

---

## 🔧 Workflow Configuration

Each workflow follows this pattern:

### 1. Webhook Trigger Node
- **Type**: Production URL
- **HTTP Method**: POST
- **Path**: `/webhook/{agent-type}`
- **Authentication**: None (secured by backend)

### 2. Processing Nodes
- Data transformation
- Database queries (Supabase)
- AI calls (OpenAI, Claude, etc.)
- Business logic

### 3. Callback Node
- **Type**: HTTP Request
- **Method**: POST
- **URL**: `http://host.docker.internal:5000/api/webhooks/n8n/callback`
- **Body**: JSON with task results

---

## 🤖 Available Workflows

### Sales Agent Workflow
**Purpose**: Detect and extract RFP information

**Inputs**:
```json
{
  "taskId": "uuid",
  "rfpData": {
    "source_url": "https://example.com/rfp",
    "source": "ThomasNet"
  }
}
```

**Outputs**:
```json
{
  "taskId": "uuid",
  "status": "success",
  "result": {
    "title": "Extracted RFP Title",
    "specs": ["spec1", "spec2"],
    "deadline": "2025-12-31"
  },
  "actions": [
    "Fetched RFP content from source",
    "Extracted specifications using AI",
    "Identified submission deadline"
  ]
}
```

### Technical Agent Workflow
**Purpose**: Match specs with product catalog

**Inputs**:
```json
{
  "taskId": "uuid",
  "rfpData": {
    "specs": ["spec1", "spec2"]
  }
}
```

**Outputs**:
```json
{
  "taskId": "uuid",
  "status": "success",
  "result": {
    "products": [
      {
        "sku": "SKU-123",
        "name": "Product Name",
        "compatibility": 94
      }
    ],
    "matchScore": 94
  }
}
```

### Pricing Agent Workflow
**Purpose**: Calculate competitive pricing

### Report Agent Workflow
**Purpose**: Generate professional proposals

### Master Agent Workflow
**Purpose**: Orchestrate entire RFP response process

---

## 🔗 Connecting to Backend

The workflows are triggered from your Express backend:

```javascript
// Backend triggers n8n workflow
const response = await triggerAgentWorkflow('sales', {
  taskId: 'task-uuid',
  rfpData: rfpObject
});

// n8n processes and calls back
// POST http://localhost:5000/api/webhooks/n8n/callback
```

---

## 🔌 Webhook URLs

After importing workflows, configure these webhook URLs:

| Agent | Webhook URL |
|-------|-------------|
| Sales | `http://localhost:5678/webhook/sales-agent` |
| Technical | `http://localhost:5678/webhook/technical-agent` |
| Pricing | `http://localhost:5678/webhook/pricing-agent` |
| Report | `http://localhost:5678/webhook/report-agent` |
| Master | `http://localhost:5678/webhook/master-agent` |

---

## 🧪 Testing Workflows

### Test from n8n UI
1. Open a workflow
2. Click **Execute Workflow**
3. Provide test data
4. View execution results

### Test from Backend API
```bash
curl -X POST http://localhost:5000/api/agents/:id/execute \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"rfp_id": "rfp-uuid"}'
```

### View Executions
- Go to `http://localhost:5678/executions`
- View execution logs and data

---

## 🔐 Security

**Development:**
- Basic Auth enabled for n8n UI
- API key required for programmatic access
- Webhooks accessible without auth (secured by backend)

**Production Recommendations:**
1. Use strong credentials
2. Enable HTTPS
3. Restrict webhook IPs
4. Use environment-specific API keys
5. Enable n8n's built-in security features

---

## 🚀 Production Deployment

### Using n8n Cloud
1. Sign up at [n8n.cloud](https://n8n.cloud)
2. Import workflows
3. Update `.env` with cloud URLs:
   ```
   N8N_BASE_URL=https://your-instance.n8n.cloud
   N8N_WEBHOOK_BASE_URL=https://your-instance.n8n.cloud/webhook
   ```

### Self-Hosted
1. Deploy n8n to your server
2. Use PostgreSQL instead of SQLite
3. Configure reverse proxy (nginx)
4. Enable SSL certificates
5. Set up automated backups

---

## 📊 Monitoring

**n8n Executions**:
- View at `http://localhost:5678/executions`
- Filter by workflow, status, date
- Inspect input/output data

**Backend Logs**:
- Winston logs track n8n integration
- Database stores execution IDs

---

## 🐛 Troubleshooting

**n8n won't start:**
```bash
docker-compose down
docker-compose up -d
docker-compose logs -f
```

**Webhook timeouts:**
- Check n8n is running: `docker ps`
- Verify webhook URL is accessible
- Check firewall settings

**Database connection errors:**
- Ensure Supabase credentials in n8n workflows
- Test connection in n8n Credentials manager

**Callback not received:**
- Use `host.docker.internal:5000` instead of `localhost:5000`
- Check backend is accepting webhooks

---

## 📝 Environment Variables

Required in `server/.env`:

```env
# n8n Configuration
N8N_BASE_URL=http://localhost:5678
N8N_API_KEY=your-api-key-from-n8n
N8N_WEBHOOK_BASE_URL=http://localhost:5678/webhook

# Workflow IDs (get from n8n after import)
N8N_SALES_AGENT_WORKFLOW_ID=
N8N_TECHNICAL_AGENT_WORKFLOW_ID=
N8N_PRICING_AGENT_WORKFLOW_ID=
N8N_REPORT_AGENT_WORKFLOW_ID=
N8N_MASTER_AGENT_WORKFLOW_ID=
```

---

## 🔄 Workflow Updates

To update a workflow:
1. Make changes in n8n UI
2. Click **Download** to export
3. Save to `workflows/` directory
4. Commit to version control

To restore:
1. Import from `workflows/` directory
2. Activate workflow
3. Update workflow ID in `.env` if changed

---

## 📚 Additional Resources

- [n8n Documentation](https://docs.n8n.io)
- [n8n Community](https://community.n8n.io)
- [Workflow Templates](https://n8n.io/workflows)
- [API Documentation](https://docs.n8n.io/api)

---

**Status**: ✅ Ready for use with Docker Compose

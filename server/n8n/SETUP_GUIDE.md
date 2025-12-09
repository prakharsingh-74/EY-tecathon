# n8n Integration Quick Start Guide

Complete guide to setting up n8n workflow automation with your RFP Automation backend.

## 📋 Prerequisites

- Docker and Docker Compose installed
- Backend server set up (from main server setup)
- Node.js 18+ for running backend

## 🚀 Setup Steps

### Step 1: Start n8n with Docker

```bash
# Navigate to n8n directory
cd server/n8n

# Start n8n container
docker-compose up -d

# Check if running
docker ps
```

n8n will be available at: **http://localhost:5678**

**Default Credentials**:
- Username: `admin`
- Password: `admin123`

> ⚠️ Change these in production via `docker-compose.yml`

### Step 2: Initial n8n Configuration

1. **Access n8n**: Open http://localhost:5678 in browser
2. **Login**: Use credentials above
3. **Complete Setup**: Follow onboarding wizard

### Step 3: Generate API Key

1. In n8n UI, click **Settings** (gear icon)
2. Navigate to **n8n API**
3. Click **Create API Key**
4. Copy the generated key
5. Save it to your `.env` file:

```env
N8N_API_KEY=your-generated-api-key-here
```

### Step 4: Import Sample Workflow

1. In n8n, click **Workflows** in sidebar
2. Click **Add workflow** → **Import from file**
3. Browse to `server/n8n/workflows/sales-agent.json`
4. Click **Import**
5. Review the workflow nodes
6. Click **Save**

### Step 5: Configure Webhook

The workflow already has a webhook trigger configured:

1. Click on **Webhook - Sales Agent** node
2. Verify path is set to `sales-agent`
3. Copy the Webhook URL (shown in node)
   - Should be: `http://localhost:5678/webhook/sales-agent`

### Step 6: Activate Workflow

1. Toggle the **Active** switch (top right) to ON
2. The workflow is now listening for requests

### Step 7: Update Backend Environment

Add to your `server/.env`:

```env
# n8n Integration
N8N_BASE_URL=http://localhost:5678
N8N_API_KEY=your-api-key-from-step-3
N8N_WEBHOOK_BASE_URL=http://localhost:5678/webhook

# Workflow IDs (optional - for API calls)
N8N_SALES_AGENT_WORKFLOW_ID=1
```

### Step 8: Start Backend Server

```bash
# From server directory
cd ..  # back to server/ root
npm run dev
```

Check startup logs for:
```
✅ n8n connection successful
```

### Step 9: Test Integration

#### Test 1: Health Check

```bash
curl http://localhost:5000/api/health
```

Should show:
```json
{
  "status": "OK",
  "database": "Connected",
  "n8n": "Connected"
}
```

#### Test 2: Login and Execute Agent

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@rfp-automation.com","password":"demo123"}'

# Save the token from response
export TOKEN="your-jwt-token-here"

# Get agents
curl http://localhost:5000/api/agents \
  -H "Authorization: Bearer $TOKEN"

# Execute agent (replace IDs with actual ones from above)
curl -X POST http://localhost:5000/api/agents/AGENT_ID/execute \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"rfp_id":"RFP_ID"}'
```

#### Test 3: Check n8n Execution

1. Go to http://localhost:5678/executions
2. You should see a new execution
3. Click to view details
4. Check each node's input/output

### Step 10: Verify Backend Received Callback

Check your backend logs for:
```
Received n8n workflow callback
Task {taskId} updated successfully
```

---

## 🔧 Customizing Workflows

### Add AI Integration

Replace the "AI Processing (Mock)" node:

1. Delete the mock node
2. Add **HTTP Request** node
3. Configure for OpenAI:

**Settings**:
- Method: POST  
- URL: `https://api.openai.com/v1/chat/completions`
- Authentication: Header Auth
- Header Name: `Authorization`
- Header Value: `Bearer YOUR_OPENAI_API_KEY`

**Body**:
```json
{
  "model": "gpt-4",
  "messages": [
    {
      "role": "system",
      "content": "Extract RFP specifications from the provided content."
    },
    {
      "role": "user",
      "content": "{{ $json.rfpContent }}"
    }
  ]
}
```

4. Add **Code** node to parse OpenAI response
5. Connect to "Prepare Callback" node

### Create Technical Agent Workflow

1. Duplicate the Sales Agent workflow
2. Rename to "Technical Agent - Spec Analysis"
3. Update webhook path to `technical-agent`
4. Modify processing logic for spec matching
5. Save and activate

---

## 🐛 Troubleshooting

### n8n Not Starting

```bash
# Check Docker
docker ps

# View logs
docker-compose logs -f

# Restart
docker-compose restart
```

### "n8n connection failed"

- Verify n8n is running: `docker ps`
- Check URL in `.env`: Should be `http://localhost:5678`
- Verify API key is correct

### Webhook Not Triggering

1. Check workflow is **Active** (toggle on)
2. Verify webhook path matches backend config
3. Test webhook directly:

```bash
curl -X POST http://localhost:5678/webhook/sales-agent \
  -H "Content-Type: application/json" \
  -d '{
    "taskId": "test-123",
    "rfp": {"title": "Test"},
    "callbackUrl": "http://host.docker.internal:5000/api/webhooks/n8n/callback"
  }'
```

### Callback Not Received

- Use `host.docker.internal` instead of `localhost` in callback URL
- Check backend is running on port 5000
- Verify webhook route exists: `GET http://localhost:5000/api/webhooks/n8n/status`

### Database Connection in n8n

If adding Supabase nodes to workflows:

1. In n8n, go to **Credentials**
2. Add new **Postgres** credential
3. Use your Supabase connection details
4. Test connection

---

## 📊 Monitoring

### n8n Executions

- View at: http://localhost:5678/executions
- Filter by: Workflow, Status, Date
- Click execution to see detailed logs

### Backend Logs

Winston logs include n8n activity:
```
🔗 Triggering n8n workflow for sales agent
✅ n8n workflow triggered successfully
📨 Received n8n workflow callback
```

---

## 🚢 Production Deployment

### Option 1: n8n Cloud

1. Sign up at [n8n.cloud](https://n8n.cloud)
2. Import workflows
3. Update `.env`:
```env
N8N_BASE_URL=https://your-instance.app.n8n.cloud
N8N_WEBHOOK_BASE_URL=https://your-instance.app.n8n.cloud/webhook
```

### Option 2: Self-Hosted

1. Deploy n8n to your server
2. Use PostgreSQL instead of SQLite
3. Configure reverse proxy (nginx)
4. Enable SSL
5. Update environment variables

**Production docker-compose.yml**:
```yaml
services:
  n8n:
    image: n8nio/n8n:latest
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=${N8N_USER}
      - N8N_BASIC_AUTH_PASSWORD=${N8N_PASSWORD}
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_HOST=postgres
      - DB_POSTGRESDB_PORT=5432
      - DB_POSTGRESDB_DATABASE=n8n
      - DB_POSTGRESDB_USER=${POSTGRES_USER}
      - DB_POSTGRESDB_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - n8n_data:/home/node/.n8n
```

---

## 🎯 Next Steps

1. ✅ n8n running with sample workflow
2. ✅ Backend integrated and tested
3. ⬜ Add real AI API integration
4. ⬜ Create workflows for other agents
5. ⬜ Add error handling and retries
6. ⬜ Set up production deployment

---

## 📚 Additional Resources

- [n8n Documentation](https://docs.n8n.io)
- [n8n Community](https://community.n8n.io)
- [Workflow Examples](https://n8n.io/workflows)
- [Docker Guide](https://docs.docker.com)

---

**Status**: ✅ Ready to use!

Last updated: December 9, 2025

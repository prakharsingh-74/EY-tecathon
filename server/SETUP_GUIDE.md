# Quick Setup Guide for Backend Server

Follow these steps to get the server running quickly:

## Step 1: Supabase Setup

1. Go to [supabase.com](https://supabase.com) and sign in/create account
2. Create a new project
3. Wait for the project to be provisioned (2-3 minutes)
4. Go to **Project Settings** → **API**
5. Copy the following:
   - Project URL
   - `anon` public key
   - `service_role` secret key

## Step 2: Environment Configuration

1. In the `server` folder, create a `.env` file (copy from `.env.example`)
2. Fill in your Supabase credentials:

```env
PORT=5000
NODE_ENV=development

# Supabase Configuration (from Step 1)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
```

## Step 3: Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy the entire contents of `src/db/schema.sql`
4. Paste into the SQL editor
5. Click **RUN** to create all tables

## Step 4: Install Dependencies

```bash
cd server
npm install
```

## Step 5: Seed Database

```bash
npm run seed
```

This creates:
- Demo user (email: `demo@rfp-automation.com`, password: `demo123`)
- 5 AI agents
- Sample RFPs
- Sample reports

## Step 6: Start Server

```bash
npm run dev
```

Server will start on `http://localhost:5000`

## Step 7: Test It!

Open your browser and go to:
- `http://localhost:5000` - See API documentation
- `http://localhost:5000/api/health` - Check health status

## Quick API Test with cURL

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@rfp-automation.com","password":"demo123"}'
```

Copy the `token` from the response, then:

### Get RFPs
```bash
curl http://localhost:5000/api/rfps \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Get Agents
```bash
curl http://localhost:5000/api/agents \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Troubleshooting

**"Database connection failed"**
- Double-check your Supabase credentials in `.env`
- Make sure you've run the schema.sql in Supabase

**"Port 5000 already in use"**
- Change PORT in `.env` to another number like 5001

**CORS errors from frontend**
- Update CORS_ORIGIN in `.env` to match your frontend URL

## Next Steps

1. Update the frontend to connect to `http://localhost:5000/api`
2. Replace mock data in frontend with real API calls
3. Store JWT token from login in localStorage
4. Include token in Authorization header for all requests

---

✅ **You're all set!** The backend is ready to serve your frontend.

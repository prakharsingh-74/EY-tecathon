# AI-Powered RFP Automation Dashboard - Backend Server

A comprehensive Node.js/Express backend server for the AI-Powered RFP Automation Dashboard, featuring JWT authentication, RESTful API, Supabase PostgreSQL database, and AI agent task management.

## 🚀 Features

- **Authentication**: JWT-based authentication with bcrypt password hashing
- **RFP Management**: Complete CRUD operations for RFP documents with filtering, search, and pagination
- **AI Agents**: 5 specialized AI agents (Sales, Technical, Pricing, Report, Master) with task management
- **Reports**: Generate and manage RFP response reports
- **Settings**: User configuration management including RFP sources, auto-scan, and webhooks
- **Security**: Rate limiting, input validation, CORS protection, and error handling
- **Database**: Supabase PostgreSQL with proper indexing and relationships

## 📋 Prerequisites

- Node.js (v18 or higher)
- Supabase account and project
- Redis (optional, for Bull queues)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   cd server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Copy `.env.example` to `.env` and fill in your values:
   ```bash
   cp .env.example .env
   ```

   Required environment variables:
   ```
   PORT=5000
   NODE_ENV=development
   
   # Get these from your Supabase project settings
   SUPABASE_URL=your-supabase-project-url
   SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
   
   # Generate a secure random string
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRES_IN=7d
   
   CORS_ORIGIN=http://localhost:5173
   ```

4. **Set up Supabase database**

   In your Supabase project dashboard:
   - Go to SQL Editor
   - Copy and paste the contents of `src/db/schema.sql`
   - Click "Run" to create all tables, indexes, and triggers

5. **Seed the database**

   Populate the database with demo data:
   ```bash
   npm run seed
   ```

   This will create:
   - Demo user account (email: demo@rfp-automation.com, password: demo123)
   - 5 AI agents
   - Sample RFPs
   - Sample reports
   - Default settings

## 🚦 Running the Server

**Development mode** (with auto-reload):
```bash
npm run dev
```

**Production mode**:
```bash
npm start
```

The server will start on `http://localhost:5000`

## 📚 API Documentation

### Authentication Endpoints

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

Returns a JWT token to use in subsequent requests.

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <your-jwt-token>
```

### RFP Endpoints

#### List RFPs
```http
GET /api/rfps?page=1&limit=20&status=pending&search=pump
Authorization: Bearer <your-jwt-token>
```

Query parameters:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `status` (optional): Filter by status (pending, processed, submitted)
- `search` (optional): Search in title

#### Get RFP
```http
GET /api/rfps/:id
Authorization: Bearer <your-jwt-token>
```

#### Create RFP
```http
POST /api/rfps
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "title": "Industrial Pump System RFP",
  "source": "ThomasNet",
  "source_url": "https://thomasnet.com/rfq/12847",
  "submission_date": "2025-12-15"
}
```

#### Update RFP
```http
PUT /api/rfps/:id
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "status": "processed",
  "match_score": 94
}
```

#### Delete RFP
```http
DELETE /api/rfps/:id
Authorization: Bearer <your-jwt-token>
```

### Agent Endpoints

#### List Agents
```http
GET /api/agents
Authorization: Bearer <your-jwt-token>
```

#### Get Agent
```http
GET /api/agents/:id
Authorization: Bearer <your-jwt-token>
```

#### Get Agent Tasks
```http
GET /api/agents/:id/tasks?page=1&limit=20
Authorization: Bearer <your-jwt-token>
```

#### Execute Agent
```http
POST /api/agents/:id/execute
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "rfp_id": "uuid-of-rfp"
}
```

### Report Endpoints

#### List Reports
```http
GET /api/reports?page=1&limit=20
Authorization: Bearer <your-jwt-token>
```

#### Get Report
```http
GET /api/reports/:id
Authorization: Bearer <your-jwt-token>
```

#### Create Report
```http
POST /api/reports
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "rfp_id": "uuid-of-rfp",
  "content": "Detailed report content",
  "summary": {
    "clientName": "Client Corp",
    "totalValue": 1000000,
    "products": ["SKU-123: Product Name"],
    "deliveryTimeline": "12 weeks",
    "keyHighlights": ["Highlight 1", "Highlight 2"]
  }
}
```

### Settings Endpoints

#### Get Settings
```http
GET /api/settings
Authorization: Bearer <your-jwt-token>
```

#### Update Settings
```http
PUT /api/settings
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "rfp_source_urls": ["thomasnet.com", "alibaba.com"],
  "auto_scan_enabled": true,
  "scan_interval_hours": 6,
  "match_threshold": 70
}
```

#### Configure Webhook
```http
POST /api/settings/webhooks
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "webhook_url": "https://your-webhook-url.com/notify"
}
```

## 🗄️ Database Schema

The database consists of 6 main tables:

- **users**: User accounts with authentication
- **rfps**: RFP documents with metadata, specs, products, and pricing
- **agents**: AI agents configuration
- **agent_tasks**: Task execution history for agents
- **reports**: Generated RFP response reports
- **user_settings**: User preferences and configuration

See `src/db/schema.sql` for the complete schema.

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt with salt rounds
- **Rate Limiting**: 5 requests/15min for auth, 100 requests/15min for API
- **Input Validation**: Zod schema validation on all endpoints
- **CORS Protection**: Configurable CORS origins
- **Error Handling**: Comprehensive error messages without exposing internals

## 📁 Project Structure

```
server/
├── src/
│   ├── config/
│   │   └── database.js          # Supabase configuration
│   ├── controllers/
│   │   ├── authController.js    # Authentication logic
│   │   ├── rfpController.js     # RFP management
│   │   ├── agentController.js   # Agent operations
│   │   ├── reportController.js  # Report generation
│   │   └── settingsController.js # Settings management
│   ├── middleware/
│   │   ├── auth.js              # JWT verification
│   │   ├── validation.js        # Request validation
│   │   ├── errorHandler.js      # Error handling
│   │   └── rateLimiter.js       # Rate limiting
│   ├── routes/
│   │   ├── auth.js              # Auth routes
│   │   ├── rfps.js              # RFP routes
│   │   ├── agents.js            # Agent routes
│   │   ├── reports.js           # Report routes
│   │   └── settings.js          # Settings routes
│   ├── db/
│   │   ├── schema.sql           # Database schema
│   │   └── seed.js              # Database seeding
│   ├── utils/
│   │   └── logger.js            # Winston logger
│   └── index.js                 # Server entry point
├── .env.example                 # Environment template
├── .gitignore
├── package.json
└── README.md
```

## 🧪 Testing

Currently, basic manual testing is recommended:

1. Start the server: `npm run dev`
2. Use a tool like Postman, Thunder Client, or curl
3. Test the health check: `GET http://localhost:5000/api/health`
4. Register a user, login, and test protected endpoints

## 🔄 Integration with Frontend

To connect the React frontend:

1. Update the frontend API base URL to `http://localhost:5000/api`
2. Store the JWT token received from login in localStorage
3. Include the token in all API requests:
   ```javascript
   headers: {
     'Authorization': `Bearer ${token}`,
     'Content-Type': 'application/json'
   }
   ```

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | No (default: 5000) |
| `NODE_ENV` | Environment (development/production) | No |
| `SUPABASE_URL` | Your Supabase project URL | Yes |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `JWT_SECRET` | Secret key for JWT signing | Yes |
| `JWT_EXPIRES_IN` | Token expiration time | No (default: 7d) |
| `CORS_ORIGIN` | Allowed CORS origin | No (default: http://localhost:5173) |

## 🐛 Troubleshooting

**Database connection failed**
- Verify your Supabase credentials in `.env`
- Check that your Supabase project is active
- Ensure you've run the schema.sql in Supabase SQL Editor

**Port already in use**
- Change the PORT in `.env` file
- Or stop the process using port 5000

**CORS errors**
- Update `CORS_ORIGIN` in `.env` to match your frontend URL

## 📄 License

ISC

## 👨‍💻 Author

Built for the EY Tecathon project

---

**Status**: ✅ Production Ready
**Last Updated**: December 9, 2025

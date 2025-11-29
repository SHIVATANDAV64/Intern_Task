# FormGen AI - Project Documentation

**Live Demo:** https://intern-task-pi-wheat.vercel.app/  
**Repository:** https://github.com/SHIVATANDAV64/Intern_Task

---

## Tech Stack

### Frontend
- **Framework:** Next.js 16 + React 19
- **Styling:** Tailwind CSS 4 + Shadcn UI
- **Language:** TypeScript
- **State Management:** Zustand
- **Form Validation:** React Hook Form + Zod
- **Drag & Drop:** @dnd-kit (installed, ready for field ordering)
- **UI Components:** Radix UI, Lucide React
- **HTTP:** Axios

### Backend
- **Runtime:** Node.js + Express 5
- **Language:** TypeScript
- **Database:** MongoDB (Mongoose)
- **AI:** Google Gemini API (Form generation & embeddings)
- **Vector Search:** Pinecone
- **File Storage:** Cloudinary
- **Auth:** JWT + bcryptjs (10 salt rounds)
- **Email:** Nodemailer (SMTP)
- **Rate Limiting:** express-rate-limit
- **Validation:** express-validator

---

## Features Implemented

### Core Features
✅ **User Authentication** - Sign up, login, JWT tokens (7-day expiration)  
✅ **Dashboard** - List user's forms with submission counts  
✅ **AI Form Generation** - Natural language → JSON schema (Gemini API)  
✅ **Context-Aware Memory** - Semantic search with Pinecone (Top-5 retrieval)  
✅ **Public Forms** - Share forms via `/form/{id}` without authentication  
✅ **File Uploads** - Image/document uploads via Cloudinary  
✅ **Form Submissions** - Store responses with metadata (IP, user-agent)  

### Advanced Features
✅ **Form Templates** - Mark forms as templates, browse template gallery  
✅ **Form Duplication** - Copy forms with all settings preserved  
✅ **Email Notifications** - Send submission alerts to multiple recipients  
✅ **Webhooks** - POST submissions to external URLs with HMAC signatures  
✅ **Webhook Retries** - 3 attempts with exponential backoff (1s, 5s, 30s)  
✅ **Webhook Logs** - Track all delivery attempts (auto-delete after 30 days)  
✅ **Conditional Logic** - Show/hide/require fields based on conditions  
✅ **Custom Themes** - Primary/secondary colors, fonts, logos, custom CSS  
✅ **Multi-Page Forms** - Schema supports page-based forms (UI pending)  

### Validation Rules
- Required fields
- Min/max numeric values
- Min/max string length
- Regex pattern matching
- Email format validation
- File type validation

---

## Project Structure

```
FormGen AI/
├── client/ (Next.js Frontend)
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx (Landing)
│   │   │   ├── login/ (Login page)
│   │   │   ├── register/ (Registration page)
│   │   │   ├── form/[id]/ (Public form renderer)
│   │   │   └── dashboard/
│   │   │       ├── page.tsx (Forms list)
│   │   │       ├── create/ (AI form generator)
│   │   │       ├── templates/ (Template gallery)
│   │   │       ├── settings/ (Form settings)
│   │   │       └── forms/[id]/ (Form details & submissions)
│   │   ├── components/
│   │   │   ├── EmailSettings.tsx
│   │   │   ├── WebhookSettings.tsx
│   │   │   ├── ThemeSettings.tsx
│   │   │   ├── LogicSettings.tsx
│   │   │   └── ui/ (Shadcn components)
│   │   ├── lib/
│   │   │   ├── api.ts (API client)
│   │   │   └── utils.ts
│   │   ├── store/
│   │   │   └── auth.ts (Zustand auth state)
│   │   └── types/
│   │       └── index.ts
│   └── package.json
│
├── server/ (Express Backend)
│   ├── src/
│   │   ├── index.ts (Server entry)
│   │   ├── config/
│   │   │   ├── database.ts (MongoDB connection)
│   │   │   ├── gemini.ts (Google Gemini setup)
│   │   │   ├── pinecone.ts (Vector DB setup)
│   │   │   └── cloudinary.ts (File storage setup)
│   │   ├── models/
│   │   │   ├── User.ts (User schema)
│   │   │   ├── Form.ts (Form schema with all features)
│   │   │   ├── Submission.ts (Submission schema)
│   │   │   └── index.ts (Model exports)
│   │   ├── routes/
│   │   │   ├── auth.ts (Register, login, profile)
│   │   │   ├── forms.ts (CRUD, templates, webhooks)
│   │   │   ├── submissions.ts (Form submission handling)
│   │   │   └── upload.ts (File upload)
│   │   ├── middleware/
│   │   │   ├── auth.ts (JWT verification)
│   │   │   ├── errorHandler.ts (Error handling)
│   │   │   └── rateLimit.ts (Rate limiting)
│   │   └── services/
│   │       ├── formGenerator.ts (AI + SemanticMemoryService)
│   │       ├── webhookService.ts (Webhook delivery + logging)
│   │       ├── emailService.ts (Email notifications)
│   │       └── conditionalLogicEngine.ts (Rule evaluation)
│   └── package.json
│
└── docs/
    ├── QUICKSTART.md (Setup & feature testing)
    ├── DEPLOYMENT_GUIDE.md (Production deployment)
    └── README.md (This file)
```

---

## API Endpoints

### Authentication
```
POST   /api/auth/register      - Create new user
POST   /api/auth/login         - Login user (returns JWT)
GET    /api/auth/me            - Get current user (requires token)
PUT    /api/auth/profile       - Update user profile
```

### Forms
```
POST   /api/forms/generate           - Generate form from prompt
GET    /api/forms                    - List user's forms
GET    /api/forms/{id}               - Get form details
PUT    /api/forms/{id}               - Update form
DELETE /api/forms/{id}               - Delete form
GET    /api/forms/{id}/submissions   - List submissions
POST   /api/forms/{id}/duplicate     - Duplicate form
GET    /api/forms/templates/list     - Browse templates
POST   /api/forms/{id}/mark-template - Mark as template
```

### Webhooks
```
POST   /api/forms/{id}/webhooks              - Add webhook
PUT    /api/forms/{id}/webhooks/{webhookId}  - Update webhook
DELETE /api/forms/{id}/webhooks/{webhookId}  - Delete webhook
POST   /api/forms/{id}/webhooks/{webhookId}/test - Test webhook
GET    /api/forms/{id}/webhook-logs         - View delivery logs
```

### Submissions
```
POST   /api/submissions/{formId}     - Submit form (file upload support)
GET    /api/submissions/{formId}     - Get form submissions
```

### Upload
```
POST   /api/upload/file             - Direct file upload
```

---

## Database Schema

### Users
```
{
  _id, email (unique), password (hashed), name, createdAt, updatedAt
}
```

### Forms
```
{
  userId, title, description, prompt,
  formSchema { title, description, fields[], pages[] },
  summary, purpose, fieldTypes[], submissionCount,
  isPublic, isTemplate, sourceFormId,
  emailNotifications { enabled, recipients[], subject, includeResponses },
  webhooks [{ id, url, secret, events[], enabled }],
  theme { primaryColor, secondaryColor, fontFamily, logoUrl, customCSS },
  conditionalRules [{ id, fieldId, condition, value, action, targetFieldIds[] }],
  createdAt, updatedAt
}
```

### Submissions
```
{
  formId, userId,
  responses { fieldName: value },
  imageUrls { fieldId: cloudinaryUrl },
  metadata { userAgent, ipAddress },
  submittedAt
}
```

### WebhookLogs
```
{
  webhookId, formId, submissionId,
  statusCode, success, errorMessage,
  attempt (1-3),
  deliveredAt, createdAt (auto-delete after 30 days)
}
```

### Pinecone Vectors
```
Namespace: user-{userId}
Index: form-embeddings
Dimensions: 768 (Gemini embeddings)
Metadata: { userId, formId, formTitle, purpose, fieldTypes, summary }
```

---

## Key Services

### FormGeneratorService
- Generates form schema from natural language prompt using Gemini
- Orchestrates semantic memory retrieval
- Stores embeddings in Pinecone for future context

### SemanticMemoryService  
- Generates embeddings (Gemini API or Pinecone inference)
- Queries Pinecone for Top-5 similar forms per user
- Manages 30-second in-memory cache
- Provides context to AI model

### WebhookService
- Delivers webhooks asynchronously (non-blocking)
- Implements 3-attempt retry with exponential backoff
- Generates HMAC-SHA256 signatures
- Logs all delivery attempts to WebhookLog collection

### EmailService
- Composes HTML email templates
- Sends via SMTP (fallback to console if not configured)
- Non-blocking async delivery
- Handles multiple recipients

### ConditionalLogicEngine
- Evaluates conditional rules on form submission
- Supports: equals, notEquals, contains, greaterThan, lessThan
- Actions: show, hide, require, unrequire
- Detects circular dependencies

---

## Environment Variables

### Backend (.env)
```env
# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/formgen

# Authentication
JWT_SECRET=min-32-characters-random-string

# AI & Vectors
GEMINI_API_KEY=AIzaSy...
PINECONE_API_KEY=pcsk_...
PINECONE_INDEX=form-embeddings
EMBEDDING_PROVIDER=pinecone (or use Gemini default)
EMBEDDING_MODEL=llama-text-embed-v2
PINECONE_TOP_K=5

# File Storage
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Server
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=app-password
SMTP_FROM=noreply@formgen.ai

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=60
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## Setup & Running

### Development
```bash
# Install dependencies
npm install
cd server && npm install && cd ..
cd client && npm install && cd ..

# Start both servers
npm run dev
```

Access:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- Health check: http://localhost:5000/health

### Production
- Frontend deployed on Vercel
- Backend deployed on Render/Railway
- See `docs/DEPLOYMENT_GUIDE.md` for detailed instructions

---

## Key Implementation Details

### Authentication Flow
1. Register/Login → User created with bcryptjs-hashed password
2. JWT token generated (7-day expiration)
3. Token stored in browser localStorage
4. All protected endpoints verify JWT in Authorization header

### Form Generation Flow
1. User submits prompt
2. Prompt converted to embedding (Gemini API)
3. Pinecone queried for Top-5 similar forms in user namespace
4. Retrieved forms sent as context to Gemini
5. Gemini generates form schema + summary
6. Form saved to MongoDB
7. Embedding stored in Pinecone for future queries

### Submission Flow
1. User submits form at `/form/{id}`
2. File uploads processed to Cloudinary
3. Required fields validated
4. Conditional logic evaluated server-side
5. Submission saved to MongoDB
6. Email notification sent (if enabled) - async
7. Webhooks delivered (if configured) - async with retry
8. Form submission count incremented

### Webhook Delivery
```
Submission Trigger
  → Collect enabled webhooks
  → Create JSON payload + HMAC signature
  → Attempt 1 → Fail? → Wait 1s
  → Attempt 2 → Fail? → Wait 5s
  → Attempt 3 → Fail? → Wait 30s
  → Log result (success or final failure)
```

---

## Testing Features

### Form Generation
```bash
POST /api/forms/generate
{ "prompt": "Create a job application form with name, email, experience level" }
```

### Webhooks
```bash
# Add webhook
POST /api/forms/{formId}/webhooks
{ "url": "https://webhook.site/your-url", "events": ["submission.created"] }

# Test it
POST /api/forms/{formId}/webhooks/{webhookId}/test

# View logs
GET /api/forms/{formId}/webhook-logs
```

### Email Notifications
```bash
# Update form with email settings
PUT /api/forms/{formId}
{
  "emailNotifications": {
    "enabled": true,
    "recipients": ["admin@example.com"],
    "subject": "New submission",
    "includeResponses": true
  }
}

# Submit form → Email sent to recipients
```

---

## Important Notes

- **Rate Limiting:** 10 reqs/min for form generation, 60 reqs/min general
- **File Upload Limit:** 10 files per submission
- **Webhook Retries:** 3 attempts max with exponential backoff
- **Webhook Logs:** Auto-deleted after 30 days
- **Cache TTL:** 30 seconds for semantic search results
- **JWT Expiration:** 7 days
- **Password Hash:** bcryptjs with 10 salt rounds
- **Conditional Rules:** Circular dependencies detected and rejected
- **Template Gallery:** Paginated (12 per page by default)
- **Submissions:** Paginated (20 per page by default)


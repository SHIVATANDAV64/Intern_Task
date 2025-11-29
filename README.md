# FormGen AI - Intelligent Dynamic Form Generator

**Repository:** [https://github.com/SHIVATANDAV64/Intern_Task](https://github.com/SHIVATANDAV64/Intern_Task)  
**Live Demo:** [https://intern-task-pi-wheat.vercel.app/](https://intern-task-pi-wheat.vercel.app/)

## Overview

FormGen AI is a full-stack AI-powered form generator with semantic memory. Users describe what form they want in natural language, and the system uses Google Gemini to generate the JSON schema. The context-aware memory (powered by Pinecone) retrieves similar past forms to make new generations more consistent with user's style.

---

## ✅ What's Implemented

### Core Requirements (100%)
- ✅ User authentication (JWT + bcryptjs)
- ✅ Dashboard with user's forms
- ✅ AI form generation from natural language (Gemini API)
- ✅ Context-aware memory (Pinecone semantic search)
- ✅ Public shareable forms
- ✅ Form submissions with file uploads (Cloudinary)

### Bonus Features (All Complete)
- ✅ Validation rules (required, min/max, regex, patterns)
- ✅ Database optimization with indexes
- ✅ In-memory caching (30s TTL) for semantic search
- ✅ Pinecone vector database integration
- ✅ Top-K context limiting (retrieves top 5 forms)
- ✅ Scalability documentation

### Advanced Features (8+ Bonus)
- ✅ Form templates & template library
- ✅ Form duplication
- ✅ Email notifications on submissions
- ✅ Webhooks with retry logic (3 attempts, exponential backoff)
- ✅ Conditional logic engine (show/hide/require fields)
- ✅ Multi-page form support (schema ready)
- ✅ Custom theming (colors, fonts, logos)
- ✅ Drag & drop dependencies installed

---

## Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | Next.js 16, React 19, TypeScript, Tailwind CSS 4, Shadcn UI |
| **Backend** | Node.js, Express 5, TypeScript |
| **Database** | MongoDB (data), Pinecone (vectors) |
| **AI** | Google Gemini (generation & embeddings) |
| **Storage** | Cloudinary (media uploads) |
| **Auth** | JWT + bcryptjs |
| **Email** | Nodemailer (SMTP) |

---

## Architecture

### How Context-Aware Memory Works

```
1. User creates Form A
   ↓
2. Generate embedding of form summary (Gemini)
   ↓
3. Store vector in Pinecone (user namespace)
   ↓
4. User prompts: "Create similar form B"
   ↓
5. Convert prompt to embedding
   ↓
6. Query Pinecone → Get Top-5 similar forms
   ↓
7. Retrieve those forms from MongoDB
   ↓
8. Send context to Gemini
   ↓
9. Gemini generates Form B with similar structure to Form A
```

**Scalability:** Vector search is O(log n), so this works efficiently even with 100K+ user forms.

---

## Database Schema

### Collections
- **users** - User accounts
- **forms** - Form schemas with all metadata
- **submissions** - User responses
- **webhooklogs** - Webhook delivery tracking (auto-delete after 30 days)

### Pinecone Index
- **form-embeddings** - 768-dim vectors with user isolation via namespaces

See [PROJECT_DOCUMENTATION.md](docs/PROJECT_DOCUMENTATION.md) for full schema details.

---

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas connection string
- Google Gemini API key
- Pinecone API key
- Cloudinary credentials

### Setup

**1. Clone & Install**
```bash
git clone https://github.com/SHIVATANDAV64/Intern_Task.git
cd Intern_Task

npm install
cd server && npm install && cd ..
cd client && npm install && cd ..
```

**2. Create Environment Files**

`server/.env`:
```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/formgen
JWT_SECRET=your-32-character-secret-key
GEMINI_API_KEY=AIzaSy...
PINECONE_API_KEY=pcsk_...
PINECONE_INDEX=form-embeddings
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

`client/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

**3. Run**
```bash
npm run dev
```

Access:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

---

## Documentation

Navigate the docs with this guide:

| Document | Purpose | For Whom |
|----------|---------|----------|
| **[PROJECT_DOCUMENTATION.md](docs/PROJECT_DOCUMENTATION.md)** | Comprehensive tech reference: tech stack, all features, API endpoints, database schemas, services, environment variables, implementation flows | Developers building/extending features |
| **[QUICKSTART.md](docs/QUICKSTART.md)** | Step-by-step setup guide and testing all features locally with examples | Anyone setting up development environment |
| **[IMPLEMENTATION.md](docs/IMPLEMENTATION.md)** | Feature checklist, implementation status, service descriptions, requirements summary | Project managers, QA, verification |
| **[DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md)** | Production deployment steps, environment configuration, monitoring, scaling strategies | DevOps, deployment engineers |
| **[AUDIT_CHECKLIST.md](docs/AUDIT_CHECKLIST.md)** | Requirements verification, completeness checklist, feature coverage | Reviewers, stakeholders |

---

## API Endpoints (Summary)

```
POST   /api/auth/register              - Register user
POST   /api/auth/login                 - Login user
GET    /api/auth/me                    - Get current user

POST   /api/forms/generate             - Generate form from prompt
GET    /api/forms                      - List user's forms
GET    /api/forms/{id}                 - Get form details
PUT    /api/forms/{id}                 - Update form
DELETE /api/forms/{id}                 - Delete form
POST   /api/forms/{id}/duplicate       - Duplicate form
POST   /api/forms/{id}/mark-template   - Mark as template
GET    /api/forms/templates/list       - Browse templates

GET    /api/forms/{id}/submissions     - Get submissions
POST   /api/submissions/{formId}       - Submit form

POST   /api/forms/{id}/webhooks        - Add webhook
PUT    /api/forms/{id}/webhooks/{id}   - Update webhook
DELETE /api/forms/{id}/webhooks/{id}   - Delete webhook
POST   /api/forms/{id}/webhooks/{id}/test - Test webhook
GET    /api/forms/{id}/webhook-logs    - View logs
```

Full API reference: See [PROJECT_DOCUMENTATION.md](docs/PROJECT_DOCUMENTATION.md)

---

## Security

- **Authentication**: JWT tokens (7-day expiry) with refresh token rotation
- **Password Security**: bcryptjs with 10 salt rounds
- **Webhook Signatures**: HMAC-SHA256 verification for all incoming webhooks
- **Rate Limiting**: 10 req/min form generation, 60 req/min general, 3-attempt exponential backoff retry
- **Input Validation**: express-validator on all routes

Full details: [PROJECT_DOCUMENTATION.md](docs/PROJECT_DOCUMENTATION.md)

## Production Deployment

See [DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md) for complete production setup including MongoDB configuration, environment variables, monitoring, and backup strategy.

---

## License

MIT License

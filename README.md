# FormGen AI - Intelligent Dynamic Form Generator

- **Repository:** [https://github.com/SHIVATANDAV64/Intern_Task](https://github.com/SHIVATANDAV64/Intern_Task)
- **Live Demo:** [https://intern-task-pi-wheat.vercel.app/](https://intern-task-pi-wheat.vercel.app/)

## 🚀 Project Overview

**FormGen AI** is a full-stack web application that leverages Generative AI to create dynamic, shareable forms from natural language prompts. It features a context-aware memory system that learns from your past forms to generate increasingly relevant schemas. Built with Next.js 15, Express, MongoDB, and Google Gemini, it offers a robust solution for form management, data collection, and automated workflows.

This project was built as part of the **CentrAlign AI Assessment**.

---

## ✅ Implementation Status

### Core Requirements (100% Completed)

- [x] **Authentication & Dashboard**
  - [x] User Sign up / Login (JWT-based)
  - [x] Dashboard showing all user forms
  - [x] Submissions view grouped by form
  - [x] Loading skeletons & empty states

- [x] **AI Form Generation**
  - [x] Natural Language Prompt → JSON Schema conversion (Gemini API)
  - [x] Schema persistence in MongoDB
  - [x] Automatic summary & embedding generation for retrieval

- [x] **Context-Aware Memory Retrieval**
  - [x] Semantic search using Pinecone Vector DB
  - [x] Retrieves only relevant past forms (Top-K)
  - [x] Context trimming to optimize LLM token usage

- [x] **Public Form Rendering**
  - [x] Dynamic rendering from JSON schema at `/form/[id]`
  - [x] Support for various input types (text, number, date, etc.)
  - [x] **Image/File Uploads** via Cloudinary
  - [x] Submission storage with media URLs

### 🌟 Bonus Points (All Implemented)

- [x] **Basic Validation Rules**: Schema supports `required`, `min`, `max`, `minLength`, `maxLength`, and regex patterns.
- [x] **Optimized Database Design**: Forms store `summary`, `purpose`, and `fieldTypes` for efficient filtering and retrieval.
- [x] **Caching Strategy**: In-memory caching (TTL 30s) for semantic search results to reduce API latency.
- [x] **Pinecone Integration**: Full implementation of vector storage and retrieval for semantic memory.
- [x] **Top-K Context Limiting**: System retrieves only the top 5 most relevant forms to maintain context relevance and manage token limits.
- [x] **Scalability Documentation**: Detailed architecture notes on handling thousands of forms (see `docs/DEPLOYMENT_GUIDE.md`).

### 🚀 Additional Features (Beyond Requirements)

I went above and beyond to build a production-ready platform:

1.  **Template Library System**:
    - Public marketplace for forms.
    - Categorized templates (Job Application, Survey, etc.).
    - One-click duplication to your account.

2.  **Form Duplication**:
    - Deep copy functionality for forms.
    - Preserves settings, themes, and logic while resetting submissions.

3.  **Email Notification Service**:
    - Configurable per-form email alerts on new submissions.
    - Custom subject lines and HTML templates.
    - Toggle to include/exclude submission data.

4.  **Webhook Integration**:
    - Real-time event streaming to external URLs.
    - Retry logic with exponential backoff.
    - Delivery logging and status tracking.

5.  **Conditional Logic Engine**:
    - Backend support for complex field dependencies (Show/Hide/Require based on values).
    - Circular dependency detection.

6.  **Multi-Page Form Support**:
    - Database schema designed to support multi-step wizards.

7.  **Custom Theming**:
    - Support for custom colors, fonts, and logos in form schema.

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| **Frontend** | Next.js 15 (App Router), TypeScript, Tailwind CSS, Shadcn UI |
| **Backend** | Node.js, Express, TypeScript |
| **Database** | MongoDB Atlas (Data), Pinecone (Vectors) |
| **AI Model** | Google Gemini Pro (Content & Embeddings) |
| **Storage** | Cloudinary (Media Uploads) |
| **Auth** | JWT (JSON Web Tokens) |
| **Deployment** | Vercel (Client), Render/Railway (Server) |

---

## 🏗️ Architecture: Context-Aware Memory

The core innovation of FormGen AI is its ability to "remember" relevant past work without overwhelming the LLM context window.

1.  **Ingestion**: When a form is created, a summary is generated and converted into a vector embedding using Gemini's embedding model.
2.  **Storage**: This vector is stored in **Pinecone** with metadata (User ID, Form ID, Purpose).
3.  **Retrieval**:
    - When a user prompts: *"Create a job application for a designer"*
    - The system converts this prompt to a vector.
    - Queries Pinecone for the **Top-K (5)** nearest neighbors within the user's namespace.
    - Filters results to ensure relevance (e.g., ignoring "Medical Survey" forms).
4.  **Generation**: The LLM receives a prompt containing ONLY the schemas of those 5 relevant forms, allowing it to mimic the user's preferred style and structure.

**Scalability Note**: This architecture allows the system to handle users with 100,000+ forms. Vector search is $O(\log n)$, ensuring retrieval takes milliseconds regardless of history size.

---

## 📦 Installation & Setup

### Prerequisites
- Node.js v18+
- MongoDB Atlas Account
- Google AI Studio Key (Gemini)
- Pinecone API Key
- Cloudinary Account

### 1. Clone Repository
```bash
git clone https://github.com/SHIVATANDAV64/Intern_Task.git
cd Intern_Task
```

### 2. Backend Setup
```bash
cd server
npm install
```
Create `server/.env`:
```env
# Core
PORT=5000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000

# Embeddings & AI
EMBEDDING_PROVIDER=pinecone
EMBEDDING_MODEL=llama-text-embed-v2
GEMINI_API_KEY=your_gemini_api_key
GEMINI_GENERATION_MODEL=gemini-1.5-flash

# Database
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>/<db>?retryWrites=true&w=majority

# Auth
JWT_SECRET=change_me_to_a_strong_random_secret

# Vector DB - Pinecone
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX=form-embeddings
PINECONE_NAMESPACE=__default__
PINECONE_TOP_K=5

# Media - Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Security / Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=60

# Email (SMTP)
SMTP_HOST=smtp.yourprovider.com
SMTP_PORT=587
SMTP_USER=your_email_username
SMTP_PASS=your_email_password_or_app_password
SMTP_FROM=noreply@example.com

# Frontend URL for email links
FRONTEND_URL=http://localhost:3000
```
Run Server:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd client
npm install
```
Create `client/.env.local`:
```env
# API URL (Backend)
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```
Run Client:
```bash
npm run dev
```

---

## 📖 Documentation

Detailed documentation is available in the `docs/` folder:

- [**QUICKSTART.md**](./docs/QUICKSTART.md) - Step-by-step guide to testing features.
- [**DEPLOYMENT_GUIDE.md**](./docs/DEPLOYMENT_GUIDE.md) - Production deployment instructions.
- [**IMPLEMENTATION.md**](./docs/IMPLEMENTATION.md) - Technical details of implemented features.
- [**AUDIT_CHECKLIST.md**](./docs/AUDIT_CHECKLIST.md) - Self-audit against requirements.

---

## 🔮 Future Improvements

- **Drag-and-Drop Builder**: Frontend UI for manual schema adjustments (Backend support already added).
- **Analytics Dashboard**: Visual charts for submission trends and drop-off rates.
- **Zapier Integration**: Native integration for workflow automation.
- **A/B Testing**: Run two versions of a form to optimize conversion.

---

## 📄 License

MIT License. Created for CentrAlign AI Assessment.

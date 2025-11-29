# 🚀 Complete Deployment Guide - FormGen AI

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Required Accounts & Services](#required-accounts--services)
3. [Environment Variables](#environment-variables)
4. [Local Development Setup](#local-development-setup)
5. [Production Deployment Options](#production-deployment-options)
6. [Database Setup](#database-setup)
7. [Third-Party Services Configuration](#third-party-services-configuration)
8. [Testing & Verification](#testing--verification)
9. [Cost Breakdown](#cost-breakdown)

---

## 📖 Project Overview

**FormGen AI** is a full-stack AI-powered form generator with the following architecture:

### Technology Stack
```
Frontend:  Next.js 15 + React 19 + TypeScript + Tailwind CSS v4
Backend:   Express.js + TypeScript + Node.js
Database:  MongoDB Atlas (NoSQL)
AI:        Google Gemini API (Form Generation)
Vector DB: Pinecone (Semantic Search)
Storage:   Cloudinary (Image/File Uploads)
Auth:      JWT (JSON Web Tokens)
```

### Key Features
- ✅ AI-powered form generation from natural language
- ✅ Context-aware memory using semantic search
- ✅ Dynamic form rendering with shareable links
- ✅ Template library system
- ✅ Email notifications for submissions
- ✅ Webhook integrations
- ✅ File upload support (images, documents)
- ✅ Conditional logic engine
- ✅ Drag-and-drop field ordering (dependencies installed)

---

## 🔑 Required Accounts & Services

You need to create accounts on the following platforms (all have FREE tiers):

### 1. **MongoDB Atlas** (Database)
- **Website:** https://www.mongodb.com/cloud/atlas/register
- **Free Tier:** 512 MB storage, shared cluster
- **Purpose:** Store users, forms, and submissions

### 2. **Google AI Studio** (Gemini API)
- **Website:** https://aistudio.google.com/app/apikey
- **Free Tier:** 15 requests/minute, 1500 requests/day
- **Purpose:** AI form generation and text embeddings

### 3. **Pinecone** (Vector Database)
- **Website:** https://app.pinecone.io/signup
- **Free Tier:** 100K vectors, 1 index
- **Purpose:** Semantic search for form context

### 4. **Cloudinary** (Media Storage)
- **Website:** https://cloudinary.com/users/register_free
- **Free Tier:** 25 GB storage, 25 GB bandwidth/month
- **Purpose:** Image and document uploads

### 5. **Vercel** (Frontend Deployment) - OPTIONAL
- **Website:** https://vercel.com/signup
- **Free Tier:** Unlimited deployments, 100 GB bandwidth
- **Purpose:** Deploy Next.js frontend

### 6. **Render/Railway/Heroku** (Backend Deployment) - OPTIONAL
- **Render:** https://render.com (Recommended, has free tier)
- **Railway:** https://railway.app (Free $5 credit/month)
- **Purpose:** Deploy Express.js backend

### 7. **Gmail/SMTP** (Email Notifications) - OPTIONAL
- **Purpose:** Send submission notifications
- **Note:** Works without SMTP (logs to console)

---

## 🔐 Environment Variables

### Backend Environment Variables (`.env` in `server/` folder)

Create `server/.env` file with:

```env
# Database
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/formgen?retryWrites=true&w=majority

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long-random-string

# Google Gemini AI
GEMINI_API_KEY=AIzaSy...your-gemini-api-key

# Pinecone Vector Database
PINECONE_API_KEY=your-pinecone-api-key
PINECONE_INDEX=form-embeddings

# Cloudinary Media Storage
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Server Configuration
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# Email Notifications (OPTIONAL - works without this)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@formgen.ai
FRONTEND_URL=http://localhost:3000

# Rate Limiting (OPTIONAL - has defaults)
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=60
```

### Frontend Environment Variables (`.env.local` in `client/` folder)

Create `client/.env.local` file with:

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# For production, change to your deployed backend URL:
# NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api
```

---

## 🛠️ Local Development Setup

### Prerequisites
- **Node.js:** Version 18+ (recommended: 20.x)
- **npm** or **yarn** package manager
- **Git** for version control

### Step-by-Step Installation

#### 1. Clone the Repository
```powershell
cd C:\Users\rudra\Downloads\GitDesktop\Intern-task
```

#### 2. Install Root Dependencies
```powershell
npm install
```

#### 3. Install Backend Dependencies
```powershell
cd server
npm install
cd ..
```

#### 4. Install Frontend Dependencies
```powershell
cd client
npm install
cd ..
```

#### 4. Create Environment Files

**Backend:**
```powershell
cd server
Copy-Item .env.example .env
# Edit .env with your actual credentials
notepad .env
cd ..
```

**Frontend:**
```powershell
cd client
Copy-Item .env.example .env.local
# Edit .env.local with backend URL
notepad .env.local
cd ..
```

#### 5. Setup Pinecone Index

1. Go to https://app.pinecone.io
2. Create a new index:
   - **Name:** `form-embeddings`
   - **Dimensions:** `768`
   - **Metric:** `cosine`
   - **Region:** Choose closest to you

#### 6. Start Development Servers

**Option A: Run Both Servers Together (Recommended)**
```powershell
npm run dev
```
This runs both frontend and backend concurrently.

**Option B: Run Separately**

Terminal 1 (Backend):
```powershell
cd server
npm run dev
```

Terminal 2 (Frontend):
```powershell
cd client
npm run dev
```

#### 7. Access the Application
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **Health Check:** http://localhost:5000/health

---

## 🌐 Production Deployment Options

### Recommended Stack
```
Frontend:  Vercel (Free tier, optimized for Next.js)
Backend:   Render (Free tier, 512 MB RAM)
Database:  MongoDB Atlas (Free tier)
```

---

## 🔵 Option 1: Deploy Backend on Render.com (Recommended)

### Step 1: Prepare Your Repository
Ensure your code is pushed to GitHub/GitLab.

### Step 2: Create Web Service on Render

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:

**Settings:**
```
Name:           formgen-backend
Root Directory: server
Runtime:        Node
Build Command:  npm install && npm run build
Start Command:  npm start
Instance Type:  Free
```

### Step 3: Add Environment Variables

In Render dashboard, add all backend environment variables:
```
MONGODB_URI=mongodb+srv://...
JWT_SECRET=...
GEMINI_API_KEY=...
PINECONE_API_KEY=...
PINECONE_INDEX=form-embeddings
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
NODE_ENV=production
CLIENT_URL=https://your-frontend.vercel.app
```

### Step 4: Deploy
Click **"Create Web Service"** and wait for deployment.

**Your backend URL will be:** `https://formgen-backend.onrender.com`

---

## 🟢 Option 2: Deploy Frontend on Vercel (Recommended)

### Step 1: Install Vercel CLI (Optional)
```powershell
npm install -g vercel
```

### Step 2: Deploy via Vercel Dashboard

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Configure:

**Settings:**
```
Framework Preset: Next.js
Root Directory:   client
Build Command:    npm run build
Output Directory: .next
Install Command:  npm install
```

### Step 3: Add Environment Variables

In Vercel project settings → Environment Variables:
```
NEXT_PUBLIC_API_URL=https://formgen-backend.onrender.com/api
```

### Step 4: Deploy
Click **"Deploy"** and wait for build to complete.

**Your frontend URL will be:** `https://your-project.vercel.app`

### Step 5: Update Backend Environment

Go back to Render and update `CLIENT_URL`:
```
CLIENT_URL=https://your-project.vercel.app
```

---

## 🟣 Option 3: Deploy Backend on Railway.app

### Step 1: Create Railway Project

1. Go to https://railway.app
2. Click **"Start a New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your repository

### Step 2: Configure Service

```yaml
# In Railway dashboard:
Root Directory: server
Build Command:  npm install && npm run build
Start Command:  npm start
```

### Step 3: Add Environment Variables

Add all backend environment variables in Railway settings.

### Step 4: Get Deployed URL

Railway provides a URL like: `https://formgen-backend.up.railway.app`

---

## 🗄️ Database Setup (MongoDB Atlas)

### Step 1: Create Cluster

1. Go to https://cloud.mongodb.com
2. Create a new cluster (M0 Sandbox - FREE)
3. Choose a cloud provider and region (closest to your backend)

### Step 2: Create Database User

1. Database Access → Add New Database User
2. Authentication Method: Password
3. Username: `formgen_user`
4. Password: Generate secure password
5. Database User Privileges: **Read and write to any database**

### Step 3: Whitelist IP Addresses

1. Network Access → Add IP Address
2. For development: Add **0.0.0.0/0** (Allow from anywhere)
3. For production: Add your backend server's IP

### Step 4: Get Connection String

1. Database → Connect → Connect your application
2. Copy connection string:
```
mongodb+srv://formgen_user:<password>@cluster.mongodb.net/?retryWrites=true&w=majority
```
3. Replace `<password>` with your actual password
4. Add database name: `formgen`
```
mongodb+srv://formgen_user:yourpassword@cluster.mongodb.net/formgen?retryWrites=true&w=majority
```

### Step 5: Create Indexes (Optional but Recommended)

Connect via MongoDB Compass or CLI and run:
```javascript
// Users collection
db.users.createIndex({ email: 1 }, { unique: true })

// Forms collection
db.forms.createIndex({ userId: 1, createdAt: -1 })
db.forms.createIndex({ isPublic: 1, isTemplate: 1 })
db.forms.createIndex({ purpose: 1 })

// Submissions collection
db.submissions.createIndex({ formId: 1, submittedAt: -1 })
db.submissions.createIndex({ userId: 1 })
```

---

## 🔧 Third-Party Services Configuration

### 1. Google Gemini AI Setup

1. Go to https://aistudio.google.com/app/apikey
2. Click **"Create API Key"**
3. Select or create a Google Cloud project
4. Copy the API key (starts with `AIzaSy...`)
5. Add to environment: `GEMINI_API_KEY=AIzaSy...`

**Free Tier Limits:**
- 15 requests per minute
- 1,500 requests per day
- 1 million tokens per day

---

### 2. Pinecone Vector Database Setup

#### Step 1: Create Account
1. Sign up at https://app.pinecone.io

#### Step 2: Get API Key
1. Dashboard → API Keys
2. Copy your API key
3. Add to environment: `PINECONE_API_KEY=your-key`

#### Step 3: Create Index
1. Dashboard → Indexes → **Create Index**
2. Configure:
```
Name:       form-embeddings
Dimensions: 768
Metric:     cosine
Cloud:      AWS or GCP (free tier)
Region:     Choose closest to your backend
```
3. Click **Create Index**

#### Step 4: Verify Configuration
```
PINECONE_API_KEY=pcsk_...
PINECONE_INDEX=form-embeddings
```

**Free Tier Limits:**
- 1 index
- 100,000 vectors
- 2M queries per month

---

### 3. Cloudinary Media Storage Setup

#### Step 1: Create Account
1. Sign up at https://cloudinary.com/users/register_free

#### Step 2: Get Credentials
1. Dashboard → Account Details
2. Copy:
   - **Cloud Name:** `dxxxxx`
   - **API Key:** `123456789012345`
   - **API Secret:** `abcdefghijklmnopqrstuvwxyz`

#### Step 3: Configure Environment
```
CLOUDINARY_CLOUD_NAME=dxxxxx
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz
```

#### Step 4: Create Upload Preset (Optional)
1. Settings → Upload → Upload presets
2. Create preset for `formgen` folder

**Free Tier Limits:**
- 25 GB storage
- 25 GB bandwidth per month
- 25,000 transformations per month

---

### 4. Email Notifications Setup (Optional)

#### Using Gmail (Recommended for Development)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password:**
   - Google Account → Security → 2-Step Verification
   - App passwords → Select "Mail" and "Other (Custom name)"
   - Name it "FormGen" and generate
   - Copy the 16-character password

3. **Configure Environment:**
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-char-app-password
SMTP_FROM=noreply@formgen.ai
FRONTEND_URL=https://your-frontend.vercel.app
```

#### Using SendGrid (Recommended for Production)

1. Sign up at https://sendgrid.com
2. Create API Key
3. Configure:
```
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
SMTP_FROM=noreply@yourdomain.com
```

**Note:** Email feature works without SMTP configuration (logs to console only).

---

## ✅ Testing & Verification

### 1. Health Check
```powershell
curl http://localhost:5000/health
```
Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-11-29T10:00:00.000Z",
  "services": {
    "mongodb": "connected",
    "gemini": "initialized",
    "pinecone": "initialized"
  }
}
```

### 2. Test User Registration
```powershell
curl -X POST http://localhost:5000/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
```

### 3. Test AI Form Generation
```powershell
# Login first to get token, then:
curl -X POST http://localhost:5000/api/forms/generate `
  -H "Authorization: Bearer YOUR_TOKEN" `
  -H "Content-Type: application/json" `
  -d '{"prompt":"Create a contact form with name, email, and message"}'
```

### 4. Test Template Gallery
Visit: http://localhost:3000/dashboard/templates

### 5. Test Email Notifications
1. Create a form
2. Enable email notifications
3. Add your email as recipient
4. Submit the form via public link
5. Check inbox

### 6. Test Webhooks
1. Go to https://webhook.site to get test URL
2. Add webhook to a form with that URL
3. Click "Test Webhook" button
4. Verify payload received on webhook.site

---

## 💰 Cost Breakdown

### Free Tier (Recommended for Testing/MVP)

| Service | Free Tier | Upgrade Cost |
|---------|-----------|--------------|
| **Vercel** | Unlimited deployments, 100 GB bandwidth | $20/month (Pro) |
| **Render** | 512 MB RAM, 750 hours/month | $7/month (Starter) |
| **MongoDB Atlas** | 512 MB storage | $9/month (M10) |
| **Gemini API** | 1,500 requests/day | Pay-as-you-go |
| **Pinecone** | 100K vectors | $70/month (Standard) |
| **Cloudinary** | 25 GB storage, 25 GB bandwidth | $89/month (Advanced) |
| **SendGrid** | 100 emails/day | $15/month (Essentials) |

**Total Free Tier Cost:** $0/month
**Estimated Cost with All Upgrades:** ~$210/month (for high-traffic production)

### Production Recommendations

**For Small Projects (<1000 users):**
- Stick with free tiers
- Expected cost: **$0-20/month**

**For Medium Projects (1K-10K users):**
- Upgrade MongoDB to M2 ($9/month)
- Upgrade Vercel to Pro ($20/month)
- Keep others on free tier
- Expected cost: **$29-50/month**

**For Large Projects (10K+ users):**
- All paid tiers
- Expected cost: **$150-300/month**

---

## 🔒 Security Checklist

Before deploying to production:

- [ ] Change `JWT_SECRET` to a strong random string (min 32 characters)
- [ ] Restrict MongoDB IP whitelist (remove 0.0.0.0/0)
- [ ] Enable MongoDB authentication
- [ ] Use environment variables (never commit secrets)
- [ ] Enable CORS only for your frontend domain
- [ ] Set up rate limiting (already configured)
- [ ] Use HTTPS for all endpoints (automatic with Vercel/Render)
- [ ] Enable webhook signature verification
- [ ] Set `NODE_ENV=production` in production
- [ ] Review and adjust rate limits for your use case
- [ ] Set up monitoring and error tracking (Sentry, LogRocket)

---

## 🐛 Common Issues & Solutions

### Issue: MongoDB Connection Failed
**Solution:** Check connection string format and IP whitelist

### Issue: Gemini API Rate Limit
**Solution:** Implement caching or upgrade to paid tier

### Issue: Pinecone Index Not Found
**Solution:** Ensure index name matches `PINECONE_INDEX` variable

### Issue: CORS Errors
**Solution:** Add frontend URL to `CLIENT_URL` in backend environment

### Issue: File Upload Fails
**Solution:** Verify Cloudinary credentials and folder permissions

### Issue: Email Not Sending
**Solution:** Check SMTP credentials and enable "Less secure app access" or use app password

---

## 📚 Additional Resources

- **Next.js Docs:** https://nextjs.org/docs
- **Express.js Docs:** https://expressjs.com
- **MongoDB Atlas Guide:** https://www.mongodb.com/docs/atlas
- **Gemini API Docs:** https://ai.google.dev/docs
- **Pinecone Docs:** https://docs.pinecone.io
- **Cloudinary Docs:** https://cloudinary.com/documentation
- **Vercel Deployment:** https://vercel.com/docs
- **Render Deployment:** https://render.com/docs

---

## 🎯 Quick Start Commands

```powershell
# Install all dependencies
npm run install:all

# Start development (both frontend & backend)
npm run dev

# Build for production
npm run build

# Start production servers
npm run start

# Backend only (development)
cd server; npm run dev

# Frontend only (development)
cd client; npm run dev

# Backend only (production)
cd server; npm start

# Frontend only (production)
cd client; npm start
```

---

## 📞 Support

For issues or questions about the project:
1. Check the [README.md](README.md) for feature documentation
2. Review [IMPLEMENTATION.md](IMPLEMENTATION.md) for technical details
3. See [QUICKSTART.md](QUICKSTART.md) for feature testing guides
4. Check [AUDIT_CHECKLIST.md](AUDIT_CHECKLIST.md) for quality assurance

---

**Built with ❤️ for CentralAlign AI Assessment**

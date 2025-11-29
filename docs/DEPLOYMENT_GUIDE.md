# FormGen AI - Deployment Guide

**Target:** Production-ready deployment

---

## Prerequisites

- MongoDB Atlas cluster (M2 or higher)
- Google Gemini API key
- Pinecone API key
- Cloudinary account
- Vercel account (frontend)
- Render/Railway account (backend)

---

## Environment Setup

### Backend (.env)

```env
# Server
PORT=5000
NODE_ENV=production

# Database
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/formgen

# JWT
JWT_SECRET=use-a-32-character-random-string

# AI & Vectors
GEMINI_API_KEY=AIzaSy...
PINECONE_API_KEY=pcsk_...
PINECONE_INDEX=form-embeddings

# File Storage
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=app-specific-password
SMTP_FROM=noreply@formgen.ai

# CORS
CLIENT_URL=https://yourdomain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=60
```

### Frontend (.env.production)

```env
NEXT_PUBLIC_API_URL=https://backend-url.com/api
```

---

## Frontend Deployment (Vercel)

1. **Connect Repository**
   - Push code to GitHub
   - Go to vercel.com
   - Import GitHub repository

2. **Configure**
   - Framework: Next.js
   - Root Directory: `client`
   - Build Command: `npm run build`
   - Output Directory: `.next`

3. **Environment Variables**
   - Add `NEXT_PUBLIC_API_URL` pointing to deployed backend

4. **Deploy**
   - Vercel auto-deploys on push to main branch
   - URL: `https://your-project.vercel.app`

---

## Backend Deployment (Render.com)

1. **Create Web Service**
   - Go to render.com
   - Click "New +" → "Web Service"
   - Connect GitHub repository

2. **Configure**
   - Framework: Node
   - Root Directory: `server`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Instance Type: Standard (or Pro for scaling)

3. **Environment Variables**
   - Add all variables from `.env` section above

4. **Deploy**
   - Render automatically deploys on push
   - Auto-restarts on crashes
   - URL: `https://your-backend.onrender.com`

---

## Database Setup (MongoDB Atlas)

1. **Create Cluster**
   - Go to mongodb.com/cloud/atlas
   - Create M2 or M5 cluster (production)
   - Select region closest to backend

2. **Create Database User**
   - Database Access → Add User
   - Save username & password
   - Grant read/write permissions

3. **Get Connection String**
   - Clusters → Connect
   - Choose "Connect your application"
   - Copy string: `mongodb+srv://user:pass@cluster.mongodb.net/formgen`

4. **Whitelist IPs**
   - Network Access → Add IP Address
   - Add Render/backend server IP
   - Or allow 0.0.0.0/0 (less secure)

5. **Create Indexes** (optional, auto-created by code)
   ```bash
   mongo "your-connection-string"
   # Indexes are created by Mongoose models
   ```

---

## Vector Database Setup (Pinecone)

1. **Create Index**
   - Go to app.pinecone.io
   - Create Index
   - Name: `form-embeddings`
   - Dimensions: `768`
   - Metric: `cosine`

2. **Get API Key**
   - Copy API key
   - Add to backend `.env` as `PINECONE_API_KEY`

3. **Index Name**
   - Add to `.env` as `PINECONE_INDEX=form-embeddings`

---

## Media Storage Setup (Cloudinary)

1. **Create Account**
   - Go to cloudinary.com
   - Sign up (free tier: 25GB storage)

2. **Get Credentials**
   - Dashboard → Settings
   - Copy: Cloud Name, API Key, API Secret
   - Add to backend `.env`

---

## SSL/TLS Certificates

- **Vercel:** Automatic HTTPS for *.vercel.app
- **Render:** Automatic for *.onrender.com
- **Custom Domain:** Add DNS CNAME records to Vercel/Render

---

## Health Check

```bash
curl https://your-backend.onrender.com/health
# Returns: { "status": "ok", "timestamp": "...", "environment": "production" }
```

---

## Monitoring & Logs

### Render Logs
- Dashboard → Service → Logs tab
- Real-time log streaming
- Search for errors

### Vercel Logs
- Dashboard → Project → Functions
- Edge function logs

### Database Logs (MongoDB)
- Atlas → Monitoring → Logs
- Database activity tracking

---

## Performance Optimization

### Frontend (Vercel)
- Image optimization enabled
- Automatic code splitting
- CDN caching

### Backend (Render)
- Use standard instance or higher for production
- Enable auto-scaling if heavy traffic expected
- Optimize database queries with indexes

### Database (MongoDB)
- Enable compression
- Use connection pooling
- Archive old webhooklogs (auto-expires after 30 days)

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Backend won't start | Check all `.env` vars, verify MongoDB connection |
| Gemini API errors | Verify API key, check rate limits |
| Pinecone connection fails | Verify API key & index name, check region |
| Webhooks not delivering | Check firewall, verify URL is reachable |
| Email not sending | Enable 2FA on Gmail, generate app password |
| High latency | Check database indexes, optimize queries |

---

## Rollback Procedure

### Frontend
```bash
git revert <commit-hash>
git push main
# Vercel auto-deploys previous build
```

### Backend
```bash
git revert <commit-hash>
git push main
# Render auto-deploys and restarts
```

---

## Scaling

### Traffic Increase
- Render: Upgrade instance type
- Vercel: Already auto-scales
- Database: Upgrade MongoDB tier

### Data Growth
- MongoDB: Enable sharding if >100GB
- Pinecone: Auto-scales vectors
- Webhooklogs: Auto-delete after 30 days


# Audit Checklist (Centralign AI Assessment)

## Tech Stack
- Next.js 15 + TypeScript (client)
- Express (server)
- MongoDB (Atlas recommended)
- AI: Gemini or alternatives
- Vector DB: Pinecone (optional but recommended)
- Media: Cloudinary
- Auth: Email/password
- Form Sharing: Public `/form/[id]`

## Required Features
- Auth & Dashboard
  - Sign up / Login
  - List user forms
  - Submissions grouped by form
  - Loading & empty states
- AI Form Generation
  - Prompt → JSON schema
  - Persist schema to MongoDB
  - Store embeddings/summary for retrieval
- Context-Aware Retrieval
  - Top-K relevant past forms
  - Trimmed context in AI prompt
- Public Rendering
  - Render from JSON schema
  - Accept images, store URLs
  - Save submissions + image URLs

## Deliverables
- Working demo (local/deployed)
- GitHub source
- README with:
  - Setup instructions
  - Example prompts & samples
  - Memory retrieval architecture
  - Scalability handling
  - Limitations
  - Future improvements

## Bonus
- Basic validation rules (required, min/max, email, image type)
- Optimized design for summaries/embeddings
- Debounce/cache semantic search
- Pinecone semantic retrieval
- Limit LLM context to top-K (3–10)
- Scalability reasoning for thousands/millions

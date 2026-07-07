# Lumora AI — Deployment Guide

## Quick Start (Local)

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
cp .env.example .env   # Fill in your values
uvicorn app.main:app --host 127.0.0.1 --port 8000
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env.local  # Set NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
npm run dev
```

---

## Production Deployment (Free, 24/7)

### Step 1: Get Neon PostgreSQL (Free, No Expiry)
1. https://console.neon.tech → New Project
2. Copy connection string → looks like:
   `postgresql+asyncpg://user:pass@ep-xxxx.neon.tech/dbname?ssl=require`

### Step 2: Get Upstash Redis (Free, No Sleep)
1. https://console.upstash.com → Create Database
2. Copy Redis URL → looks like:
   `rediss://default:token@endpoint.upstash.io:6379`

### Step 3: Get Gemini API Key (Free)
1. https://aistudio.google.com/app/apikey → Create API Key

### Step 4: Deploy to Render
1. Push this repo to GitHub
2. https://render.com → New → Blueprint
3. Connect your GitHub repo
4. Render reads render.yaml and creates both services

### Step 5: Set Environment Variables in Render Dashboard

**lumora-ai-backend:**
| Key | Value |
|-----|-------|
| DATABASE_URL | Your Neon connection string |
| REDIS_URL | Your Upstash Redis URL |
| GEMINI_API_KEY | Your Gemini API key |
| CORS_ORIGINS | https://lumora-ai-frontend.onrender.com |

**lumora-ai-frontend:**
| Key | Value |
|-----|-------|
| NEXT_PUBLIC_API_URL | https://lumora-ai-backend.onrender.com |

### Step 6: Keep Backend Alive (Free)
1. https://uptimerobot.com → Sign up free
2. Add Monitor → URL: `https://lumora-ai-backend.onrender.com/health/`
3. Interval: 5 minutes → prevents sleep

---

## Architecture

```
Frontend (Render Static)     → Free, CDN, never sleeps
Backend (Render Free + ping) → Free, kept alive by UptimeRobot
Database (Neon PostgreSQL)   → Free, no expiry, persistent
Redis (Upstash)              → Free, no sleep, 10k req/day
Total cost: $0/month
```

---

## Files Changed from Original

| File | Change |
|------|--------|
| `backend/app/db/postgres.py` | Removed ssl from connect_args (Neon fix) |
| `backend/app/config.py` | Added ssl=require to DATABASE_URL for Neon |
| `backend/app/llm/embeddings.py` | Replaced sentence-transformers with Gemini API |
| `backend/app/llm/rag.py` | Removed .env file read, fixed syntax errors |
| `frontend/store/useStore.ts` | Added missing sidebarOpen, conversations, clearMessages |
| `frontend/next.config.ts` | Added output:export for static build |
| `render.yaml` | Fixed type:static → type:web |

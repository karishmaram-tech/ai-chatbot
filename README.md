# AI Chatbot - Production Ready

A full-stack AI chatbot with RAG, authentication, and observability.

## Tech Stack
- **Frontend**: Next.js 16, Tailwind CSS
- **Backend**: FastAPI, Python 3.12
- **AI**: Google Gemini (free) or OpenAI
- **RAG**: FAISS vector search + sentence-transformers
- **Database**: PostgreSQL
- **Cache**: Redis
- **Monitoring**: Prometheus + Grafana

## Quick Start (Local)

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Docker (All services)
```bash
cd infrastructure
docker compose up --build
```

## Endpoints
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3001


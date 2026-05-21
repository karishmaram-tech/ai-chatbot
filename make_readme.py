readme = """# NeuraChat — Production AI Chatbot Platform

> A full-stack AI SaaS platform with RAG pipeline, real-time streaming, JWT authentication, and complete observability. Built to production standards with FastAPI, Next.js, PostgreSQL, Redis, and Google Gemini.

[![CI/CD](https://github.com/karishmaram-tech/ai-chatbot/actions/workflows/ci.yml/badge.svg)](https://github.com/karishmaram-tech/ai-chatbot/actions)
[![Python](https://img.shields.io/badge/Python-3.12-blue)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-green)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org)
[![Docker](https://img.shields.io/badge/Docker-Compose-blue)](https://docker.com)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

## What This Project Demonstrates

This project was built to demonstrate production-grade AI engineering skills including:

- **RAG Pipeline** — Upload PDFs and ask questions about them using FAISS vector search
- **Real-time Streaming** — Word-by-word AI responses via Server-Sent Events
- **Full Observability** — Prometheus metrics, Grafana dashboards, structured logging
- **Production Auth** — JWT tokens, bcrypt hashing, rate limiting via Redis
- **Cost Tracking** — Token usage and cost monitoring per conversation
- **CI/CD Pipeline** — Automated testing and deployment via GitHub Actions

## Architecture
┌─────────────────┐
                │   Next.js 16    │
                │  (React + SSE)  │
                └────────┬────────┘
                         │ HTTP/SSE
                ┌────────▼────────┐
                │    FastAPI      │
                │  + Rate Limit   │
                │  + JWT Auth     │
                └──┬──────────┬───┘
                   │          │
        ┌──────────▼──┐  ┌───▼──────────┐
        │ PostgreSQL  │  │    Redis      │
        │ (Users,     │  │ (Cache, Rate  │
        │  Messages)  │  │  Limit)       │
        └─────────────┘  └───────────────┘
                   │
        ┌──────────▼──┐
        │  Gemini AI  │
        │  + FAISS    │
        │  RAG Pipeline│
        └─────────────┘
                   │
        ┌──────────▼──┐
        │ Prometheus  │
        │  + Grafana  │
        └─────────────┘
## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Next.js 16, Tailwind CSS, Zustand | Real-time chat UI |
| Backend | FastAPI, Python 3.12 | REST API + SSE streaming |
| AI | Google Gemini 2.0 Flash | LLM responses |
| RAG | FAISS + sentence-transformers | Document search |
| Database | PostgreSQL 16 | Persistent storage |
| Cache | Redis 7 | Rate limiting + caching |
| Auth | JWT + bcrypt | Secure authentication |
| Monitoring | Prometheus + Grafana | Metrics + dashboards |
| DevOps | Docker Compose, GitHub Actions | CI/CD pipeline |

## Features

- Real-time streaming AI responses (Server-Sent Events)
- RAG pipeline — upload PDFs and chat with them
- JWT authentication with secure session management
- Redis-based rate limiting (60 req/min per user)
- Token usage and cost tracking per conversation
- Prometheus metrics exposed at /metrics
- Grafana dashboard with request analytics
- Conversation history persisted in PostgreSQL
- Docker Compose for one-command local setup
- 7 automated tests with CI/CD via GitHub Actions

## Quick Start

### Prerequisites
- Python 3.12+
- Node.js 20+
- Docker Desktop

### 1. Clone and setup

```bash
git clone https://github.com/karishmaram-tech/ai-chatbot.git
cd ai-chatbot
```

### 2. Start infrastructure

```bash
cd infrastructure
docker compose up postgres redis -d
```

### 3. Start backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\\Scripts\\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your GEMINI_API_KEY
uvicorn app.main:app --reload --port 8000
```

### 4. Start frontend

```bash
cd frontend
npm install
npm run dev
```

### 5. Open the app

| Service | URL |
|---------|-----|
| App | http://localhost:3000 |
| API Docs | http://localhost:8000/docs |
| Prometheus | http://localhost:9090 |
| Grafana | http://localhost:3001 |

## API Reference

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/v1/auth/register | Create account | No |
| POST | /api/v1/auth/login | Login + get token | No |
| GET | /api/v1/auth/me | Get current user | Yes |
| POST | /api/v1/chat/stream | Streaming chat | Yes |
| GET | /api/v1/chat/conversations | List conversations | Yes |
| POST | /api/v1/documents/upload | Upload PDF for RAG | Yes |
| GET | /api/v1/analytics/usage | Usage + cost stats | Yes |
| GET | /metrics | Prometheus metrics | No |
| GET | /health/ | Health check | No |

## Environment Variables

```env
# AI
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-2.0-flash

# Database
DATABASE_URL=postgresql+asyncpg://chatbot:password@localhost:5432/chatbot_db

# Redis
REDIS_URL=redis://localhost:6379/0

# Auth
SECRET_KEY=random_64_char_string
JWT_SECRET_KEY=another_random_string

# App
ENVIRONMENT=development
DEBUG=true
```

## Project Structure
ai-chatbot/
├── backend/
│   ├── app/
│   │   ├── api/routes/      # FastAPI route handlers
│   │   ├── core/            # Auth, rate limiting, caching
│   │   ├── db/              # PostgreSQL + Redis connections
│   │   ├── llm/             # AI client, RAG pipeline, memory
│   │   ├── observability/   # Logging, metrics, tracing
│   │   └── schemas/         # Pydantic data models
│   ├── tests/               # Pytest test suite
│   └── Dockerfile
├── frontend/
│   ├── app/                 # Next.js 16 App Router pages
│   ├── components/          # Reusable React components
│   ├── store/               # Zustand global state
│   └── Dockerfile
├── infrastructure/
│   ├── docker-compose.yml   # Local development
│   ├── prometheus/          # Metrics configuration
│   └── nginx/               # Reverse proxy
└── .github/workflows/       # CI/CD pipeline
## Testing

```bash
cd backend
pytest tests/ -v
```

## Deployment

### Render (Recommended for demos)
See [render.yaml](render.yaml) for one-click deployment configuration.

### Docker (Self-hosted)
```bash
cd infrastructure
docker compose up --build
```

## What I Learned Building This

- How to build streaming AI responses with Server-Sent Events
- RAG pipeline architecture with vector embeddings and semantic search
- Production observability with Prometheus and Grafana
- Async Python patterns for high-performance APIs
- JWT authentication security best practices
- Docker Compose for multi-service orchestration

## License

MIT — feel free to use this as a reference for your own projects.
"""

with open("README.md", "w", encoding="utf-8", newline="\n") as f:
    f.write(readme)
print("README.md created!")
print("Characters:", len(readme))


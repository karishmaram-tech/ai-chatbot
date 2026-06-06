# ── Stage 1: Dependencies ───────────────────────────────
FROM python:3.12-slim AS builder

WORKDIR /build

# System packages needed to compile psycopg + sentence-transformers
RUN apt-get update && apt-get install -y --no-install-recommends     gcc g++ curl libpq-dev     && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip wheel &&     pip install --no-cache-dir -r requirements.txt

# ── Stage 2: Runtime ────────────────────────────────────
FROM python:3.12-slim AS runtime

WORKDIR /app

# Only curl needed at runtime (for health checks)
RUN apt-get update && apt-get install -y --no-install-recommends     curl libpq5     && rm -rf /var/lib/apt/lists/*

# Copy installed packages from builder (keeps image small)
COPY --from=builder /usr/local/lib/python3.12/site-packages                     /usr/local/lib/python3.12/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# Copy application code
COPY . .

# Create vector store directory (used if FAISS fallback is needed)
RUN mkdir -p /tmp/vector_store

# Security: run as non-root user
RUN useradd -m -u 1000 -s /bin/bash appuser     && chown -R appuser:appuser /app
USER appuser

# Port Render/Railway injects via $PORT env var
EXPOSE 8000

# Health check — Render uses this to know when app is ready
HEALTHCHECK --interval=30s --timeout=10s --start-period=90s --retries=3     CMD curl -f http://localhost:${PORT:-8000}/health/ || exit 1

# Start command — $PORT is injected by Render automatically
CMD uvicorn app.main:app     --host 0.0.0.0     --port ${PORT:-8000}     --workers 1     --log-level info     --access-log

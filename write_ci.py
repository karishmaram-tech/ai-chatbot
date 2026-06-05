import os
os.makedirs(".github/workflows", exist_ok=True)

ci = """name: Lumora AI CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test-backend:
    name: Backend Tests
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_USER: chatbot
          POSTGRES_PASSWORD: password
          POSTGRES_DB: chatbot_db
        ports: [5432:5432]
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      redis:
        image: redis:7-alpine
        ports: [6379:6379]
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"
          cache: pip
          cache-dependency-path: backend/requirements.txt
      - name: Install dependencies
        working-directory: backend
        run: pip install -r requirements.txt aiosqlite
      - name: Run tests
        working-directory: backend
        env:
          DATABASE_URL: sqlite+aiosqlite:///./test.db
          REDIS_URL: redis://localhost:6379/0
          SECRET_KEY: test-secret-key-ci
          JWT_SECRET_KEY: test-jwt-key-ci
          OPENAI_API_KEY: test-key
          GEMINI_API_KEY: test-key
          ENVIRONMENT: testing
          DEBUG: "false"
          CORS_ORIGINS: http://localhost:3000
        run: pytest tests/ -v --tb=short

  build-frontend:
    name: Frontend Build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: npm
          cache-dependency-path: frontend/package-lock.json
      - name: Install
        working-directory: frontend
        run: npm ci
      - name: Build static export
        working-directory: frontend
        env:
          NEXT_PUBLIC_API_URL: https://lumora-ai-backend.onrender.com
        run: npm run build
      - name: Upload build artifact
        uses: actions/upload-artifact@v4
        with:
          name: frontend-out
          path: frontend/out
          retention-days: 7

  security-scan:
    name: Security Scan
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Check for secrets in code
        uses: trufflesecurity/trufflehog@main
        with:
          path: ./
          base: main
          head: HEAD
        continue-on-error: true
"""

with open(".github/workflows/ci.yml", "w", encoding="utf-8", newline="\n") as f:
    f.write(ci)
print("CI/CD pipeline written!")


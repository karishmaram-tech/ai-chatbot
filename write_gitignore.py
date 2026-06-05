content = """# Python
__pycache__/
*.py[cod]
*.egg-info/
venv/
.venv/
env/
*.pyc

# Environment secrets — NEVER commit
.env
*.env
!.env.example
!.env.production

# Database
*.db
*.sqlite3
test.db

# Vector store (local)
backend/vector_store/
*.index

# Node
frontend/node_modules/
frontend/.next/
frontend/out/

# Test artifacts
.pytest_cache/
.coverage
htmlcov/

# Build artifacts
dist/
build/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Automation scripts (not needed in production)
backend/fix_*.py
backend/write_*.py
backend/add_*.py
backend/rename_*.py
backend/update_*.py
backend/rewrite_*.py
frontend/fix_*.py
frontend/write_*.py
automation_scripts/

# Logs
*.log
logs/

# Grafana data
infrastructure/grafana/data/
"""

with open(".gitignore", "w", encoding="utf-8", newline="\n") as f:
    f.write(content)
print(".gitignore updated!")


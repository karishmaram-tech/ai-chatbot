import os, json

# railway.json for backend
os.makedirs("backend", exist_ok=True)
railway_backend = {
    "$schema": "https://railway.app/railway.schema.json",
    "build": {
        "builder": "NIXPACKS",
        "buildCommand": "pip install -r requirements.txt"
    },
    "deploy": {
        "startCommand": "uvicorn app.main:app --host 0.0.0.0 --port $PORT",
        "healthcheckPath": "/health/",
        "healthcheckTimeout": 60,
        "restartPolicyType": "ON_FAILURE",
        "restartPolicyMaxRetries": 3
    }
}
with open("backend/railway.json", "w", encoding="utf-8", newline="\n") as f:
    json.dump(railway_backend, f, indent=2)
print("backend/railway.json written!")

# nixpacks.toml for Python version
nixpacks = """[phases.setup]
nixPkgs = [\"python312\", \"gcc\"]

[phases.install]
cmds = [\"pip install -r requirements.txt\"]

[phases.build]
cmds = []

[start]
cmd = \"uvicorn app.main:app --host 0.0.0.0 --port $PORT\"
"""
with open("backend/nixpacks.toml", "w", encoding="utf-8", newline="\n") as f:
    f.write(nixpacks)
print("backend/nixpacks.toml written!")

# railway.json for frontend
railway_frontend = {
    "$schema": "https://railway.app/railway.schema.json",
    "build": {
        "builder": "NIXPACKS",
        "buildCommand": "npm ci && npm run build"
    },
    "deploy": {
        "startCommand": "npx serve out -p $PORT",
        "healthcheckPath": "/",
        "healthcheckTimeout": 30
    }
}
with open("frontend/railway.json", "w", encoding="utf-8", newline="\n") as f:
    json.dump(railway_frontend, f, indent=2)
print("frontend/railway.json written!")


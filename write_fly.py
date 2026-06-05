backend_fly = """# fly.toml for Lumora AI Backend
# Deploy: fly launch --no-deploy, then fly deploy

app = "lumora-ai-backend"
primary_region = "sin"  # Singapore — closest to India

[build]
  dockerfile = "Dockerfile"

[env]
  ENVIRONMENT = "production"
  DEBUG = "false"
  PORT = "8080"
  VECTOR_STORE_PATH = "/tmp/vector_store"

[http_service]
  internal_port = 8080
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 0

  [http_service.concurrency]
    type = "requests"
    hard_limit = 200
    soft_limit = 150

[[vm]]
  cpu_kind = "shared"
  cpus = 1
  memory_mb = 512

[mounts]
  source = "lumora_vector_store"
  destination = "/app/vector_store"

[[services.tcp_checks]]
  grace_period = "30s"
  interval = "15s"
  restart_limit = 0
  timeout = "2s"

[[services.http_checks]]
  interval = "10s"
  grace_period = "30s"
  method = "get"
  path = "/health/"
  protocol = "http"
  timeout = "2s"
  tls_skip_verify = false
"""

with open("backend/fly.toml", "w", encoding="utf-8", newline="\n") as f:
    f.write(backend_fly)
print("backend/fly.toml written!")

frontend_fly = """# fly.toml for Lumora AI Frontend (static)
app = "lumora-ai-frontend"
primary_region = "sin"

[build]
  dockerfile = "Dockerfile"

[http_service]
  internal_port = 80
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 0

[[vm]]
  cpu_kind = "shared"
  cpus = 1
  memory_mb = 256
"""

with open("frontend/fly.toml", "w", encoding="utf-8", newline="\n") as f:
    f.write(frontend_fly)
print("frontend/fly.toml written!")


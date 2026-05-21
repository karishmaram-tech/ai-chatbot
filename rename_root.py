import os

files = [
    "README.md",
    "render.yaml",
    "infrastructure/docker-compose.yml",
    "infrastructure/docker-compose.prod.yml",
    ".github/workflows/ci.yml",
]

replacements = [
    ("AI Chatbot", "Lumora AI"),
    ("ai-chatbot", "lumora-ai"),
    ("ai_chatbot", "lumora_ai"),
    ("chatbot_backend", "lumora_backend"),
    ("chatbot_frontend", "lumora_frontend"),
    ("chatbot_postgres", "lumora_postgres"),
    ("chatbot_redis", "lumora_redis"),
    ("chatbot_prometheus", "lumora_prometheus"),
    ("chatbot_grafana", "lumora_grafana"),
]

for filepath in files:
    if not os.path.exists(filepath):
        print(f"SKIP: {filepath}")
        continue
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    original = content
    for old, new in replacements:
        content = content.replace(old, new)
    if content != original:
        with open(filepath, "w", encoding="utf-8", newline="\n") as f:
            f.write(content)
        print(f"UPDATED: {filepath}")
    else:
        print(f"NO CHANGE: {filepath}")

print("Root rename complete!")


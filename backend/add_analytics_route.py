with open("app/main.py", "r") as f:
    content = f.read()

content = content.replace(
    "from app.api.routes import health, auth, chat, documents",
    "from app.api.routes import health, auth, chat, documents, analytics"
)

content = content.replace(
    "app.include_router(documents.router)",
    "app.include_router(documents.router)\napp.include_router(analytics.router)"
)

with open("app/main.py", "w", encoding="utf-8", newline="\n") as f:
    f.write(content)
print("Analytics router added!")


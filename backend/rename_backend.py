import os

files_to_update = [
    "app/config.py",
    "app/main.py",
    ".env",
]

for filepath in files_to_update:
    if not os.path.exists(filepath):
        print(f"SKIP: {filepath} not found")
        continue
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    original = content
    content = content.replace("AI Chatbot", "Lumora AI")
    content = content.replace("ai-chatbot", "lumora-ai")
    content = content.replace("ai_chatbot", "lumora_ai")
    content = content.replace("Production-ready AI Chatbot API with RAG", "Lumora AI — Intelligent Chat Platform with RAG")
    if content != original:
        with open(filepath, "w", encoding="utf-8", newline="\n") as f:
            f.write(content)
        print(f"UPDATED: {filepath}")
    else:
        print(f"NO CHANGE: {filepath}")

print("Backend rename complete!")


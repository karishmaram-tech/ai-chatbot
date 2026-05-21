with open("app/main.py", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(
    "Production-ready AI Chatbot API with RAG",
    "Lumora AI — Intelligent Chat Platform with RAG"
)
content = content.replace("AI Chatbot", "Lumora AI")

with open("app/main.py", "w", encoding="utf-8", newline="\n") as f:
    f.write(content)

print("main.py updated!")

# Verify
with open("app/main.py", "r") as f:
    for line in f:
        if "Lumora" in line or "Chatbot" in line:
            print("Found:", line.rstrip())


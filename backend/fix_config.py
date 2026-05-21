with open("app/config.py", "r", encoding="utf-8") as f:
    content = f.read()

print("BEFORE:")
for line in content.split("\n")[:10]:
    print(line)

content = content.replace("AI Chatbot", "Lumora AI")
content = content.replace("ai-chatbot", "lumora-ai")

with open("app/config.py", "w", encoding="utf-8", newline="\n") as f:
    f.write(content)

print("\nAFTER:")
with open("app/config.py", "r") as f:
    for i, line in enumerate(f):
        if i < 10:
            print(line.rstrip())
print("Done!")


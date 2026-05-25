import os
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite:///./chatbot.db"
)

SECRET_KEY = os.getenv(
    "SECRET_KEY",
    "super-secret-key"
)

ALGORITHM = "HS256"

ACCESS_TOKEN_EXPIRE_MINUTES = 60

REDIS_URL = os.getenv(
    "REDIS_URL",
    "redis://localhost:6379"
)

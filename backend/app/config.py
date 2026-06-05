"""
config.py - Production-ready configuration
Reads from environment variables with safe defaults.
"""
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field, field_validator
from functools import lru_cache
from typing import List
import os


class Settings(BaseSettings):
    # App
    app_name: str = Field(default="Lumora AI")
    app_version: str = Field(default="1.0.0")
    environment: str = Field(default="development")
    debug: bool = Field(default=False)
    secret_key: str = Field(default="change-me-in-production")
    api_host: str = Field(default="0.0.0.0")
    api_port: int = Field(default=8000)

    # CORS — comma-separated list of allowed origins
    # Example: https://lumora.onrender.com,https://lumora.vercel.app
    cors_origins: str = Field(default="http://localhost:3000,http://127.0.0.1:3000")

    @property
    def allowed_origins(self) -> List[str]:
        origins = [o.strip() for o in self.cors_origins.split(",") if o.strip()]
        # Always allow localhost in development
        if self.environment == "development":
            extras = ["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:8000"]
            for e in extras:
                if e not in origins:
                    origins.append(e)
        return origins

    # OpenAI
    openai_api_key: str = Field(default="")
    openai_model: str = Field(default="gpt-4o-mini")
    openai_max_tokens: int = Field(default=2000)
    openai_temperature: float = Field(default=0.7)

    # Gemini
    gemini_api_key: str = Field(default="")
    gemini_model: str = Field(default="gemini-2.0-flash")
    llm_provider: str = Field(default="gemini")

    # Database — supports both local and cloud URLs
    database_url: str = Field(default="postgresql+asyncpg://chatbot:password@localhost:5432/chatbot_db")

    @field_validator("database_url", mode="before")
    @classmethod
    def fix_postgres_url(cls, v: str) -> str:
        # Render/Railway provide postgres:// but asyncpg needs postgresql+asyncpg://
        if v.startswith("postgres://"):
            v = v.replace("postgres://", "postgresql+asyncpg://", 1)
        elif v.startswith("postgresql://") and "+asyncpg" not in v:
            v = v.replace("postgresql://", "postgresql+asyncpg://", 1)
        return v

    # Redis — supports both local and cloud URLs
    redis_url: str = Field(default="redis://localhost:6379/0")

    # LangSmith
    langchain_tracing_v2: bool = Field(default=False)
    langchain_api_key: str = Field(default="")
    langchain_project: str = Field(default="lumora-ai")

    # Rate limiting
    rate_limit_requests: int = Field(default=60)
    rate_limit_window: int = Field(default=60)

    # JWT
    jwt_secret_key: str = Field(default="change-me-jwt-secret")
    jwt_algorithm: str = Field(default="HS256")
    jwt_expire_minutes: int = Field(default=1440)

    # Vector store path (use /tmp for ephemeral hosts)
    vector_store_path: str = Field(default="vector_store")

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )


@lru_cache()
def get_settings() -> Settings:
    return Settings()

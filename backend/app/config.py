from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator
from functools import lru_cache
from typing import List


class Settings(BaseSettings):
    app_name: str = "Lumora AI"
    app_version: str = "1.0.0"
    environment: str = "development"
    debug: bool = False
    secret_key: str = "change-me-in-production"
    cors_origins: str = "http://localhost:3000"

    @property
    def allowed_origins(self) -> List[str]:
        origins = [o.strip() for o in self.cors_origins.split(",") if o.strip()]
        if self.environment == "development":
            for extra in ["http://localhost:3000", "http://127.0.0.1:3000"]:
                if extra not in origins:
                    origins.append(extra)
        return origins

    gemini_api_key: str = ""
    gemini_model: str = "gemini-2.0-flash"
    openai_api_key: str = ""
    openai_model: str = "gpt-4o-mini"
    llm_provider: str = "gemini"

    database_url: str = "postgresql+asyncpg://user:pass@localhost:5432/lumora"

    @field_validator("database_url", mode="before")
    @classmethod
    def fix_postgres_url(cls, v: str) -> str:
        if v.startswith("postgres://"):
            v = v.replace("postgres://", "postgresql+asyncpg://", 1)
        elif v.startswith("postgresql://") and "+asyncpg" not in v:
            v = v.replace("postgresql://", "postgresql+asyncpg://", 1)
        # Neon needs ssl=require in the URL (not in connect_args)
        if "neon.tech" in v and "ssl=" not in v and "sslmode=" not in v:
            sep = "&" if "?" in v else "?"
            v = v + sep + "ssl=require"
        return v

    redis_url: str = "redis://localhost:6379/0"

    jwt_secret_key: str = "change-me-jwt-secret"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 1440

    rate_limit_requests: int = 60
    rate_limit_window: int = 60

    vector_store_path: str = "/tmp/vector_store"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )


@lru_cache()
def get_settings() -> Settings:
    return Settings()

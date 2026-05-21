from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field
from functools import lru_cache


class Settings(BaseSettings):

    # App
    app_name: str = Field(default='Lumora AI')
    app_version: str = Field(default='1.0.0')
    environment: str = Field(default='development')
    debug: bool = Field(default=False)
    secret_key: str = Field(default='change-me')
    api_host: str = Field(default='0.0.0.0')
    api_port: int = Field(default=8000)

    # OpenAI (optional)
    openai_api_key: str = Field(default='')
    openai_model: str = Field(default='gpt-4o-mini')
    openai_max_tokens: int = Field(default=2000)
    openai_temperature: float = Field(default=0.7)

    # Gemini (free alternative)
    gemini_api_key: str = Field(default='')
    gemini_model: str = Field(default='gemini-2.0-flash')

    # LLM Provider: 'openai' or 'gemini'
    llm_provider: str = Field(default='gemini')

    # Database
    database_url: str = Field(default='sqlite+aiosqlite:///./dev.db')

    # Redis
    redis_url: str = Field(default='redis://localhost:6379/0')

    # LangSmith
    langchain_tracing_v2: bool = Field(default=False)
    langchain_api_key: str = Field(default='')
    langchain_project: str = Field(default='lumora-ai')

    # Rate Limiting
    rate_limit_requests: int = Field(default=60)
    rate_limit_window: int = Field(default=60)

    # JWT
    jwt_secret_key: str = Field(default='change-me-jwt')
    jwt_algorithm: str = Field(default='HS256')
    jwt_expire_minutes: int = Field(default=1440)

    model_config = SettingsConfigDict(
        env_file='.env',
        env_file_encoding='utf-8',
        case_sensitive=False,
        extra='ignore',
    )


@lru_cache()
def get_settings() -> Settings:
    return Settings()

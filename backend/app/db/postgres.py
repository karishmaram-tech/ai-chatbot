"""postgres.py - Production-ready async PostgreSQL for Neon.
SSL is handled via ?ssl=require in DATABASE_URL, not in connect_args.
"""
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import text
from app.config import get_settings
from app.observability.logging import get_logger

settings = get_settings()
logger = get_logger(__name__)


class Base(DeclarativeBase):
    pass


def create_engine():
    is_prod = settings.environment == "production"
    return create_async_engine(
        settings.database_url,
        pool_size=5 if is_prod else 2,
        max_overflow=10 if is_prod else 3,
        pool_recycle=1800,
        pool_pre_ping=True,
        pool_timeout=30,
        echo=False,
        connect_args={
            "server_settings": {"application_name": settings.app_name},
            "command_timeout": 60,
        } if "asyncpg" in settings.database_url else {},
    )


engine = create_engine()
AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def init_db(max_retries: int = 5) -> None:
    for attempt in range(1, max_retries + 1):
        try:
            async with engine.begin() as conn:
                from app.db import models  # noqa
                await conn.run_sync(Base.metadata.create_all)
            logger.info("database_initialized", attempt=attempt)
            return
        except Exception as e:
            if attempt == max_retries:
                logger.error("database_init_failed", error=str(e))
                raise
            wait = 2 ** attempt
            logger.warning("database_init_retry", attempt=attempt, wait=wait, error=str(e))
            await asyncio.sleep(wait)


async def close_db() -> None:
    await engine.dispose()
    logger.info("database_connections_closed")


async def check_db() -> bool:
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        return True
    except Exception:
        return False


async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

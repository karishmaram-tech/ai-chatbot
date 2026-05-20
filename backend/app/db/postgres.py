"""
postgres.py - PostgreSQL async database connection.

We use SQLAlchemy with async support. This means our server
can handle many requests at once without waiting for the database.

Think of it like a waiter who takes multiple orders simultaneously
instead of waiting for each kitchen order before taking the next one.
"""

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from app.config import get_settings
from app.observability.logging import get_logger

settings = get_settings()
logger = get_logger(__name__)


# DeclarativeBase is the parent class for ALL our database models.
# Every table in our database will be a class that inherits from Base.
class Base(DeclarativeBase):
    pass


# The engine is the actual connection to PostgreSQL.
# pool_size=10 means: keep 10 connections open and ready to use.
# max_overflow=20 means: allow up to 20 extra connections if busy.
engine = create_async_engine(
    settings.database_url,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,   # Test connection before using it
    echo=settings.debug,  # Log SQL queries in development
)

# SessionLocal is a factory that creates database sessions.
# Each request gets its own session (its own conversation with the DB).
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,  # Keep data accessible after commit
)


async def init_db() -> None:
    '''
    Create all tables in the database.
    Called once at application startup.
    '''
    async with engine.begin() as conn:
        # Import models so SQLAlchemy knows about them
        from app.db import models  # noqa: F401
        await conn.run_sync(Base.metadata.create_all)
    logger.info('database_initialized')


async def close_db() -> None:
    '''
    Close all database connections.
    Called at application shutdown.
    '''
    await engine.dispose()
    logger.info('database_connections_closed')


async def get_db():
    '''
    FastAPI dependency that provides a database session per request.
    
    Usage in any route:
        async def my_route(db: AsyncSession = Depends(get_db)):
            result = await db.execute(...)
    
    The session is automatically closed after the request finishes,
    even if an error occurs (that is what the try/finally does).
    '''
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

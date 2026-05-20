"""
redis.py - Redis connection and utilities.

Redis is an in-memory database. We use it for:
- Rate limiting (count requests per user per minute)
- Caching (store frequent responses so we don't call OpenAI repeatedly)
- Session storage
"""

import redis.asyncio as aioredis
from app.config import get_settings
from app.observability.logging import get_logger

settings = get_settings()
logger = get_logger(__name__)

# Global Redis client - created once, reused for all requests
redis_client: aioredis.Redis | None = None


async def init_redis() -> None:
    global redis_client
    redis_client = aioredis.from_url(
        settings.redis_url,
        encoding='utf-8',
        decode_responses=True,
        socket_connect_timeout=5,
        socket_timeout=5,
    )
    # Test the connection
    await redis_client.ping()
    logger.info('redis_connected', url=settings.redis_url)


async def close_redis() -> None:
    global redis_client
    if redis_client:
        await redis_client.aclose()
        logger.info('redis_disconnected')


def get_redis() -> aioredis.Redis:
    if redis_client is None:
        raise RuntimeError('Redis not initialized')
    return redis_client

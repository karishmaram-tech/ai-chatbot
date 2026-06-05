"""
redis.py - Production Redis connection with retry logic.
"""
import asyncio
import redis.asyncio as aioredis
from app.config import get_settings
from app.observability.logging import get_logger

settings = get_settings()
logger = get_logger(__name__)

redis_client: aioredis.Redis | None = None


async def init_redis(max_retries: int = 5) -> None:
    global redis_client
    for attempt in range(1, max_retries + 1):
        try:
            redis_client = aioredis.from_url(
                settings.redis_url,
                encoding="utf-8",
                decode_responses=True,
                socket_connect_timeout=10,
                socket_timeout=10,
                retry_on_timeout=True,
                health_check_interval=30,
            )
            await redis_client.ping()
            logger.info("redis_connected", url=settings.redis_url.split("@")[-1])
            return
        except Exception as e:
            if attempt == max_retries:
                logger.error("redis_init_failed", error=str(e))
                raise
            wait = 2 ** attempt
            logger.warning("redis_retry", attempt=attempt, wait=wait)
            await asyncio.sleep(wait)


async def close_redis() -> None:
    global redis_client
    if redis_client:
        await redis_client.aclose()
        logger.info("redis_disconnected")


def get_redis() -> aioredis.Redis:
    if redis_client is None:
        raise RuntimeError("Redis not initialized")
    return redis_client


async def check_redis() -> bool:
    try:
        if redis_client:
            await redis_client.ping()
            return True
        return False
    except Exception:
        return False

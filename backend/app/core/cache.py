
# Redis caching utility
import hashlib
import json
from app.db.redis import get_redis
from app.observability.logging import get_logger

logger = get_logger(__name__)

async def get_cached_response(query: str) -> str | None:
    try:
        redis = get_redis()
        key = "cache:" + hashlib.md5(query.encode()).hexdigest()
        cached = await redis.get(key)
        if cached:
            logger.info("cache_hit", query=query[:50])
            return cached
    except Exception as e:
        logger.warning("cache_error", error=str(e))
    return None

async def set_cached_response(query: str, response: str, ttl: int = 3600) -> None:
    try:
        redis = get_redis()
        key = "cache:" + hashlib.md5(query.encode()).hexdigest()
        await redis.setex(key, ttl, response)
        logger.info("cache_set", query=query[:50], ttl=ttl)
    except Exception as e:
        logger.warning("cache_set_error", error=str(e))

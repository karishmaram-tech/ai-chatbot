"""
rate_limiter.py - Redis-based rate limiting.

Rate limiting prevents:
- API abuse (someone sending 10,000 requests)
- OpenAI cost explosions
- Server overload

Our limit: 60 requests per minute per IP address.
"""

from fastapi import Request, HTTPException, status, Depends
from app.db.redis import get_redis
from app.observability.logging import get_logger

logger = get_logger(__name__)


async def rate_limit(request: Request) -> None:
    """
    FastAPI dependency that enforces rate limiting.

    Uses Redis to count requests per IP per minute.
    Key format: 'rate_limit:{ip}' with 60-second expiry.

    Usage in any route:
        async def my_route(_: None = Depends(rate_limit)):
            ...
    """
    redis = get_redis()

    # Get client IP
    client_ip = request.client.host if request.client else 'unknown'
    key = f'rate_limit:{client_ip}'

    # Increment request count
    count = await redis.incr(key)

    # Set expiry on first request (sliding window)
    if count == 1:
        await redis.expire(key, 60)

    # Get remaining TTL for headers
    ttl = await redis.ttl(key)

    # Add rate limit headers (industry standard)
    request.state.rate_limit_remaining = max(0, 60 - count)
    request.state.rate_limit_reset = ttl

    if count > 60:
        logger.warning('rate_limit_exceeded', ip=client_ip, count=count)
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail='Too many requests. Please wait before trying again.',
            headers={
                'X-RateLimit-Limit': '60',
                'X-RateLimit-Remaining': '0',
                'X-RateLimit-Reset': str(ttl),
                'Retry-After': str(ttl),
            },
        )

    logger.info('rate_limit_check', ip=client_ip, count=count, remaining=60 - count)

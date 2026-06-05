from fastapi import APIRouter
from datetime import datetime, timezone
from app.config import get_settings
from app.observability.logging import get_logger

router = APIRouter(prefix="/health", tags=["Health"])
settings = get_settings()
logger = get_logger(__name__)


@router.get("/")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "app": settings.app_name,
        "version": settings.app_version,
        "environment": settings.environment,
    }


@router.get("/ready")
async def readiness_check():
    from app.db.postgres import check_db
    from app.db.redis import check_redis
    checks = {
        "api": True,
        "database": await check_db(),
        "redis": await check_redis(),
    }
    all_ready = all(checks.values())
    logger.info("readiness_check", checks=checks, ready=all_ready)
    return {
        "status": "ready" if all_ready else "not_ready",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "checks": checks,
    }


@router.get("/version")
async def version():
    return {
        "app": settings.app_name,
        "version": settings.app_version,
        "environment": settings.environment,
    }

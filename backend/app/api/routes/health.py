from fastapi import APIRouter
from datetime import datetime, timezone
from app.config import get_settings
from app.observability.logging import get_logger

router = APIRouter(prefix='/health', tags=['Health'])
settings = get_settings()
logger = get_logger(__name__)

@router.get('/')
async def health_check():
    return {
        'status': 'healthy',
        'timestamp': datetime.now(timezone.utc).isoformat(),
        'app': settings.app_name,
        'version': settings.app_version,
    }

@router.get('/ready')
async def readiness_check():
    import sqlalchemy
    checks = {'api': True, 'database': False, 'redis': False}

    try:
        from app.db.postgres import engine
        async with engine.connect() as conn:
            await conn.execute(sqlalchemy.text('SELECT 1'))
        checks['database'] = True
    except Exception as e:
        logger.error('db_check_failed', error=str(e))

    try:
        from app.db.redis import get_redis
        await get_redis().ping()
        checks['redis'] = True
    except Exception as e:
        logger.error('redis_check_failed', error=str(e))

    all_ready = all(checks.values())
    return {
        'status': 'ready' if all_ready else 'not_ready',
        'timestamp': datetime.now(timezone.utc).isoformat(),
        'checks': checks,
    }

@router.get('/version')
async def version():
    return {'app': settings.app_name, 'version': settings.app_version}

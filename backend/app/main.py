import time
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from prometheus_fastapi_instrumentator import Instrumentator

from app.config import get_settings
from app.observability.logging import setup_logging, get_logger
from app.api.routes import health, auth, chat, documents, analytics
from app.db.postgres import init_db, close_db
from app.db.redis import init_redis, close_redis

settings = get_settings()
setup_logging()
logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("application_starting", app=settings.app_name, env=settings.environment)
    await init_db()
    await init_redis()
    logger.info("application_ready", cors_origins=settings.allowed_origins)
    yield
    logger.info("application_shutting_down")
    await close_db()
    await close_redis()
    logger.info("application_stopped")


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Lumora AI — Intelligent Chat Platform with RAG",
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None,
    lifespan=lifespan,
)

# Prometheus metrics
Instrumentator().instrument(app).expose(app)

# Dynamic CORS from environment variable
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.perf_counter()
    logger.info("request_started", method=request.method, path=request.url.path)
    response = await call_next(request)
    ms = round((time.perf_counter() - start) * 1000, 2)
    logger.info("request_completed", method=request.method, path=request.url.path,
                status=response.status_code, ms=ms)
    response.headers["X-Response-Time"] = f"{ms}ms"
    response.headers["X-API-Version"] = settings.app_version
    return response


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error("unhandled_exception", error=str(exc), type=type(exc).__name__,
                 path=request.url.path)
    return JSONResponse(status_code=500, content={
        "error": "internal_server_error",
        "message": "An unexpected error occurred",
        "detail": str(exc) if settings.debug else None,
    })


app.include_router(health.router)
app.include_router(auth.router)
app.include_router(chat.router)
app.include_router(documents.router)
app.include_router(analytics.router)


@app.get("/")
async def root():
    return {
        "app": settings.app_name,
        "version": settings.app_version,
        "environment": settings.environment,
        "status": "operational",
        "docs": "/docs" if settings.debug else "disabled",
        "health": "/health/",
        "metrics": "/metrics",
    }

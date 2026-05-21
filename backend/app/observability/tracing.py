from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor, ConsoleSpanExporter
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.sdk.resources import Resource
from app.config import get_settings
from app.observability.logging import get_logger

settings = get_settings()
logger = get_logger(__name__)


def init_tracing(app) -> None:
    """
    Initialize OpenTelemetry distributed tracing.

    Every request gets a unique trace ID that flows through:
    FastAPI -> Database -> Redis -> AI API

    This lets you see exactly where time is spent in each request.
    In production, you would send these to Jaeger or Tempo.
    """
    resource = Resource.create({
        "service.name": settings.app_name,
        "service.version": settings.app_version,
        "deployment.environment": settings.environment,
    })

    provider = TracerProvider(resource=resource)

    # In development: print traces to console
    # In production: send to Jaeger/Tempo/Datadog
    processor = BatchSpanProcessor(ConsoleSpanExporter())
    provider.add_span_processor(processor)

    trace.set_tracer_provider(provider)

    # Auto-instrument FastAPI
    FastAPIInstrumentor.instrument_app(app)

    logger.info("tracing_initialized", service=settings.app_name)


def get_tracer():
    return trace.get_tracer(__name__)


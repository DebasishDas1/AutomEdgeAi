# core/logging.py
import structlog
from core.config import settings

def configure_logging():
    """
    Configures structlog with contextual processors and conditional rendering
    (Console for dev, JSON for prod).
    """
    structlog.configure(
        processors=[
            structlog.contextvars.merge_contextvars,
            structlog.processors.add_log_level,
            structlog.processors.CallsiteParameterAdder(
                [structlog.processors.CallsiteParameter.FILENAME,
                 structlog.processors.CallsiteParameter.LINENO]
            ),
            structlog.processors.TimeStamper(fmt="iso"),
            (
                structlog.dev.ConsoleRenderer()
                if settings.ENVIRONMENT == "dev"
                else structlog.processors.JSONRenderer()
            ),
        ],
        logger_factory=structlog.PrintLoggerFactory(),
    )

"""
app/__init__.py
===============
Application factory for EstateIQ.

The create_app() pattern is the Flask standard for production apps.

WHY AN APPLICATION FACTORY?
1. Testing: Each test can create a fresh app with different config
2. Multiple instances: You can run API and admin as separate apps
3. Circular imports: Extensions are created before the app exists
4. Flexibility: Config can be passed in at creation time

This is the pattern used by every serious Flask application:
Flask-SQLAlchemy docs, Flask-Login docs, and Flask itself
all recommend this approach.
"""

import logging
import os
from flask import Flask, jsonify

import config
from app.extensions import limiter


def create_app(config_override: dict = None) -> Flask:
    """
    Create and configure the Flask application.

    Args:
        config_override: Optional dict to override config values.
                        Used in testing to pass test-specific settings.

    Returns:
        Configured Flask application instance.

    Example:
        # Production
        app = create_app()

        # Testing
        app = create_app({"TESTING": True, "DEBUG": False})
    """
    app = Flask(
        __name__,
        # Tell Flask where templates and static files live
        # They are in the project root, not inside the app/ folder
        template_folder=os.path.join(os.path.dirname(os.path.dirname(__file__)), "templates"),
        static_folder=os.path.join(os.path.dirname(os.path.dirname(__file__)), "static"),
    )

    # ── Core Flask Config ─────────────────────────────────
    app.config["SECRET_KEY"]    = config.SECRET_KEY
    app.config["DEBUG"]         = config.DEBUG
    app.config["TESTING"]       = False
    app.config["JSON_SORT_KEYS"] = False  # Preserve key order in responses

    # ── Apply any test overrides ──────────────────────────
    if config_override:
        app.config.update(config_override)

    # ── Validate config at startup ────────────────────────
    _validate_startup_config(app)

    # ── Initialize Extensions ─────────────────────────────
    _init_extensions(app)

    # ── Register Blueprints ───────────────────────────────
    _register_blueprints(app)

    # ── Register Error Handlers ───────────────────────────
    _register_error_handlers(app)

    # ── Log startup info ──────────────────────────────────
    logger = logging.getLogger("estateiq")
    logger.info(f"Application created: {config.APP_NAME} v{config.APP_VERSION}")
    logger.info(f"Environment: {config.ENVIRONMENT}")
    logger.info(f"Debug mode: {config.DEBUG}")

    return app


def _validate_startup_config(app: Flask):
    """Validate configuration at startup. Fail fast on bad config."""
    try:
        warnings = config.validate_config()
        logger = logging.getLogger("estateiq")
        for warning in warnings:
            logger.warning(f"CONFIG: {warning}")
    except EnvironmentError as e:
        raise SystemExit(f"FATAL CONFIG ERROR: {e}")


def _init_extensions(app: Flask):
    """Initialize Flask extensions with the app instance."""
    # Rate limiter
    limiter.init_app(app)

    # Configure limiter defaults from config
    app.config["RATELIMIT_DEFAULT"] = config.RATE_LIMIT_DEFAULT
    app.config["RATELIMIT_HEADERS_ENABLED"] = True


def _register_blueprints(app: Flask):
    """Register all route blueprints."""
    from app.routes.main       import main_bp
    from app.routes.prediction import prediction_bp
    from app.routes.health     import health_bp

    app.register_blueprint(main_bp)
    app.register_blueprint(prediction_bp)
    app.register_blueprint(health_bp)


def _register_error_handlers(app: Flask):
    """Register global error handlers for clean JSON error responses."""

    @app.errorhandler(400)
    def bad_request(e):
        return jsonify({
            "success": False,
            "errors":  ["Bad request: " + str(e)],
            "error_type": "bad_request"
        }), 400

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({
            "success": False,
            "errors":  [f"Endpoint not found: {str(e)}"],
            "error_type": "not_found"
        }), 404

    @app.errorhandler(405)
    def method_not_allowed(e):
        return jsonify({
            "success": False,
            "errors":  ["Method not allowed on this endpoint"],
            "error_type": "method_not_allowed"
        }), 405

    @app.errorhandler(429)
    def rate_limit_exceeded(e):
        logger = logging.getLogger("estateiq")
        logger.warning(f"RATE LIMIT | {str(e)}")
        return jsonify({
            "success":             False,
            "errors":              [
                f"Too many requests. "
                f"Limit: {config.RATE_LIMIT_PER_MINUTE}/minute. "
                f"Please wait and try again."
            ],
            "error_type":          "rate_limit_exceeded",
            "retry_after_seconds": 60
        }), 429

    @app.errorhandler(500)
    def server_error(e):
        logger = logging.getLogger("estateiq")
        logger.error(f"SERVER ERROR: {str(e)}", exc_info=True)
        return jsonify({
            "success": False,
            "errors":  ["Internal server error. Please try again."],
            "error_type": "server_error"
        }), 500
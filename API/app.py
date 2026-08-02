"""Application factory for the MPDB API."""

import logging

from flask import Blueprint, Flask, jsonify, request
from flask_cors import CORS

import db as db_module
from catalog import CARS_BY_SLUG
from config import Config
from db import get_db, init_db
from extensions import limiter
from security import admin_required

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")


@admin_bp.get("/rentals")
@admin_required
def all_rentals():
    """Every booking in the system.

    This replaces the old ``/is_admin`` endpoint, which answered "is this user
    an admin?" for any username handed to it, with no authentication at all.
    Admin status now travels in the signed session cookie and is enforced
    server-side on the routes that actually need it.
    """
    rows = get_db().execute(
        """
        SELECT r.*, u.username
          FROM rentals r
          LEFT JOIN users u ON u.id = r.user_id
         ORDER BY datetime(r.created_at) DESC
        """
    )
    return (
        jsonify(
            {
                "rentals": [
                    {
                        "id": row["id"],
                        "username": row["username"],
                        "fullName": row["full_name"],
                        "email": row["email"],
                        "phone": row["phone"],
                        "carSlug": row["car_slug"],
                        "carName": (CARS_BY_SLUG.get(row["car_slug"]) or {}).get(
                            "name", row["car_slug"]
                        ),
                        "pickupDate": row["pickup_date"],
                        "returnDate": row["return_date"],
                        "location": row["location"],
                        "totalPrice": row["total_price"],
                        "status": row["status"],
                        "createdAt": row["created_at"],
                    }
                    for row in rows
                ]
            }
        ),
        200,
    )


def create_app(config_object=Config):
    app = Flask(__name__)
    app.config.from_object(config_object)
    app.config["SECRET_KEY"] = config_object.resolve_secret_key()

    logging.basicConfig(
        level=logging.DEBUG if app.config["DEBUG"] else logging.INFO,
        format="%(asctime)s %(levelname)-8s %(name)s: %(message)s",
    )

    # Only the configured frontend origins may send credentialed requests.
    # The old server used a bare CORS(app), which allows any site on the
    # internet to call the API from a logged-in user's browser.
    CORS(
        app,
        resources={r"/api/*": {"origins": app.config["CORS_ORIGINS"]}},
        supports_credentials=True,
        allow_headers=["Content-Type"],
        methods=["GET", "POST", "DELETE", "OPTIONS"],
    )

    limiter.init_app(app)
    limiter.storage_uri = app.config["RATELIMIT_STORAGE_URI"]

    db_module.register(app)

    from auth import bp as auth_bp
    from catalog import bp as catalog_bp
    from rentals import bp as rentals_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(catalog_bp)
    app.register_blueprint(rentals_bp)
    app.register_blueprint(admin_bp)

    _register_health(app)
    _register_error_handlers(app)
    _register_security_headers(app)

    with app.app_context():
        applied = init_db()
        if applied:
            app.logger.info("Applied database migration(s): %s", applied)

    return app


def _register_health(app):
    @app.get("/api/health")
    def health():
        get_db().execute("SELECT 1")
        return jsonify({"status": "ok", "service": "mpdb-api"}), 200


def _register_error_handlers(app):
    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({"error": getattr(error, "description", "Bad request.")}), 400

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({"error": "Not found."}), 404

    @app.errorhandler(405)
    def method_not_allowed(error):
        return jsonify({"error": "Method not allowed."}), 405

    @app.errorhandler(413)
    def payload_too_large(error):
        return jsonify({"error": "Request body is too large."}), 413

    @app.errorhandler(429)
    def rate_limited(error):
        return (
            jsonify(
                {
                    "error": "Too many attempts. Please wait a moment and try again.",
                    "retryAfter": getattr(error, "description", None),
                }
            ),
            429,
        )

    @app.errorhandler(Exception)
    def unhandled(error):
        # Log the detail, return a generic message: stack traces and SQL
        # errors must never reach the client.
        app.logger.exception("Unhandled error on %s %s", request.method, request.path)
        return jsonify({"error": "An unexpected error occurred."}), 500


def _register_security_headers(app):
    @app.after_request
    def apply_headers(response):
        response.headers.setdefault("X-Content-Type-Options", "nosniff")
        response.headers.setdefault("X-Frame-Options", "DENY")
        response.headers.setdefault("Referrer-Policy", "no-referrer")
        response.headers.setdefault(
            "Cache-Control", "no-store, no-cache, must-revalidate"
        )
        return response


if __name__ == "__main__":
    # debug is driven by FLASK_DEBUG and defaults to off. The old server hard
    # coded debug=True, which exposes the Werkzeug console -- remote code
    # execution for anyone who can reach the port.
    application = create_app()
    application.run(host="127.0.0.1", port=5000, debug=application.config["DEBUG"])

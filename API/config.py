"""Application configuration, loaded from the environment."""

import os
import secrets
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent

load_dotenv(BASE_DIR / ".env")


def _env_bool(name, default=False):
    raw = os.getenv(name)
    if raw is None:
        return default
    return raw.strip().lower() in {"1", "true", "yes", "on"}


def _env_list(name, default):
    raw = os.getenv(name)
    if not raw:
        return list(default)
    return [item.strip() for item in raw.split(",") if item.strip()]


class Config:
    ENV = os.getenv("FLASK_ENV", "development")
    DEBUG = _env_bool("FLASK_DEBUG", False)

    # An absolute path, so the server finds the database no matter where it is
    # launched from. The old code used a relative path and silently created an
    # empty database whenever you started it from the wrong directory.
    DATABASE_PATH = Path(os.getenv("DATABASE_PATH", BASE_DIR / "database.db"))

    SECRET_KEY = os.getenv("SECRET_KEY", "")

    JWT_ALGORITHM = "HS256"
    JWT_TTL_SECONDS = int(os.getenv("JWT_TTL_SECONDS", 60 * 60 * 12))

    SESSION_COOKIE_NAME = os.getenv("SESSION_COOKIE_NAME", "mpdb_session")
    SESSION_COOKIE_SECURE = _env_bool("SESSION_COOKIE_SECURE", ENV == "production")
    SESSION_COOKIE_SAMESITE = os.getenv("SESSION_COOKIE_SAMESITE", "Lax")

    CORS_ORIGINS = _env_list(
        "CORS_ORIGINS",
        ["http://localhost:5173", "http://127.0.0.1:5173"],
    )

    RATELIMIT_STORAGE_URI = os.getenv("RATELIMIT_STORAGE_URI", "memory://")
    LOGIN_RATE_LIMIT = os.getenv("LOGIN_RATE_LIMIT", "5 per minute")
    REGISTER_RATE_LIMIT = os.getenv("REGISTER_RATE_LIMIT", "10 per hour")

    MAX_CONTENT_LENGTH = 64 * 1024

    # HS256 signing keys shorter than this are rejected by RFC 7518.
    MIN_SECRET_KEY_BYTES = 32

    @classmethod
    def resolve_secret_key(cls):
        """Return the signing key, refusing to start insecurely in production."""
        if cls.SECRET_KEY:
            if len(cls.SECRET_KEY.encode("utf-8")) < cls.MIN_SECRET_KEY_BYTES:
                raise RuntimeError(
                    f"SECRET_KEY must be at least {cls.MIN_SECRET_KEY_BYTES} bytes. "
                    'Generate one with: python -c "import secrets; '
                    'print(secrets.token_hex(32))"'
                )
            return cls.SECRET_KEY
        if cls.ENV == "production":
            raise RuntimeError(
                "SECRET_KEY must be set in production. Generate one with:\n"
                "  python -c \"import secrets; print(secrets.token_hex(32))\""
            )
        # Development only. Sessions do not survive a restart, which is fine
        # locally and much safer than shipping a hardcoded default key.
        return secrets.token_hex(32)


class TestConfig(Config):
    ENV = "testing"
    TESTING = True
    SECRET_KEY = "test-key-not-for-real-use-0123456789abcdef"
    LOGIN_RATE_LIMIT = "1000 per minute"
    REGISTER_RATE_LIMIT = "1000 per minute"

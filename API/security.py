"""Password hashing, session tokens and route guards."""

import hashlib
import hmac
import re
from datetime import datetime, timedelta, timezone
from functools import wraps

import jwt
from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerifyMismatchError, VerificationError
from flask import current_app, g, jsonify, request

from db import get_db

# OWASP-recommended baseline for argon2id (64 MiB, 3 passes).
_hasher = PasswordHasher(time_cost=3, memory_cost=65536, parallelism=4)

_LEGACY_SHA256 = re.compile(r"^[0-9a-f]{64}$")

USERNAME_PATTERN = re.compile(r"^[A-Za-z0-9._-]{3,32}$")
MIN_PASSWORD_LENGTH = 8
MAX_PASSWORD_LENGTH = 128


def hash_password(password):
    return _hasher.hash(password)


def verify_password(stored_hash, password):
    """Check a password against either an argon2id or a legacy SHA-256 hash.

    Returns ``(ok, new_hash)``. ``new_hash`` is non-None when the stored value
    needs to be replaced -- either because it is an unsalted SHA-256 digest
    from the original app, or because argon2 parameters have since been
    raised. Callers are expected to persist it.
    """
    if not stored_hash:
        return False, None

    if stored_hash.startswith("$argon2"):
        try:
            _hasher.verify(stored_hash, password)
        except (VerifyMismatchError, VerificationError, InvalidHashError):
            return False, None
        if _hasher.check_needs_rehash(stored_hash):
            return True, hash_password(password)
        return True, None

    if _LEGACY_SHA256.match(stored_hash):
        # Accounts created by the original server stored a bare, unsalted
        # SHA-256 digest. Accept it once, then immediately upgrade to argon2id
        # so the weak hash never touches disk again.
        digest = hashlib.sha256(password.encode("utf-8")).hexdigest()
        if hmac.compare_digest(digest, stored_hash):
            return True, hash_password(password)
        return False, None

    return False, None


def validate_credentials(username, password):
    """Return a list of human-readable problems; empty means valid."""
    errors = []

    if not isinstance(username, str) or not USERNAME_PATTERN.match(username):
        errors.append(
            "Username must be 3-32 characters and may contain only letters, "
            "digits, dots, underscores and hyphens."
        )

    if not isinstance(password, str):
        errors.append("Password is required.")
    elif len(password) < MIN_PASSWORD_LENGTH:
        errors.append(
            f"Password must be at least {MIN_PASSWORD_LENGTH} characters long."
        )
    elif len(password) > MAX_PASSWORD_LENGTH:
        errors.append(
            f"Password must be at most {MAX_PASSWORD_LENGTH} characters long."
        )

    return errors


def create_token(user_id, username, is_admin):
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(user_id),
        "username": username,
        "is_admin": bool(is_admin),
        "iat": now,
        "exp": now + timedelta(seconds=current_app.config["JWT_TTL_SECONDS"]),
    }
    return jwt.encode(
        payload,
        current_app.config["SECRET_KEY"],
        algorithm=current_app.config["JWT_ALGORITHM"],
    )


def decode_token(token):
    try:
        return jwt.decode(
            token,
            current_app.config["SECRET_KEY"],
            algorithms=[current_app.config["JWT_ALGORITHM"]],
        )
    except jwt.PyJWTError:
        return None


def set_session_cookie(response, token):
    response.set_cookie(
        current_app.config["SESSION_COOKIE_NAME"],
        token,
        max_age=current_app.config["JWT_TTL_SECONDS"],
        httponly=True,
        secure=current_app.config["SESSION_COOKIE_SECURE"],
        samesite=current_app.config["SESSION_COOKIE_SAMESITE"],
        path="/",
    )
    return response


def clear_session_cookie(response):
    response.delete_cookie(
        current_app.config["SESSION_COOKIE_NAME"],
        path="/",
        httponly=True,
        secure=current_app.config["SESSION_COOKIE_SECURE"],
        samesite=current_app.config["SESSION_COOKIE_SAMESITE"],
    )
    return response


def current_user():
    """Resolve the caller from the session cookie, or None.

    The row is re-read from the database on every request so that deleted
    accounts and revoked admin rights take effect immediately instead of
    lingering until the token expires.
    """
    if "current_user" in g:
        return g.current_user

    g.current_user = None
    token = request.cookies.get(current_app.config["SESSION_COOKIE_NAME"])
    if token:
        payload = decode_token(token)
        if payload:
            row = (
                get_db()
                .execute(
                    "SELECT id, username, is_admin, created_at FROM users WHERE id = ?",
                    (payload["sub"],),
                )
                .fetchone()
            )
            if row is not None:
                g.current_user = dict(row)
    return g.current_user


def login_required(view):
    @wraps(view)
    def wrapped(*args, **kwargs):
        if current_user() is None:
            return jsonify({"error": "Authentication required."}), 401
        return view(*args, **kwargs)

    return wrapped


def admin_required(view):
    @wraps(view)
    def wrapped(*args, **kwargs):
        user = current_user()
        if user is None:
            return jsonify({"error": "Authentication required."}), 401
        if not user["is_admin"]:
            return jsonify({"error": "Administrator privileges required."}), 403
        return view(*args, **kwargs)

    return wrapped

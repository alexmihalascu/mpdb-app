"""Authentication endpoints: register, login, logout, session, password change."""

import sqlite3

from flask import Blueprint, current_app, jsonify, request

from db import get_db
from extensions import limiter
from security import (
    clear_session_cookie,
    create_token,
    current_user,
    hash_password,
    login_required,
    set_session_cookie,
    validate_credentials,
    verify_password,
)

bp = Blueprint("auth", __name__, url_prefix="/api/auth")

# Verifying a throwaway hash keeps the response time for "unknown username"
# in the same ballpark as "wrong password", so the endpoint does not leak
# which accounts exist via timing.
_DUMMY_HASH = None


def _dummy_verify(password):
    global _DUMMY_HASH
    if _DUMMY_HASH is None:
        _DUMMY_HASH = hash_password("timing-equalisation-placeholder")
    verify_password(_DUMMY_HASH, password)


def _json_body():
    data = request.get_json(silent=True)
    return data if isinstance(data, dict) else {}


def _public_user(row):
    return {
        "id": row["id"],
        "username": row["username"],
        "isAdmin": bool(row["is_admin"]),
        "createdAt": row["created_at"],
    }


@bp.post("/register")
@limiter.limit(lambda: current_app.config["REGISTER_RATE_LIMIT"])
def register():
    data = _json_body()
    username = (data.get("username") or "").strip()
    password = data.get("password") or ""

    errors = validate_credentials(username, password)
    if errors:
        return jsonify({"error": errors[0], "errors": errors}), 400

    db = get_db()
    try:
        cursor = db.execute(
            "INSERT INTO users (username, password_hash, is_admin) VALUES (?, ?, 0)",
            (username, hash_password(password)),
        )
    except sqlite3.IntegrityError:
        # The UNIQUE index does the real work here; the old schema had no
        # constraint at all, so registering the same name twice silently
        # created a second account.
        return jsonify({"error": "That username is already taken."}), 409

    db.commit()
    row = db.execute(
        "SELECT id, username, is_admin, created_at FROM users WHERE id = ?",
        (cursor.lastrowid,),
    ).fetchone()

    response = jsonify({"user": _public_user(row)})
    set_session_cookie(response, create_token(row["id"], row["username"], row["is_admin"]))
    return response, 201


@bp.post("/login")
@limiter.limit(lambda: current_app.config["LOGIN_RATE_LIMIT"])
def login():
    data = _json_body()
    username = (data.get("username") or "").strip()
    password = data.get("password") or ""

    if not username or not password:
        return jsonify({"error": "Username and password are required."}), 400

    db = get_db()
    row = db.execute(
        "SELECT id, username, password_hash, is_admin, created_at "
        "FROM users WHERE username = ? COLLATE NOCASE",
        (username,),
    ).fetchone()

    if row is None:
        _dummy_verify(password)
        return jsonify({"error": "Invalid username or password."}), 401

    ok, upgraded_hash = verify_password(row["password_hash"], password)
    if not ok:
        return jsonify({"error": "Invalid username or password."}), 401

    if upgraded_hash:
        db.execute(
            "UPDATE users SET password_hash = ?, updated_at = datetime('now') WHERE id = ?",
            (upgraded_hash, row["id"]),
        )
        db.commit()

    response = jsonify({"user": _public_user(row)})
    set_session_cookie(response, create_token(row["id"], row["username"], row["is_admin"]))
    return response, 200


@bp.post("/logout")
def logout():
    response = jsonify({"message": "Signed out."})
    clear_session_cookie(response)
    return response, 200


@bp.get("/me")
def me():
    user = current_user()
    if user is None:
        return jsonify({"user": None}), 200
    return jsonify({"user": _public_user(user)}), 200


@bp.post("/password")
@login_required
def change_password():
    data = _json_body()
    current_password = data.get("currentPassword") or ""
    new_password = data.get("newPassword") or ""

    user = current_user()
    db = get_db()
    row = db.execute(
        "SELECT password_hash FROM users WHERE id = ?", (user["id"],)
    ).fetchone()

    ok, _ = verify_password(row["password_hash"], current_password)
    if not ok:
        return jsonify({"error": "Your current password is incorrect."}), 403

    errors = validate_credentials(user["username"], new_password)
    if errors:
        return jsonify({"error": errors[-1], "errors": errors}), 400

    if current_password == new_password:
        return jsonify({"error": "The new password must be different."}), 400

    db.execute(
        "UPDATE users SET password_hash = ?, updated_at = datetime('now') WHERE id = ?",
        (hash_password(new_password), user["id"]),
    )
    db.commit()

    # Re-issue the cookie so the session stays valid after the change.
    response = jsonify({"message": "Password updated."})
    set_session_cookie(
        response, create_token(user["id"], user["username"], user["is_admin"])
    )
    return response, 200

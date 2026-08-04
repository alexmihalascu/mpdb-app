"""End-to-end tests for the MPDB API, driven through the HTTP layer."""

import hashlib
import sqlite3
import sys
from datetime import date, timedelta
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app import create_app  # noqa: E402
from config import TestConfig  # noqa: E402

TOMORROW = (date.today() + timedelta(days=1)).isoformat()
NEXT_WEEK = (date.today() + timedelta(days=8)).isoformat()
YESTERDAY = (date.today() - timedelta(days=1)).isoformat()

GOOD_BOOKING = {
    "fullName": "Ana Popescu",
    "email": "ana@example.com",
    "phone": "+40 721 000 111",
    "carSlug": "urus",
    "pickupDate": TOMORROW,
    "returnDate": NEXT_WEEK,
    "location": "Otopeni Airport",
}


@pytest.fixture
def app(tmp_path):
    class Cfg(TestConfig):
        DATABASE_PATH = tmp_path / "test.db"

    return create_app(Cfg)


@pytest.fixture
def client(app):
    return app.test_client()


def register(client, username="testuser", password="correct-horse-1"):
    return client.post(
        "/api/auth/register", json={"username": username, "password": password}
    )


# --------------------------------------------------------------------------
# Schema and migration
# --------------------------------------------------------------------------


def test_migration_adds_constraints(app):
    connection = sqlite3.connect(app.config["DATABASE_PATH"])
    assert connection.execute("PRAGMA user_version").fetchone()[0] == 2
    indexes = {row[1] for row in connection.execute("PRAGMA index_list(users)")}
    rental_columns = {
        row[1] for row in connection.execute("PRAGMA table_info(rentals)")
    }
    assert "idx_users_username" in indexes
    assert {"coverage_level", "delivery_mode"} <= rental_columns
    connection.close()


def test_migration_preserves_legacy_users_and_upgrades_hash(tmp_path):
    """A pre-migration database keeps its rows, and its SHA-256 hash is
    replaced with argon2id the first time that user signs in."""
    legacy_path = tmp_path / "legacy.db"
    connection = sqlite3.connect(legacy_path)
    connection.executescript(
        """
        CREATE TABLE "users" (
            "id" INTEGER, "username" TEXT NOT NULL,
            "password" TEXT NOT NULL, "is_admin" INTEGER,
            PRIMARY KEY("id" AUTOINCREMENT)
        );
        CREATE TABLE "rentals" (
            "rent_id" INTEGER, "name" TEXT NOT NULL, "email" TEXT NOT NULL,
            "phone" TEXT NOT NULL, "car" TEXT NOT NULL,
            "pickupDate" TEXT NOT NULL, "returnDate" TEXT, "location" TEXT,
            PRIMARY KEY("rent_id" AUTOINCREMENT)
        );
        """
    )
    legacy_hash = hashlib.sha256(b"password123").hexdigest()
    connection.execute(
        "INSERT INTO users (username, password, is_admin) VALUES (?, ?, 1)",
        ("alex", legacy_hash),
    )
    connection.commit()
    connection.close()

    class Cfg(TestConfig):
        DATABASE_PATH = legacy_path

    client = create_app(Cfg).test_client()

    response = client.post(
        "/api/auth/login", json={"username": "alex", "password": "password123"}
    )
    assert response.status_code == 200
    assert response.get_json()["user"]["isAdmin"] is True

    connection = sqlite3.connect(legacy_path)
    stored = connection.execute(
        "SELECT password_hash FROM users WHERE username = 'alex'"
    ).fetchone()[0]
    connection.close()
    assert stored.startswith("$argon2id$")
    assert stored != legacy_hash


# --------------------------------------------------------------------------
# Registration
# --------------------------------------------------------------------------


def test_register_returns_user_and_sets_session_cookie(client):
    response = register(client)
    assert response.status_code == 201
    assert response.get_json()["user"]["username"] == "testuser"
    assert "mpdb_session" in response.headers.get("Set-Cookie", "")
    assert "HttpOnly" in response.headers.get("Set-Cookie", "")


def test_register_never_stores_a_plaintext_or_sha256_password(client, app):
    register(client, password="correct-horse-1")
    connection = sqlite3.connect(app.config["DATABASE_PATH"])
    stored = connection.execute("SELECT password_hash FROM users").fetchone()[0]
    connection.close()
    assert stored.startswith("$argon2id$")
    assert "correct-horse-1" not in stored
    assert stored != hashlib.sha256(b"correct-horse-1").hexdigest()


def test_register_rejects_duplicate_username_case_insensitively(client):
    register(client, username="testuser")
    response = register(client, username="TestUser")
    assert response.status_code == 409


@pytest.mark.parametrize(
    "username,password",
    [
        ("ab", "correct-horse-1"),  # too short
        ("bad user!", "correct-horse-1"),  # illegal characters
        ("testuser", "short"),  # weak password
        ("testuser", ""),  # missing password
    ],
)
def test_register_rejects_invalid_input(client, username, password):
    response = client.post(
        "/api/auth/register", json={"username": username, "password": password}
    )
    assert response.status_code == 400


# --------------------------------------------------------------------------
# Login / session
# --------------------------------------------------------------------------


def test_login_succeeds_with_correct_password(client):
    register(client)
    client.delete_cookie("mpdb_session")
    response = client.post(
        "/api/auth/login", json={"username": "testuser", "password": "correct-horse-1"}
    )
    assert response.status_code == 200
    assert response.get_json()["user"]["username"] == "testuser"


def test_login_fails_with_wrong_password(client):
    register(client)
    client.delete_cookie("mpdb_session")
    response = client.post(
        "/api/auth/login", json={"username": "testuser", "password": "wrong-password"}
    )
    assert response.status_code == 401
    assert "user" not in response.get_json()


def test_login_error_does_not_reveal_whether_username_exists(client):
    register(client)
    client.delete_cookie("mpdb_session")
    unknown = client.post(
        "/api/auth/login", json={"username": "ghost", "password": "correct-horse-1"}
    )
    wrong = client.post(
        "/api/auth/login", json={"username": "testuser", "password": "nope-nope-nope"}
    )
    assert unknown.status_code == wrong.status_code == 401
    assert unknown.get_json()["error"] == wrong.get_json()["error"]


def test_me_returns_null_when_signed_out(client):
    assert client.get("/api/auth/me").get_json()["user"] is None


def test_me_returns_user_when_signed_in(client):
    register(client)
    assert client.get("/api/auth/me").get_json()["user"]["username"] == "testuser"


def test_logout_clears_the_session(client):
    register(client)
    client.post("/api/auth/logout")
    assert client.get("/api/auth/me").get_json()["user"] is None


def test_session_cookie_is_not_readable_by_javascript(client):
    cookie = register(client).headers["Set-Cookie"]
    assert "HttpOnly" in cookie
    assert "SameSite=Lax" in cookie


def test_forged_session_token_is_rejected(client):
    register(client)
    client.set_cookie("mpdb_session", "not.a.valid.token")
    assert client.get("/api/auth/me").get_json()["user"] is None


# --------------------------------------------------------------------------
# Password change
# --------------------------------------------------------------------------


def test_password_change_requires_authentication(client):
    response = client.post(
        "/api/auth/password",
        json={"currentPassword": "a", "newPassword": "new-password-1"},
    )
    assert response.status_code == 401


def test_password_change_requires_the_current_password(client):
    register(client)
    response = client.post(
        "/api/auth/password",
        json={"currentPassword": "wrong", "newPassword": "new-password-1"},
    )
    assert response.status_code == 403


def test_password_change_updates_the_credential(client):
    register(client)
    assert (
        client.post(
            "/api/auth/password",
            json={
                "currentPassword": "correct-horse-1",
                "newPassword": "brand-new-password-2",
            },
        ).status_code
        == 200
    )
    client.delete_cookie("mpdb_session")
    assert (
        client.post(
            "/api/auth/login",
            json={"username": "testuser", "password": "brand-new-password-2"},
        ).status_code
        == 200
    )
    assert (
        client.post(
            "/api/auth/login",
            json={"username": "testuser", "password": "correct-horse-1"},
        ).status_code
        == 401
    )


# --------------------------------------------------------------------------
# Catalog
# --------------------------------------------------------------------------


def test_catalog_lists_the_fleet(client):
    cars = client.get("/api/cars").get_json()["cars"]
    assert len(cars) == 18
    assert {"slug", "name", "pricePerDay", "horsepower"} <= set(cars[0])


# --------------------------------------------------------------------------
# Rentals
# --------------------------------------------------------------------------


def test_booking_is_persisted(client, app):
    response = client.post("/api/rentals", json=GOOD_BOOKING)
    assert response.status_code == 201

    connection = sqlite3.connect(app.config["DATABASE_PATH"])
    rows = connection.execute("SELECT full_name, car_slug FROM rentals").fetchall()
    connection.close()
    assert rows == [("Ana Popescu", "urus")]


def test_booking_total_is_computed_server_side(client):
    """7 days x 800 EUR/day for the Urus, and a client-supplied total is ignored."""
    payload = {**GOOD_BOOKING, "totalPrice": 1}
    rental = client.post("/api/rentals", json=payload).get_json()["rental"]
    assert rental["totalPrice"] == 7 * 800


def test_booking_total_includes_selected_package_and_delivery(client):
    payload = {
        **GOOD_BOOKING,
        "coverageLevel": "executive",
        "deliveryMode": "otopeni",
        "totalPrice": 1,
    }
    rental = client.post("/api/rentals", json=payload).get_json()["rental"]
    assert rental["totalPrice"] == 7 * 800 + 7 * 95 + 35
    assert rental["coverageLabel"] == "Executive"
    assert rental["deliveryLabel"] == "Otopeni"
    assert rental["priceBreakdown"]["coverageTotal"] == 7 * 95


def test_booking_is_linked_to_the_signed_in_user(client):
    register(client)
    client.post("/api/rentals", json=GOOD_BOOKING)
    rentals = client.get("/api/rentals").get_json()["rentals"]
    assert len(rentals) == 1
    assert rentals[0]["carName"] == "Lamborghini Urus"


@pytest.mark.parametrize(
    "override,bad_field",
    [
        ({"email": "not-an-email"}, "email"),
        ({"phone": "abc"}, "phone"),
        ({"carSlug": "delorean"}, "carSlug"),
        ({"pickupDate": YESTERDAY}, "pickupDate"),
        ({"returnDate": TOMORROW}, "returnDate"),
        ({"fullName": "A"}, "fullName"),
        ({"location": ""}, "location"),
        ({"coverageLevel": "vip"}, "coverageLevel"),
        ({"deliveryMode": "moon"}, "deliveryMode"),
    ],
)
def test_booking_validation_rejects_bad_input(client, override, bad_field):
    response = client.post("/api/rentals", json={**GOOD_BOOKING, **override})
    assert response.status_code == 400
    assert bad_field in response.get_json()["fields"]


def test_rentals_list_requires_authentication(client):
    assert client.get("/api/rentals").status_code == 401


def test_users_cannot_see_or_cancel_other_peoples_rentals(client):
    register(client, username="alice")
    rental_id = client.post("/api/rentals", json=GOOD_BOOKING).get_json()["rental"]["id"]
    client.post("/api/auth/logout")

    register(client, username="mallory")
    assert client.get("/api/rentals").get_json()["rentals"] == []
    assert client.delete(f"/api/rentals/{rental_id}").status_code == 404


def test_owner_can_cancel_their_rental(client):
    register(client)
    rental_id = client.post("/api/rentals", json=GOOD_BOOKING).get_json()["rental"]["id"]
    response = client.delete(f"/api/rentals/{rental_id}")
    assert response.status_code == 200
    assert response.get_json()["rental"]["status"] == "cancelled"


# --------------------------------------------------------------------------
# Authorisation
# --------------------------------------------------------------------------


def test_admin_endpoint_rejects_anonymous_callers(client):
    assert client.get("/api/admin/rentals").status_code == 401


def test_admin_endpoint_rejects_ordinary_users(client):
    register(client)
    assert client.get("/api/admin/rentals").status_code == 403


def test_admin_endpoint_allows_admins(client, app):
    register(client, username="boss")
    connection = sqlite3.connect(app.config["DATABASE_PATH"])
    connection.execute("UPDATE users SET is_admin = 1 WHERE username = 'boss'")
    connection.commit()
    connection.close()
    assert client.get("/api/admin/rentals").status_code == 200


def test_revoking_admin_takes_effect_without_waiting_for_token_expiry(client, app):
    register(client, username="boss")
    connection = sqlite3.connect(app.config["DATABASE_PATH"])
    connection.execute("UPDATE users SET is_admin = 1 WHERE username = 'boss'")
    connection.commit()
    assert client.get("/api/admin/rentals").status_code == 200

    connection.execute("UPDATE users SET is_admin = 0 WHERE username = 'boss'")
    connection.commit()
    connection.close()
    assert client.get("/api/admin/rentals").status_code == 403


# --------------------------------------------------------------------------
# Hardening
# --------------------------------------------------------------------------


def test_login_is_rate_limited(app):
    class Cfg(TestConfig):
        DATABASE_PATH = app.config["DATABASE_PATH"]
        LOGIN_RATE_LIMIT = "3 per minute"

    client = create_app(Cfg).test_client()
    statuses = [
        client.post(
            "/api/auth/login", json={"username": "nobody", "password": "whatever-1"}
        ).status_code
        for _ in range(5)
    ]
    assert 429 in statuses


def test_security_headers_are_present(client):
    headers = client.get("/api/health").headers
    assert headers["X-Content-Type-Options"] == "nosniff"
    assert headers["X-Frame-Options"] == "DENY"


def test_unknown_route_returns_json_not_html(client):
    response = client.get("/api/does-not-exist")
    assert response.status_code == 404
    assert response.get_json()["error"] == "Not found."


def test_health_check(client):
    assert client.get("/api/health").get_json()["status"] == "ok"

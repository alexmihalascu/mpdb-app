"""SQLite access layer plus a small forward-only migration runner.

Migrations are keyed off SQLite's ``PRAGMA user_version`` so ``init_db`` is
idempotent: it can run on every boot and will only apply what is missing.
"""

import sqlite3

import click
from flask import current_app, g

SCHEMA_VERSION = 2


def get_db():
    """Return the request-scoped connection, opening one on first use."""
    if "db" not in g:
        connection = sqlite3.connect(
            current_app.config["DATABASE_PATH"],
            detect_types=sqlite3.PARSE_DECLTYPES,
        )
        connection.row_factory = sqlite3.Row
        connection.execute("PRAGMA foreign_keys = ON")
        connection.execute("PRAGMA journal_mode = WAL")
        g.db = connection
    return g.db


def close_db(exc=None):
    """Close the connection at the end of the request.

    The original code opened a connection per handler and never closed any of
    them, which leaked file handles and left writes in limbo on errors.
    """
    connection = g.pop("db", None)
    if connection is None:
        return
    if exc is None:
        connection.commit()
    else:
        connection.rollback()
    connection.close()


def _current_version(connection):
    return connection.execute("PRAGMA user_version").fetchone()[0]


def _set_version(connection, version):
    connection.execute(f"PRAGMA user_version = {int(version)}")


def _migrate_to_v1(connection):
    """Rebuild both tables with constraints the original schema lacked.

    ``users.username`` gains a case-insensitive UNIQUE index (duplicate
    accounts were possible before), ``rentals`` gains a real foreign key,
    timestamps and a status column. Existing rows are carried over, including
    legacy SHA-256 password hashes which are upgraded lazily on next login.
    """
    existing = {
        row["name"]
        for row in connection.execute(
            "SELECT name FROM sqlite_master WHERE type = 'table'"
        )
    }

    connection.executescript(
        """
        CREATE TABLE users_v1 (
            id            INTEGER PRIMARY KEY AUTOINCREMENT,
            username      TEXT    NOT NULL COLLATE NOCASE,
            password_hash TEXT    NOT NULL,
            is_admin      INTEGER NOT NULL DEFAULT 0 CHECK (is_admin IN (0, 1)),
            created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
            updated_at    TEXT    NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE rentals_v1 (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id     INTEGER REFERENCES users_v1(id) ON DELETE CASCADE,
            full_name   TEXT    NOT NULL,
            email       TEXT    NOT NULL,
            phone       TEXT    NOT NULL,
            car_slug    TEXT    NOT NULL,
            pickup_date TEXT    NOT NULL,
            return_date TEXT    NOT NULL,
            location    TEXT    NOT NULL,
            total_price INTEGER,
            status      TEXT    NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
            created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
        );
        """
    )

    if "users" in existing:
        # Keep the earliest row per username so the UNIQUE index can be built
        # even if the old, unconstrained table accumulated duplicates.
        connection.execute(
            """
            INSERT INTO users_v1 (id, username, password_hash, is_admin)
            SELECT id, username, password, COALESCE(is_admin, 0)
              FROM users
             WHERE id IN (
                   SELECT MIN(id) FROM users GROUP BY lower(username)
             )
            """
        )

    if "rentals" in existing:
        columns = {
            row["name"] for row in connection.execute("PRAGMA table_info(rentals)")
        }
        if {"name", "email", "phone", "car"} <= columns:
            connection.execute(
                """
                INSERT INTO rentals_v1 (
                    full_name, email, phone, car_slug,
                    pickup_date, return_date, location
                )
                SELECT name, email, phone, car,
                       pickupDate, COALESCE(returnDate, pickupDate),
                       COALESCE(location, '')
                  FROM rentals
                """
            )

    connection.executescript(
        """
        DROP TABLE IF EXISTS users;
        DROP TABLE IF EXISTS rentals;
        ALTER TABLE users_v1   RENAME TO users;
        ALTER TABLE rentals_v1 RENAME TO rentals;

        CREATE UNIQUE INDEX idx_users_username ON users (username COLLATE NOCASE);
        CREATE INDEX idx_rentals_user  ON rentals (user_id);
        CREATE INDEX idx_rentals_dates ON rentals (pickup_date, return_date);
        """
    )


MIGRATIONS = {1: _migrate_to_v1}


def _migrate_to_v2(connection):
    """Store commercial options used by the price calculator."""
    columns = {
        row["name"] for row in connection.execute("PRAGMA table_info(rentals)")
    }
    if "coverage_level" not in columns:
        connection.execute(
            "ALTER TABLE rentals ADD COLUMN coverage_level TEXT NOT NULL DEFAULT 'standard'"
        )
    if "delivery_mode" not in columns:
        connection.execute(
            "ALTER TABLE rentals ADD COLUMN delivery_mode TEXT NOT NULL DEFAULT 'bucharest'"
        )


MIGRATIONS[2] = _migrate_to_v2


def init_db(connection=None):
    """Apply any migrations the database has not seen yet."""
    owns_connection = connection is None
    if owns_connection:
        connection = sqlite3.connect(current_app.config["DATABASE_PATH"])
        connection.row_factory = sqlite3.Row

    try:
        version = _current_version(connection)
        applied = []
        for target in sorted(MIGRATIONS):
            if version < target:
                # Foreign keys stay off during the table rewrites so the
                # rename dance does not trip referential checks midway.
                connection.execute("PRAGMA foreign_keys = OFF")
                MIGRATIONS[target](connection)
                _set_version(connection, target)
                connection.execute("PRAGMA foreign_keys = ON")
                applied.append(target)
        connection.commit()
        return applied
    finally:
        if owns_connection:
            connection.close()


@click.command("init-db")
def init_db_command():
    """Flask CLI entry point: ``flask --app app init-db``."""
    applied = init_db()
    if applied:
        click.echo(f"Applied migration(s): {', '.join(map(str, applied))}")
    else:
        click.echo(f"Database already at schema version {SCHEMA_VERSION}.")


def register(app):
    app.teardown_appcontext(close_db)
    app.cli.add_command(init_db_command)

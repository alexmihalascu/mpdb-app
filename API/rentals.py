"""Rental booking endpoints.

The original rent form only ever called ``console.log``; nothing was ever
written to the ``rentals`` table that the schema already defined.
"""

import re
from datetime import date, datetime

from flask import Blueprint, jsonify, request

from catalog import CARS_BY_SLUG
from db import get_db
from security import current_user, login_required

bp = Blueprint("rentals", __name__, url_prefix="/api/rentals")

EMAIL_PATTERN = re.compile(r"^[^@\s]+@[^@\s.]+(\.[^@\s.]+)+$")
PHONE_PATTERN = re.compile(r"^\+?[0-9 ().-]{7,20}$")
MAX_RENTAL_DAYS = 90

COVERAGE_LEVELS = {
    "standard": {"label": "Standard", "dailyFee": 0},
    "plus": {"label": "Plus", "dailyFee": 45},
    "executive": {"label": "Executive", "dailyFee": 95},
}

DELIVERY_MODES = {
    "bucharest": {"label": "Bucuresti", "flatFee": 0},
    "otopeni": {"label": "Otopeni", "flatFee": 35},
    "custom": {"label": "Livrare dedicata", "flatFee": 120},
}


def _json_body():
    data = request.get_json(silent=True)
    return data if isinstance(data, dict) else {}


def _parse_date(value):
    try:
        return datetime.strptime(value, "%Y-%m-%d").date()
    except (TypeError, ValueError):
        return None


def _serialise(row):
    car = CARS_BY_SLUG.get(row["car_slug"])
    days = _rental_days(row["pickup_date"], row["return_date"])
    coverage_level = row["coverage_level"] if "coverage_level" in row.keys() else "standard"
    delivery_mode = row["delivery_mode"] if "delivery_mode" in row.keys() else "bucharest"
    price = _price_breakdown(car, days, coverage_level, delivery_mode)
    return {
        "id": row["id"],
        "fullName": row["full_name"],
        "email": row["email"],
        "phone": row["phone"],
        "carSlug": row["car_slug"],
        "carName": car["name"] if car else row["car_slug"],
        "pickupDate": row["pickup_date"],
        "returnDate": row["return_date"],
        "location": row["location"],
        "totalPrice": row["total_price"],
        "coverageLevel": coverage_level,
        "coverageLabel": COVERAGE_LEVELS.get(coverage_level, COVERAGE_LEVELS["standard"])[
            "label"
        ],
        "deliveryMode": delivery_mode,
        "deliveryLabel": DELIVERY_MODES.get(delivery_mode, DELIVERY_MODES["bucharest"])[
            "label"
        ],
        "priceBreakdown": price,
        "status": row["status"],
        "createdAt": row["created_at"],
    }


def _rental_days(pickup, returned):
    start = _parse_date(pickup)
    end = _parse_date(returned)
    if start is None or end is None or end <= start:
        return 0
    return (end - start).days


def _price_breakdown(car, days, coverage_level, delivery_mode):
    daily_rate = car["pricePerDay"] if car else 0
    coverage = COVERAGE_LEVELS.get(coverage_level, COVERAGE_LEVELS["standard"])
    delivery = DELIVERY_MODES.get(delivery_mode, DELIVERY_MODES["bucharest"])
    base_total = days * daily_rate
    coverage_total = days * coverage["dailyFee"]
    delivery_total = delivery["flatFee"]
    return {
        "days": days,
        "dailyRate": daily_rate,
        "baseTotal": base_total,
        "coverageDailyFee": coverage["dailyFee"],
        "coverageTotal": coverage_total,
        "deliveryFee": delivery_total,
        "total": base_total + coverage_total + delivery_total,
    }


def _validate(data):
    """Return ``(cleaned, errors)`` where errors maps field name -> message."""
    errors = {}

    full_name = (data.get("fullName") or "").strip()
    if len(full_name) < 3 or len(full_name) > 120:
        errors["fullName"] = "Please enter your full name (3-120 characters)."

    email = (data.get("email") or "").strip().lower()
    if not EMAIL_PATTERN.match(email) or len(email) > 254:
        errors["email"] = "Please enter a valid email address."

    phone = (data.get("phone") or "").strip()
    if not PHONE_PATTERN.match(phone):
        errors["phone"] = "Please enter a valid phone number."

    car_slug = (data.get("carSlug") or "").strip()
    car = CARS_BY_SLUG.get(car_slug)
    if car is None:
        errors["carSlug"] = "Please choose a car from our fleet."

    location = (data.get("location") or "").strip()
    if len(location) < 2 or len(location) > 160:
        errors["location"] = "Please enter a pickup location."

    coverage_level = (data.get("coverageLevel") or "standard").strip()
    if coverage_level not in COVERAGE_LEVELS:
        errors["coverageLevel"] = "Please choose a valid protection level."

    delivery_mode = (data.get("deliveryMode") or "bucharest").strip()
    if delivery_mode not in DELIVERY_MODES:
        errors["deliveryMode"] = "Please choose a valid delivery option."

    pickup = _parse_date(data.get("pickupDate"))
    if pickup is None:
        errors["pickupDate"] = "Please enter a valid pickup date (YYYY-MM-DD)."
    elif pickup < date.today():
        errors["pickupDate"] = "The pickup date cannot be in the past."

    returned = _parse_date(data.get("returnDate"))
    if returned is None:
        errors["returnDate"] = "Please enter a valid return date (YYYY-MM-DD)."
    elif pickup is not None:
        if returned <= pickup:
            errors["returnDate"] = "The return date must be after the pickup date."
        elif (returned - pickup).days > MAX_RENTAL_DAYS:
            errors["returnDate"] = f"Rentals are limited to {MAX_RENTAL_DAYS} days."

    if errors:
        return None, errors

    days = (returned - pickup).days
    price = _price_breakdown(car, days, coverage_level, delivery_mode)
    return {
        "full_name": full_name,
        "email": email,
        "phone": phone,
        "car_slug": car_slug,
        "pickup_date": pickup.isoformat(),
        "return_date": returned.isoformat(),
        "location": location,
        "coverage_level": coverage_level,
        "delivery_mode": delivery_mode,
        # Computed here, never trusted from the request body.
        "total_price": price["total"],
    }, {}


@bp.post("")
def create_rental():
    cleaned, errors = _validate(_json_body())
    if errors:
        return jsonify({"error": "Please correct the highlighted fields.", "fields": errors}), 400

    user = current_user()
    db = get_db()
    cursor = db.execute(
        """
        INSERT INTO rentals (
            user_id, full_name, email, phone, car_slug,
            pickup_date, return_date, location, coverage_level,
            delivery_mode, total_price
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            user["id"] if user else None,
            cleaned["full_name"],
            cleaned["email"],
            cleaned["phone"],
            cleaned["car_slug"],
            cleaned["pickup_date"],
            cleaned["return_date"],
            cleaned["location"],
            cleaned["coverage_level"],
            cleaned["delivery_mode"],
            cleaned["total_price"],
        ),
    )
    db.commit()

    row = db.execute("SELECT * FROM rentals WHERE id = ?", (cursor.lastrowid,)).fetchone()
    return jsonify({"rental": _serialise(row)}), 201


@bp.get("")
@login_required
def list_my_rentals():
    user = current_user()
    rows = get_db().execute(
        "SELECT * FROM rentals WHERE user_id = ? ORDER BY datetime(created_at) DESC",
        (user["id"],),
    )
    return jsonify({"rentals": [_serialise(row) for row in rows]}), 200


@bp.delete("/<int:rental_id>")
@login_required
def cancel_rental(rental_id):
    user = current_user()
    db = get_db()
    row = db.execute("SELECT * FROM rentals WHERE id = ?", (rental_id,)).fetchone()

    if row is None or (row["user_id"] != user["id"] and not user["is_admin"]):
        # Same response for "missing" and "not yours" so the endpoint cannot
        # be used to probe which rental IDs exist.
        return jsonify({"error": "Rental not found."}), 404

    if row["status"] == "cancelled":
        return jsonify({"rental": _serialise(row)}), 200

    db.execute("UPDATE rentals SET status = 'cancelled' WHERE id = ?", (rental_id,))
    db.commit()

    row = db.execute("SELECT * FROM rentals WHERE id = ?", (rental_id,)).fetchone()
    return jsonify({"rental": _serialise(row)}), 200

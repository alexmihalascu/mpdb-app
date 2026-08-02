"""The rentable fleet.

Prices live on the server so a booking total can never be set by the client.
The frontend maps ``slug`` onto its bundled photography.
"""

from flask import Blueprint, jsonify

CARS = [
    {
        "slug": "mustang",
        "name": "Ford Mustang GT",
        "brand": "Ford",
        "year": 2020,
        "horsepower": 450,
        "pricePerDay": 100,
        "transmission": "Automatic",
        "seats": 4,
        "category": "Muscle",
    },
    {
        "slug": "urus",
        "name": "Lamborghini Urus",
        "brand": "Lamborghini",
        "year": 2021,
        "horsepower": 650,
        "pricePerDay": 800,
        "transmission": "Automatic",
        "seats": 5,
        "category": "SUV",
    },
    {
        "slug": "s63",
        "name": "Mercedes-AMG S 63",
        "brand": "Mercedes-Benz",
        "year": 2022,
        "horsepower": 791,
        "pricePerDay": 750,
        "transmission": "Automatic",
        "seats": 5,
        "category": "Luxury",
    },
    {
        "slug": "models",
        "name": "Tesla Model S Plaid",
        "brand": "Tesla",
        "year": 2023,
        "horsepower": 1020,
        "pricePerDay": 700,
        "transmission": "Single-speed",
        "seats": 5,
        "category": "Electric",
    },
    {
        "slug": "gt63s",
        "name": "Mercedes-AMG GT 63 S E-Performance",
        "brand": "Mercedes-Benz",
        "year": 2022,
        "horsepower": 843,
        "pricePerDay": 900,
        "transmission": "Automatic",
        "seats": 4,
        "category": "Grand Tourer",
    },
    {
        "slug": "a45s",
        "name": "Mercedes-AMG A 45 S",
        "brand": "Mercedes-Benz",
        "year": 2021,
        "horsepower": 421,
        "pricePerDay": 300,
        "transmission": "Automatic",
        "seats": 5,
        "category": "Hot Hatch",
    },
    {
        "slug": "c63s",
        "name": "Mercedes-AMG C 63 S E-Performance",
        "brand": "Mercedes-Benz",
        "year": 2023,
        "horsepower": 680,
        "pricePerDay": 800,
        "transmission": "Automatic",
        "seats": 5,
        "category": "Sports Sedan",
    },
    {
        "slug": "modelx",
        "name": "Tesla Model X Plaid",
        "brand": "Tesla",
        "year": 2023,
        "horsepower": 1020,
        "pricePerDay": 750,
        "transmission": "Single-speed",
        "seats": 6,
        "category": "Electric",
    },
]

CARS_BY_SLUG = {car["slug"]: car for car in CARS}

bp = Blueprint("catalog", __name__, url_prefix="/api")


@bp.get("/cars")
def list_cars():
    return jsonify({"cars": CARS}), 200

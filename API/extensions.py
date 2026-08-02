"""Shared Flask extension instances.

Kept in their own module so blueprints can import them without creating a
circular import back to the application factory.
"""

from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

# api/cache_headers.py
"""
Response cache header utilities for controlling browser/CDN caching.
Implements Cache-Control and ETag strategies for optimal performance.
"""

from typing import Optional
from datetime import datetime, timedelta
from fastapi import Response
import hashlib
import json


def generate_etag(data: dict | str | list) -> str:
    """Generate ETag from content hash."""
    if isinstance(data, (dict, list)):
        content = json.dumps(data, sort_keys=True, default=str).encode()
    else:
        content = str(data).encode()
    return f'"{hashlib.md5(content).hexdigest()}"'


def set_cache_headers(
    response: Response,
    max_age: int = 3600,
    public: bool = False,
    etag: Optional[str] = None,
) -> Response:
    """
    Set cache control headers on response.
    
    Args:
        response: FastAPI Response object
        max_age: Cache lifetime in seconds (default 1 hour)
        public: Allow public caches (CDN) vs private only
        etag: Optional ETag value for validation
    """
    cache_control = f"{'public' if public else 'private'}, max-age={max_age}"
    response.headers["Cache-Control"] = cache_control
    
    if etag:
        response.headers["ETag"] = etag
    
    response.headers["Vary"] = "Accept-Encoding"
    return response


def get_cache_control(
    max_age: int = 3600,
    public: bool = False,
    must_revalidate: bool = False,
) -> str:
    """Build Cache-Control header value."""
    parts = [f"{'public' if public else 'private'}", f"max-age={max_age}"]
    if must_revalidate:
        parts.append("must-revalidate")
    return ", ".join(parts)

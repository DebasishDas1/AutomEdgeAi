import structlog
from fastapi import Request, HTTPException, status
from core.firebase import verify_token

logger = structlog.get_logger(__name__)

async def verify_firebase_token(request: Request):
    """
    FastAPI dependency to verify a Firebase ID token.
    Sanitizes errors and enforces revocation checks.
    """
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="missing_authorization_header",
        )
    
    token = auth_header.split(" ")[1]
    try:
        # verify_token handles initialization and check_revoked=True
        return verify_token(token)
    except Exception as e:
        # Log the specific error for debug but keep details from client
        logger.warning("firebase_token_invalid", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="invalid_token",
        )

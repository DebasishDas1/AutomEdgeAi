import firebase_admin
from firebase_admin import credentials, auth
from core.config import settings
import logging
import json
import os

# Configure logging
logger = logging.getLogger(__name__)

_firebase_initialized = False

def init_firebase():
    global _firebase_initialized
    if not _firebase_initialized:
        try:
            # Prefer settings JSON, fallback to env file path if provided
            json_blob = settings.FIREBASE_CREDENTIALS_JSON
            cred_path = os.getenv("FIREBASE_CREDENTIALS")
            
            cred = None
            if json_blob:
                try:
                    cred = credentials.Certificate(json.loads(json_blob))
                except Exception as e:
                    logger.warning(f"Failed to parse FIREBASE_CREDENTIALS_JSON: {e}")
            
            if not cred and cred_path and os.path.exists(cred_path):
                cred = credentials.Certificate(cred_path)
            
            if not cred:
                logger.error("No Firebase credentials found in settings or ENV (FIREBASE_CREDENTIALS)")
                return

            if not firebase_admin._apps:
                firebase_admin.initialize_app(cred)
            _firebase_initialized = True
            logger.info("Firebase Admin SDK initialized successfully.")
        except Exception as e:
            logger.warning(f"Failed to initialize Firebase Admin SDK: {e}")

def verify_token(token: str) -> dict:
    """
    Verifies a Firebase ID token with revocation check.
    Raises ValueError on failure.
    """
    init_firebase()
    # auth.verify_id_token raises on any verification failure
    return auth.verify_id_token(token, check_revoked=True)

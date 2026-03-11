import json
import logging
import gspread

from google.oauth2.service_account import Credentials
from core.config import settings

logger = logging.getLogger(__name__)

SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive",
]

_sheets_client = None


def get_sheets_client() -> gspread.Client:
    """
    Returns a cached Google Sheets client.

    Credentials are loaded from:
    settings.SHEETS_CREDENTIALS_JSON (JSON string in .env)

    Example .env:
    SHEETS_CREDENTIALS_JSON={"type":"service_account",...}
    """

    global _sheets_client

    if _sheets_client:
        return _sheets_client

    try:
        creds_json = settings.SHEETS_CREDENTIALS_JSON

        if not creds_json:
            raise ValueError("SHEETS_CREDENTIALS_JSON missing")

        creds_dict = json.loads(creds_json)

        creds = Credentials.from_service_account_info(
            creds_dict,
            scopes=SCOPES,
        )

        _sheets_client = gspread.authorize(creds)

        logger.info("Google Sheets client initialized")

        return _sheets_client

    except Exception as exc:
        logger.error(f"Failed to initialize Google Sheets client: {exc}")
        raise
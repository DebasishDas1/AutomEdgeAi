import json
import logging
import gspread
from typing import Optional
from google.oauth2.service_account import Credentials
from core.config import settings

logger = logging.getLogger(__name__)

SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive",
]

_sheets_client: Optional[gspread.Client] = None

def get_sheets_client() -> gspread.Client:
    """
    Returns a cached gspread Client using SHEETS_CREDENTIALS_JSON.
    """
    global _sheets_client
    if _sheets_client:
        return _sheets_client

    try:
        creds_json = settings.SHEETS_CREDENTIALS_JSON
        if not creds_json:
            raise ValueError("SHEETS_CREDENTIALS_JSON missing in settings")

        creds_dict = json.loads(creds_json)
        creds = Credentials.from_service_account_info(
            creds_dict,
            scopes=SCOPES,
        )
        _sheets_client = gspread.authorize(creds)
        logger.info("Google Sheets client initialized (gspread)")
        return _sheets_client

    except Exception as exc:
        logger.error(f"Failed to initialize Google Sheets client: {exc}")
        raise
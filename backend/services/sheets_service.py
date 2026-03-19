# services/sheets_service.py
from __future__ import annotations

import asyncio
import structlog
from typing import Any

logger = structlog.get_logger(__name__)


class SheetsService:
    def _get_service(self):
        try:
            import base64, json, os
            from google.oauth2.service_account import Credentials
            from googleapiclient.discovery import build
        except ImportError:
            raise RuntimeError(
                "Run: uv add google-api-python-client google-auth"
            )
        raw = os.environ.get("SHEETS_CREDENTIALS_JSON")
        if not raw:
            raise RuntimeError("SHEETS_CREDENTIALS_JSON env var not set")
        info = json.loads(base64.b64decode(raw))
        creds = Credentials.from_service_account_info(
            info, scopes=["https://www.googleapis.com/auth/spreadsheets"]
        )
        return build("sheets", "v4", credentials=creds)

    async def append_lead(self, sheet_id: str, tab_name: str, row_data: list[Any]) -> None:
        try:
            await asyncio.to_thread(self._append_sync, sheet_id, tab_name, row_data)
            logger.info("sheets_row_appended", sheet_id=sheet_id, tab=tab_name)
        except Exception as exc:
            logger.error("sheets_append_failed", error=str(exc), tab=tab_name)
            raise

    def _append_sync(self, sheet_id: str, tab_name: str, row_data: list[Any]) -> None:
        svc = self._get_service()
        svc.spreadsheets().values().append(
            spreadsheetId=sheet_id,
            range=f"{tab_name}!A:Z",
            valueInputOption="USER_ENTERED",
            body={"values": [row_data]},
        ).execute()


sheets_service = SheetsService()
import logging
import gspread
from datetime import datetime
from core.config import settings
from core.sheets import get_sheets_client

logger = logging.getLogger(__name__)

_TAB_MAP = {"hot": "Hot Leads", "warm": "Warm Leads", "cold": "Cold Leads"}
_HEADERS = ["Timestamp","Name","Email","Phone","Issue","Address","Vertical","Appointment"]


class SheetsTool:

    def save_lead_to_sheet(
        self,
        score:    str  = "warm",
        row:      list = None,   # pre-built row from nodes.py (preferred)
        state:    dict = None,   # legacy: build row from state dict
        sheet_id: str  = None,
    ) -> int:
        """
        Append a lead row to the correct tab.
        Accepts either:
          - row=list, score=str, sheet_id=str   (called by nodes.py)
          - state=dict, sheet_id=str             (legacy)
        Returns 1-based row number of appended row, or -1 on failure.
        """
        # Build row from state if pre-built row not provided
        if row is None:
            if state is None:
                logger.error("save_lead_to_sheet: must provide row or state")
                return -1
            score = state.get("score", "warm")
            row = [
                datetime.utcnow().isoformat(),
                state.get("name", ""),
                state.get("email", ""),
                state.get("phone", ""),
                state.get("issue", ""),
                state.get("location") or state.get("city", ""),
                state.get("vertical", ""),
                state.get("appt_confirmed", ""),
            ]

        tab = _TAB_MAP.get(score, "Warm Leads")

        # Dev mock
        if settings.ENVIRONMENT != "prod":
            logger.info(f"[MOCK SHEETS] tab={tab} row={row}")
            return 99

        if not sheet_id:
            logger.error("save_lead_to_sheet: sheet_id not provided")
            return -1

        try:
            gc = get_sheets_client()
            sh = gc.open_by_key(sheet_id)

            try:
                ws = sh.worksheet(tab)
            except gspread.exceptions.WorksheetNotFound:
                ws = sh.add_worksheet(title=tab, rows=1000, cols=20)
                ws.append_row(_HEADERS, value_input_option="USER_ENTERED")
                logger.info(f"created sheet tab: {tab}")

            ws.append_row(row, value_input_option="USER_ENTERED")
            row_num = len(ws.get_all_values())
            logger.info(f"sheet row appended tab={tab} row={row_num}")
            return row_num

        except Exception as exc:
            logger.error(f"sheets write failed: {exc}")
            return -1

    def append_row(self, vertical: str, row: list) -> None:
        """Legacy helper used by base.py capture_lead."""
        id_map = {
            "hvac":         settings.HVAC_SHEET_ID,
            "roofing":      settings.ROOFING_SHEET_ID,
            "plumbing":     settings.PLUMBING_SHEET_ID,
            "pest_control": settings.PEST_SHEET_ID,
        }
        sheet_id = id_map.get(vertical)
        if not sheet_id:
            logger.warning(f"no sheet_id for vertical={vertical}")
            return
        if settings.ENVIRONMENT != "prod":
            logger.info(f"[MOCK SHEETS append_row] vertical={vertical} row={row}")
            return
        try:
            gc = get_sheets_client()
            gc.open_by_key(sheet_id).sheet1.append_row(row, value_input_option="USER_ENTERED")
        except Exception as exc:
            logger.error(f"append_row failed: {exc}")


sheets_tool = SheetsTool()
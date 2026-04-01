# tools/retell_tools.py
# Retell AI post-call data extraction.
# Mirrors the n8n "Extract Call Data" node in pure Python,
# with the extraction bugs from the original fixed.
from __future__ import annotations

import re
from datetime import datetime, timezone
from typing import Optional


def _normalize_phone(raw: str) -> str:
    """Strip formatting, ensure E.164 prefix."""
    if not raw:
        return ""
    digits = re.sub(r"\D", "", raw)
    if len(digits) < 7:
        return ""
    if len(digits) == 10:
        return f"+1{digits}"
    return f"+{digits}"


def _extract_email(text: str) -> str:
    """
    Scan transcript + summary only — NOT the full payload blob.
    Scanning the full JSON blob matches internal Retell/n8n system emails.
    """
    m = re.search(r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}", text)
    return m.group(0).lower() if m else ""


def _extract_name(book_args: dict, transcript: str, summary: str) -> str:
    """Structured args → transcript pattern → summary pattern → fallback."""
    name = (
        book_args.get("name")
        or book_args.get("full_name")
        or book_args.get("patient_name")
        or ""
    )
    if name:
        return name.strip()

    # "My name is John Smith" / "I'm Jane Doe"
    m = re.search(
        r"(?:my name is|i(?:'m| am))\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)",
        transcript,
        re.IGNORECASE,
    )
    if m:
        return m.group(1).strip()

    # "Patient John Smith called" / "caller Jane Doe"
    m2 = re.search(
        r"(?:patient|caller)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)",
        summary,
        re.IGNORECASE,
    )
    return m2.group(1).strip() if m2 else "Unknown Patient"


def _parse_appt_datetime(book_args: dict, transcript: str):
    """
    Return (date_str, time_str) from tool args or transcript.
    Never uses findDeep('date') — too broad, hits created_at/updated_at.
    """
    date_str = (
        book_args.get("date")
        or book_args.get("appointment_date")
        or ""
    )
    time_str = (
        book_args.get("time")
        or book_args.get("appointment_time")
        or ""
    )

    if not date_str and book_args.get("start_time"):
        try:
            dt = datetime.fromisoformat(
                book_args["start_time"].replace("Z", "+00:00")
            )
            date_str = dt.date().isoformat()
            time_str = dt.strftime("%I:%M %p")
        except (ValueError, AttributeError):
            pass

    # Transcript fallback: "March 15" or "03/15"
    if not date_str:
        m = re.search(
            r"\b(January|February|March|April|May|June|July|August|"
            r"September|October|November|December)\s+\d{1,2}",
            transcript,
            re.IGNORECASE,
        )
        if not m:
            m = re.search(r"\b\d{1,2}/\d{1,2}(?:/\d{2,4})?", transcript)
        date_str = m.group(0) if m else ""

    return date_str, time_str


def extract_call_data(payload: dict) -> dict:
    """
    Parse a Retell post-call webhook payload into a flat dict
    suitable for DB persistence and downstream notifications.

    Handles both payload shapes:
      - {"event": "call_analyzed", "call": {...}}
      - {"body": {"event": "call_analyzed", "call": {...}}}
    """
    data = payload.get("call") or payload.get("body", {}).get("call") or payload
    transcript = data.get("transcript") or payload.get("transcript") or ""
    analysis = data.get("call_analysis") or {}
    summary = (
        analysis.get("call_summary")
        or analysis.get("summary")
        or data.get("summary")
        or ""
    )

    # Tool calls — book_appointment is ground truth for appointment status
    tools = (
        analysis.get("tool_calls")
        or data.get("tool_calls")
        or payload.get("tool_calls")
        or []
    )
    book_call = next(
        (t for t in tools if "book_appointment" in (t.get("name") or "").lower()),
        None,
    )
    book_args: dict = {}
    if book_call:
        raw = book_call.get("arguments", {})
        if isinstance(raw, str):
            import json
            try:
                book_args = json.loads(raw)
            except Exception:
                book_args = {}
        else:
            book_args = raw or {}

    # Phone — structured fields only, never full-blob regex
    raw_phone = (
        data.get("user_phone_number")
        or data.get("from_number")
        or data.get("caller_number")
        or book_args.get("phone")
        or book_args.get("patient_phone")
        or ""
    )
    patient_phone = _normalize_phone(raw_phone)

    patient_name = _extract_name(book_args, transcript, summary)

    # Email from transcript + summary only
    patient_email = _extract_email(transcript + " " + summary)

    appt_date, appt_time = _parse_appt_datetime(book_args, transcript)

    # Duration
    start_ts = data.get("start_timestamp")
    end_ts   = data.get("end_timestamp")
    duration_sec: Optional[int] = None
    if start_ts and end_ts:
        try:
            duration_sec = int((int(end_ts) - int(start_ts)) / 1000)
        except (TypeError, ValueError):
            pass

    return {
        "call_id":           data.get("call_id") or payload.get("call_id") or "unknown",
        "transcript":        transcript,
        "summary":           summary,
        "recording_url":     data.get("recording_url") or "",
        "patient_phone":     patient_phone,
        "patient_name":      patient_name,
        "patient_email":     patient_email,
        "appointment_booked": bool(book_call),
        "appointment_date":  appt_date,
        "appointment_time":  appt_time,
        "duration_sec":      duration_sec,
        "disconnect_reason": data.get("disconnection_reason") or "unknown",
        "event_type":        (
            payload.get("event")
            or payload.get("body", {}).get("event")
            or data.get("event_type")
            or "call_analyzed"
        ),
    }
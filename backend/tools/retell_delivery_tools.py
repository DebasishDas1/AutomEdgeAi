# tools/retell_delivery_tools.py
# Post-call delivery pipeline for Retell AI voice calls.
#
# Booking path:    DB call_log → DB appointment → email patient + email/WA clinic
# No-booking path: DB call_log → DB missed_call → email clinic + follow-up patient
from __future__ import annotations

import asyncio
import structlog
from core.config import settings

logger = structlog.get_logger(__name__)


# ── Email HTML bodies ─────────────────────────────────────────────────────────

def _patient_confirmation_html(d: dict) -> str:
    import html as h
    name  = h.escape(d.get("patient_name") or "")
    date  = h.escape(d.get("appointment_date") or "—")
    time_ = h.escape(d.get("appointment_time") or "—")
    return f"""
<div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px;">
  <h2 style="color:#0D1B2A;">Appointment Confirmed!</h2>
  <p>Hi {name},</p>
  <p>Your appointment at <strong>Mainak Chiropractic</strong> is confirmed.</p>
  <table style="width:100%;border-collapse:collapse;margin:16px 0;">
    <tr><td style="color:#666;padding:6px 0;width:80px;">Date</td>
        <td style="font-weight:500;">{date}</td></tr>
    <tr><td style="color:#666;padding:6px 0;">Time</td>
        <td style="font-weight:500;">{time_}</td></tr>
  </table>
  <p>If you need to reschedule, please call us directly.</p>
  <p>See you soon!<br><strong>Mainak Chiropractic</strong></p>
</div>"""


def _clinic_booking_html(d: dict) -> str:
    import html as h
    s = {k: h.escape(str(d.get(k) or "—")) for k in (
        "patient_name", "patient_phone", "patient_email",
        "appointment_date", "appointment_time",
        "call_id", "summary", "recording_url",
    )}
    return f"""
<div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px;">
  <h2 style="color:#0D1B2A;">&#128197; New Booking via AI Call</h2>
  <table style="width:100%;border-collapse:collapse;">
    <tr><td style="color:#666;padding:6px 0;width:120px;">Patient</td>
        <td style="font-weight:500;">{s['patient_name']}</td></tr>
    <tr><td style="color:#666;padding:6px 0;">Phone</td><td>{s['patient_phone']}</td></tr>
    <tr><td style="color:#666;padding:6px 0;">Email</td><td>{s['patient_email']}</td></tr>
    <tr><td style="color:#666;padding:6px 0;">Date</td>
        <td style="font-weight:500;">{s['appointment_date']}</td></tr>
    <tr><td style="color:#666;padding:6px 0;">Time</td>
        <td style="font-weight:500;">{s['appointment_time']}</td></tr>
  </table>
  <div style="margin:16px 0;padding:12px;background:#f8f8f8;border-radius:6px;font-size:14px;">
    <strong>Summary:</strong> {s['summary']}
  </div>
  <p style="font-size:13px;color:#888;">
    Call ID: {s['call_id']} &nbsp;|&nbsp;
    <a href="{s['recording_url']}">Recording</a>
  </p>
</div>"""


def _clinic_missed_html(d: dict) -> str:
    import html as h
    s = {k: h.escape(str(d.get(k) or "—")) for k in (
        "patient_name", "patient_phone", "patient_email",
        "call_id", "summary", "recording_url", "duration_sec",
    )}
    return f"""
<div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px;">
  <h2 style="color:#E8593C;">&#128222; Missed Booking</h2>
  <p>A call completed without booking an appointment.</p>
  <table style="width:100%;border-collapse:collapse;">
    <tr><td style="color:#666;padding:6px 0;width:120px;">Patient</td>
        <td style="font-weight:500;">{s['patient_name']}</td></tr>
    <tr><td style="color:#666;padding:6px 0;">Phone</td><td>{s['patient_phone']}</td></tr>
    <tr><td style="color:#666;padding:6px 0;">Email</td><td>{s['patient_email']}</td></tr>
    <tr><td style="color:#666;padding:6px 0;">Duration</td><td>{s['duration_sec']}s</td></tr>
  </table>
  <div style="margin:16px 0;padding:12px;background:#f8f8f8;border-radius:6px;font-size:14px;">
    <strong>Summary:</strong> {s['summary']}
  </div>
  <p style="font-size:13px;color:#888;">
    Call ID: {s['call_id']} &nbsp;|&nbsp;
    <a href="{s['recording_url']}">Recording</a>
  </p>
  <p style="color:#E8593C;font-weight:500;">Consider a follow-up call.</p>
</div>"""


def _patient_followup_html(d: dict) -> str:
    import html as h
    name = h.escape(d.get("patient_name") or "")
    return f"""
<div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px;">
  <h2 style="color:#0D1B2A;">We missed you!</h2>
  <p>Hi {name},</p>
  <p>Thank you for reaching out to <strong>Mainak Chiropractic</strong>.</p>
  <p>It looks like we weren't able to schedule your appointment during the call.
     We'd love to help — please call us back or book online at your convenience.</p>
  <p>— Mainak Chiropractic</p>
</div>"""


# ── Email sender ──────────────────────────────────────────────────────────────

async def _send_email(to: str, subject: str, html: str, tag: str) -> bool:
    if not to or "@" not in to:
        logger.warning("retell_email_skip_no_address", tag=tag)
        return False
    if not getattr(settings, "RESEND_API_KEY", None):
        logger.warning("retell_email_skip_no_api_key", tag=tag)
        return False
    try:
        import resend
        resend.api_key = settings.RESEND_API_KEY
        from_addr = getattr(settings, "EMAIL_FROM", "onboarding@resend.dev")
        await asyncio.to_thread(
            resend.Emails.send,
            {
                "from":    f"Mainak Chiropractic <{from_addr}>",
                "to":      [to],
                "subject": subject,
                "html":    html,
            },
        )
        logger.info("retell_email_sent", tag=tag, to=to)
        return True
    except Exception as exc:
        logger.error("retell_email_failed", tag=tag, error=str(exc))
        return False


# ── WhatsApp clinic alert ─────────────────────────────────────────────────────

async def _whatsapp_clinic_alert(d: dict, booked: bool) -> bool:
    team_phone = getattr(settings, "TEAM_WHATSAPP_NUMBER", None)
    if not team_phone:
        logger.warning("retell_wa_skip_no_team_phone")
        return False
    if not getattr(settings, "TWILIO_ACCOUNT_SID", None):
        logger.warning("retell_wa_skip_no_twilio")
        return False

    wa_from = getattr(settings, "TWILIO_WA_FROM", "whatsapp:+14155238886")
    to_num  = team_phone if team_phone.startswith("+") else f"+{team_phone}"

    if booked:
        body = (
            f"\U0001f4c5 *New Booking*\n\n"
            f"*Patient:* {d.get('patient_name')}\n"
            f"*Phone:* {d.get('patient_phone')}\n"
            f"*Date:* {d.get('appointment_date')}\n"
            f"*Time:* {d.get('appointment_time')}\n"
            f"*Call ID:* {d.get('call_id')}"
        )
    else:
        body = (
            f"\U0001f4de *Missed Booking*\n\n"
            f"*Patient:* {d.get('patient_name')}\n"
            f"*Phone:* {d.get('patient_phone')}\n"
            f"*Duration:* {d.get('duration_sec')}s\n"
            f"*Summary:* {d.get('summary') or '—'}\n"
            f"Consider a follow-up call."
        )

    try:
        from twilio.rest import Client
        client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        await asyncio.to_thread(
            client.messages.create,
            from_=wa_from,
            to=f"whatsapp:{to_num}",
            body=body,
        )
        logger.info("retell_wa_sent", booked=booked)
        return True
    except Exception as exc:
        logger.error("retell_wa_failed", error=str(exc))
        return False


# ── DB persistence ────────────────────────────────────────────────────────────

async def _persist_call_log(d: dict) -> str | None:
    """Upsert on retell_call_id — handles Retell webhook retries (no duplicates)."""
    from core.database import get_db_context
    try:
        async with get_db_context() as db:
            from sqlalchemy import text
            result = await db.execute(
                text("""
                    INSERT INTO call_logs (
                        retell_call_id, transcript, summary, recording_url,
                        patient_phone, patient_name, patient_email,
                        appointment_booked, appointment_date, appointment_time,
                        duration_sec, disconnect_reason, event_type
                    ) VALUES (
                        :call_id, :transcript, :summary, :recording_url,
                        :patient_phone, :patient_name, :patient_email,
                        :appointment_booked, :appointment_date, :appointment_time,
                        :duration_sec, :disconnect_reason, :event_type
                    )
                    ON CONFLICT (retell_call_id) DO UPDATE SET
                        transcript         = EXCLUDED.transcript,
                        summary            = EXCLUDED.summary,
                        recording_url      = EXCLUDED.recording_url,
                        appointment_booked = EXCLUDED.appointment_booked,
                        appointment_date   = EXCLUDED.appointment_date,
                        appointment_time   = EXCLUDED.appointment_time,
                        duration_sec       = EXCLUDED.duration_sec,
                        disconnect_reason  = EXCLUDED.disconnect_reason
                    RETURNING id
                """),
                {
                    "call_id":            d["call_id"],
                    "transcript":         d["transcript"],
                    "summary":            d["summary"],
                    "recording_url":      d["recording_url"],
                    "patient_phone":      d["patient_phone"],
                    "patient_name":       d["patient_name"],
                    "patient_email":      d["patient_email"],
                    "appointment_booked": d["appointment_booked"],
                    "appointment_date":   d["appointment_date"],
                    "appointment_time":   d["appointment_time"],
                    "duration_sec":       d["duration_sec"],
                    "disconnect_reason":  d["disconnect_reason"],
                    "event_type":         d["event_type"],
                },
            )
            await db.commit()
            row = result.fetchone()
            call_log_id = str(row[0]) if row else None
            logger.info("retell_call_log_persisted",
                        call_id=d["call_id"], call_log_id=call_log_id)
            return call_log_id
    except Exception as exc:
        logger.error("retell_call_log_failed", call_id=d["call_id"], error=str(exc))
        return None


async def _persist_appointment(d: dict, call_log_id: str | None) -> bool:
    from core.database import get_db_context
    try:
        async with get_db_context() as db:
            from sqlalchemy import text
            await db.execute(
                text("""
                    INSERT INTO appointments (
                        call_log_id, patient_name, patient_phone, patient_email,
                        appointment_date, appointment_time, status
                    ) VALUES (
                        :call_log_id, :patient_name, :patient_phone, :patient_email,
                        :appointment_date, :appointment_time, 'scheduled'
                    )
                """),
                {
                    "call_log_id":      call_log_id,
                    "patient_name":     d["patient_name"],
                    "patient_phone":    d["patient_phone"],
                    "patient_email":    d["patient_email"],
                    "appointment_date": d["appointment_date"],
                    "appointment_time": d["appointment_time"],
                },
            )
            await db.commit()
            logger.info("retell_appointment_persisted", call_id=d["call_id"])
            return True
    except Exception as exc:
        logger.error("retell_appointment_failed", call_id=d["call_id"], error=str(exc))
        return False


async def _persist_missed_call(d: dict, call_log_id: str | None) -> bool:
    from core.database import get_db_context
    try:
        async with get_db_context() as db:
            from sqlalchemy import text
            await db.execute(
                text("""
                    INSERT INTO missed_calls (
                        call_log_id, patient_name, patient_phone,
                        patient_email, summary, follow_up_sent
                    ) VALUES (
                        :call_log_id, :patient_name, :patient_phone,
                        :patient_email, :summary, false
                    )
                """),
                {
                    "call_log_id":   call_log_id,
                    "patient_name":  d["patient_name"],
                    "patient_phone": d["patient_phone"],
                    "patient_email": d["patient_email"],
                    "summary":       d["summary"],
                },
            )
            await db.commit()
            logger.info("retell_missed_call_persisted", call_id=d["call_id"])
            return True
    except Exception as exc:
        logger.error("retell_missed_call_failed", call_id=d["call_id"], error=str(exc))
        return False


# ── Main pipeline ─────────────────────────────────────────────────────────────

async def run_retell_post_call_pipeline(d: dict) -> dict:
    """
    Full post-call delivery. Each step is isolated — failure never blocks the rest.

    Booking path:
      call_log (upsert) → appointment → email patient + email clinic + WA clinic

    No-booking path:
      call_log (upsert) → missed_call → email clinic + email patient follow-up + WA clinic
    """
    log = logger.bind(call_id=d["call_id"], booked=d["appointment_booked"])

    results: dict = {
        "call_log_id":    None,
        "db_call_log":    False,
        "db_appointment": False,
        "db_missed":      False,
        "email_patient":  False,
        "email_clinic":   False,
        "wa_clinic":      False,
    }

    # Step 1: Call log always persisted first
    call_log_id = await _persist_call_log(d)
    results["call_log_id"] = call_log_id
    results["db_call_log"] = call_log_id is not None

    clinic_email = (
        getattr(settings, "RETELL_CLINIC_EMAIL", None)
        or getattr(settings, "TEAM_EMAIL", None)
        or ""
    )

    if d["appointment_booked"]:
        # ── Booking path ──────────────────────────────────────────────────────
        results["db_appointment"] = await _persist_appointment(d, call_log_id)

        ep, ec, wa = await asyncio.gather(
            _send_email(
                to=d["patient_email"],
                subject="Your Appointment is Confirmed — Mainak Chiropractic",
                html=_patient_confirmation_html(d),
                tag="patient_confirmation",
            ),
            _send_email(
                to=clinic_email,
                subject=f"\U0001f4c5 New Booking: {d['patient_name']}",
                html=_clinic_booking_html(d),
                tag="clinic_booking",
            ),
            _whatsapp_clinic_alert(d, booked=True),
            return_exceptions=True,
        )
        results["email_patient"] = ep is True
        results["email_clinic"]  = ec is True
        results["wa_clinic"]     = wa is True

    else:
        # ── No-booking path ───────────────────────────────────────────────────
        results["db_missed"] = await _persist_missed_call(d, call_log_id)

        # Only send patient follow-up if we have their email
        patient_email_task = (
            _send_email(
                to=d["patient_email"],
                subject="We missed you — Mainak Chiropractic",
                html=_patient_followup_html(d),
                tag="patient_followup",
            )
            if d.get("patient_email")
            else asyncio.sleep(0)   # no-op coroutine — replaces deprecated asyncio.coroutine
        )

        ec, ep, wa = await asyncio.gather(
            _send_email(
                to=clinic_email,
                subject=f"\U0001f4de Missed Booking: {d['patient_name']}",
                html=_clinic_missed_html(d),
                tag="clinic_missed",
            ),
            patient_email_task,
            _whatsapp_clinic_alert(d, booked=False),
            return_exceptions=True,
        )
        results["email_clinic"]  = ec is True
        results["email_patient"] = ep is True
        results["wa_clinic"]     = wa is True

    log.info("retell_pipeline_complete", **results)
    return results
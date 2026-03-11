import logging
import resend
from core.config import settings

logger = logging.getLogger(__name__)


class EmailTool:

    def send_email(
        self,
        to:        str,
        subject:   str,
        html:      str,               # nodes.py passes html= (not html_body)
        from_name: str = "automedge", # nodes.py passes from_name=
    ) -> dict:

        if settings.ENVIRONMENT != "prod":
            logger.info(f"[MOCK EMAIL] to={to} subject={subject}")
            return {"id": "mock_email", "status": "sent"}

        if not settings.RESEND_API_KEY:
            logger.warning("RESEND_API_KEY not set")
            return {"status": "error", "error": "missing api key"}

        try:
            resend.api_key = settings.RESEND_API_KEY

            from_addr = getattr(settings, "EMAIL_FROM", "onboarding@resend.dev")
            sender    = f"{from_name} <{from_addr}>"

            response = resend.Emails.send({
                "from":    "onboarding@resend.dev",
                "to":      [to],
                "subject": subject,
                "html":    html,
            })
            logger.info(f"email sent id={response['id']} to={to}")
            return {"id": response["id"], "status": "sent"}

        except Exception as exc:
            logger.error(f"email failed to={to}: {exc}")
            return {"id": None, "status": "error", "error": str(exc)}


email_tool = EmailTool()
"""Email sending: SMTP delivery, template rendering, and event dispatch.

Templates use simple ``{{ variable }}`` placeholders. Sending happens through the
SMTP settings configured in the admin (stored in the ``email_settings`` table).
"""
from __future__ import annotations

import re
import smtplib
from email.message import EmailMessage
from html import escape

from sqlalchemy import select
from sqlalchemy.orm import Session

from .database import SessionLocal
from .models import EmailSettings, EmailTemplate

# Known events that can trigger an email. `recipient` documents who receives it;
# `variables` lists the placeholders available to that template.
EVENTS: dict[str, dict] = {
    "registration": {
        "name": "Registration confirmation (to applicant)",
        "recipient": "applicant",
        "variables": ["name", "email", "phone", "course", "message"],
    },
    "admin_new_application": {
        "name": "New application notification (to admin)",
        "recipient": "admin",
        "variables": ["name", "email", "phone", "course", "message"],
    },
    "contact_confirmation": {
        "name": "Contact confirmation (to sender)",
        "recipient": "sender",
        "variables": ["name", "email", "subject", "message"],
    },
    "admin_new_message": {
        "name": "New contact message notification (to admin)",
        "recipient": "admin",
        "variables": ["name", "email", "subject", "message"],
    },
}

_PLACEHOLDER = re.compile(r"\{\{\s*(\w+)\s*\}\}")


def render(text: str, context: dict[str, str]) -> str:
    """Replace ``{{ var }}`` placeholders with values from `context`."""
    def repl(match: re.Match) -> str:
        return str(context.get(match.group(1), ""))

    return _PLACEHOLDER.sub(repl, text or "")


def get_email_settings(db: Session) -> EmailSettings:
    """Return the singleton settings row, creating it if missing."""
    settings = db.get(EmailSettings, 1)
    if settings is None:
        settings = EmailSettings(id=1)
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings


def _looks_like_html(body: str) -> bool:
    return "<" in body and ">" in body


def send_raw(settings: EmailSettings, to: str, subject: str, body: str) -> None:
    """Send one email via SMTP. Raises on failure."""
    msg = EmailMessage()
    msg["Subject"] = subject
    from_addr = settings.from_email or settings.username
    msg["From"] = f"{settings.from_name} <{from_addr}>" if settings.from_name else from_addr
    msg["To"] = to

    if _looks_like_html(body):
        # Plain-text fallback derived by stripping tags.
        plain = re.sub(r"<[^>]+>", "", body)
        msg.set_content(plain)
        msg.add_alternative(body, subtype="html")
    else:
        msg.set_content(body)
        msg.add_alternative(
            f"<div style=\"font-family:sans-serif;white-space:pre-wrap\">{escape(body)}</div>",
            subtype="html",
        )

    if settings.smtp_port == 465:
        with smtplib.SMTP_SSL(settings.smtp_host, settings.smtp_port, timeout=20) as server:
            server.login(settings.username, settings.password)
            server.send_message(msg)
    else:
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=20) as server:
            if settings.use_tls:
                server.starttls()
            if settings.username:
                server.login(settings.username, settings.password)
            server.send_message(msg)


def send_event_email(event_key: str, context: dict[str, str], to_email: str | None) -> bool:
    """Render and send the template for `event_key`. Safe to call in the background.

    Returns True if an email was sent, False otherwise (disabled, no template,
    missing recipient, or a delivery error — errors are swallowed and logged).
    """
    db = SessionLocal()
    try:
        settings = get_email_settings(db)
        if not settings.enabled or not settings.smtp_host:
            return False

        recipient = to_email
        if EVENTS.get(event_key, {}).get("recipient") == "admin":
            recipient = settings.admin_email or settings.from_email
        if not recipient:
            return False

        template = db.scalar(
            select(EmailTemplate).where(EmailTemplate.key == event_key)
        )
        if template is None or not template.is_active:
            return False

        subject = render(template.subject, context)
        body = render(template.body, context)
        send_raw(settings, recipient, subject, body)
        return True
    except Exception as exc:  # noqa: BLE001 — never let email break the request
        print(f"[email] Failed to send '{event_key}' to {to_email}: {exc}")
        return False
    finally:
        db.close()

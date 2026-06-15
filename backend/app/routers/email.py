"""Email administration: SMTP settings, templates, and test sends (admin only)."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import get_current_admin
from ..email_service import EVENTS, get_email_settings, send_raw
from ..models import EmailTemplate
from ..schemas import (
    EmailEventInfo,
    EmailSettingsOut,
    EmailSettingsUpdate,
    EmailTemplateOut,
    EmailTemplateUpdate,
    MessageResponse,
    TestEmailRequest,
)

router = APIRouter(
    prefix="/api/email",
    tags=["email"],
    dependencies=[Depends(get_current_admin)],  # entire module is admin-only
)


def _to_out(settings) -> EmailSettingsOut:
    return EmailSettingsOut(
        enabled=settings.enabled,
        smtp_host=settings.smtp_host,
        smtp_port=settings.smtp_port,
        use_tls=settings.use_tls,
        username=settings.username,
        from_email=settings.from_email,
        from_name=settings.from_name,
        admin_email=settings.admin_email,
        has_password=bool(settings.password),
    )


# ----- Settings -----
@router.get("/settings", response_model=EmailSettingsOut)
def get_settings(db: Session = Depends(get_db)) -> EmailSettingsOut:
    return _to_out(get_email_settings(db))


@router.put("/settings", response_model=EmailSettingsOut)
def update_settings(
    payload: EmailSettingsUpdate, db: Session = Depends(get_db)
) -> EmailSettingsOut:
    settings = get_email_settings(db)
    data = payload.model_dump(exclude_unset=True)
    # Only overwrite the password when a non-empty value is provided.
    password = data.pop("password", None)
    if password:
        settings.password = password
    for field, value in data.items():
        setattr(settings, field, value)
    db.commit()
    db.refresh(settings)
    return _to_out(settings)


# ----- Events (read-only metadata) -----
@router.get("/events", response_model=list[EmailEventInfo])
def list_events() -> list[EmailEventInfo]:
    return [
        EmailEventInfo(key=k, name=v["name"], recipient=v["recipient"], variables=v["variables"])
        for k, v in EVENTS.items()
    ]


# ----- Templates -----
@router.get("/templates", response_model=list[EmailTemplateOut])
def list_templates(db: Session = Depends(get_db)) -> list[EmailTemplate]:
    return list(db.scalars(select(EmailTemplate).order_by(EmailTemplate.id)))


@router.put("/templates/{key}", response_model=EmailTemplateOut)
def update_template(
    key: str, payload: EmailTemplateUpdate, db: Session = Depends(get_db)
) -> EmailTemplate:
    template = db.scalar(select(EmailTemplate).where(EmailTemplate.key == key))
    if template is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Template not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(template, field, value)
    db.commit()
    db.refresh(template)
    return template


# ----- Test send -----
@router.post("/test", response_model=MessageResponse)
def send_test(payload: TestEmailRequest, db: Session = Depends(get_db)) -> MessageResponse:
    settings = get_email_settings(db)
    if not settings.smtp_host:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "SMTP host is not configured")
    try:
        send_raw(
            settings,
            str(payload.to),
            "Test email — Abuladze Academy",
            "This is a test email from your Abuladze Academy admin. "
            "If you received it, your SMTP settings work. ✅",
        )
    except Exception as exc:  # noqa: BLE001 — surface the SMTP error to the admin
        raise HTTPException(
            status.HTTP_502_BAD_GATEWAY, f"Failed to send: {exc}"
        ) from exc
    return MessageResponse(detail=f"Test email sent to {payload.to}")

"""Contact-form endpoints — public create, admin manage."""
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import get_current_admin
from ..email_service import send_event_email
from ..models import ContactMessage
from ..schemas import ContactCreate, ContactOut

router = APIRouter(prefix="/api/contact", tags=["contact"])


@router.post("", response_model=ContactOut, status_code=status.HTTP_201_CREATED)
def create_message(
    payload: ContactCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
) -> ContactMessage:
    """Public: submit a contact message."""
    message = ContactMessage(**payload.model_dump())
    db.add(message)
    db.commit()
    db.refresh(message)

    context = {
        "name": message.name,
        "email": message.email,
        "subject": message.subject,
        "message": message.message,
    }
    background_tasks.add_task(send_event_email, "contact_confirmation", context, message.email)
    background_tasks.add_task(send_event_email, "admin_new_message", context, None)
    return message


@router.get("", response_model=list[ContactOut], dependencies=[Depends(get_current_admin)])
def list_messages(db: Session = Depends(get_db)) -> list[ContactMessage]:
    """Admin: list contact messages, newest first."""
    return list(db.scalars(select(ContactMessage).order_by(ContactMessage.created_at.desc())))


@router.patch(
    "/{message_id}/read", response_model=ContactOut,
    dependencies=[Depends(get_current_admin)],
)
def mark_read(message_id: int, db: Session = Depends(get_db)) -> ContactMessage:
    message = db.get(ContactMessage, message_id)
    if message is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Message not found")
    message.is_read = True
    db.commit()
    db.refresh(message)
    return message


@router.delete(
    "/{message_id}", status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(get_current_admin)],
)
def delete_message(message_id: int, db: Session = Depends(get_db)) -> None:
    message = db.get(ContactMessage, message_id)
    if message is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Message not found")
    db.delete(message)
    db.commit()

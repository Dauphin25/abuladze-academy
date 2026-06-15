"""SQLAlchemy ORM models for Abuladze Academy."""
from datetime import datetime

from sqlalchemy import JSON, Boolean, DateTime, ForeignKey, Integer, Numeric, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


class Admin(Base):
    """Back-office user who can manage site content."""

    __tablename__ = "admins"

    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())


class Professor(Base):
    """An instructor / professor shown on the site."""

    __tablename__ = "professors"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120))
    title: Mapped[str] = mapped_column(String(120), default="")
    bio: Mapped[str] = mapped_column(Text, default="")  # short summary (cards)
    biography: Mapped[str] = mapped_column(Text, default="")  # full bio (detail page)
    photo_url: Mapped[str] = mapped_column(String(500), default="")
    specialties: Mapped[str] = mapped_column(String(300), default="")
    email: Mapped[str] = mapped_column(String(255), default="")
    # books: list[str]; links: list[{"label": str, "url": str}]
    books: Mapped[list] = mapped_column(JSON, default=list)
    links: Mapped[list] = mapped_column(JSON, default=list)
    order: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())


class Course(Base):
    """A program / course offered by the academy."""

    __tablename__ = "courses"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(160))
    summary: Mapped[str] = mapped_column(String(400), default="")
    description: Mapped[str] = mapped_column(Text, default="")
    level: Mapped[str] = mapped_column(String(40), default="დამწყები")
    duration: Mapped[str] = mapped_column(String(60), default="")
    price: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)
    icon: Mapped[str] = mapped_column(String(40), default="code")
    image_url: Mapped[str] = mapped_column(String(500), default="")
    # Rich detail fields
    aim: Mapped[str] = mapped_column(Text, default="")
    target_audience: Mapped[str] = mapped_column(Text, default="")
    prerequisites: Mapped[str] = mapped_column(Text, default="")
    what_you_learn: Mapped[list] = mapped_column(JSON, default=list)
    schedule: Mapped[str] = mapped_column(String(200), default="")
    start_date: Mapped[str] = mapped_column(String(80), default="")
    language: Mapped[str] = mapped_column(String(40), default="ქართული")
    format: Mapped[str] = mapped_column(String(40), default="ოფლაინ")
    min_age: Mapped[int | None] = mapped_column(Integer, nullable=True)
    max_age: Mapped[int | None] = mapped_column(Integer, nullable=True)
    max_students: Mapped[int | None] = mapped_column(Integer, nullable=True)
    certificate: Mapped[bool] = mapped_column(Boolean, default=True)
    order: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    students: Mapped[list["Student"]] = relationship(back_populates="course")


class Student(Base):
    """An enrollment / interest application submitted from the site."""

    __tablename__ = "students"

    id: Mapped[int] = mapped_column(primary_key=True)
    full_name: Mapped[str] = mapped_column(String(160))
    email: Mapped[str] = mapped_column(String(255))
    phone: Mapped[str] = mapped_column(String(40), default="")
    message: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[str] = mapped_column(String(20), default="new")  # new | contacted | enrolled
    course_id: Mapped[int | None] = mapped_column(ForeignKey("courses.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    course: Mapped["Course | None"] = relationship(back_populates="students")


class ContactMessage(Base):
    """A general contact-form message."""

    __tablename__ = "contact_messages"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(160))
    email: Mapped[str] = mapped_column(String(255))
    subject: Mapped[str] = mapped_column(String(200), default="")
    message: Mapped[str] = mapped_column(Text)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())


class SiteContent(Base):
    """Editable key/value content blocks (mini CMS), per locale.

    Primary key is (key, locale) so the same content key can hold a Georgian
    ("ka") and an English ("en") value.
    """

    __tablename__ = "site_content"

    key: Mapped[str] = mapped_column(String(80), primary_key=True)
    locale: Mapped[str] = mapped_column(String(5), primary_key=True, default="ka")
    value: Mapped[str] = mapped_column(Text, default="")
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )


class EmailSettings(Base):
    """SMTP configuration for outgoing email. Single row (id=1)."""

    __tablename__ = "email_settings"

    id: Mapped[int] = mapped_column(primary_key=True, default=1)
    enabled: Mapped[bool] = mapped_column(Boolean, default=False)
    smtp_host: Mapped[str] = mapped_column(String(255), default="")
    smtp_port: Mapped[int] = mapped_column(Integer, default=587)
    use_tls: Mapped[bool] = mapped_column(Boolean, default=True)
    username: Mapped[str] = mapped_column(String(255), default="")
    password: Mapped[str] = mapped_column(String(255), default="")  # never exposed via API
    from_email: Mapped[str] = mapped_column(String(255), default="")
    from_name: Mapped[str] = mapped_column(String(120), default="")
    admin_email: Mapped[str] = mapped_column(String(255), default="")  # where admin notifications go
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )


class EmailTemplate(Base):
    """An editable email template tied to an event `key`."""

    __tablename__ = "email_templates"

    id: Mapped[int] = mapped_column(primary_key=True)
    key: Mapped[str] = mapped_column(String(60), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(160), default="")
    subject: Mapped[str] = mapped_column(String(255), default="")
    body: Mapped[str] = mapped_column(Text, default="")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )

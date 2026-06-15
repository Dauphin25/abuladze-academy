"""Pydantic request/response schemas."""
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


# ----- Auth -----
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class LoginRequest(BaseModel):
    username: str
    password: str


class AdminOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    username: str


# ----- Professors / Lecturers -----
class LecturerLink(BaseModel):
    label: str
    url: str


class ProfessorBase(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    title: str = ""
    bio: str = ""
    biography: str = ""
    photo_url: str = ""
    specialties: str = ""
    email: str = ""
    books: list[str] = Field(default_factory=list)
    links: list[LecturerLink] = Field(default_factory=list)
    order: int = 0
    is_active: bool = True


class ProfessorCreate(ProfessorBase):
    pass


class ProfessorUpdate(BaseModel):
    name: str | None = None
    title: str | None = None
    bio: str | None = None
    biography: str | None = None
    photo_url: str | None = None
    specialties: str | None = None
    email: str | None = None
    books: list[str] | None = None
    links: list[LecturerLink] | None = None
    order: int | None = None
    is_active: bool | None = None


class ProfessorOut(ProfessorBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    created_at: datetime


# ----- Courses -----
class CourseBase(BaseModel):
    title: str = Field(min_length=1, max_length=160)
    summary: str = ""
    description: str = ""
    level: str = "დამწყები"
    duration: str = ""
    price: float | None = None
    icon: str = "code"
    image_url: str = ""
    aim: str = ""
    target_audience: str = ""
    prerequisites: str = ""
    what_you_learn: list[str] = Field(default_factory=list)
    schedule: str = ""
    start_date: str = ""
    language: str = "ქართული"
    format: str = "ოფლაინ"
    min_age: int | None = None
    max_age: int | None = None
    max_students: int | None = None
    certificate: bool = True
    order: int = 0
    is_active: bool = True


class CourseCreate(CourseBase):
    pass


class CourseUpdate(BaseModel):
    title: str | None = None
    summary: str | None = None
    description: str | None = None
    level: str | None = None
    duration: str | None = None
    price: float | None = None
    icon: str | None = None
    image_url: str | None = None
    aim: str | None = None
    target_audience: str | None = None
    prerequisites: str | None = None
    what_you_learn: list[str] | None = None
    schedule: str | None = None
    start_date: str | None = None
    language: str | None = None
    format: str | None = None
    min_age: int | None = None
    max_age: int | None = None
    max_students: int | None = None
    certificate: bool | None = None
    order: int | None = None
    is_active: bool | None = None


class CourseOut(CourseBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    created_at: datetime


# ----- Students (enrollment applications) -----
class StudentCreate(BaseModel):
    full_name: str = Field(min_length=1, max_length=160)
    email: EmailStr
    phone: str = ""
    message: str = ""
    course_id: int | None = None


class StudentStatusUpdate(BaseModel):
    status: str = Field(pattern="^(new|contacted|enrolled)$")


class StudentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    full_name: str
    email: str
    phone: str
    message: str
    status: str
    course_id: int | None
    created_at: datetime


# ----- Contact messages -----
class ContactCreate(BaseModel):
    name: str = Field(min_length=1, max_length=160)
    email: EmailStr
    subject: str = ""
    message: str = Field(min_length=1)


class ContactOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    email: str
    subject: str
    message: str
    is_read: bool
    created_at: datetime


# ----- Site content (CMS) -----
class ContentItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    key: str
    locale: str
    value: str


class ContentUpdate(BaseModel):
    value: str


# ----- Email settings -----
class EmailSettingsOut(BaseModel):
    """Settings as returned to the admin — password is never included."""
    model_config = ConfigDict(from_attributes=True)
    enabled: bool
    smtp_host: str
    smtp_port: int
    use_tls: bool
    username: str
    from_email: str
    from_name: str
    admin_email: str
    has_password: bool = False


class EmailSettingsUpdate(BaseModel):
    enabled: bool | None = None
    smtp_host: str | None = None
    smtp_port: int | None = None
    use_tls: bool | None = None
    username: str | None = None
    # Send a non-empty value to set/replace the password; omit or null to keep it.
    password: str | None = None
    from_email: str | None = None
    from_name: str | None = None
    admin_email: str | None = None


# ----- Email templates -----
class EmailTemplateOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    key: str
    name: str
    subject: str
    body: str
    is_active: bool


class EmailTemplateUpdate(BaseModel):
    subject: str | None = None
    body: str | None = None
    is_active: bool | None = None


class EmailEventInfo(BaseModel):
    key: str
    name: str
    recipient: str
    variables: list[str]


class TestEmailRequest(BaseModel):
    to: EmailStr


# ----- Generic -----
class MessageResponse(BaseModel):
    detail: str

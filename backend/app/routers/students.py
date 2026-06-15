"""Student enrollment endpoints — public create, admin manage."""
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import get_current_admin
from ..email_service import send_event_email
from ..models import Course, Student
from ..schemas import StudentCreate, StudentOut, StudentStatusUpdate

router = APIRouter(prefix="/api/students", tags=["students"])


@router.post("", response_model=StudentOut, status_code=status.HTTP_201_CREATED)
def create_student(
    payload: StudentCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
) -> Student:
    """Public: submit an enrollment / interest application."""
    course = None
    if payload.course_id is not None:
        course = db.get(Course, payload.course_id)
        if course is None:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "Selected course does not exist")
    student = Student(**payload.model_dump())
    db.add(student)
    db.commit()
    db.refresh(student)

    # Fire off emails after the response is sent (failures won't affect the user).
    context = {
        "name": student.full_name,
        "email": student.email,
        "phone": student.phone,
        "course": course.title if course else "",
        "message": student.message,
    }
    background_tasks.add_task(send_event_email, "registration", context, student.email)
    background_tasks.add_task(send_event_email, "admin_new_application", context, None)
    return student


@router.get("", response_model=list[StudentOut], dependencies=[Depends(get_current_admin)])
def list_students(
    status_filter: str | None = None,
    db: Session = Depends(get_db),
) -> list[Student]:
    """Admin: list all enrollment applications, newest first."""
    stmt = select(Student).order_by(Student.created_at.desc())
    if status_filter:
        stmt = stmt.where(Student.status == status_filter)
    return list(db.scalars(stmt))


@router.patch(
    "/{student_id}", response_model=StudentOut,
    dependencies=[Depends(get_current_admin)],
)
def update_status(
    student_id: int, payload: StudentStatusUpdate, db: Session = Depends(get_db)
) -> Student:
    student = db.get(Student, student_id)
    if student is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Student not found")
    student.status = payload.status
    db.commit()
    db.refresh(student)
    return student


@router.delete(
    "/{student_id}", status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(get_current_admin)],
)
def delete_student(student_id: int, db: Session = Depends(get_db)) -> None:
    student = db.get(Student, student_id)
    if student is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Student not found")
    db.delete(student)
    db.commit()

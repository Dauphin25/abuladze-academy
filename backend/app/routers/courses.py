"""Course (program) endpoints — public read, admin write."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import get_current_admin
from ..models import Course
from ..schemas import CourseCreate, CourseOut, CourseUpdate

router = APIRouter(prefix="/api/courses", tags=["courses"])


@router.get("", response_model=list[CourseOut])
def list_courses(
    include_inactive: bool = False,
    db: Session = Depends(get_db),
) -> list[Course]:
    stmt = select(Course).order_by(Course.order, Course.id)
    if not include_inactive:
        stmt = stmt.where(Course.is_active.is_(True))
    return list(db.scalars(stmt))


@router.get("/{course_id}", response_model=CourseOut)
def get_course(course_id: int, db: Session = Depends(get_db)) -> Course:
    course = db.get(Course, course_id)
    if course is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Course not found")
    return course


@router.post(
    "", response_model=CourseOut, status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(get_current_admin)],
)
def create_course(payload: CourseCreate, db: Session = Depends(get_db)) -> Course:
    course = Course(**payload.model_dump())
    db.add(course)
    db.commit()
    db.refresh(course)
    return course


@router.put(
    "/{course_id}", response_model=CourseOut,
    dependencies=[Depends(get_current_admin)],
)
def update_course(
    course_id: int, payload: CourseUpdate, db: Session = Depends(get_db)
) -> Course:
    course = db.get(Course, course_id)
    if course is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Course not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(course, field, value)
    db.commit()
    db.refresh(course)
    return course


@router.delete(
    "/{course_id}", status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(get_current_admin)],
)
def delete_course(course_id: int, db: Session = Depends(get_db)) -> None:
    course = db.get(Course, course_id)
    if course is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Course not found")
    db.delete(course)
    db.commit()

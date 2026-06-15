"""Professor (instructor) endpoints — public read, admin write."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import get_current_admin
from ..models import Professor
from ..schemas import ProfessorCreate, ProfessorOut, ProfessorUpdate

router = APIRouter(prefix="/api/professors", tags=["professors"])


@router.get("", response_model=list[ProfessorOut])
def list_professors(
    include_inactive: bool = False,
    db: Session = Depends(get_db),
) -> list[Professor]:
    stmt = select(Professor).order_by(Professor.order, Professor.id)
    if not include_inactive:
        stmt = stmt.where(Professor.is_active.is_(True))
    return list(db.scalars(stmt))


@router.get("/{professor_id}", response_model=ProfessorOut)
def get_professor(professor_id: int, db: Session = Depends(get_db)) -> Professor:
    professor = db.get(Professor, professor_id)
    if professor is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Professor not found")
    return professor


@router.post(
    "", response_model=ProfessorOut, status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(get_current_admin)],
)
def create_professor(payload: ProfessorCreate, db: Session = Depends(get_db)) -> Professor:
    professor = Professor(**payload.model_dump())
    db.add(professor)
    db.commit()
    db.refresh(professor)
    return professor


@router.put(
    "/{professor_id}", response_model=ProfessorOut,
    dependencies=[Depends(get_current_admin)],
)
def update_professor(
    professor_id: int, payload: ProfessorUpdate, db: Session = Depends(get_db)
) -> Professor:
    professor = db.get(Professor, professor_id)
    if professor is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Professor not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(professor, field, value)
    db.commit()
    db.refresh(professor)
    return professor


@router.delete(
    "/{professor_id}", status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(get_current_admin)],
)
def delete_professor(professor_id: int, db: Session = Depends(get_db)) -> None:
    professor = db.get(Professor, professor_id)
    if professor is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Professor not found")
    db.delete(professor)
    db.commit()

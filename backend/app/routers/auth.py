"""Authentication endpoints for the admin back-office."""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import get_current_admin
from ..models import Admin
from ..schemas import AdminOut, Token
from ..security import create_access_token, verify_password

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
) -> Token:
    """Exchange username + password for a JWT access token."""
    admin = db.scalar(select(Admin).where(Admin.username == form_data.username))
    if admin is None or not verify_password(form_data.password, admin.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return Token(access_token=create_access_token(admin.username))


@router.get("/me", response_model=AdminOut)
def me(current_admin: Admin = Depends(get_current_admin)) -> Admin:
    """Return the currently authenticated admin."""
    return current_admin

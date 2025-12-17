from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta

from ..Service import authService, userService

from .. import schemas
from ..database import get_db

router = APIRouter()

@router.post("/register", response_model=schemas.User)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    try:
        db_user = userService.get_user_by_email(db, email=user.email)
        if db_user:
            raise Exception("Email already registered")
        return userService.create_user(db=db, user=user)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/token", response_model=schemas.Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = userService.get_user_by_email(db, email=form_data.username)
    if not user or not authService.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=authService.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = authService.create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=schemas.User)
def read_users_me(current_user: schemas.User = Depends(authService.get_current_user)):
    return current_user

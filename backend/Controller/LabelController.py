from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..Service import authService, labelService
from .. import schemas
from backend.Service import labelService
from ..database import get_db

router = APIRouter()

@router.get("/", response_model=list[schemas.Label])
def read_labels(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(authService.get_current_user)
):
    return labelService.get_labels(db, skip=skip, limit=limit)

@router.get("/with_count", response_model=List[schemas.LabelWithCount])
def read_labels_with_count(
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(authService.get_current_user)
):
    labels_with_counts = labelService.get_labels_with_usage_count(db, user_id=current_user.id)
    return [{"id": label.id, "name": label.name, "color": label.color, "count": count} for label, count in labels_with_counts]

@router.get("/{label_id}", response_model=schemas.Label)
def read_label(
    label_id: int, 
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(authService.get_current_user)
):
    db_label = labelService.get_label(db, label_id=label_id)
    if db_label is None:
        raise HTTPException(status_code=404, detail="Label not found")
    return db_label

@router.put("/{label_id}", response_model=schemas.Label)
def update_label(
    label_id: int, 
    label: schemas.LabelUpdate, 
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(authService.get_current_user)
):
    db_label = labelService.update_label(db, label_id=label_id, label=label)
    if db_label is None:
        raise HTTPException(status_code=404, detail="Label not found")
    return db_label

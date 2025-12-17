from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..Service import authService, labelService
from .. import schemas
from backend.Service import labelService, taskService
from ..database import get_db

router = APIRouter()

@router.get("/labels/", response_model=list[schemas.Label])
def read_labels(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(authService.get_current_user)
):
    return labelService.get_labels(db, skip=skip, limit=limit)

@router.get("/labels/with_count", response_model=List[schemas.LabelWithCount])
def read_labels_with_count(db: Session = Depends(get_db)):
    labels_with_counts = labelService.get_labels_with_usage_count(db)
    return [{"id": label.id, "name": label.name, "color": label.color, "count": count} for label, count in labels_with_counts]

@router.get("/labels/{label_id}", response_model=schemas.Label)
def read_label(
    label_id: int, 
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(authService.get_current_user)
):
    db_label = labelService.get_label(db, label_id=label_id)
    if db_label is None:
        raise HTTPException(status_code=404, detail="Label not found")
    return db_label

@router.put("/labels/{label_id}", response_model=schemas.Label)
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

@router.post("/tasks/{task_id}/add_label", response_model=schemas.Task)
def add_label_to_task_by_name(
    task_id: int,
    task_add_label: schemas.TaskAddLabel,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(authService.get_current_user)
):
    db_task = labelService.add_label_to_task(db, task_id=task_id, label_name=task_add_label.label_name, user_id=current_user.id)
    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return db_task

@router.delete("/tasks/{task_id}/labels/{label_id}", response_model=schemas.Task)
def remove_label_from_task(
    task_id: int,
    label_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(authService.get_current_user)
):
    db_task = labelService.remove_label_from_task(db, task_id=task_id, label_id=label_id, user_id=current_user.id)
    if db_task is None:
        raise HTTPException(status_code=404, detail="Task or Label not found")
    return db_task

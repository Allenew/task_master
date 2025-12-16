from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.Model import models
from ..Service import authService, taskService

from .. import schemas
from ..database import get_db

router = APIRouter()


@router.post("/tasks/", response_model=schemas.Task)
def create_task(
    task: schemas.TaskCreate, 
    db: Session = Depends(get_db), 
    current_user: schemas.User = Depends(authService.get_current_user)
):
    return taskService.create_task(db=db, task=task, user_id=current_user.id)

@router.get("/tasks/", response_model=list[schemas.Task])
def read_tasks(
    skip: int = 0, 
    limit: int = 100, 
    status: models.TaskStatus = None,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(authService.get_current_user)
):
    return taskService.get_tasks(db, user_id=current_user.id, skip=skip, limit=limit, status=status)

@router.get("/tasks/{task_id}", response_model=schemas.Task)
def read_task(
    task_id: int, 
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(authService.get_current_user)
):
    db_task = taskService.get_task(db, task_id=task_id, user_id=current_user.id)
    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return db_task

@router.put("/tasks/{task_id}", response_model=schemas.Task)
def update_task(
    task_id: int, 
    task: schemas.TaskUpdate, 
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(authService.get_current_user)
):
    db_task = taskService.update_task(db, task_id=task_id, task=task, user_id=current_user.id)
    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return db_task

@router.delete("/tasks/{task_id}", response_model=schemas.Task)
def delete_task(
    task_id: int, 
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(authService.get_current_user)
):
    db_task = taskService.delete_task(db, task_id=task_id, user_id=current_user.id)
    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return db_task

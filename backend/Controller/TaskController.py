from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.Model import models
from backend.database import get_db
from ..Service import authService, taskService

from .. import schemas
from backend.Service import labelService, taskService

router = APIRouter()


@router.post("/", response_model=schemas.Task)
def create_task(
    task: schemas.TaskCreate, 
    db: Session = Depends(get_db), 
    current_user: schemas.User = Depends(authService.get_current_user)
):
    return taskService.create_task(db=db, task=task, user_id=current_user.id)

@router.get("/", response_model=list[schemas.Task])
def read_tasks(
    skip: int = 0, 
    limit: int = 100, 
    status: models.TaskStatus = None,
    is_active: bool = True,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(authService.get_current_user)
):
    return taskService.get_tasks(db, user_id=current_user.id, skip=skip, limit=limit, status=status, is_active=is_active)

@router.get("/{task_id}", response_model=schemas.Task)
def read_task(
    task_id: int, 
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(authService.get_current_user)
):
    db_task = taskService.get_task(db, task_id=task_id, user_id=current_user.id)
    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    if not db_task.is_active:
        raise HTTPException(status_code=400, detail="Task is not active")
    return db_task

@router.put("/{task_id}/deactivate", response_model=schemas.Task)
def deactivate_task(
    task_id: int, 
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(authService.get_current_user)
):
    db_task = taskService.deactivate_task(db, task_id=task_id, user_id=current_user.id)
    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return db_task

@router.put("/{task_id}/activate", response_model=schemas.Task)
def activate_task(
    task_id: int, 
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(authService.get_current_user)
):
    db_task = taskService.activate_task(db, task_id=task_id, user_id=current_user.id)
    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return db_task

@router.put("/{task_id}", response_model=schemas.Task)
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

@router.delete("/{task_id}", response_model=schemas.Task)
def delete_task(
    task_id: int, 
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(authService.get_current_user)
):
    db_task = taskService.delete_task(db, task_id=task_id, user_id=current_user.id)
    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return db_task

@router.post("/{task_id}/participants", response_model=schemas.Task)
def add_participant(
    task_id: int,
    participant: schemas.TaskAddParticipant,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(authService.get_current_user)
):
    task, message = taskService.add_participant_to_task(db, task_id, participant.email, current_user.id)
    if not task:
        raise HTTPException(status_code=404, detail=message)
    return task

@router.delete("/{task_id}/participants/{participant_id}", response_model=schemas.Task)
def remove_participant(
    task_id: int,
    participant_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(authService.get_current_user)
):
    task, message = taskService.remove_participant_from_task(db, task_id, participant_id, current_user.id)
    if not task:
        raise HTTPException(status_code=404, detail=message)
    return task

@router.post("/{task_id}/add_label", response_model=schemas.Task)
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

@router.delete("/{task_id}/labels/{label_id}", response_model=schemas.Task)
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

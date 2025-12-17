from sqlalchemy.orm import Session
from backend.Model import models
from .. import schemas
from . import labelService
import random

def get_task(db: Session, task_id: int, user_id: int):
    return db.query(models.Task).filter(models.Task.id == task_id, models.Task.user_id == user_id).first()

def get_tasks(db: Session, user_id: int, skip: int = 0, limit: int = 100, status: models.TaskStatus = None, is_active: bool = True):
    query = db.query(models.Task).filter(models.Task.user_id == user_id)
    if is_active is not None:
        query = query.filter(models.Task.is_active == is_active)
    if status:
        query = query.filter(models.Task.status == status)
    return query.offset(skip).limit(limit).all()

def get_all_tasks(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Task).offset(skip).limit(limit).all()

def create_task(db: Session, task: schemas.TaskCreate, user_id: int):
    task_data = task.model_dump()
    label_names = task_data.pop('labels', [])
    
    db_task = models.Task(**task_data, user_id=user_id, is_active=True)
    db.add(db_task)
    db.commit()
    db.refresh(db_task)

    if label_names:
        for label_name in label_names:
            labelService.add_label_to_task(db, task_id=db_task.id, label_name=label_name, user_id=user_id)
    
    db.refresh(db_task)
    return db_task

def update_task(db: Session, task_id: int, task: schemas.TaskUpdate, user_id: int):
    db_task = get_task(db, task_id, user_id)
    if db_task:
        update_data = task.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_task, key, value)
        db.commit()
        db.refresh(db_task)
    return db_task

def delete_task(db: Session, task_id: int, user_id: int):
    db_task = get_task(db, task_id, user_id)
    if db_task:
        db.delete(db_task)
        db.commit()
    return db_task

def deactivate_task(db: Session, task_id: int, user_id: int):
    db_task = get_task(db, task_id, user_id)
    if db_task:
        db_task.is_active = False
        db.commit()
        db.refresh(db_task)
    return db_task

def activate_task(db: Session, task_id: int, user_id: int):
    db_task = get_task(db, task_id, user_id)
    if db_task:
        db_task.is_active = True
        db.commit()
        db.refresh(db_task)
    return db_task
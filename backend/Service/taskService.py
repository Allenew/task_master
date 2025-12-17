from sqlalchemy.orm import Session
from sqlalchemy import or_
from backend.Model import models
from .. import schemas
from . import labelService, userService

def get_task(db: Session, task_id: int, user_id: int):
    return db.query(models.Task).outerjoin(models.task_participants).filter(
        models.Task.id == task_id,
        or_(
            models.Task.user_id == user_id,
            models.task_participants.c.user_id == user_id
        )
    ).first()

def get_tasks(db: Session, user_id: int, skip: int = 0, limit: int = 100, status: models.TaskStatus = None, is_active: bool = True):
    query = db.query(models.Task).outerjoin(models.task_participants).filter(
        or_(
            models.Task.user_id == user_id,
            models.task_participants.c.user_id == user_id
        )
    ).distinct()
    
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
    
    # Enforce progress logic based on status
    if task_data.get('status') == 'TODO':
        task_data['progress'] = 0
    elif task_data.get('status') == 'DONE':
        task_data['progress'] = 100
    elif task_data.get('status') == 'DOING':
        p = task_data.get('progress', 0)
        task_data['progress'] = max(0, min(100, p))
    
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
        
        status = update_data.get('status')
        progress = update_data.get('progress')
        
        if status is not None:
            if status == 'TODO':
                update_data['progress'] = 0
            elif status == 'DONE':
                update_data['progress'] = 100
            elif status == 'DOING':
                # If progress also updated, use it. Else use current.
                p = progress if progress is not None else db_task.progress
                update_data['progress'] = max(0, min(100, p))
        
        elif progress is not None:
            # Status not updated, but progress is.
            if progress == 0:
                update_data['status'] = 'TODO'
            elif progress == 100:
                update_data['status'] = 'DONE'
            else:
                update_data['status'] = 'DOING'

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

def add_participant_to_task(db: Session, task_id: int, participant_email: str, owner_id: int):
    task = get_task(db, task_id, owner_id)
    if not task:
        return None, "Task not found."
    
    if task.user_id != owner_id:
        return None, "Only the task owner can add participants."

    participant = userService.get_user_by_email(db, email=participant_email)
    if not participant:
        return None, "User to be added not found."

    if participant in task.participants or task.owner == participant:
        return None, "User is already a participant or the owner."

    task.participants.append(participant)
    db.commit()
    db.refresh(task)
    return task, "Participant added successfully."

def remove_participant_from_task(db: Session, task_id: int, participant_id: int, owner_id: int):
    task = get_task(db, task_id, owner_id)
    if not task:
        return None, "Task not found."
        
    if task.user_id != owner_id:
        return None, "Only the task owner can remove participants."

    participant = userService.get_user(db, user_id=participant_id)
    if not participant:
        return None, "User to be removed not found."

    if participant not in task.participants:
        return None, "User is not a participant."

    task.participants.remove(participant)
    db.commit()
    db.refresh(task)
    return task, "Participant removed successfully."
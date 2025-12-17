import random
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from backend.Model import models
from .. import schemas

def create_label(db: Session, label: schemas.LabelCreate):
    db_label = models.Label(**label.model_dump())
    db.add(db_label)
    db.commit()
    db.refresh(db_label)
    return db_label

def get_labels(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Label).offset(skip).limit(limit).all()

def get_label(db: Session, label_id: int):
    return db.query(models.Label).filter(models.Label.id == label_id).first()

def update_label(db: Session, label_id: int, label: schemas.LabelUpdate):
    db_label = get_label(db, label_id)
    if db_label:
        update_data = label.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_label, key, value)
        db.commit()
        db.refresh(db_label)
    return db_label

def delete_label(db: Session, label_id: int):
    db_label = get_label(db, label_id)
    if db_label:
        db.delete(db_label)
        db.commit()
    return db_label

def get_label_by_name(db: Session, name: str):
    return db.query(models.Label).filter(models.Label.name == name).first()

def get_labels_with_usage_count(db: Session):
    return db.query(
        models.Label,
        func.count(models.task_labels.c.task_id).label('count')
    ).outerjoin(models.task_labels).group_by(models.Label.id).all()

def add_label_to_task(db: Session, task_id: int, label_name: str, user_id: int):
    task = db.query(models.Task).filter(models.Task.id == task_id, models.Task.user_id == user_id).first()
    if not task:
        return None

    available_light_colors = ["#FFCDD2", "#F8BBD0", "#E1BEE7", "#D1C4E9", "#C5CAE9",
                              "#BBDEFB", "#B3E5FC", "#B2EBF2", "#B2DFDB", "#C8E6C9",
                              "#DCEDC8", "#F0F4C3", "#FFF9C4", "#FFECB3", "#FFE0B2",
                              "#FFCCBC", "#D7CCC8", "#F5F5F5", "#CFD8DC"]
    label = get_label_by_name(db, name=label_name)
    if not label:
        label = models.Label(name=label_name, color=random.choice(available_light_colors))
        db.add(label)
        db.commit()
        db.refresh(label)

    if label not in task.labels:
        task.labels.append(label)
        db.commit()
        db.refresh(task)
        
    return task

def remove_label_from_task(db: Session, task_id: int, label_id: int, user_id: int):
    task = db.query(models.Task).filter(models.Task.id == task_id, models.Task.user_id == user_id).first()
    label = get_label(db, label_id)
    if task and label and label in task.labels:
        task.labels.remove(label)
        db.commit()
        db.refresh(task)
    return task

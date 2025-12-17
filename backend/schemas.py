from pydantic import BaseModel, EmailStr, ConfigDict
from typing import List, Optional
from datetime import datetime
from enum import Enum

class TaskStatus(str, Enum):
    TODO = "TODO"
    DOING = "DOING"
    DONE = "DONE"

class UserBase(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    # tasks: List[Task] = [] # Avoid circular dependency

    class Config:
        orm_mode = True

class UserInDB(User):
    hashed_password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: TaskStatus = TaskStatus.TODO
    due_date: Optional[datetime] = None

class TaskCreate(TaskBase):
    labels: Optional[List[str]] = []

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[TaskStatus] = None
    due_date: Optional[datetime] = None

class LabelBase(BaseModel):
    name: str
    color: Optional[str] = None

class LabelCreate(LabelBase):
    pass

class LabelUpdate(LabelBase):
    pass

class TaskAddLabel(BaseModel):
    label_name: str

class Label(LabelBase):
    id: int

    class Config:
        orm_mode = True

class LabelWithCount(Label):
    count: int

class TaskAddParticipant(BaseModel):
    email: EmailStr

class Task(TaskBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    owner: User
    labels: List[Label] = []
    participants: List[User] = []

    class Config:
        orm_mode = True

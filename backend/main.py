from fastapi import FastAPI

from backend.Controller import TaskController, LabelController, UserController

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# CORS configuration
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(UserController.router, prefix="/users", tags=["users"])

app.include_router(TaskController.router, prefix="/tasks", tags=["tasks"])

app.include_router(LabelController.router, prefix="/labels", tags=["labels"])
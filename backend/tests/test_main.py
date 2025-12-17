from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from ..database import Base, get_db
from ..main import app

# Setup in-memory SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite://"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

def test_register_user():
    response = client.post(
        "/users/register",
        json={
            "email": "test@example.com", 
            "password": "password123",
            "first_name": "Test",
            "last_name": "User"
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test@example.com"
    assert "id" in data

def get_auth_token():
    # Ensure user exists
    client.post(
        "/users/register",
        json={
            "email": "login@example.com", 
            "password": "password123",
            "first_name": "Login",
            "last_name": "User"
        },
    )
    
    response = client.post(
        "/users/token",
        data={"username": "login@example.com", "password": "password123"},
    )
    return response.json()["access_token"]

def test_login_user():
    token = get_auth_token()
    assert token is not None

def create_task_helper():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}
    
    response = client.post(
        "/tasks/",
        json={"title": "Test Task", "description": "Test Description"},
        headers=headers,
    )
    return response.json()["id"], headers

def test_create_task():
    task_id, headers = create_task_helper()
    assert task_id is not None

def test_read_tasks():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}
    
    # Create a task first
    client.post(
        "/tasks/",
        json={"title": "Task 1", "description": "Desc 1"},
        headers=headers,
    )
    
    response = client.get("/tasks/", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1

def test_update_task():
    task_id, headers = create_task_helper()
    
    response = client.put(
        f"/tasks/{task_id}",
        json={"title": "Updated Task", "description": "Updated Desc", "status": "DONE"},
        headers=headers,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Updated Task"
    assert data["status"] == "DONE"

def test_delete_task():
    task_id, headers = create_task_helper()
    
    response = client.delete(f"/tasks/{task_id}", headers=headers)
    assert response.status_code == 200
    
    # Verify it's gone
    response = client.get(f"/tasks/{task_id}", headers=headers)
    assert response.status_code == 404

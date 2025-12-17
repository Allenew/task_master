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

    # Test creating task with labels and progress
    response = client.post(
        "/tasks/",
        json={
            "title": "Task with Labels", 
            "description": "Desc", 
            "progress": 50,
            "labels": ["Urgent", "Work"]
        },
        headers=headers,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["progress"] == 50
    assert len(data["labels"]) == 2
    assert data["labels"][0]["name"] in ["Urgent", "Work"]

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
    
    # Update progress and due date
    response = client.put(
        f"/tasks/{task_id}",
        json={
            "title": "Updated Task", 
            "description": "Updated Desc", 
            "status": "DOING",
            "progress": 75,
            # "due_date": "2023-12-31T23:59:59" # Optional: Add if you want to test date parsing
        },
        headers=headers,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Updated Task"
    assert data["status"] == "DOING"
    assert data["progress"] == 75

def test_add_label_to_task():
    task_id, headers = create_task_helper()
    
    response = client.post(
        f"/tasks/{task_id}/add_label",
        json={"label_name": "New Label"},
        headers=headers,
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data["labels"]) >= 1
    assert any(l["name"] == "New Label" for l in data["labels"])

def test_invite_participant():
    # 1. Create Owner
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}
    
    # 2. Create Task
    response = client.post(
        "/tasks/",
        json={"title": "Shared Task", "description": "For invite"},
        headers=headers,
    )
    task_id = response.json()["id"]

    # 3. Create Another User (Participant)
    client.post(
        "/users/register",
        json={
            "email": "friend@example.com", 
            "password": "password123",
            "first_name": "Friend",
            "last_name": "User"
        },
    )

    # 4. Invite Participant
    response = client.post(
        f"/tasks/{task_id}/participants",
        json={"email": "friend@example.com"},
        headers=headers,
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data["participants"]) == 1
    assert data["participants"][0]["email"] == "friend@example.com"

def test_delete_task():
    task_id, headers = create_task_helper()
    
    response = client.delete(f"/tasks/{task_id}", headers=headers)
    assert response.status_code == 200
    
    # Verify it's gone
    response = client.get(f"/tasks/{task_id}", headers=headers)
    assert response.status_code == 404

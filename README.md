# Task Master

A full-stack TODO List management app with a modern UI and robust backend.

## Tech Stack

- **Backend**: Python, FastAPI, SQLAlchemy, Postgres (or SQLite for dev), Alembic (Migrations), JWT Auth
- **Frontend**: React, Vite, TypeScript, TanStack Query, React Router, Recharts
- **Styling**: CSS Modules / Custom CSS

## Features

- **Authentication**: User registration and login with JWT.
- **Dashboard**: Visual overview of task status using charts.
- **Task Management**: Create, Read, Update, Delete (CRUD) tasks.
- **Filtering**: Filter tasks by status.
- **Responsive UI**: Modern layout with sidebar navigation.

## Setup & Run

### Prerequisites

- Node.js (v16+)
- Python (v3.10+)
- Docker (optional, for Postgres)

### 1. Backend Setup

1.  **Create Virtual Environment**:
    ```bash
    python -m venv .venv
    source .venv/bin/activate  # On Windows: .venv\Scripts\activate
    ```

2.  **Install Dependencies**:
    ```bash
    pip install -r backend/requirements.txt
    ```

3.  **Database Setup**:
    *   **Option A (Docker Postgres)**:
        Ensure Docker Desktop is installed and running.
        ```bash
        docker compose up -d
        # Ensure DATABASE_URL in .env or backend/database.py points to postgres
        ```
    *   **Option B (SQLite)**:
        The app defaults to SQLite if no `DATABASE_URL` is set. No extra step needed. This is the easiest way to get started if you don't have Docker.

4.  **Run Migrations**:
    ```bash
    cd backend
    alembic upgrade head
    ```

5.  **Run Server**:
    ```bash
    uvicorn backend.main:app --reload
    ```
    The API will be available at `http://localhost:8000`.

### 2. Frontend Setup

1.  **Navigate to Frontend**:
    ```bash
    cd frontend
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Run Development Server**:
    ```bash
    npm run dev
    ```
    The app will be available at `http://localhost:5173`.

## Testing

### Backend Tests

```bash
cd backend
pytest
```

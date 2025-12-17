# Task Master

A full-stack TODO List management app with a modern UI and robust backend.

## Tech Stack

- **Backend**: Python, FastAPI, SQLAlchemy, SQLite, Alembic (Migrations), JWT Auth
- **Frontend**: React, Vite, TypeScript, TanStack Query, React Router, Recharts
- **Styling**: CSS Modules (MUI & Lucide React) / Custom CSS

## Features

- **Authentication**: User registration and login with JWT.
- **Dashboard**: Visual overview of task status using charts.
- **Task Management**: Create, Read, Update, Delete (CRUD) tasks.
- **Filtering**: Filter tasks by status.
- **Functions for Task**: 
  - **Progress Tracking**: View and update task progress.
  - **Labels**: Attach custom labels to tasks.
  - **Collaboration**: Invite friends as participants.
  - **Due Dates**: Set task deadlines.
  - **Task Lifecycle**: Deactivate and reactivate tasks.
- **Responsive UI**: Modern layout with sidebar navigation.
- **CI/CD**: Auto-deployed on AWS EC2 via Docker containers using GitHub Actions.


## Setup & Run

### Prerequisites

- Node.js (v20+)
- Python (v3.10+)

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
    *   **SQLite**:
        The app defaults to SQLite if no `DATABASE_URL` is set. No extra step needed. This is the easiest way to get started if you don't have Docker.

4.  **Create your own env file in development stage**:
    Refer to the `.env.example` file to create your own `.env` file.
    ```bash
    cd backend
    cp .env.example .env
    ```
    If you don't have database url, please just comment or delete the DATABASE_URL line in your .env file.

5.  **Run Migrations**:
    ```bash
    cd backend
    alembic upgrade head
    ```

6.  **Run Server**:
    ```bash
    uvicorn backend.main:app --reload
    ```
    or
    ```bash
    python -m backend.main
    ```
    The API will be available at `http://localhost:8000`.

### 2. Frontend Setup

1.  **Navigate to Frontend**:
    Please open a new terminal, and run the command:
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

    Now, open it on browser, you could see the web is running.

## Git Push & Application Deployment

### Pushing Changes to GitHub

1. **Stage and Commit Your Changes**:
    ```bash
    git add .
    git commit -m "Describe your changes"
    ```

2. **Push to Remote Repository**:
    ```bash
    git push origin main
    ```
    Replace `main` with your branch name if different.

### Deployment (CI/CD)

- The application is automatically deployed to AWS EC2 using Docker containers and GitHub Actions.
- On every push to the `main` branch:
    - GitHub Actions build and test the backend and frontend.
    - Docker images are built and pushed.
    - The EC2 instance pulls the latest images and restarts the containers.

**Note:** Ensure your GitHub repository is connected to your AWS EC2 instance and Docker is configured for deployment. For more details, refer to the `.github/workflows` directory.



## Testing

### Backend Tests

```bash
cd backend
pytest
```

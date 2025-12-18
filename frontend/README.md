# Task Master - Frontend

Task Master is a modern, responsive web application designed to help users organize their work and life efficiently. This frontend application provides a seamless user experience for managing tasks, tracking progress, and collaborating with others.

## 🌟 Features

### 1. Welcome & Onboarding
- **Guest Page**: An inviting landing page that showcases the system's value proposition.
- **Authentication**: Secure **Login** and **Register** functionality to protect user data and provide personalized experiences.

### 2. Dashboard & Visualization
- **Data Visualization**: A comprehensive dashboard featuring charts and graphs (powered by Recharts) to visualize task status, completion rates, and productivity trends at a glance.

### 3. Task Management
- **Task List**: A central hub to view all tasks with powerful filtering options to find specific items quickly.
- **Task Details**: Deep dive into individual tasks to see:
  - **Participants**: See who is collaborating on the task.
  - **Progress**: Track completion status with visual indicators.
  - **Labels**: Custom tags for better organization.
- **CRUD Operations**:
  - **Create**: Add new tasks with detailed descriptions, due dates, and priorities.
  - **Edit**: Update task details as requirements change.
  - **Deactivate**: Archive tasks that are no longer active without losing the history.
  - **Delete**: Permanently remove unwanted tasks.

### 4. Collaboration & Organization
- **Participant Invitation**: Invite other users to collaborate on tasks directly from the create/edit forms.
- **Labeling System**: Attach custom labels to tasks for flexible categorization and filtering.

## 🛠 Tech Stack

- **Core**: React, TypeScript, Vite
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router DOM
- **UI Components**: Material UI (MUI), Lucide React (Icons)
- **Data Visualization**: Recharts
- **Forms & Date**: React Hook Form (implied), MUI Date Pickers, Date-fns
- **HTTP Client**: Axios
- **Notifications**: React Hot Toast
- **Testing**: Cypress (Component Testing)

## 🚀 Getting Started

### Prerequisites
- Node.js (v20 or higher recommended)
- npm or yarn

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and visit `http://localhost:5173`

## 🧪 Testing

This project uses **Cypress** for component testing.

- Run tests headlessly:
  ```bash
  npm run test:component
  ```
- Open Cypress interactive runner:
  ```bash
  npm run cy:open
  ```

# Project Roadmap & TODO List

This document outlines planned improvements and features for the Task Master system, focusing on real-world business usage scenarios.

## 1. Frontend & User Experience

### 1.1 Mobile Responsiveness
- [ ] **Mobile Style Compatibility**: Optimize the current UI/UX for mobile devices. The current design is desktop-centric; media queries and responsive layouts need to be implemented to ensure a seamless experience on smartphones and tablets.

### 1.2 Security Enhancements
- [ ] **Bot Protection**: Integrate Cloudflare or similar services to prevent bot traffic and automated attacks.
- [ ] **Two-Factor Authentication (2FA)**: Implement Email OTP (One-Time Password) verification during Login and Registration to ensure email validity and enhance account security.

### 1.3 Notification System
- [ ] **Message Center**: Develop a notification hub to alert users of important events.
    - [ ] **Due Date Reminders**: Notify users when tasks are approaching their deadline.
    - [ ] **Collaboration Invites**: Alert users when they are invited to participate in a task.

### 1.4 User Profile & Settings
- [ ] **Settings Page**: Add configuration options for:
    - [ ] Language preferences.
    - [ ] Timezone settings.
    - [ ] Privacy controls.
- [ ] **Profile Management**: Allow users to:
    - [ ] Change their password.
    - [ ] Update their email address.

### 1.5 Advanced Task Filtering
- [ ] **Expanded Filter Options**: Extend the current status-based filter to include:
    - [ ] Due Date (e.g., Today, This Week, Overdue).
    - [ ] Creation Time.
    - [ ] Labels/Tags.

### 1.6 Granular Task Editing
- [ ] **Field-Specific Editing**: Instead of a full-form edit, allow users to modify specific fields individually (e.g., quick-edit Description, update Progress, change Due Date) for a smoother workflow.

### 1.7 Dashboard Improvements
- [ ] **Calendar View**: Integrate a calendar widget to visualize tasks.
    - [ ] Flag due dates on the calendar.
    - [ ] Show task duration ranges (Start Date to Due Date).

### 1.8 User Groups & Teams
- [ ] **Team Management**: Implement User Groups.
    - [ ] Create and manage teams/groups.
    - [ ] **Group Tasks**: Assign tasks to entire groups.
    - [ ] **Quick Invite**: Easily invite all group members to a task.

### 1.9 Task Comments
- [ ] **Comment System**: Implement a comment section for tasks.
    - [ ] Allow participants to discuss task details.
    - [ ] Store comments in a dedicated table.
    - [ ] Ensure communication history is visible.

### 1.10 Activity Logs
- [ ] **Audit Trail**: Track and store history of task updates.
    - [ ] Log specific changes (e.g., "Progress changed from 45% to 60%").
    - [ ] Record timestamp and user identity for each action.
    - [ ] Display the activity log within the task details view.

### 1.11 Rich Text Support
- [ ] **Rich Text Editor**: Integrate a WYSIWYG editor for task descriptions.
    - [ ] Support formatting (bold, lists, headers) in Add/Edit Task forms.
    - [ ] Render rich text content securely in the task view.

### 1.12 Style Isolation
- [ ] **SCSS Integration**: Adopt SCSS for better style management.
    - [ ] Use nesting to namespace styles (e.g., `.page-container { .header { ... } }`) to prevent CSS conflicts between pages.
    - [ ] Refactor existing CSS files to SCSS modules or namespaced SCSS files.

## 2. Backend Technology & Optimization

### 2.1 Database Architecture
- [ ] **Dedicated Database Container**: Migrate to a separate, dedicated database container (e.g., PostgreSQL) to enhance security, reliability, and data persistence.

### 2.2 Caching Strategy
- [ ] **Redis Integration**: Implement Redis for backend caching.
    - [ ] **Draft Saving**: Cache user input for new tasks (drafts) to prevent data loss.

### 2.3 Kubernetes (K8s)
- [ ] **Orchestration**: Adopt Kubernetes for managing container deployment, scaling, and management across multiple cloud servers.

### 2.4 Scheduled Tasks & Message Queues
- [ ] **Async Processing**: Implement RabbitMQ and Celery for background task processing.
- [ ] **Cron Jobs**: Set up scheduled tasks for:
    - [ ] Daily performance reports.
    - [ ] Due date notifications.
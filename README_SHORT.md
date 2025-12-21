# 🚀 Collaborative Task Manager

A full-stack, real-time collaborative task management application with role-based permissions.

---

## 📦 Tech Stack

**Backend:** Node.js, Express.js, MongoDB, Socket.io, JWT, Zod, bcrypt  
**Frontend:** React 19, TypeScript, Vite, Tailwind CSS, React Query, React Hook Form, Socket.io-client

---

## ✨ Features

### Authentication
- User registration & login with JWT tokens
- Protected routes & auto-logout
- Profile management (name, email)

### Task Management
- **CRUD Operations**: Create, read, update, delete tasks
- **Status**: To-Do, In-Progress, Completed
- **Priority**: Low, Medium, High
- **Due Dates**: Optional with overdue highlighting
- **Multi-User Assignment**: Assign multiple users to tasks

### Dashboard Views
- **My Work**: Tasks assigned to you
- **Delegated**: Tasks you created
- **Urgent**: Overdue tasks with count badge

### Permissions
- **Creator**: Full edit access (all fields)
- **Assignee**: Can only update status
- **Delete**: Creator only

### Real-Time Updates
- Live task creation/updates/deletions
- Task assignment notifications
- Task completion notifications
- Automatic UI refresh via Socket.io

### UI/UX
- Responsive design (Mobile, Tablet, Desktop)
- Skeleton loaders
- Color-coded badges
- Advanced filtering & sorting
- Avatar system for assignees
- Modern, clean interface

---

## 🏗️ Architecture

**Backend:** Layered architecture (Routes → Controllers → Services → Repositories → Database)  
**Frontend:** Component-based with React Query for server state, Context API for auth

**Database:** MongoDB (flexible schema, array support)  
**Authentication:** JWT tokens (stateless, scalable)  
**Real-Time:** Socket.io (automatic reconnection, user targeting)

---

## 📡 Key API Endpoints

**Authentication:**
- `POST /api/users/register` - Register user
- `POST /api/users/login` - Login & get token
- `GET /api/users/profile` - Get profile
- `PATCH /api/users/profile` - Update profile
- `GET /api/users` - Get all users

**Tasks:**
- `POST /api/tasks` - Create task
- `GET /api/tasks/created` - Get created tasks
- `GET /api/tasks/assigned` - Get assigned tasks
- `GET /api/tasks/overdue` - Get overdue tasks
- `PATCH /api/tasks/:id` - Update task
- `PATCH /api/tasks/assign/:taskId` - Assign user
- `DELETE /api/tasks/:taskId` - Delete task

**Headers:** All protected routes require `token: <jwt-token>` header

---

## ⚡ Real-Time Events

- `TASK_CREATED` - Broadcast to all clients
- `TASK_UPDATED` - Broadcast to all clients
- `TASK_FINISHED` - Notify creator only
- `TASK_DELETED` - Broadcast to all clients
- `TASK_ASSIGNED` - Notify assigned user only

---

## 🎯 Design Decisions

**MongoDB:** Flexible schema, native array support, JSON-like structure  
**JWT:** Stateless authentication, scalable, self-contained tokens  
**Service Layer:** Business logic separation, Socket.io integration  
**React Query:** Automatic caching, background updates, cache invalidation  
**Socket.io:** Automatic fallback, reconnection, user targeting

---

## 🔄 Trade-offs

- **localStorage vs Cookies:** Chose localStorage (simpler, no CSRF)
- **MongoDB vs PostgreSQL:** Chose MongoDB (flexible schema, array support)
- **React Query vs Redux:** Chose React Query (built for server state)
- **Socket.io vs WebSockets:** Chose Socket.io (automatic fallback)

---

## 📋 Assumptions

- Users have unique emails
- No email verification required
- No password reset flow
- Tasks are hard-deleted (not soft-deleted)
- All users always connected (no offline mode)
- Modern browser support (ES6+)

---

## 🚀 Quick Start

**Backend:**
```bash
cd backend
npm install
# Create .env with MONGODB_URI and JWT_SECRET
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
# Create .env with VITE_API_URL=http://localhost:3000
npm run dev
```

**Access:** http://localhost:5173

---

## 📊 Project Structure

```
backend/src/
  ├── controllers/    # Request handlers
  ├── services/       # Business logic
  ├── repositories/   # Data access
  ├── models/         # Mongoose schemas
  ├── routes/         # API routes
  └── utils/          # Socket.io utilities

frontend/src/
  ├── pages/          # Route components
  ├── components/     # UI components
  ├── hooks/          # Custom hooks
  ├── contexts/       # Auth context
  └── lib/            # API client, constants
```

---

**For detailed documentation, see [README.md](./README.md)**


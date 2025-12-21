# 🚀 Collaborative Task Manager

A full-stack, real-time collaborative task management application with role-based permissions, built with Node.js/Express backend and React frontend.

---

## 📋 Table of Contents

- [Setup Instructions](#setup-instructions)
- [API Contract Documentation](#api-contract-documentation)
- [Architecture Overview & Design Decisions](#architecture-overview--design-decisions)
- [Socket.io Real-Time Integration](#socketio-real-time-integration)
- [Trade-offs & Assumptions](#trade-offs--assumptions)

---

## 🚀 Setup Instructions

### Prerequisites

- **Node.js** 18+ installed
- **MongoDB** installed and running locally, or MongoDB Atlas account
- **npm** or **yarn** package manager

### Backend Setup

1. **Navigate to backend directory**

   ```bash
   cd backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Create `.env` file** in the `backend/` directory:

   ```env
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/taskmanager
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   ```

4. **Start MongoDB** (if running locally)

   ```bash
   mongod
   ```

5. **Start the backend server**

   ```bash
   # Development mode (with auto-reload)
   npm run dev

   # Production mode
   npm start
   ```

   The backend will run on **http://localhost:3000**

### Frontend Setup

1. **Navigate to frontend directory**

   ```bash
   cd frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Create `.env` file** in the `frontend/` directory:

   ```env
   VITE_API_URL=http://localhost:3000
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

   The frontend will run on **http://localhost:5173**

**Access the application:**

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

---

## 📡 API Contract Documentation

### Base URL

```
http://localhost:3000/api
```

### Authentication Endpoints

#### `POST /api/users/register`

Register a new user.

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**

- **201 Created**
  ```json
  {
    "msg": "User registered successfully"
  }
  ```
- **400 Bad Request** - Validation error or user already exists

**Validation:**

- `name`: 2-30 characters
- `email`: Valid email format
- `password`: Minimum 6 characters

---

#### `POST /api/users/login`

Authenticate user and receive JWT token.

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**

- **200 OK**
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "69485422a818d72ce3853da0",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
  ```
- **401 Unauthorized** - Invalid credentials

---

#### `GET /api/users/profile`

Get current user's profile information.

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

- **200 OK**
  ```json
  {
    "_id": "69485422a818d72ce3853da0",
    "name": "John Doe",
    "email": "john@example.com"
  }
  ```
- **401 Unauthorized** - Invalid or missing token
- **404 Not Found** - User not found

---

#### `PATCH /api/users/profile`

Update current user's profile (name and/or email).

**Headers:**

```
token:<token>
```

**Request Body:**

```json
{
  "name": "John Updated",
  "email": "john.updated@example.com"
}
```

**Response:**

- **200 OK** - Updated user object (password excluded)
- **400 Bad Request** - Validation error or email already exists
- **401 Unauthorized** - Invalid or missing token

---

#### `GET /api/users`

Get list of all users (for task assignment dropdown).

**Headers:**

```
token: <token>
```

**Response:**

- **200 OK**
  ```json
  [
    {
      "_id": "69485422a818d72ce3853da0",
      "name": "John Doe",
      "email": "john@example.com"
    }
  ]
  ```
- **401 Unauthorized** - Invalid or missing token

---

### Task Management Endpoints

#### `POST /api/tasks`

Create a new task.

**Headers:**

```
token:<token>
```

**Request Body:**

```json
{
  "title": "Complete project documentation",
  "description": "Write comprehensive docs for the project",
  "status": "To-Do",
  "priority": "High",
  "dueDate": "2025-12-25"
}
```

**Response:**

- **201 Created** - Created task object
- **400 Bad Request** - Validation error
- **401 Unauthorized** - Invalid or missing token

**Note:** `creatorId` is automatically set from the authenticated user's token.

---

#### `GET /api/tasks/created`

Get all tasks created by the authenticated user.

**Headers:**

```
token:<token>
```

**Query Parameters (Optional):**

- `status`: Filter by status (To-Do, In-Progress, Completed)
- `priority`: Filter by priority (Low, Medium, High)

**Response:**

- **200 OK**
  ```json
  {
    "message": "Created tasks retrieved",
    "tasks": [
      {
        "_id": "...",
        "title": "...",
        "status": "To-Do",
        "priority": "High",
        "creatorId": "...",
        "assignedTo": [...],
        ...
      }
    ]
  }
  ```

---

#### `GET /api/tasks/assigned`

Get all tasks assigned to the authenticated user.

**Headers:**

```
token:<token>
```

**Query Parameters (Optional):**

- `status`: Filter by status
- `priority`: Filter by priority

**Response:**

- **200 OK**
  ```json
  {
    "message": "Assigned tasks retrieved",
    "tasks": [...]
  }
  ```

---

#### `GET /api/tasks/overdue`

Get all overdue and incomplete tasks for the authenticated user.

**Headers:**

```
token:<token>
```

**Response:**

- **200 OK**
  ```json
  {
    "count": 2,
    "tasks": [...]
  }
  ```

**Logic:** Returns tasks where:

- `dueDate < current date`
- `status !== 'Completed'`
- User is either creator or assignee

---

#### `PATCH /api/tasks/:id`

Update a task (status, priority, or due date).

**Headers:**

```
token:<token>
```

**Request Body:**

```json
{
  "status": "In-Progress",
  "priority": "Medium",
  "dueDate": "2025-12-30"
}
```

**Response:**

- **200 OK** - Updated task object
- **400 Bad Request** - Validation error
- **401 Unauthorized** - Invalid or missing token
- **403 Forbidden** - User not authorized to update this task

**Permission Rules:**

- **Creator**: Can update all fields
- **Assignee**: Can only update `status` field
- Backend validates permissions

---

#### `PATCH /api/tasks/assign/:taskId`

Assign or unassign a user to/from a task.

**Headers:**

```
token:<token>
```

**Request Body:**

```json
{
  "targetUserId": "69485422a818d72ce3853da0"
}
```

**Response:**

- **200 OK**
  ```json
  {
    "message": "Task assigned successfully"
  }
  ```
- **400 Bad Request** - Task not found, user not found, or already assigned
- **401 Unauthorized** - Invalid or missing token
- **403 Forbidden** - Only task creator can assign users

**Logic:**

- Only the task creator can assign users
- Prevents duplicate assignments
- Emits `TASK_ASSIGNED` socket event to the assigned user
- Emits `TASK_UPDATED` socket event to all connected clients

---

#### `DELETE /api/tasks/:taskId`

Delete a task.

**Headers:**

```
token:<token>
```

**Response:**

- **200 OK**
  ```json
  {
    "message": "Task deleted successfully"
  }
  ```
- **401 Unauthorized** - Invalid or missing token
- **403 Forbidden** - Only task creator can delete tasks
- **404 Not Found** - Task not found

**Logic:**

- Only the task creator can delete tasks
- Emits `TASK_DELETED` socket event to all connected clients

---

## 🏗️ Architecture Overview & Design Decisions

### Overall Architecture

The application follows a **layered architecture** pattern:

```
Client (React) → API (Express) → Service Layer → Repository Layer → Database (MongoDB)
                      ↓
                  Socket.io (Real-Time)
```

### Backend Architecture

#### 1. **Layered Architecture**

**Routes Layer** (`routes/`)

- Handles HTTP routing
- Applies authentication middleware
- Delegates to controllers

**Controllers Layer** (`controllers/`)

- Request/response handling
- Input validation (Zod schemas)
- Error handling
- Calls service layer

**Services Layer** (`services/`)

- Business logic
- Orchestrates repository calls
- Handles Socket.io events
- Data transformation

**Repository Layer** (`repositories/`)

- Database operations
- Mongoose queries
- Data access abstraction

**Models Layer** (`models/`)

- Mongoose schemas
- Data validation rules
- Relationships

**Why This Architecture?**

- **Separation of Concerns**: Each layer has a single responsibility
- **Testability**: Easy to mock and test each layer independently
- **Maintainability**: Changes in one layer don't affect others
- **Scalability**: Can optimize each layer separately

---

#### 2. **Database Choice: MongoDB**

**Why MongoDB?**

1. **Flexible Schema**

   - Tasks can have optional fields (description, dueDate)
   - Easy to add new fields without migrations
   - Supports nested data structures (assignedTo array)

2. **Document-Based**

   - Tasks are stored as complete documents
   - Natural fit for JavaScript/Node.js (JSON-like)
   - Efficient for read-heavy operations

3. **Array Support**

   - Native support for `assignedTo` array field
   - Easy querying with `$in`, `$elemMatch` operators
   - No need for join tables

4. **Scalability**
   - Horizontal scaling with sharding
   - Good performance for this use case
   - Easy to deploy (MongoDB Atlas)

**Trade-off:**

- No built-in relationships (using references instead of foreign keys)
- Manual referential integrity checks needed

---

#### 3. **JWT Authentication Implementation**

**Why JWT?**

1. **Stateless**

   - No server-side session storage
   - Scalable across multiple servers
   - Works well with microservices

2. **Self-Contained**

   - Token contains user ID
   - No database lookup needed for validation
   - Fast authentication checks

3. **Secure**
   - Signed with secret key
   - Expiration time (24 hours)
   - Can be revoked by changing secret

**Implementation Details:**

**Token Generation** (Login):

```javascript
const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "24h" });
```

**Token Validation** (Middleware):

```javascript
// Backend expects token in 'token' header (not 'Authorization')
const token = req.headers.token;
const decoded = jwt.verify(token, JWT_SECRET);
req.userid = decoded.id;
```

**Frontend Storage:**

- Token stored in `localStorage`
- Automatically attached to all requests via Axios interceptor
- Cleared on 401 errors (auto-logout)

**Security Considerations:**

- Token stored in localStorage (XSS risk mitigated by React escaping)
- HTTPS required in production
- Token expiration prevents indefinite access
- Secret key must be strong and kept secure

---

#### 4. **Service Layer Pattern**

**Why a Service Layer?**

1. **Business Logic Separation**

   - Controllers stay thin (only HTTP concerns)
   - Business rules centralized
   - Easier to test business logic

2. **Reusability**

   - Services can be called from multiple controllers
   - Can be used by background jobs or CLI tools

3. **Transaction Management**

   - Can coordinate multiple repository calls
   - Future: Easy to add database transactions

4. **Socket.io Integration**
   - Services emit socket events after operations
   - Keeps real-time logic in business layer
   - Consistent event emission

**Example Flow:**

```
Controller → Service → Repository → Database
                ↓
            Socket.io Events
```

**Service Responsibilities:**

- Validate business rules
- Check permissions
- Orchestrate data operations
- Emit real-time events
- Handle errors

---

#### 5. **Repository Pattern**

**Why Repository Pattern?**

1. **Database Abstraction**

   - Controllers/services don't know about Mongoose
   - Easy to switch databases
   - Centralized query logic

2. **Testability**

   - Easy to mock repositories
   - Test business logic without database

3. **Query Optimization**

   - All queries in one place
   - Easy to optimize and index

4. **Data Transformation**
   - Consistent data formatting
   - Password exclusion
   - Field selection

---

### Frontend Architecture

#### 1. **Component Structure**

**Pages** (`pages/`)

- Top-level route components
- Dashboard, Login, Register, Profile

**Components** (`components/`)

- Reusable UI components
- TaskCard, TaskModal, TaskFilters
- No business logic

**Hooks** (`hooks/`)

- Custom React hooks
- `useSocket` - Socket.io integration
- `useTasks` - React Query hooks for tasks

**Contexts** (`contexts/`)

- Global state management
- `AuthContext` - Authentication state

**Why This Structure?**

- **Separation**: UI components separate from business logic
- **Reusability**: Components can be reused across pages
- **Testability**: Easy to test components in isolation

---

#### 2. **State Management Strategy**

**Server State: React Query**

- All API data managed by React Query
- Automatic caching (5 min stale time)
- Background refetching
- Optimistic updates

**Client State: React Context + Local State**

- Authentication: Context API
- UI state: Local component state (modals, filters)
- Form state: React Hook Form

**Why React Query?**

- **Automatic Caching**: Reduces API calls
- **Background Updates**: Keeps data fresh
- **Cache Invalidation**: Easy to sync with Socket.io
- **Loading States**: Built-in loading/error states
- **Request Deduplication**: Prevents duplicate requests

---

#### 3. **Form Management: React Hook Form + Zod**

**Why React Hook Form?**

- **Performance**: Minimal re-renders
- **Validation**: Integrates with Zod
- **Type Safety**: Full TypeScript support
- **Developer Experience**: Easy to use API

**Why Zod?**

- **Type Safety**: Schema defines TypeScript types
- **Runtime Validation**: Validates at runtime
- **Error Messages**: Clear, customizable errors
- **Reusability**: Same schema for frontend and backend

---

## ⚡ Socket.io Real-Time Integration

### Architecture

**Backend Setup:**

```javascript
// server.js
const io = require("socket.io")(server);
socketUtil.init(io);

// socket.util.js
const userSockets = new Map(); // userId → socketId mapping

// On connection, map user to socket
io.on("connection", (socket) => {
  const userId = socket.userId; // From auth middleware
  userSockets.set(userId, socket.id);
});
```

**Frontend Setup:**

```typescript
// useSocket.ts
const socket = io(SOCKET_URL, {
  auth: { token },
  transports: ["websocket", "polling"],
});
```

### Event Flow

#### 1. **Task Creation**

```
User creates task → Backend saves → Service emits 'TASK_CREATED' →
All clients receive → React Query invalidates cache → UI updates
```

#### 2. **Task Assignment**

```
Creator assigns user → Backend updates → Service calls notifyUser() →
Only assigned user receives 'TASK_ASSIGNED' → Toast notification shown
```

#### 3. **Task Update**

```
User updates task → Backend saves → Service emits 'TASK_UPDATED' →
All clients receive → React Query invalidates → UI refreshes
```

#### 4. **Task Completion**

```
Assignee marks complete → Backend updates → Service calls notifyUser() →
Only creator receives 'TASK_FINISHED' → Success toast shown
```

#### 5. **Task Deletion**

```
Creator deletes task → Backend removes → Service emits 'TASK_DELETED' →
All clients receive → React Query removes from cache → Task disappears
```

### Implementation Details

**Backend Socket Events:**

1. **Broadcast Events** (to all clients):

   - `TASK_CREATED` - New task created
   - `TASK_UPDATED` - Task modified
   - `TASK_DELETED` - Task removed

2. **Targeted Events** (to specific user):
   - `TASK_ASSIGNED` - User assigned to task
   - `TASK_FINISHED` - Task completed (notify creator)

**Frontend Socket Integration:**

```typescript
// useSocket.ts
socket.on("TASK_CREATED", (task) => {
  queryClient.invalidateQueries({ queryKey: ["tasks"] });
  // Show notification if user is assigned
});

socket.on("TASK_ASSIGNED", (data) => {
  queryClient.invalidateQueries({ queryKey: ["tasks"] });
  toast.success(data.message); // User-specific notification
});
```

**Key Features:**

- **Automatic Reconnection**: Socket.io handles reconnection
- **User Mapping**: Backend maps userId to socketId for targeted events
- **Cache Synchronization**: React Query automatically refreshes on events
- **Error Handling**: Graceful degradation if socket fails

---

## 🤔 Trade-offs & Assumptions

### Trade-offs Made

#### 1. **localStorage vs Cookies for JWT**

**Chosen: localStorage**

- ✅ Simpler implementation
- ✅ No CSRF token needed
- ✅ Works with SPA architecture
- ❌ Vulnerable to XSS (mitigated by React escaping)
- ❌ Not automatically sent (requires interceptor)

**Alternative Considered:** HttpOnly cookies

- More secure against XSS
- Requires CSRF protection
- More complex setup

---

#### 2. **MongoDB vs PostgreSQL**

**Chosen: MongoDB**

- ✅ Flexible schema (tasks have optional fields)
- ✅ Native array support (assignedTo)
- ✅ Easy to scale
- ❌ No built-in relationships
- ❌ Manual referential integrity

**Alternative Considered:** PostgreSQL

- ACID compliance
- Built-in relationships
- More complex for this use case

---

#### 3. **React Query vs Redux**

**Chosen: React Query**

- ✅ Built for server state
- ✅ Automatic caching
- ✅ Less boilerplate
- ✅ Integrates well with Socket.io
- ❌ Not for client state (use Context instead)

**Alternative Considered:** Redux

- More control
- More boilerplate
- Better for complex client state

---

#### 4. **Socket.io vs WebSockets**

**Chosen: Socket.io**

- ✅ Automatic fallback to polling
- ✅ Built-in reconnection
- ✅ Room/namespace support
- ✅ Easier to use
- ❌ Larger bundle size

**Alternative Considered:** Native WebSockets

- Smaller bundle
- More control
- More complex implementation

---

#### 5. **Service Layer vs Direct Repository Calls**

**Chosen: Service Layer**

- ✅ Business logic separation
- ✅ Easier to test
- ✅ Can add transactions later
- ❌ Extra layer of abstraction

**Alternative Considered:** Direct repository calls

- Simpler
- Less separation
- Harder to test

---

### Assumptions Made

#### 1. **User Model Assumptions**

- Users have unique emails
- Passwords are hashed with bcrypt (salt rounds: 5)
- User IDs are MongoDB ObjectIds
- No email verification required
- No password reset flow (can be added later)

#### 2. **Task Model Assumptions**

- Tasks always have a creator (required)
- Tasks can have multiple assignees (array)
- Due dates are optional
- Status enum: ['To-Do', 'In-Progress', 'Completed']
- Priority enum: ['Low', 'Medium', 'High']
- Tasks are soft-deleted (actually removed from DB)

#### 3. **Permission Assumptions**

- Only creators can delete tasks
- Assignees can only update status
- Backend validates all permissions (not just frontend)
- No role-based access control (RBAC) - simple creator/assignee model

#### 4. **Real-Time Assumptions**

- All users are always connected (no offline mode)
- Socket events are fire-and-forget (no acknowledgment)
- Events are eventually consistent
- No event ordering guarantees

#### 5. **Frontend Assumptions**

- Modern browser support (ES6+)
- JavaScript enabled
- No IE11 support
- Responsive design for mobile/tablet/desktop
- Users have stable internet connection

#### 6. **API Assumptions**

- Backend runs on port 3000
- Frontend runs on port 5173
- CORS enabled for localhost
- API uses JSON for all requests/responses
- Error responses follow consistent format

#### 7. **Security Assumptions**

- HTTPS in production (not enforced in code)
- JWT secret is strong and kept secure
- MongoDB is not exposed publicly
- Input validation on both frontend and backend
- No SQL injection (using Mongoose)

---

### Future Enhancements (Not Implemented)

1. **Email Verification**

   - Currently no email verification
   - Can be added with nodemailer

2. **Password Reset**

   - No forgot password flow
   - Can be added with token-based reset

3. **File Attachments**

   - Tasks don't support file uploads
   - Can be added with multer + cloud storage

4. **Task Comments**

   - No commenting system
   - Can be added as sub-documents

5. **Task History/Audit Log**

   - No change tracking
   - Can be added with versioning

6. **Advanced Permissions**

   - No RBAC system
   - Currently simple creator/assignee model

7. **Offline Support**

   - No offline mode
   - Can be added with service workers

8. **Pagination**
   - All tasks loaded at once
   - Can be added for large datasets

---

## 📝 Code Quality

### Backend

- ✅ Consistent error handling
- ✅ Input validation with Zod
- ✅ Separation of concerns
- ✅ Error messages are user-friendly
- ✅ No hardcoded values (uses environment variables)

### Frontend

- ✅ TypeScript for type safety
- ✅ Component composition
- ✅ Custom hooks for reusability
- ✅ Consistent naming conventions
- ✅ Responsive design
- ✅ Accessibility considerations

---

## 📚 Technology Choices Summary

| Technology          | Purpose           | Why Chosen                                  |
| ------------------- | ----------------- | ------------------------------------------- |
| **MongoDB**         | Database          | Flexible schema, array support, JSON-like   |
| **Express.js**      | Backend Framework | Simple, flexible, large ecosystem           |
| **JWT**             | Authentication    | Stateless, scalable, self-contained         |
| **Socket.io**       | Real-Time         | Automatic fallback, reconnection, easy API  |
| **React Query**     | State Management  | Built for server state, automatic caching   |
| **React Hook Form** | Forms             | Performance, validation, TypeScript         |
| **Zod**             | Validation        | Type safety, runtime validation, reusable   |
| **Tailwind CSS**    | Styling           | Utility-first, responsive, fast development |
| **TypeScript**      | Type Safety       | Catch errors early, better DX               |

---

## 🚢 Deployment Checklist

### Backend

- [ ] Set production MongoDB URI
- [ ] Set strong JWT_SECRET
- [ ] Enable HTTPS
- [ ] Configure CORS for production domain
- [ ] Set up process manager (PM2)
- [ ] Configure reverse proxy (Nginx)
- [ ] Set up logging
- [ ] Enable rate limiting

### Frontend

- [ ] Set production API URL in .env
- [ ] Build production bundle
- [ ] Deploy to hosting service
- [ ] Enable HTTPS
- [ ] Configure CDN
- [ ] Set up error tracking (Sentry)
- [ ] Configure analytics

---

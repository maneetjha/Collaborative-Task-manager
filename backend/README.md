# 🔧 Backend API - Collaborative Task Manager

Node.js/Express backend with MongoDB, Socket.io real-time updates, and JWT authentication.

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

### Installation

```bash
# Install dependencies
npm install

# Create .env file
PORT=3000
MONGODB_URI=mongodb://localhost:27017/taskmanager
JWT_SECRET=your-super-secret-jwt-key

# Start development server
npm run dev

# Start production server
npm start
```

Server runs on **http://localhost:3000**

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── app.js              # Express app configuration
│   ├── server.js           # Server entry point
│   ├── config/             # Configuration files
│   ├── controllers/       # Request handlers
│   │   ├── task.controller.js
│   │   └── user.controller.js
│   ├── middleware/         # Custom middleware
│   │   └── authentication.js
│   ├── models/             # Mongoose models
│   │   ├── task.model.js
│   │   └── user.model.js
│   ├── repositories/       # Data access layer
│   │   ├── task.repository.js
│   │   └── user.repository.js
│   ├── routes/             # API routes
│   │   ├── task.routes.js
│   │   └── user.routes.js
│   ├── services/           # Business logic
│   │   ├── task.service.js
│   │   └── user.service.js
│   └── utils/              # Utilities
│       └── socket.util.js
├── tests/                  # Test files
├── package.json
└── .env
```

---

## 🏗️ Architecture

### Layered Architecture

```
HTTP Request
    ↓
Routes (routing, middleware)
    ↓
Controllers (validation, error handling)
    ↓
Services (business logic, Socket.io)
    ↓
Repositories (database operations)
    ↓
MongoDB
```

### Layer Responsibilities

**Routes** (`routes/`)

- Define API endpoints
- Apply authentication middleware
- Route requests to controllers

**Controllers** (`controllers/`)

- Handle HTTP requests/responses
- Input validation with Zod
- Error handling
- Call service layer

**Services** (`services/`)

- Business logic
- Permission checks
- Orchestrate repository calls
- Emit Socket.io events

**Repositories** (`repositories/`)

- Database operations
- Mongoose queries
- Data transformation
- Query optimization

**Models** (`models/`)

- Mongoose schemas
- Data validation
- Relationships

---

## 📡 API Endpoints

### Authentication Routes (`/api/users`)

| Method | Endpoint    | Auth | Description              |
| ------ | ----------- | ---- | ------------------------ |
| POST   | `/register` | No   | Register new user        |
| POST   | `/login`    | No   | Login and get JWT token  |
| GET    | `/profile`  | Yes  | Get current user profile |
| PATCH  | `/profile`  | Yes  | Update user profile      |
| GET    | `/`         | Yes  | Get all users            |

### Task Routes (`/api/tasks`)

| Method | Endpoint          | Auth | Description                |
| ------ | ----------------- | ---- | -------------------------- |
| POST   | `/`               | Yes  | Create new task            |
| GET    | `/created`        | Yes  | Get tasks created by user  |
| GET    | `/assigned`       | Yes  | Get tasks assigned to user |
| GET    | `/overdue`        | Yes  | Get overdue tasks          |
| PATCH  | `/:id`            | Yes  | Update task                |
| PATCH  | `/assign/:taskId` | Yes  | Assign user to task        |
| DELETE | `/:taskId`        | Yes  | Delete task                |

**All protected routes require:** `token: <jwt-token>` header

---

## 🔐 Authentication

### JWT Implementation

**Token Generation:**

```javascript
const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "24h" });
```

**Token Validation (Middleware):**

```javascript
// Expects token in 'token' header (not Authorization)
const token = req.headers.token;
const decoded = jwt.verify(token, JWT_SECRET);
req.userid = decoded.id;
```

**Security:**

- Tokens expire after 24 hours
- Secret key stored in environment variables
- Password hashing with bcrypt (5 salt rounds)

---

## 💾 Database Schema

### User Model

```javascript
{
  _id: ObjectId,
  name: String (required, 2-30 chars),
  email: String (required, unique, validated),
  password: String (required, hashed),
  createdAt: Date,
  updatedAt: Date
}
```

### Task Model

```javascript
{
  _id: ObjectId,
  title: String (required),
  description: String (optional),
  status: Enum ['To-Do', 'In-Progress', 'Completed'],
  priority: Enum ['Low', 'Medium', 'High'],
  dueDate: Date (optional),
  creatorId: ObjectId (ref: User, required),
  assignedTo: [ObjectId] (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

---

## ⚡ Socket.io Integration

### Setup

```javascript
// server.js
const io = require("socket.io")(server);
socketUtil.init(io);

// socket.util.js
const userSockets = new Map(); // Maps userId → socketId
```

### Events Emitted

**Broadcast Events** (to all clients):

- `TASK_CREATED` - New task created
- `TASK_UPDATED` - Task modified
- `TASK_DELETED` - Task removed

**Targeted Events** (to specific user):

- `TASK_ASSIGNED` - User assigned to task
- `TASK_FINISHED` - Task completed (notify creator)

### Event Flow

```javascript
// In service layer
broadcastUpdate("TASK_CREATED", newTask); // All clients
notifyUser(userId, "TASK_ASSIGNED", data); // Specific user
```

---

## 🔒 Permission System

### Task Permissions

**Creator:**

- ✅ Create, read, update, delete tasks
- ✅ Assign/unassign users
- ✅ Update all fields

**Assignee:**

- ✅ Read assigned tasks
- ✅ Update status only
- ❌ Cannot edit title, description, priority, due date
- ❌ Cannot delete tasks
- ❌ Cannot assign users

**Implementation:**

- Frontend: Disables fields based on role
- Backend: Validates permissions in service layer

---

## 📝 Validation

### Zod Schemas

**User Registration:**

```javascript
{
  name: z.string().min(2).max(30),
  email: z.string().email(),
  password: z.string().min(6)
}
```

**Profile Update:**

```javascript
{
  name: z.string().min(2).max(30).optional(),
  email: z.string().email().optional()
}
```

**Task Creation:**

- Title: Required
- Status: Enum ['To-Do', 'In-Progress', 'Completed']
- Priority: Enum ['Low', 'Medium', 'High']
- Due Date: Optional, Date type

---

## 🛠️ Service Layer Pattern

### Why Service Layer?

1. **Business Logic Separation**

   - Controllers stay thin
   - Centralized business rules
   - Easier testing

2. **Socket.io Integration**

   - Services emit events after operations
   - Consistent event emission
   - Real-time logic in business layer

3. **Permission Validation**
   - Centralized permission checks
   - Reusable across endpoints

### Example Service Method

```javascript
async assignTask(taskId, targetUserId, requesterId) {
  // 1. Validate task exists
  // 2. Check requester is creator
  // 3. Check user exists
  // 4. Prevent duplicate assignment
  // 5. Update database
  // 6. Emit socket events
  // 7. Return result
}
```

---

## 🔄 Repository Pattern

### Benefits

1. **Database Abstraction**

   - Services don't know about Mongoose
   - Easy to switch databases
   - Centralized queries

2. **Query Optimization**

   - All queries in one place
   - Easy to add indexes
   - Consistent data formatting

3. **Testability**
   - Easy to mock repositories
   - Test services without database

---

## 📊 Error Handling

### Error Response Format

```json
{
  "message": "Error description",
  "msg": "Alternative error message"
}
```

### Status Codes

- **200 OK** - Success
- **201 Created** - Resource created
- **400 Bad Request** - Validation error
- **401 Unauthorized** - Invalid/missing token
- **403 Forbidden** - Permission denied
- **404 Not Found** - Resource not found
- **500 Internal Server Error** - Server error

---

## 🔧 Environment Variables

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/taskmanager
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

---

## 🧪 Testing

```bash
# Run tests
npm test

# Test files in tests/ directory
```

---

## 📦 Dependencies

**Production:**

- `express` - Web framework
- `mongoose` - MongoDB ODM
- `jsonwebtoken` - JWT authentication
- `bcrypt` - Password hashing
- `socket.io` - Real-time communication
- `zod` - Schema validation
- `dotenv` - Environment variables

**Development:**

- `nodemon` - Auto-reload
- `jest` - Testing framework
- `supertest` - HTTP testing

---

## 🚢 Production Deployment

1. Set production environment variables
2. Use process manager (PM2)
3. Enable HTTPS
4. Configure MongoDB Atlas or production DB
5. Set up reverse proxy (Nginx)
6. Enable logging
7. Set up monitoring

---

## 🔍 Key Design Decisions

### MongoDB Choice

- Flexible schema for optional fields
- Native array support (assignedTo)
- Document-based (JSON-like)
- Easy scaling

### JWT Authentication

- Stateless (no session storage)
- Scalable across servers
- Self-contained tokens
- 24-hour expiration

### Service Layer

- Business logic separation
- Socket.io event emission
- Permission validation
- Transaction-ready

### Repository Pattern

- Database abstraction
- Query optimization
- Easy testing
- Consistent data access

---

## 📝 API Response Examples

### Success Response

```json
{
  "message": "Operation successful",
  "data": {...}
}
```

### Error Response

```json
{
  "message": "Error description"
}
```

### Task Response

```json
{
  "_id": "...",
  "title": "Task title",
  "status": "To-Do",
  "priority": "High",
  "creatorId": "...",
  "assignedTo": ["...", "..."],
  "createdAt": "2025-12-21T...",
  "updatedAt": "2025-12-21T..."
}
```

---

## 🔐 Security Features

- ✅ Password hashing (bcrypt)
- ✅ JWT token authentication
- ✅ Input validation (Zod)
- ✅ MongoDB injection prevention
- ✅ CORS configuration
- ✅ Environment variable protection
- ✅ Permission validation

---

## 📚 Code Patterns

### Controller Pattern

```javascript
async methodName(req, res) {
  try {
    // Validation
    // Call service
    // Return response
  } catch (error) {
    // Error handling
  }
}
```

### Service Pattern

```javascript
async methodName(params) {
  // Validate
  // Check permissions
  // Database operations
  // Emit socket events
  // Return result
}
```

### Repository Pattern

```javascript
async methodName(params) {
  return await Model.operation(params);
}
```

---

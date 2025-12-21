# Task Manager Frontend

A production-ready, real-time collaborative task management frontend built with React, TypeScript, and modern web technologies.

## 🚀 Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS (Fully responsive)
- **State Management**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod validation
- **Real-Time**: Socket.io-client
- **Routing**: React Router v6
- **Notifications**: React Hot Toast
- **Icons**: Lucide React
- **Date Handling**: date-fns

## 📋 Features

### Authentication
- ✅ Login/Register with form validation
- ✅ JWT token-based authentication
- ✅ Automatic token refresh and error handling
- ✅ Protected routes

### Dashboard Views
- ✅ **My Work (Assigned)**: Tasks assigned to you
- ✅ **Delegated (Created)**: Tasks you created
- ✅ **Urgent (Overdue)**: Overdue & incomplete tasks with red badge count

### Task Management
- ✅ Create, Read, Update, Delete tasks
- ✅ Status: To-Do, In-Progress, Completed
- ✅ Priority: Low, Medium, High
- ✅ Due date with validation (no past dates)
- ✅ Multi-user assignment
- ✅ Color-coded badges for status and priority
- ✅ Overdue task highlighting

### Permissions & Security
- ✅ **Creator**: Full edit access (title, description, status, priority, due date, assignees)
- ✅ **Assignee**: Can only update task status
- ✅ Delete restricted to task creator only
- ✅ Permission-based UI (disabled fields for assignees)

### Filters & Sorting
- ✅ Filter by Status (All, To-Do, In-Progress, Completed)
- ✅ Filter by Priority (All, Low, Medium, High)
- ✅ Sort by Due Date (Ascending/Descending)

### Real-Time Updates (Socket.io)
- ✅ **TASK_CREATED**: Auto-refresh task lists
- ✅ **TASK_UPDATED**: Live task updates
- ✅ **TASK_FINISHED**: Success notification to creator
- ✅ **TASK_DELETED**: Immediate removal from UI
- ✅ **TASK_ASSIGNED**: Persistent notification to assignee

### Loading States
- ✅ Skeleton loaders (shimmer effect)
- ✅ Loading spinners for actions
- ✅ Empty states with helpful messages

### Responsive Design
- ✅ Mobile-first approach
- ✅ Tablet and desktop optimized
- ✅ Touch-friendly UI elements
- ✅ Adaptive layouts

## 🛠️ Installation

```bash
# Install dependencies
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:3000" > .env

# Start development server
npm run dev
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── ProtectedRoute.tsx      # Route guard
│   │   ├── SkeletonLoader.tsx      # Loading skeletons
│   │   ├── TaskCard.tsx            # Task display card
│   │   ├── TaskFilters.tsx         # Filter toolbar
│   │   └── TaskModal.tsx           # Create/Edit modal
│   ├── contexts/
│   │   └── AuthContext.tsx         # Auth state management
│   ├── hooks/
│   │   ├── useSocket.ts            # Socket.io integration
│   │   └── useTasks.ts             # React Query hooks
│   ├── lib/
│   │   ├── api.ts                  # Axios instance
│   │   └── constants.ts            # App constants
│   ├── pages/
│   │   ├── Dashboard.tsx           # Main dashboard
│   │   ├── Login.tsx               # Login page
│   │   └── Register.tsx            # Registration page
│   ├── types/
│   │   └── index.ts                # TypeScript types
│   ├── App.tsx                     # App root
│   ├── main.tsx                    # Entry point
│   └── index.css                   # Global styles
├── .env                            # Environment variables
├── tailwind.config.js              # Tailwind configuration
├── vite.config.ts                  # Vite configuration
└── package.json
```

## 🔌 API Integration

The frontend connects to the backend API at `http://localhost:3000` by default.

### Endpoints Used:
- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login
- `GET /api/users` - Get all users (for assignment)
- `GET /api/users/profile` - Get current user profile
- `POST /api/tasks` - Create task
- `GET /api/tasks/created` - Get created tasks
- `GET /api/tasks/assigned` - Get assigned tasks
- `GET /api/tasks/overdue` - Get overdue tasks
- `PATCH /api/tasks/:id` - Update task
- `PATCH /api/tasks/assign/:taskId` - Assign/unassign users
- `DELETE /api/tasks/:taskId` - Delete task

## 🎨 Design Decisions

### State Management
- **React Query** for server state (caching, invalidation, optimistic updates)
- **Context API** for authentication state
- **Local state** for UI interactions

### Form Validation
- **Zod schemas** ensure type-safe validation
- **React Hook Form** for performant form handling
- Real-time error feedback

### Real-Time Sync
- Socket.io listeners integrated with React Query
- Automatic cache invalidation on events
- Optimistic UI updates

### Performance
- Lazy loading and code splitting
- Memoized computed values
- Debounced search/filters
- Skeleton loaders prevent layout shift

## 🚦 Running the Application

1. **Start the backend server** (from backend directory):
   ```bash
   npm start
   ```

2. **Start the frontend** (from frontend directory):
   ```bash
   npm run dev
   ```

3. **Access the app**:
   - Frontend: http://localhost:5173
   - Backend: http://localhost:3000

## 🧪 Build for Production

```bash
# Build optimized production bundle
npm run build

# Preview production build
npm run preview
```

## 📱 Responsive Breakpoints

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🎯 Key Features Implemented

✅ All requirements from the specification met
✅ Production-ready code quality
✅ Type-safe TypeScript throughout
✅ Comprehensive error handling
✅ Accessible UI components
✅ Clean, maintainable code structure

## 📝 Environment Variables

Create a `.env` file in the frontend root:

```env
VITE_API_URL=http://localhost:3000
```



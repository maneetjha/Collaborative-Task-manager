# Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Install Dependencies
```bash
cd frontend
npm install
```

### Step 2: Configure Environment
```bash
# Create .env file
echo "VITE_API_URL=http://localhost:3000" > .env
```

### Step 3: Start Development Server
```bash
npm run dev
```

The app will be available at **http://localhost:5173**

---

## 🎯 First Time Setup

### Prerequisites
- Node.js 18+ installed
- Backend server running on port 3000
- MongoDB connected

### Backend Setup (if not running)
```bash
# In a separate terminal
cd ../backend
npm install
npm start
```

---

## 👤 Testing the Application

### 1. Register a New User
- Navigate to http://localhost:5173
- Click "Sign up"
- Fill in:
  - Name: "John Doe"
  - Email: "john@example.com"
  - Password: "password123"
- Click "Sign Up"

### 2. Login
- Use the credentials you just created
- You'll be redirected to the dashboard

### 3. Create Your First Task
- Click "New Task" button
- Fill in:
  - Title: "Complete project documentation"
  - Description: "Write comprehensive docs"
  - Status: "To-Do"
  - Priority: "High"
  - Due Date: Tomorrow's date
- Click "Create Task"

### 4. Test Real-Time Features
- Open another browser window (incognito)
- Register a second user
- In first window, create a task and assign it to the second user
- Watch the second window receive a real-time notification!

---

## 📱 Mobile Testing

### Using Browser DevTools
1. Open Chrome DevTools (F12)
2. Click the device toggle icon (Ctrl+Shift+M)
3. Select a mobile device (iPhone 12, Pixel 5, etc.)
4. Test all features in mobile view

### Using Real Device
1. Find your local IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
2. Update `.env`: `VITE_API_URL=http://YOUR_IP:3000`
3. Restart dev server
4. On mobile browser, visit: `http://YOUR_IP:5173`

---

## 🔍 Feature Testing Checklist

### Authentication
- [ ] Register new user
- [ ] Login with valid credentials
- [ ] Login with invalid credentials (should show error)
- [ ] Logout
- [ ] Access protected route without login (should redirect)

### Task Management
- [ ] Create task
- [ ] Edit task (as creator - all fields enabled)
- [ ] Edit task (as assignee - only status enabled)
- [ ] Delete task (as creator)
- [ ] Assign users to task

### Dashboard Views
- [ ] Switch between tabs (My Work, Delegated, Urgent)
- [ ] Verify correct tasks in each tab
- [ ] Check overdue badge count

### Filters & Sort
- [ ] Filter by status (To-Do, In-Progress, Completed)
- [ ] Filter by priority (Low, Medium, High)
- [ ] Sort by due date (ascending/descending)
- [ ] Combine multiple filters

### Real-Time Updates
- [ ] Create task in one window, see it appear in another
- [ ] Update task status, see real-time update
- [ ] Complete task, creator receives notification
- [ ] Assign user to task, assignee receives notification
- [ ] Delete task, see it disappear immediately

### Responsive Design
- [ ] Test on mobile (< 768px)
- [ ] Test on tablet (768px - 1024px)
- [ ] Test on desktop (> 1024px)
- [ ] Verify all buttons are touch-friendly
- [ ] Check text readability on small screens

---




# Task Management System - Complete Setup Guide

## 📋 Prerequisites Check

Before starting, you need to have the following installed:

### Required Software
1. **Node.js** (v18 or higher) - ✅ Already installed
2. **MongoDB** - ⚠️ **NEEDED**
3. **npm** or **yarn** - ✅ Already installed

### Option 1: Install MongoDB Locally (Recommended for Development)

#### Windows Installation
1. Download MongoDB from: https://www.mongodb.com/try/download/community
2. Run the installer (.msi file)
3. Choose "Complete" installation
4. Install MongoDB as a Service (check the box)
5. Install MongoDB Compass (GUI tool - optional but helpful)
6. After installation, MongoDB will run automatically

#### Verify MongoDB Installation
```powershell
mongod --version
```

### Option 2: Use MongoDB Atlas (Cloud - Free Tier)

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create a free account
3. Create a new cluster (M0 Free tier)
4. Create a database user
5. Whitelist your IP (or use 0.0.0.0/0 for development)
6. Get your connection string
7. Update `backend/.env` with your Atlas URI:
```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/task_management
```

### Option 3: Use Docker (If you have Docker Desktop)

1. Install Docker Desktop from: https://www.docker.com/products/docker-desktop
2. Navigate to backend folder and run:
```bash
docker-compose up -d
```

This will start both MongoDB and the backend service.

---

## 🚀 Quick Start (After MongoDB is Running)

### Step 1: Start Backend

```powershell
cd "F:\Task Management\backend"
npm run dev
```

Backend will run on: `http://localhost:8000`

### Step 2: Start Frontend

```powershell
cd "F:\Task Management\frontend"
npm run dev
```

Frontend will run on: `http://localhost:3000`

---

## 🎯 Full Setup Instructions

### Backend Setup

1. **Navigate to backend directory:**
```powershell
cd "F:\Task Management\backend"
```

2. **Install dependencies** (if not already done):
```powershell
npm install
```

3. **Configure environment variables:**

The `.env` file is already configured. Just ensure MongoDB is running:

```env
PORT=8000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/task_management
JWT_ACCESS_SECRET=your-super-secret-access-token-key-change-this-in-production-2024
JWT_REFRESH_SECRET=your-super-secret-refresh-token-key-change-this-in-production-2024
```

4. **Start the backend server:**
```powershell
npm run dev
```

You should see:
```
✅ MongoDB connection SUCCESS
📝 Server is running on port: 8000
```

### Frontend Setup

1. **Navigate to frontend directory:**
```powershell
cd "F:\Task Management\frontend"
```

2. **Install dependencies** (already done):
```powershell
npm install
```

3. **Configure environment:**

The `.env` file is already set:
```env
VITE_API_URL=http://localhost:8000/api/v1
```

4. **Start the development server:**
```powershell
npm run dev
```

You should see:
```
VITE v5.4.21 ready in 5719 ms
➜  Local:   http://localhost:3000/
```

---

## 🧪 Testing the Application

### 1. Open the Application

Open your browser and go to: `http://localhost:3000`

### 2. Create an Account

- Click "Sign up now" on the login page
- Fill in:
  - First Name: John
  - Last Name: Doe
  - Email: john@example.com
  - Password: Test@123 (minimum 8 characters)
- Click "Create Account"

### 3. Login

- Use your credentials to log in
- You'll be redirected to the Dashboard

### 4. Test Features

#### Create a Task
1. Click "Create Task" button
2. Fill in:
   - Title: "Complete Project Documentation"
   - Description: "Write comprehensive README files"
   - Priority: High
   - Due Date: Tomorrow
   - Status: TODO
3. Click "Create Task"

#### View Dashboard
- See task statistics (Total, In Progress, Overdue, Completed)
- View quick actions
- See task distribution by status

#### Manage Tasks
- Go to "Tasks" page
- Filter by status or priority
- Search for specific tasks
- Edit or delete tasks
- Change status with dropdown

---

## 🎨 Application Features

### Authentication
- ✅ User Registration
- ✅ User Login
- ✅ JWT Token Authentication
- ✅ Automatic Token Refresh
- ✅ Secure Logout

### Dashboard
- ✅ Task Statistics Cards
- ✅ Visual Progress Indicators
- ✅ Quick Action Links
- ✅ Task Distribution Chart

### Task Management
- ✅ Create Tasks
- ✅ Edit Tasks
- ✅ Delete Tasks
- ✅ Filter by Status
- ✅ Filter by Priority
- ✅ Search Tasks
- ✅ Sort Tasks
- ✅ Pagination
- ✅ Due Date Tracking
- ✅ Overdue Indicators

### Role-Based Access
- ✅ User Role
- ✅ Manager Role (can assign tasks)
- ✅ Admin Role (full access)

---

## 🐛 Troubleshooting

### Problem: Backend shows "MONGODB connection error"

**Solution:**
1. Ensure MongoDB is installed and running
2. Check MongoDB service status:
   ```powershell
   Get-Service MongoDB
   ```
3. If not running, start it:
   ```powershell
   Start-Service MongoDB
   ```
4. Or install MongoDB from scratch (see prerequisites above)

### Problem: Frontend can't connect to backend

**Solution:**
1. Ensure backend is running on port 8000
2. Check backend terminal for errors
3. Verify `.env` files are correct
4. Clear browser cache and reload

### Problem: "Port 3000 is already in use"

**Solution:**
1. Vite will automatically suggest another port (accept it)
2. Or kill the process using port 3000:
   ```powershell
   Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process
   ```

### Problem: Styles not loading correctly

**Solution:**
1. Clear Vite cache:
   ```powershell
   cd frontend
   Remove-Item -Recurse -Force .vite
   npm run dev
   ```

### Problem: Login returns 401 Unauthorized

**Solution:**
1. Ensure you've registered an account first
2. Check backend logs for errors
3. Verify MongoDB is connected
4. Clear browser cookies and try again

---

## 📊 API Endpoints

Once the backend is running, you can test these endpoints:

### Authentication
- POST `/api/v1/auth/register` - Register new user
- POST `/api/v1/auth/login` - Login user
- POST `/api/v1/auth/logout` - Logout user
- POST `/api/v1/auth/refresh-token` - Refresh access token
- GET `/api/v1/auth/current-user` - Get current user

### Tasks
- GET `/api/v1/tasks` - Get all tasks (with filters)
- POST `/api/v1/tasks` - Create new task
- GET `/api/v1/tasks/:id` - Get single task
- PATCH `/api/v1/tasks/:id` - Update task
- DELETE `/api/v1/tasks/:id` - Delete task
- PATCH `/api/v1/tasks/:id/status` - Update task status
- GET `/api/v1/tasks/stats/overview` - Get task statistics

### Users (Admin/Manager only)
- GET `/api/v1/users` - Get all users
- GET `/api/v1/users/profile` - Get user profile
- PATCH `/api/v1/users/:id/role` - Update user role
- PATCH `/api/v1/users/:id/status` - Toggle user status

---

## 🎯 Default Test Accounts

After starting the application, register accounts with these roles:

### Regular User
- Create any account through registration
- Default role: `user`

### Manager Account
- Register an account
- Use MongoDB Compass or mongo shell to update role:
  ```javascript
  db.users.updateOne(
    { email: "manager@example.com" },
    { $set: { role: "manager" } }
  )
  ```

### Admin Account
- Register an account
- Update role to admin:
  ```javascript
  db.users.updateOne(
    { email: "admin@example.com" },
    { $set: { role: "admin" } }
  )
  ```

---

## 📱 Accessing the Application

1. **Frontend**: http://localhost:3000
2. **Backend API**: http://localhost:8000
3. **API Health Check**: http://localhost:8000/api/v1/health

---

## 🎨 UI Features Showcase

### Modern Design Elements
- ✨ Gradient backgrounds and accents
- 🎴 Card-based layouts
- 📊 Visual statistics with progress bars
- 🏷️ Color-coded status and priority badges
- 📱 Fully responsive (mobile, tablet, desktop)
- 🎭 Smooth animations and transitions
- 🔔 Toast notifications for actions
- 📋 Modal dialogs for forms
- 🎯 Intuitive navigation with sidebar

### Styling Inspiration
UI inspired by leading task management tools:
- **Asana** - Clean card layouts
- **Monday.com** - Colorful status indicators
- **ClickUp** - Modern sidebar navigation
- **Todoist** - Minimalist design patterns

---

## 🚢 Production Deployment (Optional)

### Backend Deployment (Render/Railway)
1. Push code to GitHub
2. Connect to Render.com or Railway.app
3. Set environment variables
4. Deploy

### Frontend Deployment (Vercel/Netlify)
1. Build the project: `npm run build`
2. Deploy `dist` folder to Vercel or Netlify
3. Set environment variable: `VITE_API_URL=<your-backend-url>`

---

## 📞 Need Help?

If you encounter any issues:

1. **Check terminal output** for error messages
2. **Check browser console** (F12) for frontend errors
3. **Verify all prerequisites** are installed
4. **Ensure ports 3000 and 8000** are available
5. **Check MongoDB** is running

---

## ✅ Success Checklist

- [ ] MongoDB installed and running
- [ ] Backend dependencies installed
- [ ] Backend `.env` configured
- [ ] Backend server running on port 8000
- [ ] Frontend dependencies installed
- [ ] Frontend `.env` configured
- [ ] Frontend server running on port 3000
- [ ] Can access http://localhost:3000
- [ ] Can register a new account
- [ ] Can login successfully
- [ ] Can see dashboard
- [ ] Can create tasks
- [ ] Can manage tasks

---

**🎉 Once all checkboxes are complete, your application is fully functional!**

Built with ❤️ for Accenture Enterprise Standards

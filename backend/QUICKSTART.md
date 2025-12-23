# Task Management System - Quick Start Guide

## 🚀 Quick Start (5 minutes)

### 1. Install Dependencies (Already Done ✅)

```bash
cd backend
npm install
```

### 2. Start MongoDB

**Option A: Using Docker (Recommended)**
```bash
docker run -d -p 27017:27017 --name mongodb mongo:7.0
```

**Option B: Using Docker Compose**
```bash
docker-compose up -d mongodb
```

### 3. Start the Application

```bash
# Development mode (auto-reload)
npm run dev

# Production mode
npm start
```

### 4. Test the API

**Health Check:**
```bash
curl http://localhost:8000/health
```

**Register User:**
```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "Admin@123",
    "firstName": "Admin",
    "lastName": "User"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "Admin@123"
  }'
```

**Create Task (use token from login):**
```bash
curl -X POST http://localhost:8000/api/v1/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "title": "First Task",
    "description": "This is my first task",
    "priority": "high",
    "dueDate": "2024-12-31T23:59:59.000Z"
  }'
```

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── controllers/       # Business logic
│   ├── models/           # Database schemas
│   ├── routes/           # API endpoints
│   ├── middlewares/      # Auth, validation, error handling
│   ├── utils/            # Helper functions
│   ├── db/               # Database connection
│   ├── constants.js      # Application constants
│   ├── app.js           # Express configuration
│   └── index.js         # Entry point
├── logs/                # Application logs
├── public/temp/         # Temporary uploads
├── .env                 # Environment variables
├── package.json         # Dependencies
├── Dockerfile          # Docker configuration
├── docker-compose.yml  # Docker Compose setup
├── README.md           # Full documentation
├── API_TESTING.md      # API testing guide
└── DEPLOYMENT.md       # Deployment guide
```

---

## 🎯 Key Features Implemented

### ✅ Authentication & Authorization
- JWT-based auth with access & refresh tokens
- Email verification system
- Password hashing with bcrypt
- Role-based access control (Admin, Manager, User)

### ✅ Task Management
- Full CRUD operations
- Status workflow: TODO → IN_PROGRESS → REVIEW → DONE
- Priority levels: low, medium, high, urgent
- Task assignment and tracking
- Soft delete functionality

### ✅ Advanced Features
- Pagination (limit/offset)
- Filtering (status, priority, assignee, date range)
- Sorting (creation date, due date, priority)
- Full-text search (title, description)
- Audit logging (who did what and when)
- Task statistics and analytics

### ✅ Enterprise Best Practices
- Environment-based configuration
- Centralized error handling
- Request validation (express-validator)
- Response standardization
- SQL injection prevention
- Rate limiting (Auth: 5/15min, API: 100/15min)
- CORS configuration
- Structured logging (Winston)
- Security headers (Helmet)
- Database indexing for performance
- Docker containerization
- Health check endpoints

---

## 🗄️ Database Schema

### Users
- email, password (hashed), firstName, lastName
- role (admin/manager/user), isActive, isEmailVerified
- JWT tokens, lastLogin, timestamps

### Tasks
- title, description, status, priority, dueDate
- createdBy, assignedTo, tags
- isDeleted (soft delete), completedAt, timestamps
- **Indexes**: status, priority, assignedTo, dueDate, text search

### AuditLogs
- userId, action, resourceType, resourceId
- details, ipAddress, userAgent, timestamp
- **Indexes**: userId, resourceType, timestamp

---

## 📚 API Endpoints Overview

### Authentication (`/api/v1/auth`)
- `POST /register` - Register new user
- `POST /login` - Login user
- `POST /logout` - Logout user
- `POST /refresh` - Refresh access token
- `POST /verify-email` - Verify email
- `POST /change-password` - Change password
- `GET /me` - Get current user

### Tasks (`/api/v1/tasks`)
- `GET /` - Get all tasks (with filtering, pagination)
- `GET /:id` - Get single task
- `POST /` - Create task
- `PUT /:id` - Update task
- `PATCH /:id/status` - Update task status
- `DELETE /:id` - Delete task (soft)
- `GET /stats` - Get task statistics

### Users (`/api/v1/users`)
- `GET /` - Get all users (Admin)
- `GET /:id` - Get user by ID
- `PUT /:id` - Update user
- `PATCH /:id/role` - Update user role (Admin)
- `PATCH /:id/status` - Activate/deactivate user (Admin)
- `GET /:id/activity` - Get user activity logs

---

## 🔒 Security Features

1. **Authentication**: JWT with short-lived tokens (15min)
2. **Authorization**: Role-based access control
3. **Rate Limiting**: Prevents abuse
4. **Security Headers**: Helmet.js
5. **Input Validation**: express-validator
6. **Password Hashing**: bcrypt (10 rounds)
7. **SQL Injection**: MongoDB parameterized queries
8. **CORS**: Configured origins

---

## 🐳 Docker Deployment

**Quick Start:**
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down
```

**Services:**
- Backend API: http://localhost:8000
- MongoDB: localhost:27017
- Mongo Express: http://localhost:8081 (dev only)

---

## 📊 Monitoring

**Check Health:**
```bash
curl http://localhost:8000/health
```

**View Logs:**
```bash
# Error logs
tail -f logs/error.log

# Combined logs
tail -f logs/combined.log

# Docker logs
docker logs -f task-management-backend
```

---

## 🧪 Testing

See [API_TESTING.md](API_TESTING.md) for complete testing guide with:
- Sample requests for all endpoints
- Test data sets
- Performance testing scenarios
- Error testing cases

---

## 📖 Documentation

- **[README.md](README.md)** - Complete documentation
- **[API_TESTING.md](API_TESTING.md)** - API testing guide
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Deployment guide

---

## 🛠️ Development Commands

```bash
# Start development server
npm run dev

# Start production server
npm start

# Run tests (when implemented)
npm test

# Check code style
npm run lint
```

---

## 🌟 What Makes This Enterprise-Ready?

### Architecture
✅ Modular structure with clear separation of concerns
✅ Scalable design patterns
✅ Database indexing for performance
✅ RESTful API design

### Security
✅ Multiple layers of authentication
✅ Role-based access control
✅ Rate limiting and DDoS protection
✅ Security headers and CORS

### Reliability
✅ Centralized error handling
✅ Request validation
✅ Audit logging
✅ Health check endpoints

### Maintainability
✅ Clean code structure
✅ Comprehensive documentation
✅ Environment-based configuration
✅ Docker containerization

### Performance
✅ Database indexing
✅ Pagination for large datasets
✅ Efficient query patterns
✅ Connection pooling

---

## 🎓 Learning Resources

This project demonstrates:
- RESTful API development
- JWT authentication
- MongoDB aggregation
- Express middleware patterns
- Error handling strategies
- Security best practices
- Docker containerization
- Database design and indexing
- Role-based authorization
- Audit logging systems

---

## 📞 Support

For questions or issues:
- Check documentation in README.md
- Review API_TESTING.md for examples
- Check DEPLOYMENT.md for deployment issues
- Open an issue on GitHub

---

## 🚀 Next Steps

1. **Test the API** - Use API_TESTING.md
2. **Deploy** - Follow DEPLOYMENT.md
3. **Customize** - Adapt to your needs
4. **Scale** - Add caching, load balancing
5. **Enhance** - Add email notifications, file uploads, etc.

---

**Built with ❤️ demonstrating enterprise backend engineering practices**

**Status:** ✅ Production Ready
**Version:** 1.0.0
**Tech Stack:** Node.js, Express, MongoDB, JWT, Docker

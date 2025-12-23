# Task Management System - Enterprise Backend

A production-ready Task Management System built with Node.js, Express, and MongoDB, demonstrating enterprise-grade backend engineering practices suitable for Accenture's technical standards.

## 🚀 Features

### Core Functionality
- **Authentication & Authorization**
  - JWT-based authentication with access and refresh tokens
  - Email verification system
  - Password hashing with bcrypt
  - Role-based access control (Admin, Manager, User)
  - Secure cookie-based session management

- **Task Management**
  - Complete CRUD operations
  - Task status workflow: TODO → IN_PROGRESS → REVIEW → DONE
  - Priority levels: Low, Medium, High, Urgent
  - Task assignment to users
  - Soft delete functionality
  - Due date tracking with overdue detection

- **Advanced Features**
  - **Pagination**: Efficient cursor-based pagination
  - **Filtering**: Filter by status, priority, assignee, date range
  - **Sorting**: Sort by creation date, due date, priority
  - **Full-Text Search**: Search on title and description
  - **Audit Logging**: Complete activity tracking
  - **Task Statistics**: Dashboard metrics and analytics

### Enterprise Best Practices
- ✅ Environment-based configuration
- ✅ Centralized error handling
- ✅ Request validation with express-validator
- ✅ Response standardization
- ✅ SQL injection prevention
- ✅ Rate limiting (Auth: 5/15min, API: 100/15min)
- ✅ CORS configuration
- ✅ Structured logging with Winston
- ✅ Security headers with Helmet
- ✅ Database indexing for performance
- ✅ Docker containerization
- ✅ Health check endpoints

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- npm or yarn
- Docker & Docker Compose (optional)

## 🛠️ Installation

### Option 1: Local Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
```

Edit `.env` file with your configuration:
```env
PORT=8000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017
DB_NAME=task_management_db
ACCESS_TOKEN_SECRET=your-secret-key
REFRESH_TOKEN_SECRET=your-refresh-secret
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d
CORS_ORIGIN=http://localhost:3000
```

4. **Start MongoDB**
```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:7.0

# Or use local MongoDB installation
mongod
```

5. **Run the application**
```bash
# Development mode
npm run dev

# Production mode
npm start
```

### Option 2: Docker Setup

1. **Build and run with Docker Compose**
```bash
docker-compose up -d
```

2. **View logs**
```bash
docker-compose logs -f backend
```

3. **Stop containers**
```bash
docker-compose down
```

## 📚 API Documentation

### Base URL
```
http://localhost:8000/api/v1
```

### Health Check
```
GET /health
```

---

## 🔐 Authentication Endpoints

### Register User
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "statusCode": 201,
  "data": {
    "user": {
      "_id": "...",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "user",
      "isActive": true,
      "isEmailVerified": false
    }
  },
  "message": "User registered successfully",
  "success": true
}
```

### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response:** Sets `accessToken` and `refreshToken` cookies
```json
{
  "statusCode": 200,
  "data": {
    "user": { ... },
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  },
  "message": "Login successful",
  "success": true
}
```

### Logout
```http
POST /api/v1/auth/logout
Authorization: Bearer <accessToken>
```

### Refresh Token
```http
POST /api/v1/auth/refresh
Cookie: refreshToken=<token>

OR

{
  "refreshToken": "eyJhbGc..."
}
```

### Get Current User
```http
GET /api/v1/auth/me
Authorization: Bearer <accessToken>
```

### Change Password
```http
POST /api/v1/auth/change-password
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "oldPassword": "OldPass123",
  "newPassword": "NewSecurePass123"
}
```

---

## 📝 Task Endpoints

### Get All Tasks
```http
GET /api/v1/tasks?page=1&limit=10&status=TODO&priority=high&search=urgent
Authorization: Bearer <accessToken>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `status` (optional): TODO, IN_PROGRESS, REVIEW, DONE
- `priority` (optional): low, medium, high, urgent
- `assignedTo` (optional): User ID
- `createdBy` (optional): User ID
- `search` (optional): Full-text search
- `sortBy` (optional): createdAt, dueDate, priority (default: createdAt)
- `sortOrder` (optional): asc, desc (default: desc)
- `fromDate` (optional): Filter tasks from date
- `toDate` (optional): Filter tasks to date

### Get Task by ID
```http
GET /api/v1/tasks/:id
Authorization: Bearer <accessToken>
```

### Create Task
```http
POST /api/v1/tasks
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "title": "Implement user authentication",
  "description": "Add JWT-based authentication system",
  "priority": "high",
  "dueDate": "2024-12-31T23:59:59.000Z",
  "assignedTo": "user_id",
  "tags": ["authentication", "security"]
}
```

### Update Task
```http
PUT /api/v1/tasks/:id
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "title": "Updated title",
  "description": "Updated description",
  "priority": "urgent",
  "dueDate": "2024-12-31T23:59:59.000Z"
}
```

### Update Task Status
```http
PATCH /api/v1/tasks/:id/status
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "status": "IN_PROGRESS"
}
```

### Delete Task (Soft Delete)
```http
DELETE /api/v1/tasks/:id
Authorization: Bearer <accessToken>
```

### Get Task Statistics
```http
GET /api/v1/tasks/stats
Authorization: Bearer <accessToken>
```

---

## 👥 User Management Endpoints (Admin)

### Get All Users
```http
GET /api/v1/users?page=1&limit=10&role=user&isActive=true
Authorization: Bearer <accessToken>
```
**Required Role:** Admin

### Get User by ID
```http
GET /api/v1/users/:id
Authorization: Bearer <accessToken>
```

### Update User
```http
PUT /api/v1/users/:id
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane.doe@example.com"
}
```

### Update User Role
```http
PATCH /api/v1/users/:id/role
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "role": "manager"
}
```
**Required Role:** Admin

### Update User Status
```http
PATCH /api/v1/users/:id/status
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "isActive": false
}
```
**Required Role:** Admin

### Get User Activity
```http
GET /api/v1/users/:id/activity?page=1&limit=20
Authorization: Bearer <accessToken>
```

---

## 🗄️ Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  email: String (unique, indexed),
  password: String (hashed),
  firstName: String,
  lastName: String,
  role: String (enum: 'admin', 'manager', 'user') (indexed),
  isActive: Boolean (indexed),
  isEmailVerified: Boolean,
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  refreshToken: String,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Tasks Collection
```javascript
{
  _id: ObjectId,
  title: String (indexed, text search),
  description: String (text search),
  status: String (enum, indexed),
  priority: String (enum, indexed),
  dueDate: Date (indexed),
  createdBy: ObjectId (ref: User, indexed),
  assignedTo: ObjectId (ref: User, indexed),
  tags: [String],
  isDeleted: Boolean (indexed),
  deletedAt: Date,
  completedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### AuditLogs Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User, indexed),
  action: String (enum, indexed),
  resourceType: String (indexed),
  resourceId: ObjectId (indexed),
  details: Mixed,
  ipAddress: String,
  userAgent: String,
  timestamp: Date (indexed),
  createdAt: Date,
  updatedAt: Date
}
```

### Database Indexes
- **Compound Indexes:**
  - Tasks: `{ status: 1, priority: 1 }`
  - Tasks: `{ assignedTo: 1, status: 1 }`
  - Tasks: `{ createdBy: 1, createdAt: -1 }`
  - Tasks: `{ dueDate: 1, status: 1 }`
  - Tasks: `{ isDeleted: 1, status: 1 }`
  - AuditLogs: `{ userId: 1, timestamp: -1 }`
  - AuditLogs: `{ resourceType: 1, resourceId: 1, timestamp: -1 }`

- **Text Indexes:**
  - Tasks: `{ title: 'text', description: 'text' }`

---

## 🔒 Security Features

1. **Authentication**
   - JWT with short-lived access tokens (15 minutes)
   - Long-lived refresh tokens (7 days)
   - Secure HTTP-only cookies
   - Password hashing with bcrypt (10 rounds)

2. **Authorization**
   - Role-based access control
   - Resource-level permissions
   - User can only access their own tasks unless admin/manager

3. **Rate Limiting**
   - Authentication endpoints: 5 requests per 15 minutes
   - General API: 100 requests per 15 minutes
   - Task creation: 20 requests per hour

4. **Security Headers**
   - Helmet.js for secure HTTP headers
   - CORS configuration
   - XSS protection
   - Content Security Policy

5. **Input Validation**
   - Request validation with express-validator
   - MongoDB injection prevention
   - SQL injection prevention

---

## 📊 Response Format

### Success Response
```json
{
  "statusCode": 200,
  "data": { ... },
  "message": "Success message",
  "success": true
}
```

### Error Response
```json
{
  "statusCode": 400,
  "data": null,
  "message": "Error message",
  "success": false
}
```

---

## 🧪 Testing

### Manual Testing with cURL

**Register User:**
```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#",
    "firstName": "Test",
    "lastName": "User"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#"
  }' \
  -c cookies.txt
```

**Create Task:**
```bash
curl -X POST http://localhost:8000/api/v1/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-access-token>" \
  -d '{
    "title": "Test Task",
    "description": "This is a test task",
    "priority": "high",
    "dueDate": "2024-12-31T23:59:59.000Z"
  }'
```

---

## 🏗️ Project Structure

```
backend/
├── src/
│   ├── controllers/        # Request handlers
│   │   ├── auth.controller.js
│   │   ├── task.controller.js
│   │   └── user.controller.js
│   ├── models/            # Database schemas
│   │   ├── user.models.js
│   │   ├── task.models.js
│   │   └── auditLog.models.js
│   ├── routes/            # API routes
│   │   ├── auth.routes.js
│   │   ├── task.routes.js
│   │   └── user.routes.js
│   ├── middlewares/       # Custom middleware
│   │   ├── auth.middleware.js
│   │   ├── validation.middleware.js
│   │   ├── rateLimiter.middleware.js
│   │   └── errorHandler.middleware.js
│   ├── utils/             # Utility functions
│   │   ├── ApiError.js
│   │   ├── ApiResponse.js
│   │   ├── asyncHandler.js
│   │   └── logger.js
│   ├── db/                # Database connection
│   │   └── index.js
│   ├── constants.js       # Constants and enums
│   ├── app.js            # Express app setup
│   └── index.js          # Entry point
├── public/temp/          # Temporary file storage
├── logs/                 # Application logs
├── .env                  # Environment variables
├── .env.example         # Example environment file
├── .gitignore           # Git ignore rules
├── .dockerignore        # Docker ignore rules
├── Dockerfile           # Docker configuration
├── docker-compose.yml   # Docker Compose setup
├── package.json         # Dependencies
└── README.md           # Documentation
```

---

## 🚀 Deployment

### Docker Production Deployment

1. **Build production image:**
```bash
docker build -t task-management-api:latest .
```

2. **Run with Docker Compose:**
```bash
docker-compose -f docker-compose.yml up -d
```

3. **Check logs:**
```bash
docker-compose logs -f backend
```

### Environment Variables for Production

Ensure these are set securely in production:
- Use strong, randomly generated secrets for tokens
- Set `NODE_ENV=production`
- Configure proper CORS origins
- Use MongoDB authentication
- Enable SSL/TLS for MongoDB connections

---

## 📈 Performance Optimizations

1. **Database Indexing**
   - Compound indexes on frequently queried fields
   - Text indexes for full-text search
   - Index on foreign keys

2. **Query Optimization**
   - Aggregation pipeline for complex queries
   - Pagination to limit result sets
   - Projection to select only needed fields

3. **Connection Pooling**
   - MongoDB connection pooling enabled
   - Efficient connection management

4. **Caching Strategy**
   - Ready for Redis integration
   - Response caching for frequent queries

---

## 🔧 Troubleshooting

### MongoDB Connection Issues
```bash
# Check MongoDB is running
docker ps | grep mongo

# View MongoDB logs
docker logs task_management_mongodb

# Connect to MongoDB shell
docker exec -it task_management_mongodb mongosh
```

### Application Errors
```bash
# Check application logs
tail -f logs/error.log
tail -f logs/combined.log

# View container logs
docker logs task_management_backend
```

---

## 👨‍💻 Development

### Code Style
- ES6+ JavaScript
- Async/await for asynchronous operations
- Modular architecture
- RESTful API design

### Git Workflow
```bash
git checkout -b feature/your-feature
# Make changes
git add .
git commit -m "feat: add your feature"
git push origin feature/your-feature
```

---

## 📝 License

MIT License - See LICENSE file for details

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

---

## 📞 Support

For issues or questions:
- Create an issue on GitHub
- Contact: tejinderpal_singh@example.com

---

## 🎯 Future Enhancements

- [ ] Email notification system
- [ ] Task attachments and file uploads
- [ ] Task comments and discussions
- [ ] Real-time notifications with WebSockets
- [ ] Advanced analytics dashboard
- [ ] Export tasks to PDF/Excel
- [ ] Task templates
- [ ] Recurring tasks
- [ ] Team collaboration features
- [ ] Integration with third-party services (Slack, JIRA, etc.)
- [ ] Mobile API optimization
- [ ] GraphQL API support
- [ ] Microservices architecture

---

**Built with ❤️ for Accenture Technical Standards**
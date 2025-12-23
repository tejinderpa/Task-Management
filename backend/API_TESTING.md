# API Testing Guide

## Quick Start Testing with Postman/Thunder Client

### 1. Setup

**Base URL:** `http://localhost:8000/api/v1`

**Headers for authenticated requests:**
```
Authorization: Bearer <your_access_token>
Content-Type: application/json
```

---

## Test Flow (Copy-Paste Ready)

### Step 1: Register a User

**POST** `/auth/register`

```json
{
  "email": "admin@accenture.com",
  "password": "Admin@123",
  "firstName": "Admin",
  "lastName": "User"
}
```

Expected: Status 201, returns user object

---

### Step 2: Login

**POST** `/auth/login`

```json
{
  "email": "admin@accenture.com",
  "password": "Admin@123"
}
```

Expected: Status 200, returns user object with tokens
**Copy the `accessToken` from response for next requests**

---

### Step 3: Get Current User

**GET** `/auth/me`

Headers:
```
Authorization: Bearer <paste_your_access_token_here>
```

Expected: Status 200, returns current user info

---

### Step 4: Create a Task

**POST** `/tasks`

Headers:
```
Authorization: Bearer <your_access_token>
Content-Type: application/json
```

Body:
```json
{
  "title": "Design Authentication System",
  "description": "Design and implement JWT-based authentication with role-based access control",
  "priority": "high",
  "dueDate": "2024-12-31T23:59:59.000Z",
  "tags": ["authentication", "security", "backend"]
}
```

Expected: Status 201, returns created task

---

### Step 5: Get All Tasks

**GET** `/tasks?page=1&limit=10&status=TODO&sortBy=createdAt&sortOrder=desc`

Headers:
```
Authorization: Bearer <your_access_token>
```

Expected: Status 200, returns paginated task list

---

### Step 6: Get Task by ID

**GET** `/tasks/<task_id>`

Replace `<task_id>` with actual task ID from previous response

Headers:
```
Authorization: Bearer <your_access_token>
```

Expected: Status 200, returns single task

---

### Step 7: Update Task Status

**PATCH** `/tasks/<task_id>/status`

Headers:
```
Authorization: Bearer <your_access_token>
Content-Type: application/json
```

Body:
```json
{
  "status": "IN_PROGRESS"
}
```

Expected: Status 200, returns updated task

---

### Step 8: Update Task

**PUT** `/tasks/<task_id>`

Headers:
```
Authorization: Bearer <your_access_token>
Content-Type: application/json
```

Body:
```json
{
  "title": "Design Authentication System - Updated",
  "description": "Updated description with more details",
  "priority": "urgent"
}
```

Expected: Status 200, returns updated task

---

### Step 9: Get Task Statistics

**GET** `/tasks/stats`

Headers:
```
Authorization: Bearer <your_access_token>
```

Expected: Status 200, returns statistics

---

### Step 10: Search Tasks

**GET** `/tasks?search=authentication&priority=high&page=1&limit=10`

Headers:
```
Authorization: Bearer <your_access_token>
```

Expected: Status 200, returns filtered tasks

---

## Advanced Testing

### Filter Tasks by Date Range

**GET** `/tasks?fromDate=2024-01-01&toDate=2024-12-31&status=TODO`

---

### Create Multiple Sample Tasks

Run this multiple times with different data:

**POST** `/tasks`

```json
{
  "title": "Implement Database Indexing",
  "description": "Add proper indexes to improve query performance",
  "priority": "medium",
  "dueDate": "2024-12-25T23:59:59.000Z",
  "tags": ["database", "optimization"]
}
```

```json
{
  "title": "Setup CI/CD Pipeline",
  "description": "Configure automated testing and deployment",
  "priority": "high",
  "dueDate": "2024-12-20T23:59:59.000Z",
  "tags": ["devops", "automation"]
}
```

```json
{
  "title": "Write API Documentation",
  "description": "Document all API endpoints with examples",
  "priority": "low",
  "dueDate": "2025-01-15T23:59:59.000Z",
  "tags": ["documentation"]
}
```

---

### Change Password

**POST** `/auth/change-password`

Headers:
```
Authorization: Bearer <your_access_token>
Content-Type: application/json
```

Body:
```json
{
  "oldPassword": "Admin@123",
  "newPassword": "NewAdmin@123"
}
```

---

### Refresh Token

**POST** `/auth/refresh`

Body:
```json
{
  "refreshToken": "<your_refresh_token>"
}
```

---

### Delete Task (Soft Delete)

**DELETE** `/tasks/<task_id>`

Headers:
```
Authorization: Bearer <your_access_token>
```

Expected: Status 200, task marked as deleted

---

## Admin Operations

### Register Second User (as Manager/User)

**POST** `/auth/register`

```json
{
  "email": "manager@accenture.com",
  "password": "Manager@123",
  "firstName": "Jane",
  "lastName": "Manager"
}
```

---

### Get All Users (Admin Only)

**GET** `/users?page=1&limit=10`

Headers:
```
Authorization: Bearer <admin_access_token>
```

---

### Update User Role (Admin Only)

**PATCH** `/users/<user_id>/role`

Headers:
```
Authorization: Bearer <admin_access_token>
Content-Type: application/json
```

Body:
```json
{
  "role": "manager"
}
```

---

### Deactivate User (Admin Only)

**PATCH** `/users/<user_id>/status`

Headers:
```
Authorization: Bearer <admin_access_token>
Content-Type: application/json
```

Body:
```json
{
  "isActive": false
}
```

---

### Get User Activity

**GET** `/users/<user_id>/activity?page=1&limit=20`

Headers:
```
Authorization: Bearer <your_access_token>
```

---

## Error Testing

### Test Invalid Token

**GET** `/auth/me`

Headers:
```
Authorization: Bearer invalid_token_here
```

Expected: Status 401, error message

---

### Test Missing Required Fields

**POST** `/tasks`

```json
{
  "title": "Missing description"
}
```

Expected: Status 400, validation error

---

### Test Rate Limiting

Make 6 rapid login requests to trigger rate limit:

**POST** `/auth/login` (repeat 6 times quickly)

Expected: Status 429 after 5th request

---

## Testing Checklist

- [ ] User registration works
- [ ] User login returns tokens
- [ ] Protected routes require authentication
- [ ] Task creation works
- [ ] Task listing with pagination works
- [ ] Task filtering works
- [ ] Task search works
- [ ] Task update works
- [ ] Task status change works
- [ ] Task deletion works
- [ ] Task statistics work
- [ ] Admin can manage users
- [ ] Role-based access works
- [ ] Rate limiting works
- [ ] Error handling works properly
- [ ] Validation catches invalid inputs

---

## Sample Test Data Sets

### User Roles Test Set

```json
// Admin
{
  "email": "admin@accenture.com",
  "password": "Admin@123",
  "firstName": "System",
  "lastName": "Admin"
}

// Manager
{
  "email": "manager@accenture.com",
  "password": "Manager@123",
  "firstName": "Project",
  "lastName": "Manager"
}

// Regular User
{
  "email": "user@accenture.com",
  "password": "User@123",
  "firstName": "Regular",
  "lastName": "User"
}
```

### Task Priority Test Set

```json
// Urgent Task
{
  "title": "Production Server Down",
  "description": "Critical: Production server is not responding",
  "priority": "urgent",
  "dueDate": "2024-12-21T23:59:59.000Z"
}

// High Priority
{
  "title": "Security Vulnerability Fix",
  "description": "Fix identified security vulnerabilities",
  "priority": "high",
  "dueDate": "2024-12-25T23:59:59.000Z"
}

// Medium Priority
{
  "title": "Update Documentation",
  "description": "Update API documentation with new endpoints",
  "priority": "medium",
  "dueDate": "2025-01-05T23:59:59.000Z"
}

// Low Priority
{
  "title": "Code Refactoring",
  "description": "Refactor legacy code for better maintainability",
  "priority": "low",
  "dueDate": "2025-01-15T23:59:59.000Z"
}
```

---

## Performance Testing

### Load Testing Scenarios

1. **Concurrent User Logins**: Test 10+ simultaneous login requests
2. **Bulk Task Creation**: Create 50+ tasks rapidly
3. **Large Dataset Pagination**: Query with page=10, limit=100
4. **Complex Filtering**: Combine multiple filters
5. **Full-Text Search**: Search with various keywords

---

## Monitoring Endpoints

### Health Check

**GET** `/health`

No authentication required
Expected: Status 200

```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-12-21T10:30:00.000Z"
}
```

---

## Tips for Testing

1. **Save tokens**: Store access and refresh tokens for reuse
2. **Use environments**: Create Postman environments for different configs
3. **Test edge cases**: Try invalid data, missing fields, wrong types
4. **Check rate limits**: Verify rate limiting works correctly
5. **Monitor logs**: Check server logs for errors
6. **Test permissions**: Verify role-based access control
7. **Clean up**: Delete test data after testing

---

**Happy Testing! 🚀**

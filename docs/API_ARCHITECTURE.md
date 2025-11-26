# API Architecture Overview

**Project:** Agency Payment Tracker — Premium Edition with REST API Backend
**Date:** October 24, 2025
**Updated:** API-Based Architecture (NOT Local Storage)

---

## CRITICAL: API-FIRST ARCHITECTURE

This application uses a **REST API backend** for ALL data operations.

**THERE IS NO LOCAL STORAGE (IndexedDB/localforage)** - all data is stored on the server.

---

## Backend Architecture

### Technology Stack

**Backend:**

- **Node.js + Express + MongoDB** (Official Stack)
- **Mongoose ODM** for data modeling and validation
- **JWT (jsonwebtoken)** for authentication
- **Multer** for file uploads
- **bcryptjs** for password hashing

**Frontend:**

- Vite + React + TypeScript
- Axios for API calls
- TailwindCSS + DaisyUI

### Database Schema

All entities (Projects, Payments, Expenses, Clients, etc.) are stored in **MongoDB** as documents.

**Database:** MongoDB 6.0+ (Local installation or MongoDB Atlas cloud)

**Collections:**

- `users` - User accounts with JWT authentication
- `projects` - Projects with embedded milestones
- `clients` - Client information
- `payments` - Payment transactions (references projects)
- `expenses` - Expense transactions (references projects)
- `sources` - Payment sources
- `categories` - Expense categories
- `reminders` - Notifications and reminders
- `attachments` - File uploads (receipts, invoices)

---

## API Endpoints

### Base URL

```
Development: http://localhost:3001/api
Production: https://api.yourapp.com/api
```

### Authentication

**Method:** JWT (JSON Web Tokens)

**Flow:**

1. POST `/auth/login` → Returns JWT token
2. Include token in all requests: `Authorization: Bearer <token>`
3. POST `/auth/register` → Create new user account
4. POST `/auth/logout` → Invalidate token
5. POST `/auth/refresh` → Refresh expired token

---

## Complete API Endpoints Reference

### Authentication & Users

| Method | Endpoint         | Description               | Auth Required |
| ------ | ---------------- | ------------------------- | ------------- |
| POST   | `/auth/register` | Create new user account   | ❌            |
| POST   | `/auth/login`    | Login (returns JWT token) | ❌            |
| POST   | `/auth/logout`   | Logout (invalidate token) | ✅            |
| POST   | `/auth/refresh`  | Refresh JWT token         | ✅            |
| GET    | `/users/me`      | Get current user profile  | ✅            |
| PATCH  | `/users/me`      | Update user profile       | ✅            |

### Projects

| Method | Endpoint                 | Description                                             | Auth Required |
| ------ | ------------------------ | ------------------------------------------------------- | ------------- |
| GET    | `/projects`              | Get all projects (with filters, sorting, pagination)    | ✅            |
| GET    | `/projects/:id`          | Get single project by ID                                | ✅            |
| POST   | `/projects`              | Create new project                                      | ✅            |
| PATCH  | `/projects/:id`          | Update project                                          | ✅            |
| DELETE | `/projects/:id`          | Delete project                                          | ✅            |
| GET    | `/projects/:id/stats`    | Get calculated project statistics                       | ✅            |
| GET    | `/projects/:id/timeline` | Get project timeline (payments + expenses + milestones) | ✅            |

### Clients

| Method | Endpoint                | Description                           | Auth Required |
| ------ | ----------------------- | ------------------------------------- | ------------- |
| GET    | `/clients`              | Get all clients                       | ✅            |
| GET    | `/clients/:id`          | Get single client                     | ✅            |
| POST   | `/clients`              | Create new client                     | ✅            |
| PATCH  | `/clients/:id`          | Update client                         | ✅            |
| DELETE | `/clients/:id`          | Delete client (fails if has projects) | ✅            |
| GET    | `/clients/:id/stats`    | Get client statistics                 | ✅            |
| GET    | `/clients/:id/projects` | Get all projects for client           | ✅            |

### Payments

| Method | Endpoint                    | Description                     | Auth Required |
| ------ | --------------------------- | ------------------------------- | ------------- |
| GET    | `/payments`                 | Get all payments (with filters) | ✅            |
| GET    | `/payments/:id`             | Get single payment              | ✅            |
| POST   | `/payments`                 | Create new payment              | ✅            |
| PATCH  | `/payments/:id`             | Update payment                  | ✅            |
| DELETE | `/payments/:id`             | Delete payment                  | ✅            |
| POST   | `/payments/:id/attachments` | Upload payment attachment       | ✅            |
| GET    | `/payments/:id/attachments` | Get payment attachments         | ✅            |

### Expenses

| Method | Endpoint                    | Description                     | Auth Required |
| ------ | --------------------------- | ------------------------------- | ------------- |
| GET    | `/expenses`                 | Get all expenses (with filters) | ✅            |
| GET    | `/expenses/:id`             | Get single expense              | ✅            |
| POST   | `/expenses`                 | Create new expense              | ✅            |
| PATCH  | `/expenses/:id`             | Update expense                  | ✅            |
| DELETE | `/expenses/:id`             | Delete expense                  | ✅            |
| POST   | `/expenses/:id/attachments` | Upload expense attachment       | ✅            |
| GET    | `/expenses/:id/attachments` | Get expense attachments         | ✅            |

### Sources (Payment Sources)

| Method | Endpoint       | Description                  | Auth Required |
| ------ | -------------- | ---------------------------- | ------------- |
| GET    | `/sources`     | Get all payment sources      | ✅            |
| GET    | `/sources/:id` | Get single source            | ✅            |
| POST   | `/sources`     | Create new source            | ✅            |
| PATCH  | `/sources/:id` | Update source                | ✅            |
| DELETE | `/sources/:id` | Delete or soft-delete source | ✅            |

### Categories (Expense Categories)

| Method | Endpoint          | Description                    | Auth Required |
| ------ | ----------------- | ------------------------------ | ------------- |
| GET    | `/categories`     | Get all expense categories     | ✅            |
| GET    | `/categories/:id` | Get single category            | ✅            |
| POST   | `/categories`     | Create new category            | ✅            |
| PATCH  | `/categories/:id` | Update category                | ✅            |
| DELETE | `/categories/:id` | Delete or soft-delete category | ✅            |

### Milestones

| Method | Endpoint                          | Description                    | Auth Required |
| ------ | --------------------------------- | ------------------------------ | ------------- |
| GET    | `/projects/:projectId/milestones` | Get all milestones for project | ✅            |
| GET    | `/milestones/:id`                 | Get single milestone           | ✅            |
| POST   | `/projects/:projectId/milestones` | Create new milestone           | ✅            |
| PATCH  | `/milestones/:id`                 | Update milestone               | ✅            |
| DELETE | `/milestones/:id`                 | Delete milestone               | ✅            |

### Reminders/Notifications

| Method | Endpoint         | Description                              | Auth Required |
| ------ | ---------------- | ---------------------------------------- | ------------- |
| GET    | `/reminders`     | Get all reminders (with filters)         | ✅            |
| GET    | `/reminders/:id` | Get single reminder                      | ✅            |
| POST   | `/reminders`     | Create new reminder                      | ✅            |
| PATCH  | `/reminders/:id` | Update reminder (mark as read/dismissed) | ✅            |
| DELETE | `/reminders/:id` | Delete reminder                          | ✅            |

### Dashboard & Analytics

| Method | Endpoint             | Description                             | Auth Required |
| ------ | -------------------- | --------------------------------------- | ------------- |
| GET    | `/dashboard/stats`   | Get dashboard overview statistics       | ✅            |
| GET    | `/analytics/reports` | Get financial reports (with date range) | ✅            |
| GET    | `/analytics/trends`  | Get income/expense trends               | ✅            |

### Settings

| Method | Endpoint    | Description          | Auth Required |
| ------ | ----------- | -------------------- | ------------- |
| GET    | `/settings` | Get user settings    | ✅            |
| PATCH  | `/settings` | Update user settings | ✅            |

### Import/Export

| Method | Endpoint           | Description                | Auth Required |
| ------ | ------------------ | -------------------------- | ------------- |
| POST   | `/import/projects` | Import projects from CSV   | ✅            |
| POST   | `/import/payments` | Import payments from CSV   | ✅            |
| POST   | `/import/expenses` | Import expenses from CSV   | ✅            |
| POST   | `/import/clients`  | Import clients from CSV    | ✅            |
| GET    | `/export/all`      | Export all data (JSON/CSV) | ✅            |
| GET    | `/export/projects` | Export projects only       | ✅            |

### Attachments

| Method | Endpoint           | Description                             | Auth Required |
| ------ | ------------------ | --------------------------------------- | ------------- |
| POST   | `/attachments`     | Upload attachment (multipart/form-data) | ✅            |
| GET    | `/attachments/:id` | Download attachment                     | ✅            |
| DELETE | `/attachments/:id` | Delete attachment                       | ✅            |

---

## Request/Response Formats

### Standard Request Headers

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Standard Response Format

```json
{
  "success": true,
  "data": {
    /* Response data */
  },
  "message": "Operation successful",
  "timestamp": "2025-10-24T10:30:00.000Z"
}
```

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "projectName",
        "message": "Project name is required"
      }
    ]
  },
  "timestamp": "2025-10-24T10:30:00.000Z"
}
```

---

## Query Parameters

### Pagination

```
GET /projects?page=1&pageSize=20
```

### Filtering

```
GET /projects?status=active&clientId=abc123
GET /payments?projectId=xyz789&dateFrom=2025-01-01&dateTo=2025-12-31
```

### Sorting

```
GET /projects?sortBy=totalAmount&sortOrder=desc
```

### Search

```
GET /projects?search=website
```

### Combined

```
GET /projects?status=active&search=design&sortBy=createdAt&sortOrder=desc&page=1&pageSize=20
```

---

## Frontend API Client Setup

### Using Axios (Recommended)

```typescript
// src/utils/apiClient.ts
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - add JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response) => response.data, // Return data directly
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      localStorage.removeItem("authToken");
      window.location.href = "/login";
    }
    return Promise.reject(error.response?.data || error);
  }
);
```

### API Service Example

```typescript
// src/services/projectService.ts
import { apiClient } from "../utils/apiClient";
import {
  Project,
  ProjectInput,
  ProjectFilter,
  PaginationParams,
  SortParams,
} from "../types";

export const projectService = {
  // Get all projects
  async getProjects(
    filter?: ProjectFilter,
    sort?: SortParams,
    pagination?: PaginationParams
  ) {
    const params = new URLSearchParams();

    if (filter?.search) params.append("search", filter.search);
    if (filter?.status) params.append("status", filter.status.join(","));
    if (filter?.clientIds)
      params.append("clientIds", filter.clientIds.join(","));
    if (sort) {
      params.append("sortBy", sort.field);
      params.append("sortOrder", sort.direction);
    }
    if (pagination) {
      params.append("page", String(pagination.page));
      params.append("pageSize", String(pagination.pageSize));
    }

    const response = await apiClient.get<{
      projects: Project[];
      total: number;
    }>(`/projects?${params.toString()}`);
    return response.data;
  },

  // Get single project
  async getProjectById(id: string) {
    const response = await apiClient.get<Project>(`/projects/${id}`);
    return response.data;
  },

  // Create project
  async createProject(data: ProjectInput) {
    const response = await apiClient.post<Project>("/projects", data);
    return response.data;
  },

  // Update project
  async updateProject(id: string, data: Partial<ProjectInput>) {
    const response = await apiClient.patch<Project>(`/projects/${id}`, data);
    return response.data;
  },

  // Delete project
  async deleteProject(id: string) {
    await apiClient.delete(`/projects/${id}`);
  },

  // Get project stats
  async getProjectStats(id: string) {
    const response = await apiClient.get(`/projects/${id}/stats`);
    return response.data;
  },
};
```

---

## Environment Variables

### Frontend (.env)

```
VITE_API_BASE_URL=http://localhost:3001/api
VITE_APP_NAME=Agency Payment Tracker
```

### Backend (.env)

```
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/agency_tracker
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/agency_tracker?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-super-secret-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=3001
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# File Upload Configuration
MAX_FILE_SIZE=5242880
```

---

## Error Codes

| Code               | HTTP Status | Description                                     |
| ------------------ | ----------- | ----------------------------------------------- |
| `VALIDATION_ERROR` | 400         | Request validation failed                       |
| `UNAUTHORIZED`     | 401         | Invalid or missing authentication               |
| `FORBIDDEN`        | 403         | User doesn't have permission                    |
| `NOT_FOUND`        | 404         | Resource not found                              |
| `CONFLICT`         | 409         | Resource already exists or constraint violation |
| `SERVER_ERROR`     | 500         | Internal server error                           |

---

## Backend Setup Guide (Node.js + Express + MongoDB)

See `BACKEND_SETUP.md` for detailed backend implementation instructions.

### Quick Backend Setup

```bash
# Create backend directory
mkdir backend
cd backend

# Initialize Node.js project
npm init -y

# Install dependencies
npm install express mongoose jsonwebtoken bcryptjs cors dotenv multer
npm install --save-dev nodemon typescript @types/node @types/express

# Create basic structure
mkdir src
mkdir src/models src/routes src/controllers src/middleware src/config

# Start MongoDB locally (or use MongoDB Atlas)
mongod --dbpath=/path/to/data
```

---

## Next Steps

1. **Set up Backend Server** - Follow `BACKEND_SETUP.md`
2. **Update Frontend Code** - Replace all local storage calls with API calls
3. **Add Authentication** - Implement login/register screens with JWT
4. **Add Loading States** - Handle async API calls with proper UX
5. **Add Error Handling** - Display API errors to users
6. **Test API Integration** - Verify all CRUD operations work end-to-end

---

**This is the definitive API architecture. All plan documents will reference this.**

# PREMIUM PLAN — Part 2: Complete CRUD Operations (API-Based)

**Project:** Agency Payment Tracker — Premium Edition
**Date:** October 24, 2025
**Architecture:** REST API with MongoDB Backend

---

## Architecture Overview

All CRUD operations are handled through **REST API endpoints**. The frontend uses an **API client** (Axios) to communicate with the backend.

- **Frontend**: React components call API client functions
- **Backend**: Express routes → Controllers → Mongoose models → MongoDB
- **Authentication**: JWT tokens in Authorization headers
- **Error Handling**: Standardized error responses
- **Loading States**: All async operations show loading UI

See `API_ARCHITECTURE.md` for complete endpoint reference.
See `BACKEND_SETUP.md` for MongoDB model implementation.

---

## API Client Setup (Frontend)

Create `src/api/client.ts`:

```typescript
import axios, { AxiosInstance, AxiosError } from "axios";

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3001/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - Add JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("authToken");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

---

## 1. PROJECT CRUD Operations

### CREATE Project

**Function Signature:**

```typescript
createProject(data: ProjectInput): Promise<Project>
```

**Input Type:**

```typescript
type ProjectInput = {
  name: string;
  clientId: string;
  totalAmount: number;
  startDate: string; // ISO date
  endDate: string; // ISO date
  isRecurring?: boolean;
  tags?: string;
  notes?: string;
  milestones?: MilestoneInput[];
};
```

**Validation Steps:**

1. ✅ `name`: Required, min 1 char, max 200 chars, trim whitespace
2. ✅ `clientId`: Required, must exist in clients collection
3. ✅ `totalAmount`: Required, must be > 0, max 10,000,000
4. ✅ `startDate`: Required, valid ISO date
5. ✅ `endDate`: Required, valid ISO date, must be >= startDate
6. ✅ `isRecurring`: Optional, defaults to false
7. ✅ `tags`: Optional, max 500 chars, trim whitespace
8. ✅ `notes`: Optional, max 2000 chars
9. ✅ `milestones`: Optional, if provided validate each milestone

---

#### Backend Implementation

**File: `backend/src/controllers/projectController.ts`**

```typescript
import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { Project } from "../models/Project";
import { Client } from "../models/Client";

export const createProject = async (req: AuthRequest, res: Response) => {
  try {
    const {
      clientId,
      name,
      totalAmount,
      startDate,
      endDate,
      isRecurring,
      tags,
      notes,
      milestones,
    } = req.body;

    // Validation
    const errors: string[] = [];

    if (!name?.trim()) {
      errors.push("Project name is required");
    } else if (name.length > 200) {
      errors.push("Project name must be less than 200 characters");
    }

    if (!clientId) {
      errors.push("Client is required");
    } else {
      // Verify client exists and belongs to user
      const client = await Client.findOne({
        _id: clientId,
        userId: req.user!.id,
      });
      if (!client) {
        errors.push("Selected client does not exist or access denied");
      }
    }

    if (!totalAmount || totalAmount <= 0) {
      errors.push("Total amount must be greater than 0");
    } else if (totalAmount > 10_000_000) {
      errors.push("Total amount cannot exceed $10,000,000");
    }

    if (!startDate) {
      errors.push("Start date is required");
    } else if (isNaN(Date.parse(startDate))) {
      errors.push("Start date is invalid");
    }

    if (!endDate) {
      errors.push("End date is required");
    } else if (isNaN(Date.parse(endDate))) {
      errors.push("End date is invalid");
    } else if (new Date(endDate) < new Date(startDate)) {
      errors.push("End date must be on or after start date");
    }

    if (tags && tags.length > 500) {
      errors.push("Tags must be less than 500 characters");
    }

    if (notes && notes.length > 2000) {
      errors.push("Notes must be less than 2000 characters");
    }

    // Milestone validation
    if (milestones?.length) {
      const milestoneTotal = milestones.reduce(
        (sum: number, m: any) => sum + m.amount,
        0
      );
      if (Math.abs(milestoneTotal - totalAmount) > 0.01) {
        console.warn(
          `Milestone total ($${milestoneTotal}) doesn't match project total ($${totalAmount})`
        );
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: errors.join("; "),
          details: errors.map((msg) => ({ message: msg })),
        },
      });
    }

    // Create project
    const project = await Project.create({
      userId: req.user!.id,
      clientId,
      name: name.trim(),
      totalAmount,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      isRecurring: isRecurring || false,
      status: "active",
      tags: tags
        ? tags
            .split(",")
            .map((t: string) => t.trim())
            .filter(Boolean)
        : [],
      notes: notes?.trim(),
      milestones: milestones || [],
    });

    res.status(201).json({
      success: true,
      data: project,
    });
  } catch (error: any) {
    console.error("Create project error:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: error.message,
      },
    });
  }
};
```

---

#### Frontend Implementation

**File: `frontend/src/api/projects.ts`**

```typescript
import apiClient from "./client";
import { Project, ProjectInput } from "../types";

export const createProject = async (data: ProjectInput): Promise<Project> => {
  try {
    const response = await apiClient.post<{ success: true; data: Project }>(
      "/projects",
      data
    );
    return response.data.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.error?.message || "Failed to create project"
    );
  }
};
```

**API Endpoint:** `POST /api/projects`

**Request Body:**

```json
{
  "name": "Website Redesign",
  "clientId": "507f1f77bcf86cd799439011",
  "totalAmount": 5000,
  "startDate": "2025-01-01",
  "endDate": "2025-03-31",
  "isRecurring": false,
  "tags": "web,design",
  "notes": "Full website redesign project",
  "milestones": [
    {
      "id": "m1",
      "name": "Design Phase",
      "amount": 2000,
      "dueDate": "2025-01-31",
      "status": "pending"
    }
  ]
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "userId": "507f1f77bcf86cd799439010",
    "clientId": "507f1f77bcf86cd799439011",
    "name": "Website Redesign",
    "totalAmount": 5000,
    "startDate": "2025-01-01T00:00:00.000Z",
    "endDate": "2025-03-31T00:00:00.000Z",
    "status": "active",
    "isRecurring": false,
    "tags": ["web", "design"],
    "notes": "Full website redesign project",
    "milestones": [
      {
        "id": "m1",
        "name": "Design Phase",
        "amount": 2000,
        "dueDate": "2025-01-31T00:00:00.000Z",
        "status": "pending"
      }
    ],
    "createdAt": "2025-10-24T12:00:00.000Z",
    "updatedAt": "2025-10-24T12:00:00.000Z"
  }
}
```

**Error Response (400 Bad Request):**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Project name is required; Total amount must be greater than 0",
    "details": [
      { "message": "Project name is required" },
      { "message": "Total amount must be greater than 0" }
    ]
  }
}
```

---

#### React Component Usage

```typescript
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createProject } from "../api/projects";
import { ProjectInput } from "../types";
import toast from "react-hot-toast";

const ProjectForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: ProjectInput) => {
    setLoading(true);
    setError(null);

    try {
      const newProject = await createProject(data);
      toast.success("Project created successfully!");
      navigate(`/projects/${newProject._id}`);
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button type="submit" disabled={loading}>
        {loading ? "Creating..." : "Create Project"}
      </button>
      {error && <div className="alert alert-error">{error}</div>}
    </form>
  );
};
```

---

### READ Projects

**List All Projects (with filters, sorting, pagination)**

**Function Signature:**

```typescript
getProjects(filters?: ProjectFilter, sort?: SortConfig, pagination?: PaginationConfig): Promise<{ projects: Project[], total: number, page: number, pages: number }>
```

**Filter Type:**

```typescript
type ProjectFilter = {
  searchQuery?: string; // Search in name, tags, notes
  status?: string | string[]; // 'active', 'completed', 'archived', 'on-hold'
  clientId?: string; // Filter by client
  startDateFrom?: string; // Projects starting after date
  startDateTo?: string; // Projects starting before date
  endDateFrom?: string; // Projects ending after date
  endDateTo?: string; // Projects ending before date
  isRecurring?: boolean; // Filter recurring projects
  isOverdue?: boolean; // Show only overdue projects
  tags?: string[]; // Filter by tags
};

type SortConfig = {
  field:
    | "name"
    | "totalAmount"
    | "startDate"
    | "endDate"
    | "status"
    | "createdAt";
  direction: "asc" | "desc";
};

type PaginationConfig = {
  page: number; // Current page (1-indexed)
  limit: number; // Items per page
};
```

---

#### Backend Implementation

**File: `backend/src/controllers/projectController.ts`**

```typescript
export const getProjects = async (req: AuthRequest, res: Response) => {
  try {
    const {
      searchQuery,
      status,
      clientId,
      startDateFrom,
      startDateTo,
      endDateFrom,
      endDateTo,
      isRecurring,
      isOverdue,
      tags,
      sortField = "createdAt",
      sortDirection = "desc",
      page = 1,
      limit = 20,
    } = req.query;

    // Build filter
    const filter: any = { userId: req.user!.id };

    // Search query
    if (searchQuery) {
      filter.$or = [
        { name: { $regex: searchQuery, $options: "i" } },
        { tags: { $regex: searchQuery, $options: "i" } },
        { notes: { $regex: searchQuery, $options: "i" } },
      ];
    }

    // Status filter
    if (status) {
      if (Array.isArray(status)) {
        filter.status = { $in: status };
      } else {
        filter.status = status;
      }
    }

    // Client filter
    if (clientId) {
      filter.clientId = clientId;
    }

    // Date filters
    if (startDateFrom || startDateTo) {
      filter.startDate = {};
      if (startDateFrom)
        filter.startDate.$gte = new Date(startDateFrom as string);
      if (startDateTo) filter.startDate.$lte = new Date(startDateTo as string);
    }

    if (endDateFrom || endDateTo) {
      filter.endDate = {};
      if (endDateFrom) filter.endDate.$gte = new Date(endDateFrom as string);
      if (endDateTo) filter.endDate.$lte = new Date(endDateTo as string);
    }

    // Recurring filter
    if (isRecurring !== undefined) {
      filter.isRecurring = isRecurring === "true";
    }

    // Overdue filter
    if (isOverdue === "true") {
      filter.endDate = { $lt: new Date() };
      filter.status = { $ne: "completed" };
    }

    // Tags filter
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      filter.tags = { $in: tagArray };
    }

    // Build sort
    const sort: any = {};
    sort[sortField as string] = sortDirection === "asc" ? 1 : -1;

    // Pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Execute query
    const [projects, total] = await Promise.all([
      Project.find(filter)
        .populate("clientId", "name email company")
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Project.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: projects,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    console.error("Get projects error:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: error.message,
      },
    });
  }
};

export const getProjectById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const project = await Project.findOne({ _id: id, userId: req.user!.id })
      .populate("clientId", "name email company phone")
      .lean();

    if (!project) {
      return res.status(404).json({
        success: false,
        error: {
          code: "PROJECT_NOT_FOUND",
          message: "Project not found",
        },
      });
    }

    res.json({
      success: true,
      data: project,
    });
  } catch (error: any) {
    console.error("Get project by ID error:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: error.message,
      },
    });
  }
};

export const getProjectsByClient = async (req: AuthRequest, res: Response) => {
  try {
    const { clientId } = req.params;

    const projects = await Project.find({
      clientId,
      userId: req.user!.id,
    })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: projects,
    });
  } catch (error: any) {
    console.error("Get projects by client error:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: error.message,
      },
    });
  }
};
```

---

#### Frontend Implementation

**File: `frontend/src/api/projects.ts`**

```typescript
export const getProjects = async (
  filters?: ProjectFilter,
  sort?: SortConfig,
  pagination?: PaginationConfig
): Promise<{
  projects: Project[];
  total: number;
  page: number;
  pages: number;
}> => {
  try {
    const params: any = {};

    // Add filters
    if (filters) {
      if (filters.searchQuery) params.searchQuery = filters.searchQuery;
      if (filters.status) params.status = filters.status;
      if (filters.clientId) params.clientId = filters.clientId;
      if (filters.startDateFrom) params.startDateFrom = filters.startDateFrom;
      if (filters.startDateTo) params.startDateTo = filters.startDateTo;
      if (filters.endDateFrom) params.endDateFrom = filters.endDateFrom;
      if (filters.endDateTo) params.endDateTo = filters.endDateTo;
      if (filters.isRecurring !== undefined)
        params.isRecurring = filters.isRecurring;
      if (filters.isOverdue !== undefined) params.isOverdue = filters.isOverdue;
      if (filters.tags) params.tags = filters.tags;
    }

    // Add sorting
    if (sort) {
      params.sortField = sort.field;
      params.sortDirection = sort.direction;
    }

    // Add pagination
    if (pagination) {
      params.page = pagination.page;
      params.limit = pagination.limit;
    }

    const response = await apiClient.get<{
      success: true;
      data: Project[];
      pagination: { total: number; page: number; pages: number; limit: number };
    }>("/projects", { params });

    return {
      projects: response.data.data,
      total: response.data.pagination.total,
      page: response.data.pagination.page,
      pages: response.data.pagination.pages,
    };
  } catch (error: any) {
    throw new Error(
      error.response?.data?.error?.message || "Failed to fetch projects"
    );
  }
};

export const getProjectById = async (id: string): Promise<Project> => {
  try {
    const response = await apiClient.get<{ success: true; data: Project }>(
      `/projects/${id}`
    );
    return response.data.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.error?.message || "Project not found"
    );
  }
};

export const getProjectsByClient = async (
  clientId: string
): Promise<Project[]> => {
  try {
    const response = await apiClient.get<{ success: true; data: Project[] }>(
      `/projects/client/${clientId}`
    );
    return response.data.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.error?.message || "Failed to fetch projects"
    );
  }
};
```

**API Endpoints:**

- `GET /api/projects` - List all projects with filters
- `GET /api/projects/:id` - Get single project
- `GET /api/projects/client/:clientId` - Get projects by client

**Example Request:**

```
GET /api/projects?status=active&status=on-hold&searchQuery=website&sortField=totalAmount&sortDirection=desc&page=1&limit=10
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "userId": "507f1f77bcf86cd799439010",
      "clientId": {
        "_id": "507f1f77bcf86cd799439011",
        "name": "Acme Corp",
        "email": "contact@acme.com",
        "company": "Acme Corporation"
      },
      "name": "Website Redesign",
      "totalAmount": 5000,
      "startDate": "2025-01-01T00:00:00.000Z",
      "endDate": "2025-03-31T00:00:00.000Z",
      "status": "active",
      "isRecurring": false,
      "tags": ["web", "design"],
      "notes": "Full website redesign project",
      "milestones": [],
      "createdAt": "2025-10-24T12:00:00.000Z",
      "updatedAt": "2025-10-24T12:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "pages": 3
  }
}
```

---

#### React Component Usage

```typescript
import { useState, useEffect } from "react";
import { getProjects } from "../api/projects";
import { Project, ProjectFilter } from "../types";

const ProjectsList = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<ProjectFilter>({
    status: "active",
  });

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const { projects: data, pages } = await getProjects(
          filters,
          { field: "createdAt", direction: "desc" },
          { page, limit: 10 }
        );
        setProjects(data);
        setTotalPages(pages);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [filters, page]);

  const handleFilterChange = (newFilters: Partial<ProjectFilter>) => {
    setFilters({ ...filters, ...newFilters });
    setPage(1); // Reset to first page
  };

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div>
      {/* Filters */}
      <div className="filters">
        <input
          type="text"
          placeholder="Search projects..."
          onChange={(e) => handleFilterChange({ searchQuery: e.target.value })}
        />
        <select
          onChange={(e) => handleFilterChange({ status: e.target.value })}
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Project List */}
      {projects.map((project) => (
        <ProjectCard key={project._id} project={project} />
      ))}

      {/* Pagination */}
      <div className="pagination">
        <button disabled={page === 1} onClick={() => setPage(page - 1)}>
          Previous
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};
```

---

### UPDATE Project

```typescript
export const updateProject = async (
  id: string,
  updates: Partial<ProjectInput>
): Promise<Project> => {
  try {
    const response = await apiClient.patch<{ success: true; data: Project }>(
      `/projects/${id}`,
      updates
    );
    return response.data.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.error?.message || "Failed to update project"
    );
  }
};
```

**API Endpoint:** `PATCH /api/projects/:id`

**Request Body:**

```json
{
  "status": "completed",
  "notes": "Project completed successfully"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    /* Updated project */
  }
}
```

---

### DELETE Project

```typescript
export const deleteProject = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/projects/${id}`);
  } catch (error: any) {
    throw new Error(
      error.response?.data?.error?.message || "Failed to delete project"
    );
  }
};
```

**API Endpoint:** `DELETE /api/projects/:id`

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Project deleted successfully"
}
```

**React Component Usage:**

```typescript
const ProjectCard = ({ project }: { project: Project }) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (
      !confirm(
        "Delete this project? All payments and expenses will be removed."
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      await deleteProject(project._id);
      toast.success("Project deleted successfully");
      // Refresh list or navigate away
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="project-card">
      {/* Project details */}
      <button onClick={handleDelete} disabled={loading}>
        {loading ? "Deleting..." : "Delete"}
      </button>
    </div>
  );
};
```

---

## 2. PAYMENT CRUD Operations

### CREATE Payment

```typescript
export const createPayment = async (data: PaymentInput): Promise<Payment> => {
  try {
    const response = await apiClient.post<{ success: true; data: Payment }>(
      "/payments",
      data
    );
    return response.data.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.error?.message || "Failed to create payment"
    );
  }
};
```

**API Endpoint:** `POST /api/payments`

**Request Body:**

```json
{
  "projectId": "507f1f77bcf86cd799439012",
  "sourceId": "507f1f77bcf86cd799439013",
  "amount": 1000,
  "date": "2025-01-15",
  "reference": "INV-001",
  "notes": "First milestone payment",
  "milestoneId": "507f1f77bcf86cd799439014"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439015",
    "userId": "507f1f77bcf86cd799439010",
    "projectId": "507f1f77bcf86cd799439012",
    "sourceId": "507f1f77bcf86cd799439013",
    "amount": 1000,
    "date": "2025-01-15T00:00:00.000Z",
    "reference": "INV-001",
    "notes": "First milestone payment",
    "isDisputed": false,
    "attachments": [],
    "createdAt": "2025-10-24T12:00:00.000Z",
    "updatedAt": "2025-10-24T12:00:00.000Z"
  }
}
```

### READ Payments

```typescript
export const getPayments = async (filters?: {
  projectId?: string;
  startDate?: string;
  endDate?: string;
}): Promise<Payment[]> => {
  try {
    const response = await apiClient.get<{ success: true; data: Payment[] }>(
      "/payments",
      {
        params: filters,
      }
    );
    return response.data.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.error?.message || "Failed to fetch payments"
    );
  }
};

export const getPaymentById = async (id: string): Promise<Payment> => {
  try {
    const response = await apiClient.get<{ success: true; data: Payment }>(
      `/payments/${id}`
    );
    return response.data.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.error?.message || "Payment not found"
    );
  }
};
```

**API Endpoint:** `GET /api/payments?projectId=xxx&startDate=2025-01-01`

### UPDATE Payment

```typescript
export const updatePayment = async (
  id: string,
  updates: Partial<PaymentInput>
): Promise<Payment> => {
  try {
    const response = await apiClient.patch<{ success: true; data: Payment }>(
      `/payments/${id}`,
      updates
    );
    return response.data.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.error?.message || "Failed to update payment"
    );
  }
};
```

**API Endpoint:** `PATCH /api/payments/:id`

### DELETE Payment

```typescript
export const deletePayment = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/payments/${id}`);
  } catch (error: any) {
    throw new Error(
      error.response?.data?.error?.message || "Failed to delete payment"
    );
  }
};
```

**API Endpoint:** `DELETE /api/payments/:id`

---

## 3. CLIENT CRUD Operations

### CREATE Client

```typescript
export const createClient = async (data: ClientInput): Promise<Client> => {
  try {
    const response = await apiClient.post<{ success: true; data: Client }>(
      "/clients",
      data
    );
    return response.data.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.error?.message || "Failed to create client"
    );
  }
};
```

**API Endpoint:** `POST /api/clients`

### READ Clients

```typescript
export const getClients = async (): Promise<Client[]> => {
  try {
    const response = await apiClient.get<{ success: true; data: Client[] }>(
      "/clients"
    );
    return response.data.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.error?.message || "Failed to fetch clients"
    );
  }
};

export const getClientById = async (id: string): Promise<Client> => {
  try {
    const response = await apiClient.get<{ success: true; data: Client }>(
      `/clients/${id}`
    );
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error?.message || "Client not found");
  }
};
```

### UPDATE Client

```typescript
export const updateClient = async (
  id: string,
  updates: Partial<ClientInput>
): Promise<Client> => {
  try {
    const response = await apiClient.patch<{ success: true; data: Client }>(
      `/clients/${id}`,
      updates
    );
    return response.data.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.error?.message || "Failed to update client"
    );
  }
};
```

### DELETE Client

```typescript
export const deleteClient = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/clients/${id}`);
  } catch (error: any) {
    throw new Error(
      error.response?.data?.error?.message || "Failed to delete client"
    );
  }
};
```

---

## 4. EXPENSE CRUD Operations

### CREATE Expense

```typescript
export const createExpense = async (data: ExpenseInput): Promise<Expense> => {
  try {
    const response = await apiClient.post<{ success: true; data: Expense }>(
      "/expenses",
      data
    );
    return response.data.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.error?.message || "Failed to create expense"
    );
  }
};
```

**API Endpoint:** `POST /api/expenses`

### READ Expenses

```typescript
export const getExpenses = async (filters?: {
  projectId?: string;
  categoryId?: string;
  startDate?: string;
  endDate?: string;
}): Promise<Expense[]> => {
  try {
    const response = await apiClient.get<{ success: true; data: Expense[] }>(
      "/expenses",
      {
        params: filters,
      }
    );
    return response.data.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.error?.message || "Failed to fetch expenses"
    );
  }
};
```

### UPDATE Expense

```typescript
export const updateExpense = async (
  id: string,
  updates: Partial<ExpenseInput>
): Promise<Expense> => {
  try {
    const response = await apiClient.patch<{ success: true; data: Expense }>(
      `/expenses/${id}`,
      updates
    );
    return response.data.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.error?.message || "Failed to update expense"
    );
  }
};
```

### DELETE Expense

```typescript
export const deleteExpense = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/expenses/${id}`);
  } catch (error: any) {
    throw new Error(
      error.response?.data?.error?.message || "Failed to delete expense"
    );
  }
};
```

---

## 5. SOURCE & CATEGORY Operations

### Sources (Income Sources)

```typescript
export const getSources = async (): Promise<Source[]> => {
  try {
    const response = await apiClient.get<{ success: true; data: Source[] }>(
      "/sources"
    );
    return response.data.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.error?.message || "Failed to fetch sources"
    );
  }
};

export const createSource = async (data: { name: string }): Promise<Source> => {
  try {
    const response = await apiClient.post<{ success: true; data: Source }>(
      "/sources",
      data
    );
    return response.data.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.error?.message || "Failed to create source"
    );
  }
};

export const updateSource = async (
  id: string,
  updates: { name?: string; isActive?: boolean }
): Promise<Source> => {
  try {
    const response = await apiClient.patch<{ success: true; data: Source }>(
      `/sources/${id}`,
      updates
    );
    return response.data.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.error?.message || "Failed to update source"
    );
  }
};

export const deleteSource = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/sources/${id}`);
  } catch (error: any) {
    throw new Error(
      error.response?.data?.error?.message || "Failed to delete source"
    );
  }
};
```

### Categories (Expense Categories)

```typescript
export const getCategories = async (): Promise<Category[]> => {
  try {
    const response = await apiClient.get<{ success: true; data: Category[] }>(
      "/categories"
    );
    return response.data.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.error?.message || "Failed to fetch categories"
    );
  }
};

export const createCategory = async (data: {
  name: string;
}): Promise<Category> => {
  try {
    const response = await apiClient.post<{ success: true; data: Category }>(
      "/categories",
      data
    );
    return response.data.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.error?.message || "Failed to create category"
    );
  }
};

export const updateCategory = async (
  id: string,
  updates: { name?: string; isActive?: boolean }
): Promise<Category> => {
  try {
    const response = await apiClient.patch<{ success: true; data: Category }>(
      `/categories/${id}`,
      updates
    );
    return response.data.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.error?.message || "Failed to update category"
    );
  }
};

export const deleteCategory = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/categories/${id}`);
  } catch (error: any) {
    throw new Error(
      error.response?.data?.error?.message || "Failed to delete category"
    );
  }
};
```

---

## 6. FILE UPLOAD Operations

### Upload Attachment

```typescript
export const uploadAttachment = async (
  file: File,
  metadata: {
    entityType: "payment" | "expense";
    entityId: string;
  }
): Promise<Attachment> => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("entityType", metadata.entityType);
    formData.append("entityId", metadata.entityId);

    const response = await apiClient.post<{ success: true; data: Attachment }>(
      "/attachments/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.error?.message || "Failed to upload file"
    );
  }
};
```

**React Component Usage:**

```typescript
const AttachmentUpload = ({ paymentId }: { paymentId: string }) => {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const attachment = await uploadAttachment(file, {
        entityType: "payment",
        entityId: paymentId,
      });
      toast.success("File uploaded successfully");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <input
      type="file"
      onChange={handleFileChange}
      disabled={uploading}
      accept="image/*,.pdf"
    />
  );
};
```

---

## 7. Error Handling Patterns

### Standardized Error Response

All API errors follow this format:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "totalAmount",
        "message": "Amount must be greater than 0"
      }
    ]
  }
}
```

### Frontend Error Handling

```typescript
const handleApiError = (error: any): string => {
  if (error.response?.data?.error) {
    const apiError = error.response.data.error;

    // Validation errors with details
    if (apiError.details && apiError.details.length > 0) {
      return apiError.details
        .map((d: any) => `${d.field}: ${d.message}`)
        .join(", ");
    }

    // Generic API error
    return apiError.message;
  }

  // Network error
  if (error.code === "ECONNABORTED") {
    return "Request timeout. Please try again.";
  }

  if (!error.response) {
    return "Network error. Please check your connection.";
  }

  // Default
  return "An unexpected error occurred";
};
```

---

## 8. Loading State Patterns

### React Query Integration (Recommended)

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const useProjects = () => {
  return useQuery({
    queryKey: ["projects"],
    queryFn: () => getProjects(),
  });
};

const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project created successfully");
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });
};

// Component usage
const ProjectsList = () => {
  const { data: projects, isLoading, error } = useProjects();
  const createMutation = useCreateProject();

  if (isLoading) return <LoadingSkeleton />;
  if (error) return <ErrorMessage message={error.message} />;

  return (
    <div>
      {projects?.map((project) => (
        <ProjectCard key={project._id} project={project} />
      ))}
    </div>
  );
};
```

---

## Summary

**All data operations are now API-based:**

- ✅ No localforage or IndexedDB
- ✅ All CRUD operations use REST endpoints
- ✅ JWT authentication on all requests
- ✅ Standardized error handling
- ✅ Loading states for all async operations
- ✅ File uploads via multipart/form-data

**Next Steps:**

1. Implement backend routes and controllers
2. Set up MongoDB models (see BACKEND_SETUP.md)
3. Create API client functions in frontend
4. Update all React components to use API functions
5. Add React Query for caching and optimistic updates

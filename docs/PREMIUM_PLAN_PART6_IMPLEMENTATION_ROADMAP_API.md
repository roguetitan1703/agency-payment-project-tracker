# PREMIUM PLAN — Part 6: Implementation Roadmap (API-Based Architecture)

**Project:** Agency Payment Tracker — Premium Edition
**Date:** October 24, 2025
**Architecture:** REST API + MongoDB Backend + React Frontend
**Target Executor:** AI Agent (autonomous implementation)

---

## OVERVIEW FOR AI AGENT

This roadmap implements a **full-stack application** with:

- **Backend**: Node.js + Express + MongoDB + Mongoose + JWT authentication
- **Frontend**: Vite + React + TypeScript + TailwindCSS + DaisyUI
- **API Communication**: Axios with JWT interceptors

### Critical Rules for AI Agent:

1. **Execute phases sequentially** - Backend FIRST, then Frontend
2. **Test backend endpoints** before building frontend features
3. **Use provided MongoDB models** - Don't create your own schemas
4. **Follow API contract** - Use exact endpoint paths from API_ARCHITECTURE.md
5. **JWT authentication required** - All API requests need Authorization header
6. **No local storage for data** - Only use localStorage for auth token

---

## PHASE 0: Backend Setup (MongoDB + Express)

**Time Estimate:** 2-3 hours
**Dependencies:** Node.js 18+, MongoDB 6.0+

### Step 0.1: Create Backend Directory Structure

```powershell
# Navigate to project root
cd d:\Work\Projects\Ongoing\agency-payment-project-tracker

# Create backend directory
mkdir backend
cd backend

# Initialize Node.js project
npm init -y
```

**Update `package.json`:**

```json
{
  "name": "agency-payment-tracker-backend",
  "version": "1.0.0",
  "description": "REST API for Agency Payment Tracker",
  "main": "dist/server.js",
  "scripts": {
    "dev": "nodemon --exec ts-node src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js"
  }
}
```

---

### Step 0.2: Install Backend Dependencies

```powershell
# Core dependencies
npm install express mongoose cors dotenv

# Authentication
npm install jsonwebtoken bcryptjs

# File uploads
npm install multer

# Validation
npm install express-validator

# Dev dependencies
npm install --save-dev nodemon typescript @types/node @types/express @types/cors @types/bcryptjs @types/jsonwebtoken @types/multer ts-node
```

---

### Step 0.3: Configure TypeScript

```powershell
npx tsc --init
```

**Edit `tsconfig.json`:**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

---

### Step 0.4: Create Project Structure

```powershell
# Create directories
mkdir src, src\config, src\models, src\routes, src\controllers, src\middleware, src\utils, uploads

# Create files
New-Item src\server.ts, src\app.ts, src\config\database.ts, .env, .gitignore
```

---

### Step 0.5: Configure Environment Variables

**File: `backend\.env`**

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/agency_tracker
# OR for Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/agency_tracker

# JWT
JWT_SECRET=your-super-secret-key-change-in-production-1234567890
JWT_EXPIRES_IN=7d

# Server
PORT=3001
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:5173

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_DIR=./uploads
```

**File: `backend\.gitignore`**

```
node_modules/
dist/
.env
uploads/
*.log
.DS_Store
```

---

### Step 0.6: Set Up MongoDB Connection

**See `BACKEND_SETUP.md` for complete implementation.**

**File: `backend\src\config\database.ts`** - Copy from BACKEND_SETUP.md

---

### Step 0.7: Create Mongoose Models

**Copy these files from `BACKEND_SETUP.md`:**

1. `backend\src\models\User.ts` - User model with bcrypt
2. `backend\src\models\Client.ts` - Client model
3. `backend\src\models\Project.ts` - Project model with milestones
4. `backend\src\models\Payment.ts` - Payment model
5. `backend\src\models\Expense.ts` - Expense model
6. `backend\src\models\Source.ts` - Source model
7. `backend\src\models\Category.ts` - Category model

---

### Step 0.8: Create Express App

**File: `backend\src\app.ts`** - Copy from BACKEND_SETUP.md

**File: `backend\src\server.ts`** - Copy from BACKEND_SETUP.md

---

### Step 0.9: Start MongoDB and Test Backend

```powershell
# Start MongoDB (if local)
mongod --dbpath="C:\data\db"

# In another terminal, start backend
cd backend
npm run dev
```

**Expected Output:**

```
✅ MongoDB connected successfully
📊 Database: agency_tracker
🚀 Server running on http://localhost:3001
```

**Test Health Endpoint:**

```powershell
# Using PowerShell
Invoke-RestMethod -Uri http://localhost:3001/health
```

**Expected Response:**

```json
{
  "status": "OK",
  "message": "Agency Payment Tracker API",
  "timestamp": "2025-10-24T12:00:00.000Z"
}
```

**✅ Verification:** Backend server running, MongoDB connected

---

## PHASE 1: Authentication System

**Time Estimate:** 2 hours
**Dependencies:** Phase 0 complete

### Step 1.1: Create Auth Middleware

**File: `backend\src\middleware\auth.ts`**

```typescript
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "No token provided",
        },
      });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "User not found",
        },
      });
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: {
        code: "INVALID_TOKEN",
        message: "Invalid or expired token",
      },
    });
  }
};
```

---

### Step 1.2: Create Auth Controller

**File: `backend\src\controllers\authController.ts`**

```typescript
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User";

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: {
          code: "USER_EXISTS",
          message: "Email already registered",
        },
      });
    }

    // Create user
    const user = await User.create({ email, password, name });

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
        },
        token,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: error.message,
      },
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: "INVALID_CREDENTIALS",
          message: "Invalid email or password",
        },
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: {
          code: "INVALID_CREDENTIALS",
          message: "Invalid email or password",
        },
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
        },
        token,
      },
    });
  } catch (error: any) {
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

### Step 1.3: Create Auth Routes

**File: `backend\src\routes\authRoutes.ts`**

```typescript
import { Router } from "express";
import { register, login } from "../controllers/authController";

const router = Router();

router.post("/register", register);
router.post("/login", login);

export default router;
```

---

### Step 1.4: Add Auth Routes to App

**Edit `backend\src\app.ts`** - Add after middleware setup:

```typescript
import authRoutes from "./routes/authRoutes";

// API routes
app.use("/api/auth", authRoutes);
```

---

### Step 1.5: Test Authentication

**Restart backend:**

```powershell
npm run dev
```

**Test Registration:**

```powershell
$body = @{
    email = "test@example.com"
    password = "password123"
    name = "Test User"
} | ConvertTo-Json

Invoke-RestMethod -Uri http://localhost:3001/api/auth/register -Method POST -Body $body -ContentType "application/json"
```

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "test@example.com",
      "name": "Test User"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Test Login:**

```powershell
$body = @{
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

Invoke-RestMethod -Uri http://localhost:3001/api/auth/login -Method POST -Body $body -ContentType "application/json"
```

**✅ Verification:** Both register and login return JWT tokens

---

## PHASE 2: Backend CRUD Endpoints

**Time Estimate:** 4-5 hours
**Dependencies:** Phase 1 complete

### Step 2.1: Create Project Controller

**File: `backend\src\controllers\projectController.ts`**

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

    // Verify client exists and belongs to user
    const client = await Client.findOne({
      _id: clientId,
      userId: req.user!.id,
    });
    if (!client) {
      return res.status(404).json({
        success: false,
        error: {
          code: "CLIENT_NOT_FOUND",
          message: "Client not found or access denied",
        },
      });
    }

    // Create project
    const project = await Project.create({
      userId: req.user!.id,
      clientId,
      name,
      totalAmount,
      startDate,
      endDate,
      isRecurring: isRecurring || false,
      tags: tags ? tags.split(",").map((t: string) => t.trim()) : [],
      notes,
      milestones,
    });

    res.status(201).json({
      success: true,
      data: project,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: error.message,
      },
    });
  }
};

export const getProjects = async (req: AuthRequest, res: Response) => {
  try {
    const { status, clientId, startDate, endDate } = req.query;

    const filter: any = { userId: req.user!.id };

    if (status) filter.status = status;
    if (clientId) filter.clientId = clientId;
    if (startDate || endDate) {
      filter.startDate = {};
      if (startDate) filter.startDate.$gte = new Date(startDate as string);
      if (endDate) filter.startDate.$lte = new Date(endDate as string);
    }

    const projects = await Project.find(filter)
      .populate("clientId", "name email company")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: projects,
    });
  } catch (error: any) {
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

    const project = await Project.findOne({
      _id: id,
      userId: req.user!.id,
    }).populate("clientId", "name email company");

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
    res.status(500).json({
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: error.message,
      },
    });
  }
};

export const updateProject = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const project = await Project.findOneAndUpdate(
      { _id: id, userId: req.user!.id },
      { $set: updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

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
    res.status(500).json({
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: error.message,
      },
    });
  }
};

export const deleteProject = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const project = await Project.findOneAndDelete({
      _id: id,
      userId: req.user!.id,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        error: {
          code: "PROJECT_NOT_FOUND",
          message: "Project not found",
        },
      });
    }

    // TODO: Also delete related payments, expenses

    res.json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error: any) {
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

### Step 2.2: Create Project Routes

**File: `backend\src\routes\projectRoutes.ts`**

```typescript
import { Router } from "express";
import { authenticate } from "../middleware/auth";
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
} from "../controllers/projectController";

const router = Router();

// All routes require authentication
router.use(authenticate);

router.post("/", createProject);
router.get("/", getProjects);
router.get("/:id", getProjectById);
router.patch("/:id", updateProject);
router.delete("/:id", deleteProject);

export default router;
```

---

### Step 2.3: Add Project Routes to App

**Edit `backend\src\app.ts`:**

```typescript
import projectRoutes from "./routes/projectRoutes";

app.use("/api/projects", projectRoutes);
```

---

### Step 2.4: Create Client, Payment, Expense Controllers

**Repeat similar pattern for:**

- `backend\src\controllers\clientController.ts`
- `backend\src\controllers\paymentController.ts`
- `backend\src\controllers\expenseController.ts`
- `backend\src\controllers\sourceController.ts`
- `backend\src\controllers\categoryController.ts`

**And corresponding routes in `backend\src\routes\`**

**Add all routes to `backend\src\app.ts`:**

```typescript
import clientRoutes from "./routes/clientRoutes";
import paymentRoutes from "./routes/paymentRoutes";
import expenseRoutes from "./routes/expenseRoutes";
import sourceRoutes from "./routes/sourceRoutes";
import categoryRoutes from "./routes/categoryRoutes";

app.use("/api/clients", clientRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/sources", sourceRoutes);
app.use("/api/categories", categoryRoutes);
```

---

### Step 2.5: Test Backend CRUD

**Test Create Client:**

```powershell
$token = "YOUR_JWT_TOKEN_FROM_LOGIN"

$headers = @{
    "Authorization" = "Bearer $token"
}

$body = @{
    name = "Acme Corp"
    email = "contact@acme.com"
    company = "Acme Corporation"
} | ConvertTo-Json

Invoke-RestMethod -Uri http://localhost:3001/api/clients -Method POST -Headers $headers -Body $body -ContentType "application/json"
```

**Test Create Project:**

```powershell
$body = @{
    name = "Website Redesign"
    clientId = "CLIENT_ID_FROM_PREVIOUS_STEP"
    totalAmount = 5000
    startDate = "2025-01-01"
    endDate = "2025-03-31"
} | ConvertTo-Json

Invoke-RestMethod -Uri http://localhost:3001/api/projects -Method POST -Headers $headers -Body $body -ContentType "application/json"
```

**✅ Verification:** All CRUD endpoints working, JWT authentication required

---

## PHASE 3: Frontend Setup (Vite + React)

**Time Estimate:** 1 hour
**Dependencies:** Phase 0-2 complete (backend running)

### Step 3.1: Initialize Frontend

```powershell
# Navigate to project root
cd d:\Work\Projects\Ongoing\agency-payment-project-tracker

# Create Vite project (select React + TypeScript)
npm create vite@latest frontend -- --template react-ts

cd frontend

# Install dependencies
npm install
```

---

### Step 3.2: Install Frontend Dependencies

```powershell
# UI libraries
npm install daisyui

# API client
npm install axios

# State management & data fetching
npm install @tanstack/react-query

# Routing
npm install react-router-dom

# Form handling
npm install react-hook-form

# Icons
npm install lucide-react

# Date handling
npm install date-fns

# Notifications
npm install react-hot-toast

# CSV export
npm install papaparse
npm install --save-dev @types/papaparse
```

---

### Step 3.3: Configure TailwindCSS + DaisyUI

```powershell
npx tailwindcss init -p
```

**Edit `frontend\tailwind.config.js` (COMPLETE FILE):**

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
        "glass-lg": "0 8px 32px 0 rgba(31, 38, 135, 0.5)",
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        darkCrystal: {
          primary: "#a855f7", // Purple
          "primary-content": "#ffffff",
          secondary: "#ec4899", // Pink
          "secondary-content": "#ffffff",
          accent: "#8b5cf6", // Violet
          "accent-content": "#ffffff",
          neutral: "#1e293b", // Slate 800
          "neutral-content": "#e2e8f0",
          "base-100": "#0f172a", // Slate 900 (background)
          "base-200": "#1e293b", // Slate 800
          "base-300": "#334155", // Slate 700
          "base-content": "#f1f5f9", // Slate 100 (text)
          info: "#3b82f6", // Blue
          success: "#10b981", // Green
          warning: "#f59e0b", // Amber
          error: "#ef4444", // Red
        },
      },
    ],
  },
};
```

**Edit `frontend\src\index.css` (COMPLETE FILE):**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Global Glassmorphism Styles */
@layer components {
  .glass-premium {
    @apply bg-base-100/30 backdrop-blur-xl border border-white/10;
  }

  .glass-hover {
    @apply glass-premium transition-all duration-300 hover:bg-base-100/40 hover:border-white/20 hover:shadow-glass-lg;
  }

  .gradient-text {
    @apply bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent;
  }

  .gradient-animated {
    background: linear-gradient(90deg, #a855f7, #ec4899, #8b5cf6, #a855f7);
    background-size: 300% 300%;
    animation: gradient 6s ease infinite;
  }

  @keyframes gradient {
    0%,
    100% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
  }
}

/* Custom Scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  @apply bg-base-200;
}

::-webkit-scrollbar-thumb {
  @apply bg-base-300 rounded-lg;
}

::-webkit-scrollbar-thumb:hover {
  @apply bg-primary;
}

/* Loading Skeleton */
.skeleton {
  @apply animate-pulse bg-base-300 rounded;
}

/* Card Styles */
.card-premium {
  @apply glass-premium rounded-2xl p-6 shadow-glass;
}
```

---

### Step 3.4: Create API Client

**File: `frontend\src\api\client.ts`**

```typescript
import axios, { AxiosInstance, AxiosError } from "axios";

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
  (error) => Promise.reject(error)
);

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("authToken");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

---

### Step 3.5: Create Environment Variables

**File: `frontend\.env`**

```env
VITE_API_URL=http://localhost:3001/api
```

---

### Step 3.6: Create Utility Functions

**File: `frontend\src\utils\formatters.ts`**

```typescript
// Currency formatting
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Date formatting
export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatDateShort = (date: string | Date): string => {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

// Relative time
export const formatRelativeTime = (date: string | Date): string => {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
};

// Calculate days remaining
export const daysRemaining = (endDate: string | Date): number => {
  const now = new Date();
  const end = new Date(endDate);
  const diffMs = end.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
};

// Check if date is overdue
export const isOverdue = (endDate: string | Date): boolean => {
  return new Date(endDate) < new Date();
};

// Percentage formatting
export const formatPercentage = (value: number): string => {
  return `${Math.round(value)}%`;
};

// Truncate text
export const truncate = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};
```

**File: `frontend\src\utils\validation.ts`**

```typescript
// Email validation
export const isValidEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

// Date validation
export const isValidDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

// Amount validation
export const isValidAmount = (amount: number): boolean => {
  return amount > 0 && amount <= 10_000_000;
};

// Date range validation
export const isValidDateRange = (
  startDate: string,
  endDate: string
): boolean => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return end >= start;
};
```

**File: `frontend\src\utils\calculations.ts`**

```typescript
import { Project, Payment, Expense } from "../types";

// Calculate project statistics
export const calculateProjectStats = (
  project: Project,
  payments: Payment[],
  expenses: Expense[]
) => {
  const totalReceived = payments
    .filter((p) => p.projectId === project._id)
    .reduce((sum, p) => sum + p.amount, 0);

  const totalExpenses = expenses
    .filter((e) => e.projectId === project._id)
    .reduce((sum, e) => sum + e.amount, 0);

  const remaining = project.totalAmount - totalReceived;
  const progress =
    project.totalAmount > 0
      ? Math.min((totalReceived / project.totalAmount) * 100, 100)
      : 0;

  const netProfit = totalReceived - totalExpenses;
  const isCompleted = remaining <= 0;
  const isOverdue = new Date(project.endDate) < new Date() && remaining > 0;

  return {
    totalReceived,
    totalExpenses,
    remaining,
    progress,
    netProfit,
    isCompleted,
    isOverdue,
  };
};
```

---

### Step 3.7: Create TypeScript Types

**File: `frontend\src\types\index.ts`**

```typescript
// Base entity types
export interface Client {
  _id: string;
  userId: string;
  name: string;
  email?: string;
  company?: string;
  phone?: string;
  isRecurring: boolean;
  notes?: string;
  tags?: string[];
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  _id: string;
  userId: string;
  clientId: string | Client;
  name: string;
  totalAmount: number;
  startDate: string;
  endDate: string;
  status: "active" | "completed" | "archived" | "on-hold";
  isRecurring: boolean;
  tags?: string[];
  notes?: string;
  milestones?: Milestone[];
  createdAt: string;
  updatedAt: string;
}

export interface Milestone {
  id: string;
  name: string;
  amount: number;
  dueDate?: string;
  status: "pending" | "in-progress" | "completed";
  completedAt?: string;
}

export interface Payment {
  _id: string;
  userId: string;
  projectId: string | Project;
  sourceId: string | Source;
  amount: number;
  date: string;
  reference?: string;
  notes?: string;
  isDisputed: boolean;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  _id: string;
  userId: string;
  projectId?: string | Project;
  categoryId: string | Category;
  amount: number;
  date: string;
  description: string;
  notes?: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Source {
  _id: string;
  userId: string;
  name: string;
  type: "income";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  _id: string;
  userId: string;
  name: string;
  type: "expense";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Input types (for create/update operations)
export type ClientInput = Omit<
  Client,
  "_id" | "userId" | "createdAt" | "updatedAt"
>;
export type ProjectInput = Omit<
  Project,
  "_id" | "userId" | "createdAt" | "updatedAt"
>;
export type PaymentInput = Omit<
  Payment,
  "_id" | "userId" | "createdAt" | "updatedAt"
>;
export type ExpenseInput = Omit<
  Expense,
  "_id" | "userId" | "createdAt" | "updatedAt"
>;

// Filter types
export interface ProjectFilter {
  searchQuery?: string;
  status?: string | string[];
  clientId?: string;
  startDateFrom?: string;
  startDateTo?: string;
  endDateFrom?: string;
  endDateTo?: string;
  isRecurring?: boolean;
  isOverdue?: boolean;
  tags?: string[];
}

export interface PaymentFilter {
  projectId?: string;
  sourceId?: string;
  startDate?: string;
  endDate?: string;
  isDisputed?: boolean;
}

export interface ExpenseFilter {
  projectId?: string;
  categoryId?: string;
  startDate?: string;
  endDate?: string;
}

// Sort configuration
export interface SortConfig {
  field: string;
  direction: "asc" | "desc";
}

// Pagination configuration
export interface PaginationConfig {
  page: number;
  limit: number;
}

// Dashboard statistics
export interface DashboardStats {
  totalBilled: number;
  totalReceived: number;
  totalExpenses: number;
  outstanding: number;
  netProfit: number;
  projectCounts: {
    active: number;
    completed: number;
    archived: number;
    overdue: number;
  };
  recentPayments: Payment[];
  recentExpenses: Expense[];
}

// Authentication
export interface User {
  _id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
}
```

---

### Step 3.8: Test Frontend Dev Server

```powershell
npm run dev
```

**Expected Output:**

```
VITE v5.0.0  ready in 500 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

**✅ Verification:** Frontend running on localhost:5173

---

## PHASE 4-10: Feature Implementation

**Continue with:**

- Phase 4: Auth UI (Login/Register screens)
- Phase 5: Dashboard UI
- Phase 6: Projects CRUD UI
- Phase 7: Payments/Expenses UI
- Phase 8: Analytics & Reports
- Phase 9: Settings & Categories
- Phase 10: File Uploads & Attachments

**See individual screen specifications in:**

- `PREMIUM_PLAN_PART5A_SCREENS.md`
- `PREMIUM_PLAN_PART5B_MODALS.md`
- `PREMIUM_PLAN_PART5C_SETTINGS_FEATURES.md`

**See API endpoint details in:**

- `API_ARCHITECTURE.md`

**See backend implementation guide in:**

- `BACKEND_SETUP.md`

---

## Summary

**Key Changes from Original Plan:**

✅ **Phase 0 added** - Backend setup with MongoDB + Express
✅ **No localforage/IndexedDB** - All data via REST API
✅ **JWT Authentication** - Required for all API requests
✅ **Backend-first approach** - Build and test API before UI
✅ **MongoDB models** - Using Mongoose ODM
✅ **API client setup** - Axios with interceptors
✅ **Sequential testing** - Test each endpoint before moving forward

**Critical Success Factors:**

1. Backend MUST be fully functional before building frontend
2. All API endpoints tested with Postman/PowerShell
3. JWT authentication working correctly
4. MongoDB properly connected and seeded with test data
5. Frontend API client configured with correct base URL

**Next Steps:**

Continue with Phase 4-10 to implement all screens and features using the API endpoints created in Phase 2.

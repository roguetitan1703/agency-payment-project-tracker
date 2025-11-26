# Backend Setup Guide - MongoDB + Node.js + Express

**Project:** Agency Payment Tracker — Premium Edition
**Date:** October 24, 2025
**Stack:** Node.js + Express + MongoDB + Mongoose + JWT

---

## Prerequisites

- Node.js 18+ installed
- MongoDB 6.0+ installed locally OR MongoDB Atlas account
- npm or pnpm package manager

---

## Step 1: Install MongoDB

### Option A: Local MongoDB Installation

**Windows:**

```powershell
# Download MongoDB Community Server from:
# https://www.mongodb.com/try/download/community

# Install MongoDB
# Default installation path: C:\Program Files\MongoDB\Server\6.0\

# Add to PATH (PowerShell as Admin):
$env:Path += ";C:\Program Files\MongoDB\Server\6.0\bin"

# Create data directory
mkdir C:\data\db

# Start MongoDB server
mongod --dbpath="C:\data\db"

# In another terminal, verify MongoDB is running:
mongosh
```

**macOS:**

```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community@6.0
brew services start mongodb-community@6.0

# Verify
mongosh
```

**Linux:**

```bash
# Ubuntu/Debian
sudo apt-get install mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Verify
mongosh
```

### Option B: MongoDB Atlas (Cloud)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create cluster (Free tier available)
4. Get connection string:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/agency_tracker?retryWrites=true&w=majority
   ```

---

## Step 2: Create Backend Project

```powershell
# Navigate to project root
cd d:\Work\Projects\Ongoing\agency-payment-project-tracker

# Create backend directory
mkdir backend
cd backend

# Initialize Node.js project
npm init -y

# Update package.json name
# Edit package.json: "name": "agency-payment-tracker-backend"
```

---

## Step 3: Install Dependencies

```powershell
# Core dependencies
npm install express mongoose cors dotenv

# Authentication
npm install jsonwebtoken bcryptjs

# File uploads
npm install multer

# Validation
npm install express-validator

# Development dependencies
npm install --save-dev nodemon typescript @types/node @types/express @types/cors @types/bcryptjs @types/jsonwebtoken @types/multer

# Initialize TypeScript
npx tsc --init
```

---

## Step 4: Configure TypeScript

Edit `tsconfig.json`:

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

## Step 5: Create Project Structure

```powershell
# Create directories
mkdir src
mkdir src\config
mkdir src\models
mkdir src\routes
mkdir src\controllers
mkdir src\middleware
mkdir src\utils
mkdir uploads

# Create files
New-Item src\server.ts
New-Item src\app.ts
New-Item src\config\database.ts
New-Item .env
New-Item .gitignore
```

---

## Step 6: Configure Environment Variables

Create `.env` file:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/agency_tracker
# OR for Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/agency_tracker?retryWrites=true&w=majority

# JWT
JWT_SECRET=your-super-secret-key-change-this-in-production-1234567890
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

Create `.gitignore`:

```
node_modules/
dist/
.env
uploads/
*.log
.DS_Store
```

---

## Step 7: Database Configuration

Create `src/config/database.ts`:

```typescript
import mongoose from "mongoose";

export const connectDatabase = async (): Promise<void> => {
  try {
    const mongoURI =
      process.env.MONGODB_URI || "mongodb://localhost:27017/agency_tracker";

    await mongoose.connect(mongoURI);

    console.log("✅ MongoDB connected successfully");
    console.log(`📊 Database: ${mongoose.connection.name}`);

    // Handle connection events
    mongoose.connection.on("error", (error) => {
      console.error("❌ MongoDB connection error:", error);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("⚠️  MongoDB disconnected");
    });

    // Graceful shutdown
    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      console.log("MongoDB connection closed through app termination");
      process.exit(0);
    });
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    process.exit(1);
  }
};
```

---

## Step 8: Create Mongoose Models

### User Model (`src/models/User.ts`):

```typescript
import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>("User", UserSchema);
```

### Client Model (`src/models/Client.ts`):

```typescript
import mongoose, { Schema, Document } from "mongoose";

export interface IClient extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  email?: string;
  company?: string;
  phone?: string;
  isRecurring: boolean;
  notes?: string;
  tags?: string[];
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ClientSchema = new Schema<IClient>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    company: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
    },
    tags: [String],
    avatar: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for unique client name per user
ClientSchema.index({ userId: 1, name: 1 }, { unique: true });

export const Client = mongoose.model<IClient>("Client", ClientSchema);
```

### Project Model (`src/models/Project.ts`):

```typescript
import mongoose, { Schema, Document } from "mongoose";

interface IMilestone {
  id: string;
  name: string;
  amount: number;
  dueDate?: Date;
  status: "pending" | "in-progress" | "completed";
  completedAt?: Date;
}

export interface IProject extends Document {
  userId: mongoose.Types.ObjectId;
  clientId: mongoose.Types.ObjectId;
  name: string;
  totalAmount: number;
  startDate: Date;
  endDate: Date;
  status: "active" | "completed" | "archived" | "on-hold";
  isRecurring: boolean;
  tags?: string[];
  notes?: string;
  milestones?: IMilestone[];
  createdAt: Date;
  updatedAt: Date;
}

const MilestoneSchema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  amount: { type: Number, required: true },
  dueDate: Date,
  status: {
    type: String,
    enum: ["pending", "in-progress", "completed"],
    default: "pending",
  },
  completedAt: Date,
});

const ProjectSchema = new Schema<IProject>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: "Client",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "completed", "archived", "on-hold"],
      default: "active",
      index: true,
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    tags: [String],
    notes: String,
    milestones: [MilestoneSchema],
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
ProjectSchema.index({ userId: 1, status: 1 });
ProjectSchema.index({ userId: 1, clientId: 1 });

export const Project = mongoose.model<IProject>("Project", ProjectSchema);
```

### Payment Model (`src/models/Payment.ts`):

```typescript
import mongoose, { Schema, Document } from "mongoose";

export interface IPayment extends Document {
  userId: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  sourceId: mongoose.Types.ObjectId;
  amount: number;
  date: Date;
  reference?: string;
  notes?: string;
  isDisputed: boolean;
  attachments?: string[]; // Array of attachment IDs
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    sourceId: {
      type: Schema.Types.ObjectId,
      ref: "Source",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    reference: String,
    notes: String,
    isDisputed: {
      type: Boolean,
      default: false,
    },
    attachments: [String],
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
PaymentSchema.index({ userId: 1, projectId: 1 });
PaymentSchema.index({ userId: 1, date: -1 });

export const Payment = mongoose.model<IPayment>("Payment", PaymentSchema);
```

### Expense Model (`src/models/Expense.ts`):

```typescript
import mongoose, { Schema, Document } from "mongoose";

export interface IExpense extends Document {
  userId: mongoose.Types.ObjectId;
  projectId?: mongoose.Types.ObjectId;
  categoryId: mongoose.Types.ObjectId;
  amount: number;
  date: Date;
  description: string;
  notes?: string;
  attachments?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema = new Schema<IExpense>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      index: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    notes: String,
    attachments: [String],
  },
  {
    timestamps: true,
  }
);

// Indexes
ExpenseSchema.index({ userId: 1, projectId: 1 });
ExpenseSchema.index({ userId: 1, date: -1 });

export const Expense = mongoose.model<IExpense>("Expense", ExpenseSchema);
```

### Source Model (`src/models/Source.ts`):

```typescript
import mongoose, { Schema, Document } from "mongoose";

export interface ISource extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  type: "income";
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SourceSchema = new Schema<ISource>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["income"],
      default: "income",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

SourceSchema.index({ userId: 1, name: 1 }, { unique: true });

export const Source = mongoose.model<ISource>("Source", SourceSchema);
```

### Category Model (`src/models/Category.ts`):

```typescript
import mongoose, { Schema, Document } from "mongoose";

export interface ICategory extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  type: "expense";
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["expense"],
      default: "expense",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

CategorySchema.index({ userId: 1, name: 1 }, { unique: true });

export const Category = mongoose.model<ICategory>("Category", CategorySchema);
```

---

## Step 9: Create Express App

Create `src/app.ts`:

```typescript
import express, { Application, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Create Express app
const app: Application = express();

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "OK",
    message: "Agency Payment Tracker API",
    timestamp: new Date().toISOString(),
  });
});

// API routes will be added here
// app.use('/api/auth', authRoutes);
// app.use('/api/projects', projectRoutes);
// ... etc

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: "NOT_FOUND",
      message: "Route not found",
    },
  });
});

// Error handler
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error("Error:", err);

  res.status(err.status || 500).json({
    success: false,
    error: {
      code: err.code || "SERVER_ERROR",
      message: err.message || "Internal server error",
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    },
  });
});

export default app;
```

Create `src/server.ts`:

```typescript
import app from "./app";
import { connectDatabase } from "./config/database";

const PORT = process.env.PORT || 3001;

// Connect to database and start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDatabase();

    // Start Express server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📝 API documentation: http://localhost:${PORT}/api-docs`);
      console.log(`🏥 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
```

---

## Step 10: Update package.json Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "dev": "nodemon --exec ts-node src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  }
}
```

---

## Step 11: Test Backend Server

```powershell
# Start MongoDB (if local)
mongod --dbpath="C:\data\db"

# In another terminal, start backend
cd backend
npm run dev
```

**Expected output:**

```
✅ MongoDB connected successfully
📊 Database: agency_tracker
🚀 Server running on http://localhost:3001
🏥 Health check: http://localhost:3001/health
```

**Test health endpoint:**

```powershell
# Using PowerShell
Invoke-RestMethod -Uri http://localhost:3001/health

# OR using curl
curl http://localhost:3001/health
```

---

## Next Steps

1. **Create Authentication Routes** - Implement `/auth/register` and `/auth/login`
2. **Add JWT Middleware** - Protect routes with authentication
3. **Create CRUD Routes** - Implement all API endpoints
4. **Add File Upload** - Handle attachments with Multer
5. **Add Validation** - Use express-validator for input validation
6. **Connect Frontend** - Update frontend API client to use backend

---

## Troubleshooting

### MongoDB Connection Failed

- Check if MongoDB is running: `mongosh`
- Verify MONGODB_URI in `.env`
- Check firewall settings

### Port Already in Use

- Change PORT in `.env` to 3002 or another free port
- Kill process using port: `netstat -ano | findstr :3001`

### TypeScript Errors

- Run `npm install --save-dev @types/node @types/express`
- Check `tsconfig.json` configuration

---

**Backend setup complete! Continue to authentication and route implementation.**

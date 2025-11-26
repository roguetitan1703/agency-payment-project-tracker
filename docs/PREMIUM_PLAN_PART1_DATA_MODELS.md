# PREMIUM PLAN — Part 1: Enhanced Data Models & Validation

**Project:** Agency Payment Tracker — Premium Edition
**Date:** October 24, 2025

---

## 1. Complete TypeScript Data Models

### Core Entities with All Fields

```typescript
// ============================================================================
// PROJECT
// ============================================================================
type Project = {
  // Identity
  id: string; // UUID v4

  // Basic Info
  name: string; // required, min 1 char
  clientId: string; // FK to Client, required

  // Financial
  totalAmount: number; // required, > 0

  // Timeline
  startDate: string; // ISO date, required
  endDate: string; // ISO date, required, must be >= startDate

  // Behavior Flags
  isRecurring: boolean; // default false
  status: "active" | "completed" | "archived"; // default 'active'

  // Metadata
  tags?: string; // comma-separated, optional
  notes?: string; // optional, max 2000 chars

  // Milestones (new - from plan.md)
  milestones?: Milestone[]; // optional array of payment milestones

  // Audit
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp

  // Calculated fields (not stored, derived at runtime)
  // totalReceived: number; // sum of all payments
  // totalExpenses: number; // sum of all project expenses
  // remaining: number; // totalAmount - totalReceived
  // progress: number; // (totalReceived / totalAmount) * 100
  // netProfit: number; // totalReceived - totalExpenses
  // isOverdue: boolean; // endDate < today && remaining > 0
};

// ============================================================================
// MILESTONE (new from plan.md)
// ============================================================================
type Milestone = {
  id: string; // UUID v4
  projectId: string; // FK to Project
  name: string; // e.g., "Design Phase", "Development Phase"
  amount: number; // expected payment amount for this milestone
  dueDate: string; // ISO date
  completed: boolean; // default false
  completedDate?: string; // ISO date, set when completed
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

// ============================================================================
// PAYMENT
// ============================================================================
type Payment = {
  // Identity
  id: string; // UUID v4
  projectId: string; // FK to Project, required

  // Financial
  amount: number; // required, can be negative for refunds

  // Timeline
  date: string; // ISO date, required, defaults to today

  // Classification
  sourceId: string; // FK to Source, required
  type: "partial" | "one-time" | "advance" | "refund" | "milestone"; // required

  // Milestone Link (new)
  milestoneId?: string; // FK to Milestone, optional

  // Proof & Verification
  attachment?: Attachment; // optional
  verified: boolean; // default false, manually set by user
  disputed: boolean; // default false (new from plan.md)
  disputeReason?: string; // optional, required if disputed=true

  // Metadata
  notes?: string; // optional, max 1000 chars

  // Audit
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp (for edits/corrections)
};

// ============================================================================
// EXPENSE
// ============================================================================
type Expense = {
  // Identity
  id: string; // UUID v4

  // Financial
  amount: number; // required, > 0

  // Timeline
  date: string; // ISO date, required, defaults to today

  // Classification
  categoryId: string; // FK to Category, required
  projectId?: string; // FK to Project, optional (null = general overhead)

  // Proof
  attachment?: Attachment; // optional

  // Metadata
  notes?: string; // optional, max 1000 chars

  // Audit
  createdAt: string; // ISO timestamp
  updatedAt: string;
};

// ============================================================================
// CLIENT
// ============================================================================
type Client = {
  // Identity
  id: string; // UUID v4

  // Basic Info
  name: string; // required, min 1 char, unique
  email?: string; // optional, validated email format
  phone?: string; // optional
  company?: string; // optional

  // Behavior
  isRecurring: boolean; // default false

  // Recurring Payment Template (new from plan.md)
  recurringTemplate?: RecurringTemplate;

  // Metadata
  notes?: string; // optional, max 1000 chars
  tags?: string; // comma-separated, optional

  // Avatar (new - from Vision UI)
  avatar?: string; // base64 or URL

  // Audit
  createdAt: string; // ISO timestamp

  // Calculated (derived)
  // totalProjects: number; // count of projects
  // totalRevenue: number; // sum of all project payments
};

// ============================================================================
// RECURRING TEMPLATE (new from plan.md)
// ============================================================================
type RecurringTemplate = {
  frequency: "weekly" | "biweekly" | "monthly" | "quarterly" | "yearly";
  amount: number; // expected recurring payment amount
  dayOfMonth?: number; // 1-31 for monthly/quarterly/yearly
  dayOfWeek?: number; // 0-6 for weekly/biweekly
  startDate: string; // ISO date
  endDate?: string; // ISO date, optional (null = ongoing)
  autoCreate: boolean; // if true, system creates payment reminders
  reminderDaysBefore: number; // e.g., 3 = remind 3 days before due
};

// ============================================================================
// SOURCE (Payment Source)
// ============================================================================
type Source = {
  // Identity
  id: string; // UUID v4

  // Basic Info
  name: string; // required, e.g., "Bank Transfer", "PayPal", "Stripe"

  // Classification
  type?: "bank" | "online" | "cash" | "check" | "other"; // optional

  // Metadata
  notes?: string; // optional, e.g., account details

  // Behavior
  isActive: boolean; // default true, can be disabled without deleting

  // Audit
  createdAt: string; // ISO timestamp

  // Calculated (derived)
  // totalReceived: number; // sum of all payments from this source
};

// ============================================================================
// CATEGORY (Expense Category)
// ============================================================================
type Category = {
  // Identity
  id: string; // UUID v4

  // Basic Info
  name: string; // required, e.g., "Marketing", "Software", "Salaries"

  // Visual
  color?: string; // hex color for UI grouping
  icon?: string; // icon name or emoji

  // Metadata
  notes?: string; // optional

  // Behavior
  isActive: boolean; // default true

  // Audit
  createdAt: string; // ISO timestamp

  // Calculated (derived)
  // totalExpenses: number; // sum of all expenses in this category
};

// ============================================================================
// ATTACHMENT
// ============================================================================
type Attachment = {
  name: string; // filename with extension
  type: string; // MIME type, e.g., "image/png", "application/pdf"
  size: number; // bytes
  data: string; // base64 encoded file data
  uploadedAt: string; // ISO timestamp
};

// ============================================================================
// APPLICATION STATE
// ============================================================================
type ModalState = {
  type:
    | "onboarding"
    | "addProject"
    | "editProject"
    | "addPayment"
    | "editPayment"
    | "addExpense"
    | "editExpense"
    | "addClient"
    | "editClient"
    | "addSource"
    | "editSource"
    | "addCategory"
    | "editCategory"
    | "addMilestone"
    | "editMilestone"
    | "viewAttachment"
    | "confirmation"
    | "help" // new from Vision UI
    | "recurringSetup" // new from plan.md
    | null;
  data?: any; // entity being edited, or context data
  message?: string; // for confirmation modals
  onConfirm?: () => void | Promise<void>; // callback for confirmations
  onCancel?: () => void; // optional cancel callback
};

type Page =
  | "dashboard"
  | "projects"
  | "projectDetail"
  | "settings"
  | "import-export"
  | "reports"; // new - analytics/reporting page

type FilterState = {
  searchQuery?: string;
  clientIds?: string[]; // filter by specific clients
  status?: ("active" | "completed" | "archived")[]; // multi-select
  dateFrom?: string; // ISO date
  dateTo?: string; // ISO date
  tags?: string[]; // filter by tags
  isRecurring?: boolean;
  isOverdue?: boolean; // filter overdue projects
  minAmount?: number;
  maxAmount?: number;
};

type SortConfig = {
  field: string; // e.g., 'name', 'totalAmount', 'endDate', 'progress'
  direction: "asc" | "desc";
};

type PaginationState = {
  page: number; // 1-indexed
  pageSize: number; // items per page, default 20
  total: number; // total items matching filter
};

type AppSettings = {
  theme: "light" | "dark" | "auto"; // default 'dark'
  currency: "USD" | "EUR" | "GBP" | "INR"; // default 'USD'
  dateFormat: "MM/DD/YYYY" | "DD/MM/YYYY" | "YYYY-MM-DD"; // default 'MM/DD/YYYY'
  isOnboarded: boolean; // default false
  defaultProjectDuration: number; // days, default 30
  reminderEnabled: boolean; // default true
  reminderDaysBefore: number; // default 3
  autoBackup: boolean; // default true
  lastBackup?: string; // ISO timestamp
};

// ============================================================================
// DERIVED/CALCULATED DATA (NOT STORED)
// ============================================================================
type ProjectStats = {
  projectId: string;
  totalReceived: number; // sum(payments.amount) where projectId
  totalExpenses: number; // sum(expenses.amount) where projectId
  remaining: number; // project.totalAmount - totalReceived
  progress: number; // (totalReceived / totalAmount) * 100
  netProfit: number; // totalReceived - totalExpenses
  paymentCount: number;
  expenseCount: number;
  isOverdue: boolean; // endDate < today && remaining > 0
  isCompleted: boolean; // remaining <= 0
  daysRemaining: number; // endDate - today (can be negative)
};

type DashboardStats = {
  // Financial Overview
  totalBilled: number; // sum of all active project totalAmounts
  totalReceived: number; // sum of all payments
  totalExpenses: number; // sum of all expenses
  outstanding: number; // totalBilled - totalReceived
  netProfit: number; // totalReceived - totalExpenses

  // Project Counts
  activeProjects: number;
  completedProjects: number;
  overdueProjects: number;

  // Trends (optional - for charts)
  receivedThisMonth: number;
  expensesThisMonth: number;
  projectsCompletedThisMonth: number;

  // Recent Activity
  recentPayments: Payment[]; // last 5
  recentExpenses: Expense[]; // last 5
};

type ClientStats = {
  clientId: string;
  projectCount: number;
  totalRevenue: number; // sum of all payments for client's projects
  totalExpenses: number; // sum of expenses for client's projects
  netProfit: number;
  activeProjects: number;
  completedProjects: number;
};

// ============================================================================
// NOTIFICATION/REMINDER (new from plan.md)
// ============================================================================
type Reminder = {
  id: string;
  type:
    | "payment_due"
    | "recurring_payment"
    | "overdue_project"
    | "milestone_due";
  projectId?: string;
  milestoneId?: string;
  message: string;
  dueDate: string; // ISO date
  dismissed: boolean; // default false
  createdAt: string;
};
```

---

## 2. API-Based Data Storage

**CRITICAL:** This application uses a **REST API backend** for all data persistence.

- **NO local storage (IndexedDB/localforage)**
- All data stored in **MongoDB database** on server (using Mongoose ODM)
- Frontend communicates via **REST API endpoints**
- Authentication via **JWT tokens**

**TypeScript types defined in this document are used for:**

- Frontend API request/response typing
- React component props and state
- Form validation schemas

**Backend Implementation:**

- Mongoose schemas mirror these TypeScript types
- See `BACKEND_SETUP.md` for complete MongoDB model definitions
- See `API_ARCHITECTURE.md` for complete endpoint reference

---

## 3. Data Model Relationships

```
Client (1) ──< (N) Project
  │                 │
  │                 ├──< (N) Payment
  │                 ├──< (N) Expense
  │                 └──< (N) Milestone
  │
  └── (1:1?) RecurringTemplate

Source (1) ──< (N) Payment

Category (1) ──< (N) Expense

Project (1) ──< (N) Milestone (1) ──< (N?) Payment
```

**Key Rules:**

- **Payment → Project:** Required FK, cannot be null
- **Payment → Milestone:** Optional FK, can be null (for non-milestone payments)
- **Expense → Project:** Optional FK, null = general overhead
- **Client → Project:** Required FK, cannot delete client with active projects
- **Source/Category:** Cannot delete if referenced by payments/expenses (soft delete or block)

---

## 4. Field Validation Rules

**Note:** Validation happens on **both frontend (UX) and backend (security)**

### Project

| Field         | Required | Validation                     | Default             |
| ------------- | -------- | ------------------------------ | ------------------- |
| `name`        | ✅       | min 1 char, max 200            | -                   |
| `clientId`    | ✅       | valid Client ID exists         | -                   |
| `totalAmount` | ✅       | > 0, max 10,000,000            | -                   |
| `startDate`   | ✅       | valid ISO date                 | today               |
| `endDate`     | ✅       | >= startDate                   | startDate + 30 days |
| `isRecurring` | ❌       | boolean                        | false               |
| `status`      | ❌       | enum                           | 'active'            |
| `tags`        | ❌       | comma-separated, max 500 chars | null                |
| `notes`       | ❌       | max 2000 chars                 | null                |
| `milestones`  | ❌       | valid Milestone array          | []                  |

### Payment

| Field           | Required | Validation                        | Default    |
| --------------- | -------- | --------------------------------- | ---------- |
| `projectId`     | ✅       | valid Project ID exists           | -          |
| `amount`        | ✅       | != 0, can be negative for refunds | -          |
| `date`          | ✅       | valid ISO date, <= today          | today      |
| `sourceId`      | ✅       | valid Source ID exists            | -          |
| `type`          | ✅       | enum                              | 'one-time' |
| `milestoneId`   | ❌       | valid Milestone ID if provided    | null       |
| `verified`      | ❌       | boolean                           | false      |
| `disputed`      | ❌       | boolean                           | false      |
| `disputeReason` | ❌       | required if disputed=true         | null       |
| `attachment`    | ❌       | valid Attachment object, max 5MB  | null       |
| `notes`         | ❌       | max 1000 chars                    | null       |

**Business Rules:**

- **Over-payment warning:** If `totalReceived > project.totalAmount`, show warning (allow but warn)
- **Refund validation:** If `type='refund'`, `amount` must be negative
- **Date validation:** Cannot add payment with date in future (warning, not block)

### Expense

| Field        | Required | Validation                       | Default |
| ------------ | -------- | -------------------------------- | ------- |
| `amount`     | ✅       | > 0, max 10,000,000              | -       |
| `date`       | ✅       | valid ISO date, <= today         | today   |
| `categoryId` | ✅       | valid Category ID exists         | -       |
| `projectId`  | ❌       | valid Project ID if provided     | null    |
| `attachment` | ❌       | valid Attachment object, max 5MB | null    |
| `notes`      | ❌       | max 1000 chars                   | null    |

### Client

| Field               | Required | Validation                          | Default |
| ------------------- | -------- | ----------------------------------- | ------- |
| `name`              | ✅       | min 1 char, max 200, unique         | -       |
| `email`             | ❌       | valid email format                  | null    |
| `phone`             | ❌       | valid phone format (flexible)       | null    |
| `company`           | ❌       | max 200 chars                       | null    |
| `isRecurring`       | ❌       | boolean                             | false   |
| `recurringTemplate` | ❌       | valid RecurringTemplate if provided | null    |
| `notes`             | ❌       | max 1000 chars                      | null    |
| `tags`              | ❌       | comma-separated, max 500 chars      | null    |
| `avatar`            | ❌       | base64 image or URL, max 1MB        | null    |

### Milestone

| Field           | Required | Validation                           | Default |
| --------------- | -------- | ------------------------------------ | ------- |
| `projectId`     | ✅       | valid Project ID exists              | -       |
| `name`          | ✅       | min 1 char, max 200                  | -       |
| `amount`        | ✅       | > 0                                  | -       |
| `dueDate`       | ✅       | valid ISO date, >= project.startDate | -       |
| `completed`     | ❌       | boolean                              | false   |
| `completedDate` | ❌       | required if completed=true           | null    |
| `notes`         | ❌       | max 1000 chars                       | null    |

**Business Rules:**

- **Milestone totals warning:** Sum of milestone amounts should = project.totalAmount (warn if not)
- **Auto-complete:** When payment linked to milestone and amount matches, auto-mark milestone complete

---

## 5. ID Generation Strategy

**Approach:** **Server-generated UUIDs** (database handles ID creation)

**Backend (PostgreSQL):**

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- other fields...
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Why Server-Side IDs?**

- ✅ Database guarantees uniqueness
- ✅ No client-side ID conflicts
- ✅ Consistent with relational database patterns
- ✅ Simplifies API design (POST returns created ID)

**Frontend:** IDs are received from API responses, not generated locally.

---

## 6. Timestamp Strategy

**Approach:** **Server-generated timestamps** (database handles timestamps)

**Backend (PostgreSQL):**

```sql
created_at TIMESTAMP DEFAULT NOW(),
updated_at TIMESTAMP DEFAULT NOW()
```

**Automatic Update Trigger:**

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE
    ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

**API Response Format:** ISO 8601 strings

```json
{
  "createdAt": "2025-10-24T14:32:15.123Z",
  "updatedAt": "2025-10-24T14:32:15.123Z"
}
```

**Frontend:** Receives timestamps from API, formats for display using `date-fns`

---

## 7. Attachment Storage Strategy

**Approach:** **Server-side file storage** with signed URLs

**Backend Options:**

1. **Local file system** (development)
2. **AWS S3** (production - recommended)
3. **Azure Blob Storage**
4. **Google Cloud Storage**

**Implementation Flow:**

**Upload:**

```typescript
// Frontend: Upload file via multipart/form-data
POST /api/attachments
Content-Type: multipart/form-data

// Backend: Store file, return metadata
{
  "id": "uuid",
  "fileName": "invoice.pdf",
  "mimeType": "application/pdf",
  "size": 234567,
  "url": "https://api.example.com/attachments/uuid/download"
}
```

**Download:**

```typescript
// Frontend: Request signed URL
GET /api/attachments/:id

// Backend: Return temporary signed URL (expires in 1 hour)
{
  "url": "https://s3.amazonaws.com/bucket/file.pdf?signature=..."
}
```

**Why Server-Side?**

- ✅ No size limits (5MB+ supported)
- ✅ CDN distribution for faster downloads
- ✅ Centralized backup and security
- ✅ No base64 encoding overhead

---

## 8. Calculated Fields Strategy

**Approach:** **Server-side calculations** via dedicated API endpoints

**Why Server-Side?**

- ✅ Single source of truth
- ✅ Consistent across all clients
- ✅ Reduced frontend complexity
- ✅ Can be cached and optimized with SQL

**Backend Implementation (SQL):**

```sql
-- Calculate project stats in one efficient query
SELECT
  p.id,
  p.total_amount,
  COALESCE(SUM(pay.amount), 0) as total_received,
  COALESCE(SUM(exp.amount), 0) as total_expenses,
  p.total_amount - COALESCE(SUM(pay.amount), 0) as remaining,
  (COALESCE(SUM(pay.amount), 0) / p.total_amount * 100) as progress,
  COALESCE(SUM(pay.amount), 0) - COALESCE(SUM(exp.amount), 0) as net_profit,
  COUNT(DISTINCT pay.id) as payment_count,
  COUNT(DISTINCT exp.id) as expense_count,
  (p.end_date < NOW() AND (p.total_amount - COALESCE(SUM(pay.amount), 0)) > 0) as is_overdue
FROM projects p
LEFT JOIN payments pay ON pay.project_id = p.id
LEFT JOIN expenses exp ON exp.project_id = p.id
WHERE p.id = $1
GROUP BY p.id;
```

**Frontend API Call:**

```typescript
// GET /api/projects/:id/stats
const stats = await apiClient.get(`/projects/${projectId}/stats`);
```

---

## 9. Data Integrity Rules

**Implementation:** Database foreign keys and constraints (PostgreSQL)

### Cascade Delete Rules (Enforced by Database)

```sql
-- Projects: Block delete if has payments/expenses
ALTER TABLE payments ADD CONSTRAINT fk_payment_project
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE RESTRICT;

ALTER TABLE expenses ADD CONSTRAINT fk_expense_project
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE RESTRICT;

-- Clients: Block delete if has projects
ALTER TABLE projects ADD CONSTRAINT fk_project_client
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE RESTRICT;

-- Sources: Block delete if has payments (use soft delete)
ALTER TABLE payments ADD CONSTRAINT fk_payment_source
  FOREIGN KEY (source_id) REFERENCES sources(id) ON DELETE RESTRICT;

-- Categories: Block delete if has expenses (use soft delete)
ALTER TABLE expenses ADD CONSTRAINT fk_expense_category
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT;

-- Milestones: Allow delete, unlink payments
ALTER TABLE payments ADD CONSTRAINT fk_payment_milestone
  FOREIGN KEY (milestone_id) REFERENCES milestones(id) ON DELETE SET NULL;
```

| Entity        | Delete Action | Cascade Behavior                                                     |
| ------------- | ------------- | -------------------------------------------------------------------- |
| **Project**   | Delete        | ❌ Database blocks if has payments/expenses (RESTRICT)               |
| **Client**    | Delete        | ❌ Database blocks if has projects (RESTRICT)                        |
| **Source**    | Delete        | ❌ Database blocks if has payments (RESTRICT) - API does soft delete |
| **Category**  | Delete        | ❌ Database blocks if has expenses (RESTRICT) - API does soft delete |
| **Milestone** | Delete        | ⚠️ Payments unlinked (SET NULL)                                      |

### Orphan Prevention

- **Payment without project:** Blocked by validation (projectId required)
- **Expense without category:** Blocked by validation (categoryId required)
- **Project without client:** Blocked by validation (clientId required)

### Data Consistency Checks (Backend Validation)

**Database foreign keys automatically enforce referential integrity.**

Backend API includes additional validation endpoint:

```typescript
// GET /api/admin/integrity-check
export const validateDataIntegrity = async (): Promise<string[]> => {
  const errors: string[] = [];

  // Database foreign keys prevent most integrity issues
  // This endpoint checks for edge cases and data anomalies

  // Check 1: Orphaned attachments (file exists but no parent record)
  const orphanedAttachments = await db.query(`
    SELECT a.id FROM attachments a
    LEFT JOIN payments p ON a.entity_id = p.id AND a.entity_type = 'payment'
    LEFT JOIN expenses e ON a.entity_id = e.id AND a.entity_type = 'expense'
    WHERE p.id IS NULL AND e.id IS NULL
  `);

  if (orphanedAttachments.rows.length > 0) {
    errors.push(
      `Found ${orphanedAttachments.rows.length} orphaned attachments`
    );
  }

  // Check 2: Soft-deleted records still referenced
  const inactiveSources = await db.query(`
    SELECT s.id, s.name, COUNT(p.id) as usage_count
    FROM sources s
    JOIN payments p ON p.source_id = s.id
    WHERE s.is_active = false
    GROUP BY s.id, s.name
    HAVING COUNT(p.id) > 0
  `);

  if (inactiveSources.rows.length > 0) {
    errors.push(`Found inactive sources still in use`);
  }

  return errors;
};
```

---

## 10. Multi-User Support (Future Consideration)

The API architecture supports multi-user scenarios:

**User Isolation:**

```sql
-- Add user_id to all tables
ALTER TABLE projects ADD COLUMN user_id UUID REFERENCES users(id);
ALTER TABLE clients ADD COLUMN user_id UUID REFERENCES users(id);
-- etc.

-- Backend filters all queries by authenticated user
SELECT * FROM projects WHERE user_id = $1;
```

**Team/Organization Support:**

```sql
-- Add organization_id for team workspaces
ALTER TABLE users ADD COLUMN organization_id UUID REFERENCES organizations(id);
ALTER TABLE projects ADD COLUMN organization_id UUID REFERENCES organizations(id);

-- Share data within organization
SELECT * FROM projects WHERE organization_id = $1;
```

---

**Next:** Part 2 will cover complete API-based CRUD operations, validation logic, and error handling for each entity.

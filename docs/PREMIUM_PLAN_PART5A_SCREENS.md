# PREMIUM PLAN — Part 5A: Screen Specifications (Login, Dashboard, Projects List)

**Project:** Agency Payment Tracker — Premium Edition
**Date:** October 24, 2025

---

## SCREEN 1: Login / Sign In

### Purpose

First-time user authentication or returning user login.

### Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│  [Split Screen Layout]                                       │
│  ┌──────────────────────┬──────────────────────────────┐   │
│  │                      │                              │   │
│  │  LEFT: Hero Image    │  RIGHT: Login Form          │   │
│  │  (60% width)         │  (40% width)                │   │
│  │                      │                              │   │
│  │  Gradient Purple     │  [Logo]                     │   │
│  │  Futuristic Image    │  Nice to see you!           │   │
│  │  "VISION UI          │  Enter email and password   │   │
│  │   DASHBOARD"         │                              │   │
│  │                      │  [Email Input]              │   │
│  │  "INSPIRED BY        │  [Password Input]           │   │
│  │   THE FUTURE"        │  [☑ Remember me]            │   │
│  │                      │  [SIGN IN Button]           │   │
│  │                      │  Don't have account? Sign up│   │
│  │                      │                              │   │
│  └──────────────────────┴──────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Components Used

| Component          | Purpose                              | Props                                                                         |
| ------------------ | ------------------------------------ | ----------------------------------------------------------------------------- |
| `Hero`             | Left side container with gradient bg | `className="bg-gradient-to-br from-primary/60 via-secondary/40 to-accent/30"` |
| `Card` (glass)     | Right side form container            | `className="glass bg-base-100/30 backdrop-blur-xl"`                           |
| `Input` (email)    | Email address field                  | `type="email", placeholder="Your email address"`                              |
| `Input` (password) | Password field                       | `type="password", placeholder="Your password"`                                |
| `Checkbox`         | Remember me toggle                   | `label="Remember me"`                                                         |
| `Button` (primary) | Sign in action                       | `className="btn-primary btn-block"`                                           |
| `Link`             | Sign up redirect                     | `to="/signup"`                                                                |

### Data Dependencies

**API Calls:**

- None (local authentication for MVP, check `isOnboarded` flag in settings)

**Local Storage:**

- `settings.isOnboarded` - Check if user completed onboarding
- `settings.rememberMe` - Optional, store preference

**State:**

```typescript
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [rememberMe, setRememberMe] = useState(false);
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
```

### User Interactions

1. **Initial Load:**

   - Check `settings.isOnboarded`
   - If `true`, redirect to Dashboard
   - If `false`, show login screen

2. **Form Submission:**

   - Validate email format
   - Validate password not empty
   - Store `rememberMe` preference
   - Set `isOnboarded = true`
   - Navigate to Dashboard

3. **Sign Up Link:**
   - Navigate to Onboarding screen

### Validation Rules

| Field    | Rule                             | Error Message                            |
| -------- | -------------------------------- | ---------------------------------------- |
| Email    | Required, valid email format     | "Please enter a valid email address"     |
| Password | Required, min 6 chars (for demo) | "Password must be at least 6 characters" |

### Error States

```tsx
{
  error && (
    <div className="alert alert-error glass mb-4">
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
          clipRule="evenodd"
        />
      </svg>
      <span>{error}</span>
    </div>
  );
}
```

### Loading State

```tsx
{
  isLoading && (
    <div className="absolute inset-0 bg-base-100/50 backdrop-blur-sm flex items-center justify-center z-50">
      <span className="loading loading-spinner loading-lg text-primary" />
    </div>
  );
}
```

### Responsive Design

- **Desktop (lg):** Split screen (60/40)
- **Tablet (md):** Split screen (50/50)
- **Mobile (sm):** Stack vertically, hide hero image, full-width form

```tsx
<div className="grid grid-cols-1 lg:grid-cols-5 min-h-screen">
  {/* Hero - hidden on mobile */}
  <div className="hidden lg:block lg:col-span-3 bg-gradient-to-br from-primary/60 via-secondary/40 to-accent/30">
    {/* Hero content */}
  </div>

  {/* Form - full width on mobile */}
  <div className="col-span-1 lg:col-span-2 flex items-center justify-center p-8">
    {/* Form content */}
  </div>
</div>
```

### Accessibility

- `aria-label="Email address"` on email input
- `aria-label="Password"` on password input
- `aria-describedby="error-message"` when error present
- Focus trap within form
- Keyboard navigation (Tab, Enter to submit)

---

## SCREEN 2: Onboarding

### Purpose

First-time setup wizard to create initial client and project.

### Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│                         Welcome!                             │
│           Use these awesome forms to login or create         │
│               new account in your project for free.          │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  [Step Indicator: ● ○ ○]                          │    │
│  │                                                     │    │
│  │  Step 1: Your First Client                         │    │
│  │  ─────────────────────────────────                 │    │
│  │  [Client Name Input*]                              │    │
│  │  [Email Input]                                     │    │
│  │  [Company Input]                                   │    │
│  │                                                     │    │
│  │  ☐ This is a recurring client                     │    │
│  │                                                     │    │
│  │              [← Back]  [Next →]                    │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### Multi-Step Flow

**Step 1: Create First Client**

- Client name (required)
- Email (optional)
- Company (optional)
- Is recurring checkbox

**Step 2: Create First Project**

- Project name (required)
- Total amount (required)
- Start date (default: today)
- End date (required)
- Tags (optional)

**Step 3: Complete Setup**

- Success message
- "Go to Dashboard" button

### Components Used

| Component          | Purpose               | Props                                                                 |
| ------------------ | --------------------- | --------------------------------------------------------------------- |
| `Steps`            | Progress indicator    | `value={currentStep}, max={3}`                                        |
| `Card` (glass)     | Form container        | `className="glass bg-base-100/30 backdrop-blur-xl max-w-2xl mx-auto"` |
| `Input`            | All text fields       | Various                                                               |
| `Toggle`           | Recurring client flag | `checked={isRecurring}`                                               |
| `Button` (ghost)   | Back button           | `className="btn-ghost"`                                               |
| `Button` (primary) | Next/Complete         | `className="btn-primary"`                                             |

### Data Dependencies

**API Calls:**

- `createClient(clientData)` - Step 1 completion
- `createProject(projectData)` - Step 2 completion
- `updateSettings({ isOnboarded: true })` - Step 3 completion

**State:**

```typescript
const [currentStep, setCurrentStep] = useState(1);
const [clientData, setClientData] = useState<Partial<ClientInput>>({});
const [projectData, setProjectData] = useState<Partial<ProjectInput>>({});
const [isLoading, setIsLoading] = useState(false);
const [errors, setErrors] = useState<Record<string, string>>({});
```

### User Interactions

1. **Step 1 Submit:**

   - Validate client name required
   - Store client data in state
   - Move to step 2

2. **Step 2 Submit:**

   - Validate project name, amount required
   - Create client (from step 1)
   - Create project (using new client ID)
   - Move to step 3

3. **Step 3:**

   - Set `isOnboarded = true`
   - Navigate to Dashboard

4. **Back Button:**
   - Go to previous step
   - Preserve data

### Validation Rules

**Step 1:**
| Field | Rule | Error Message |
|-------|------|---------------|
| Client Name | Required, min 1 char | "Client name is required" |
| Email | Optional, valid email if provided | "Invalid email format" |

**Step 2:**
| Field | Rule | Error Message |
|-------|------|---------------|
| Project Name | Required, min 1 char | "Project name is required" |
| Total Amount | Required, > 0 | "Amount must be greater than 0" |
| Start Date | Required, valid date | "Invalid start date" |
| End Date | Required, >= start date | "End date must be after start date" |

### Success State

```tsx
{
  currentStep === 3 && (
    <div className="text-center py-12">
      <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-success/20 mb-6">
        <svg
          className="w-12 h-12 text-success"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
      <h2 className="text-3xl font-bold mb-4">You're all set!</h2>
      <p className="text-base-content/70 mb-8">
        Your first client and project have been created successfully.
      </p>
      <button
        onClick={() => navigate("/dashboard")}
        className="btn btn-primary btn-lg"
      >
        Go to Dashboard
      </button>
    </div>
  );
}
```

### Responsive Design

- **Desktop:** Card max-width 768px, centered
- **Mobile:** Full width with padding, stack all inputs

### Accessibility

- Clear step labels
- Aria labels on all inputs
- Focus management between steps
- Keyboard navigation

---

## SCREEN 3: Dashboard

### Purpose

Main overview screen showing financial summary, active projects, recent activity, and quick actions.

### Layout Structure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Navbar: Logo | Search | Profile]                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  Welcome back!                                [Turn on your car →]   │  │
│  │  Nice to see you again, User!                                        │  │
│  │  [Gradient Hero Card with animated blob]                             │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │
│  │ 💰 Total    │  │ ⏳ Outstanding│  │ 📉 Expenses │  │ 💵 Net Profit│     │
│  │ Received    │  │              │  │              │  │              │     │
│  │ $45,231     │  │ $12,500      │  │ $8,340       │  │ $36,891      │     │
│  │ ↗ +12%      │  │ ↘ -3%        │  │ ↗ +5%        │  │ ↗ +15%       │     │
│  │ [Sparkline] │  │ [Sparkline]  │  │ [Sparkline]  │  │ [Sparkline]  │     │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘      │
│                                                                              │
│  ┌──────────────────────────────────────┐  ┌──────────────────────────┐   │
│  │  Active Projects                      │  │  Recent Activity         │   │
│  │  ● 5 active • 2 completed            │  │                          │   │
│  │                                       │  │  [Timeline of recent     │   │
│  │  ┌────────────────────────────────┐ │  │   payments/expenses]     │   │
│  │  │ [Project Card 1]               │ │  │                          │   │
│  │  │ - Image with overlay           │ │  │  • Payment $2,500        │   │
│  │  │ - Progress bar (68%)           │ │  │    Client A - 2 hours ago│   │
│  │  │ - Team avatars                 │ │  │  • Expense $340          │   │
│  │  │ - [View All →]                 │ │  │    Marketing - 5h ago    │   │
│  │  └────────────────────────────────┘ │  │  • Payment $5,000        │   │
│  │                                       │  │    Client B - Yesterday  │   │
│  │  [Grid of project cards...]          │  │                          │   │
│  └──────────────────────────────────────┘  └──────────────────────────┘   │
│                                                                              │
│  [FAB: + Quick Add Payment/Expense]                    [? Help Widget]     │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Grid Layout

```tsx
<div className="container mx-auto p-6 space-y-6">
  {/* Hero Card - Full Width */}
  <GradientHeroCard />

  {/* Stats Row - 4 columns on desktop, 2 on tablet, 1 on mobile */}
  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
    <StatCardPremium {...stat1} />
    <StatCardPremium {...stat2} />
    <StatCardPremium {...stat3} />
    <StatCardPremium {...stat4} />
  </div>

  {/* Main Content - 2 columns on desktop, 1 on mobile */}
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    {/* Left: Projects (2/3 width) */}
    <div className="lg:col-span-2">
      <ProjectsSection />
    </div>

    {/* Right: Activity (1/3 width) */}
    <div className="lg:col-span-1">
      <RecentActivity />
    </div>
  </div>
</div>
```

### Components Used

| Component                | Purpose                      | Props/Details                        |
| ------------------------ | ---------------------------- | ------------------------------------ |
| `GradientHeroCard`       | Welcome message with action  | Title, subtitle, action button       |
| `StatCardPremium` × 4    | Financial overview stats     | Value, icon, trend, sparkline data   |
| `ProjectCardPremium` × N | Active project cards in grid | Project data, image, team members    |
| `Timeline`               | Recent activity list         | Payments and expenses, chronological |
| `FAB` (Speed Dial)       | Quick add actions            | Add Payment, Add Expense options     |
| `HelpWidget`             | Floating help button         | Fixed bottom-left                    |
| `Badge`                  | Project status indicators    | Active, Completed counts             |
| `Progress`               | Project completion bars      | Percentage value                     |
| `Avatar` (group)         | Team member avatars          | Max 3 visible + count                |

### Data Dependencies

**API Calls on Load:**

```typescript
// 1. Calculate dashboard stats
const stats = await calculateDashboardStats();
// Returns: totalBilled, totalReceived, outstanding, expenses, netProfit, counts, trends

// 2. Get active projects
const { projects } = await getProjects({
  status: ["active"],
  sort: { field: "updatedAt", direction: "desc" },
  pagination: { page: 1, pageSize: 6 },
});

// 3. Calculate stats for each project
const projectsWithStats = await Promise.all(
  projects.map(async (p) => ({
    ...p,
    stats: await calculateProjectStats(p.id),
    client: await getClientById(p.clientId),
  }))
);

// 4. Get recent activity (last 10 transactions)
const recentPayments = (await getPayments()).slice(0, 5);
const recentExpenses = (await getExpenses()).slice(0, 5);
const activity = [...recentPayments, ...recentExpenses]
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  .slice(0, 10);
```

**State:**

```typescript
const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(
  null
);
const [activeProjects, setActiveProjects] = useState<Project[]>([]);
const [projectStats, setProjectStats] = useState<Map<string, ProjectStats>>(
  new Map()
);
const [recentActivity, setRecentActivity] = useState<Transaction[]>([]);
const [isLoading, setIsLoading] = useState(true);
const [refreshKey, setRefreshKey] = useState(0);
```

### User Interactions

**1. Hero Card Action:**

- Optional custom action button
- Default: Navigate to Projects List or Create Project

**2. Stat Card Click:**

- Navigate to relevant filtered view
- Example: Click "Outstanding" → Projects List filtered by `remaining > 0`

**3. Project Card Click:**

- Navigate to Project Detail page
- Pass project ID as route param

**4. "View All" Button:**

- Navigate to Projects List (all active)

**5. Recent Activity Item Click:**

- If payment: Open payment detail modal
- If expense: Open expense detail modal

**6. FAB (Speed Dial):**

- Click main button → Expand options
- "Add Payment" → Open Quick Add Payment modal
- "Add Expense" → Open Quick Add Expense modal

**7. Filters/Sorting:**

- Optional dropdown to filter by client
- Optional date range picker

**8. Refresh:**

- Pull-to-refresh on mobile
- Auto-refresh every 30 seconds (optional)

### Loading State

```tsx
{isLoading ? (
  <div className="space-y-6">
    <CardSkeleton /> {/* Hero card */}
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <CardSkeleton />
      </div>
      <div>
        <CardSkeleton />
      </div>
    </div>
  </div>
) : (
  // Actual content
)}
```

### Empty State

```tsx
{
  activeProjects.length === 0 && (
    <div className="card glass bg-base-100/30 backdrop-blur-md border border-white/10 p-12 text-center">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
        <svg
          className="w-10 h-10 text-primary"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </div>
      <h3 className="text-xl font-bold mb-2">No active projects</h3>
      <p className="text-base-content/60 mb-6">
        Create your first project to start tracking payments and expenses.
      </p>
      <button onClick={() => navigate("/projects")} className="btn btn-primary">
        Create Project
      </button>
    </div>
  );
}
```

### Error State

```tsx
{
  error && (
    <div className="alert alert-error glass">
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
          clipRule="evenodd"
        />
      </svg>
      <div>
        <h3 className="font-bold">Failed to load dashboard</h3>
        <p className="text-sm">{error}</p>
      </div>
      <button
        onClick={() => setRefreshKey((k) => k + 1)}
        className="btn btn-sm"
      >
        Retry
      </button>
    </div>
  );
}
```

### Responsive Design

| Breakpoint           | Layout                                                                         |
| -------------------- | ------------------------------------------------------------------------------ |
| **xs (< 640px)**     | Single column, hero card reduced height, stats stacked, 1 project card per row |
| **md (640-1024px)**  | Stats 2 columns, projects 2 columns, sidebar stacks below                      |
| **lg (1024-1280px)** | Stats 4 columns, projects 2 columns, sidebar right                             |
| **xl (> 1280px)**    | Stats 4 columns, projects 3 columns, sidebar right                             |

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
  {projects.map((project) => (
    <ProjectCardPremium key={project.id} {...project} />
  ))}
</div>
```

### Accessibility

- Semantic HTML (`<main>`, `<section>`, `<article>`)
- Aria labels on all interactive elements
- Keyboard navigation support
- Screen reader announcements for data updates
- Focus visible on all interactive elements
- Color contrast ratio > 4.5:1

### Performance Optimizations

- Lazy load project images
- Virtual scrolling for activity list if > 50 items
- Memoize expensive calculations
- Debounce search/filter inputs
- Cache dashboard stats for 30 seconds

---

## SCREEN 4: Projects List

### Purpose

View, filter, sort, and manage all projects in a table/grid format.

### Layout Structure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Breadcrumb: Dashboard > Projects]                              [+ New]    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  Projects                                            [⚙ Filters ▼]   │  │
│  │  ─────────────────────────────────────────────────────────────────   │  │
│  │                                                                       │  │
│  │  [🔍 Search projects...]                                             │  │
│  │                                                                       │  │
│  │  ┌─────────┬─────────┬─────────┬─────────┐                         │  │
│  │  │ Active  │ Complete│ Archived│ Overdue │                         │  │
│  │  │   (5)   │   (12)  │   (3)   │   (1)   │                         │  │
│  │  └─────────┴─────────┴─────────┴─────────┘                         │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  TABLE VIEW                                                           │  │
│  │  ┌────────────────────────────────────────────────────────────────┐ │  │
│  │  │ Project      │ Client  │ Total   │ Received│ Progress│ Actions││ │  │
│  │  ├────────────────────────────────────────────────────────────────┤ │  │
│  │  │ Website      │ Acme Co │ $15,000 │ $10,000 │ ███░░ 68%│ E V  ││ │  │
│  │  │ Redesign     │         │         │         │          │      ││ │  │
│  │  │ 🔁 [Active]  │         │         │         │          │      ││ │  │
│  │  ├────────────────────────────────────────────────────────────────┤ │  │
│  │  │ Mobile App   │ Beta Inc│ $25,000 │ $25,000 │ █████100%│ E V  ││ │  │
│  │  │ [Completed]  │         │         │         │          │      ││ │  │
│  │  ├────────────────────────────────────────────────────────────────┤ │  │
│  │  │ ...more rows...                                                 │ │  │
│  │  └────────────────────────────────────────────────────────────────┘ │  │
│  │                                                                       │  │
│  │  [← Previous]  Page 1 of 3  [Next →]                                │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ALTERNATE: CARD/GRID VIEW                                                  │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  [Grid of ProjectCardPremium components, 3 columns on desktop]       │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### View Modes

**1. Table View (Default):**

- Sortable columns
- Inline actions
- Compact, data-dense

**2. Grid View:**

- ProjectCardPremium components
- Visual, image-based
- Better for fewer projects

**Toggle between views:**

```tsx
<div className="btn-group">
  <button
    className={`btn btn-sm ${
      viewMode === "table" ? "btn-active" : "btn-ghost"
    }`}
    onClick={() => setViewMode("table")}
  >
    <svg
      className="w-4 h-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 6h16M4 10h16M4 14h16M4 18h16"
      />
    </svg>
    Table
  </button>
  <button
    className={`btn btn-sm ${viewMode === "grid" ? "btn-active" : "btn-ghost"}`}
    onClick={() => setViewMode("grid")}
  >
    <svg
      className="w-4 h-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
      />
    </svg>
    Grid
  </button>
</div>
```

### Components Used

| Component                | Purpose            | Props/Details                        |
| ------------------------ | ------------------ | ------------------------------------ |
| `Breadcrumbs`            | Navigation trail   | Links to parent pages                |
| `Button` (primary)       | New project action | Top-right, opens modal               |
| `Input` (with icon)      | Search field       | Debounced, searches name/client/tags |
| `Tabs`                   | Status filter tabs | Active, Completed, Archived, Overdue |
| `Dropdown`               | Advanced filters   | Client, date range, amount range     |
| `AdvancedTable`          | Table view         | Sortable columns, pagination         |
| `ProjectCardPremium` × N | Grid view          | Visual project cards                 |
| `Badge`                  | Status indicators  | Color-coded by status                |
| `Progress`               | Completion bars    | In table cells                       |
| `Pagination`             | Page navigation    | Prev/Next, page numbers              |
| `Button` (ghost, xs)     | Row actions        | Edit, View, Archive buttons          |

### Data Dependencies

**API Calls:**

```typescript
// On load and filter/sort/page change
const { projects, total } = await getProjects({
  filter: {
    searchQuery: searchTerm,
    status: selectedStatuses,
    clientIds: selectedClients,
    dateFrom: dateRange.from,
    dateTo: dateRange.to,
    isRecurring: recurringFilter,
    isOverdue: overdueFilter,
  },
  sort: {
    field: sortField, // 'name', 'totalAmount', 'endDate', 'progress'
    direction: sortDirection, // 'asc' | 'desc'
  },
  pagination: {
    page: currentPage,
    pageSize: 20,
  },
});

// Calculate stats for each project
const projectsWithStats = await Promise.all(
  projects.map(async (p) => ({
    ...p,
    stats: await calculateProjectStats(p.id),
    client: await getClientById(p.clientId),
  }))
);

// Get clients for filter dropdown
const clients = await getClients();
```

**State:**

```typescript
const [projects, setProjects] = useState<Project[]>([]);
const [projectStats, setProjectStats] = useState<Map<string, ProjectStats>>(
  new Map()
);
const [totalProjects, setTotalProjects] = useState(0);
const [viewMode, setViewMode] = useState<"table" | "grid">("table");
const [searchTerm, setSearchTerm] = useState("");
const [selectedStatuses, setSelectedStatuses] = useState<string[]>(["active"]);
const [selectedClients, setSelectedClients] = useState<string[]>([]);
const [sortConfig, setSortConfig] = useState({
  field: "updatedAt",
  direction: "desc",
});
const [currentPage, setCurrentPage] = useState(1);
const [isLoading, setIsLoading] = useState(true);
```

### User Interactions

**1. Search:**

- Debounced text input (300ms)
- Searches: project name, client name, tags, notes
- Clear button (X) to reset

**2. Status Tabs:**

- Click tab to filter by status
- Active tab highlighted
- Badge shows count per status
- "All" tab shows all statuses

**3. Advanced Filters Dropdown:**

- Client multi-select
- Date range picker (from/to)
- Amount range (min/max)
- Recurring checkbox
- Overdue checkbox
- "Apply Filters" button
- "Reset" button

**4. Column Sorting (Table View):**

- Click column header to sort
- First click: ascending
- Second click: descending
- Third click: reset to default
- Visual indicator (↑↓) shows current sort

**5. Row Actions:**

- **Edit:** Open Edit Project modal
- **View:** Navigate to Project Detail page
- **Archive:** Confirm, then update status to 'archived'
- **Delete:** Confirm (with warning), then delete if no transactions

**6. Pagination:**

- Previous/Next buttons
- Page number buttons (show 5 at a time)
- Jump to page input
- "Items per page" dropdown (10, 20, 50, 100)

**7. Bulk Actions (Advanced):**

- Checkbox column for multi-select
- "Select All" checkbox in header
- Bulk actions dropdown: Archive, Export, Delete
- Confirmation modal for bulk operations

**8. New Project Button:**

- Opens Create Project modal
- After creation, refresh list and highlight new project

### Table Columns

| Column        | Width | Sortable        | Content                                           |
| ------------- | ----- | --------------- | ------------------------------------------------- |
| **Project**   | 25%   | ✅ name         | Name, recurring badge, client name (subtitle)     |
| **Client**    | 15%   | ✅ clientId     | Client name (with link to client projects)        |
| **Total**     | 12%   | ✅ totalAmount  | Formatted currency                                |
| **Received**  | 12%   | ✅ (calculated) | Formatted currency with color (green if complete) |
| **Remaining** | 12%   | ✅ (calculated) | Formatted currency with color (red if overdue)    |
| **Progress**  | 14%   | ✅ (calculated) | Progress bar + percentage                         |
| **Status**    | 10%   | ✅ status       | Badge (color-coded)                               |
| **Actions**   | Auto  | ❌              | Edit, View buttons                                |

**Implementation:**

```typescript
const columns = [
  {
    header: "Project",
    accessor: "name",
    sortable: true,
    render: (project: Project) => (
      <div>
        <div className="flex items-center gap-2">
          <span className="font-semibold">{project.name}</span>
          {project.isRecurring && (
            <div className="badge badge-xs badge-primary">Recurring</div>
          )}
        </div>
        <div className="text-xs text-base-content/60">
          {project.client.name}
        </div>
      </div>
    ),
  },
  {
    header: "Total",
    accessor: "totalAmount",
    sortable: true,
    render: (project: Project) => (
      <span className="font-semibold">
        {formatCurrency(project.totalAmount)}
      </span>
    ),
  },
  {
    header: "Received",
    accessor: "received",
    sortable: true,
    render: (project: Project) => {
      const stats = projectStats.get(project.id);
      return (
        <span
          className={stats?.isCompleted ? "text-success font-semibold" : ""}
        >
          {formatCurrency(stats?.totalReceived || 0)}
        </span>
      );
    },
  },
  {
    header: "Progress",
    accessor: "progress",
    sortable: true,
    render: (project: Project) => {
      const stats = projectStats.get(project.id);
      return TableCellRenderers.progressBar(stats?.progress || 0);
    },
  },
  {
    header: "Status",
    accessor: "status",
    sortable: true,
    render: (project: Project) =>
      TableCellRenderers.statusBadge(project.status),
  },
];
```

### Loading State

```tsx
{
  isLoading ? (
    <TableSkeleton rows={10} />
  ) : (
    <AdvancedTable data={projects} columns={columns} {...handlers} />
  );
}
```

### Empty State

```tsx
{
  projects.length === 0 && !isLoading && (
    <div className="card glass bg-base-100/30 backdrop-blur-md p-16 text-center">
      <svg
        className="w-20 h-20 mx-auto text-base-content/30 mb-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      <h3 className="text-xl font-bold mb-2">No projects found</h3>
      <p className="text-base-content/60 mb-6">
        {searchTerm || selectedClients.length > 0
          ? "Try adjusting your filters or search query"
          : "Create your first project to get started"}
      </p>
      {!searchTerm && selectedClients.length === 0 && (
        <button onClick={openCreateModal} className="btn btn-primary">
          Create Project
        </button>
      )}
    </div>
  );
}
```

### Responsive Design

| Breakpoint          | Layout                                                                     |
| ------------------- | -------------------------------------------------------------------------- |
| **xs (< 640px)**    | Hide columns (show only Name, Amount, Progress), stack actions in dropdown |
| **md (640-1024px)** | Show Name, Total, Progress, Status, Actions                                |
| **lg (> 1024px)**   | Show all columns                                                           |

**Mobile Table:**

```tsx
<div className="lg:hidden">
  {projects.map((project) => (
    <div
      key={project.id}
      className="card glass bg-base-100/30 backdrop-blur-md mb-4 p-4"
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-bold">{project.name}</h3>
          <p className="text-xs text-base-content/60">{project.client.name}</p>
        </div>
        <Badge status={project.status} />
      </div>
      <div className="flex justify-between text-sm mb-2">
        <span className="text-base-content/60">Total:</span>
        <span className="font-semibold">
          {formatCurrency(project.totalAmount)}
        </span>
      </div>
      <Progress value={stats.progress} className="mb-2" />
      <div className="flex gap-2">
        <button className="btn btn-xs btn-ghost flex-1">View</button>
        <button className="btn btn-xs btn-ghost flex-1">Edit</button>
      </div>
    </div>
  ))}
</div>
```

### Accessibility

- Table with proper `<thead>`, `<tbody>`, `<th>` tags
- Sortable headers have `aria-sort` attribute
- Row actions have aria-labels
- Keyboard navigation (Tab through rows, Enter to open)
- Screen reader announces filter/sort changes

### Performance

- Virtual scrolling for > 100 projects
- Debounced search (300ms)
- Memoize table cells
- Lazy load project images in grid view
- Cache stats calculations (5 minutes)

---

**Continue to Part 5B for Project Detail, Modals (Add/Edit Project, Payment, Expense), and Attachment Viewer...**

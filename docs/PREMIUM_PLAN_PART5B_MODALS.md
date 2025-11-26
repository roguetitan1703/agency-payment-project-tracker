# PREMIUM PLAN — Part 5B: Screen Specifications (Project Detail, Modals, Attachment Viewer)

**Project:** Agency Payment Tracker — Premium Edition
**Date:** October 24, 2025

---

## SCREEN 5: Project Detail Page

### Purpose

Comprehensive view of a single project with all associated transactions, milestones, timeline, stats, and actions.

### Layout Structure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Breadcrumb: Dashboard > Projects > Website Redesign]     [← Back to List] │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  [Project Header]                                                     │  │
│  │  Website Redesign                              [Edit] [Archive] [⋯]  │  │
│  │  Client: Acme Corp • Started: Jan 15, 2025 • Due: Mar 31, 2025      │  │
│  │  [Tags: web, design, urgent]                   [🔁 Recurring]        │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │
│  │ 💰 Total    │  │ ✅ Received │  │ ⏳ Remaining│  │ 📊 Progress │      │
│  │ $15,000     │  │ $10,000     │  │ $5,000      │  │ 68%         │      │
│  │             │  │ 12 payments │  │ $833/week   │  │ On Track    │      │
│  │             │  │             │  │             │  │ [Radial]    │      │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘      │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  [Tab Navigation]                                                     │  │
│  │  ● Timeline  ○ Payments (12)  ○ Expenses (8)  ○ Milestones (4)      │  │
│  │  ───────────────────────────────────────────────────────────────────  │  │
│  │                                                                        │  │
│  │  TIMELINE VIEW (Default Tab):                                         │  │
│  │  ┌────────────────────────────────────────────────────────────────┐ │  │
│  │  │  Mar 20, 2025                                                   │ │  │
│  │  │  ●─────  💵 Payment Received: $2,500                           │ │  │
│  │  │          Via: Bank Transfer • Source: Milestone 2              │ │  │
│  │  │          Note: Second milestone payment                        │ │  │
│  │  │          [View Details]                                        │ │  │
│  │  │                                                                 │ │  │
│  │  │  Mar 18, 2025                                                   │ │  │
│  │  │  ●─────  📉 Expense: $340                                      │ │  │
│  │  │          Category: Software • Adobe XD subscription            │ │  │
│  │  │          [View Receipt]                                        │ │  │
│  │  │                                                                 │ │  │
│  │  │  Mar 15, 2025                                                   │ │  │
│  │  │  ●─────  ✅ Milestone Completed: Design Phase                 │ │  │
│  │  │          Progress: 50% → 75%                                   │ │  │
│  │  │                                                                 │ │  │
│  │  │  ...more timeline items...                                      │ │  │
│  │  └────────────────────────────────────────────────────────────────┘ │  │
│  │                                                                        │  │
│  │  [+ Add Payment]  [+ Add Expense]  [+ Add Milestone]                 │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  Milestones                                                   (4/6)   │  │
│  │  ┌────────────────────────────────────────────────────────────────┐ │  │
│  │  │  ✅ Discovery & Planning        $2,500    100%  ████████████  │ │  │
│  │  │  ✅ Design Phase                $3,500    100%  ████████████  │ │  │
│  │  │  🔄 Development                 $5,000     60%  ███████░░░░░  │ │  │
│  │  │  ⏸️  Testing & QA                $2,000      0%  ░░░░░░░░░░░░  │ │  │
│  │  │  ⏸️  Deployment                  $1,500      0%  ░░░░░░░░░░░░  │ │  │
│  │  │  ⏸️  Post-Launch Support          $500      0%  ░░░░░░░░░░░░  │ │  │
│  │  └────────────────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  Quick Actions                                                        │  │
│  │  [Mark as Completed]  [Generate Invoice]  [Export PDF]  [Share]      │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Components Used

| Component             | Purpose                | Props/Details                            |
| --------------------- | ---------------------- | ---------------------------------------- |
| `Breadcrumbs`         | Navigation trail       | Back to Projects List                    |
| `Card` (glass)        | Project header         | Name, client, dates, tags                |
| `Badge`               | Tags, recurring flag   | Various colors                           |
| `Dropdown`            | More actions menu      | Archive, Delete, Duplicate               |
| `StatCardPremium` × 4 | Project stats          | Total, Received, Remaining, Progress     |
| `RadialProgressCard`  | Progress visualization | Circular progress with percentage        |
| `Tabs`                | Content sections       | Timeline, Payments, Expenses, Milestones |
| `Timeline`            | Chronological events   | Payments, expenses, milestones           |
| `Table`               | Payments/Expenses tabs | Sortable, filterable                     |
| `MilestoneCard`       | Milestone rows         | Status, amount, progress bar             |
| `Button` group        | Quick actions          | Mark complete, invoice, export           |
| `FAB`                 | Add transaction        | Quick add payment/expense                |

### Data Dependencies

**API Calls on Load:**

```typescript
// 1. Get project by ID
const project = await getProjectById(projectId);

// 2. Get client details
const client = await getClientById(project.clientId);

// 3. Calculate project stats
const stats = await calculateProjectStats(projectId);

// 4. Get all payments for this project
const { payments } = await getPayments({
  filter: { projectIds: [projectId] },
  sort: { field: "date", direction: "desc" },
});

// 5. Get all expenses for this project
const { expenses } = await getExpenses({
  filter: { projectIds: [projectId] },
  sort: { field: "date", direction: "desc" },
});

// 6. Get milestones
const milestones = project.milestones || [];

// 7. Build timeline (combine payments, expenses, milestone events)
const timelineItems = buildTimeline(payments, expenses, milestones);

// 8. Check for overdue status
const isOverdue = checkOverdue(project);
```

**State:**

```typescript
const [project, setProject] = useState<Project | null>(null);
const [client, setClient] = useState<Client | null>(null);
const [stats, setStats] = useState<ProjectStats | null>(null);
const [payments, setPayments] = useState<Payment[]>([]);
const [expenses, setExpenses] = useState<Expense[]>([]);
const [milestones, setMilestones] = useState<Milestone[]>([]);
const [timeline, setTimeline] = useState<TimelineItem[]>([]);
const [activeTab, setActiveTab] = useState<
  "timeline" | "payments" | "expenses" | "milestones"
>("timeline");
const [isLoading, setIsLoading] = useState(true);
const [refreshKey, setRefreshKey] = useState(0);
```

### User Interactions

**1. Header Actions:**

- **Edit Button:** Opens Edit Project modal (pre-filled with current data)
- **Archive Button:** Confirms, then updates status to 'archived'
- **More Menu (⋯):**
  - Duplicate Project
  - Mark as Completed
  - Delete Project (with warning)
  - Generate Invoice (exports PDF)

**2. Tab Navigation:**

- Click tab to switch content
- Active tab highlighted
- Badge shows count of items

**3. Timeline Tab:**

- Scroll to load more (infinite scroll or pagination)
- Click item to expand details
- Payment items: Click "View Details" → Opens payment detail modal
- Expense items: Click "View Receipt" → Opens attachment viewer
- Milestone items: Visual indicator of completion

**4. Payments Tab:**

- Table with columns: Date, Amount, Source, Status, Actions
- Sort by any column
- Click row → Opens payment detail modal
- Actions: Edit, Delete, Mark as Disputed

**5. Expenses Tab:**

- Table with columns: Date, Amount, Category, Description, Attachments, Actions
- Sort by any column
- Click row → Opens expense detail modal
- Actions: Edit, Delete, View Attachments

**6. Milestones Tab:**

- List of milestone cards
- Each shows: Name, Amount, Progress bar, Status icon
- Click to expand/collapse details
- Actions: Edit, Delete, Mark as Complete
- Add Milestone button

**7. Quick Actions:**

- **Mark as Completed:**
  - Check if fully paid
  - If not, show warning
  - Confirm, then update status
- **Generate Invoice:**
  - Opens invoice preview modal
  - Export as PDF
- **Export PDF:**
  - Generate project summary PDF
  - Include all transactions
- **Share:**
  - Copy shareable link (future feature)
  - Or export JSON

**8. Add Buttons:**

- **+ Add Payment:** Opens Quick Add Payment modal (project pre-selected)
- **+ Add Expense:** Opens Quick Add Expense modal (project pre-selected)
- **+ Add Milestone:** Opens Add Milestone modal

**9. Real-time Updates:**

- Listen to EventBus for transaction changes
- Auto-refresh stats when payment/expense added
- Highlight newly added items

### Timeline Item Structure

```typescript
type TimelineItem = {
  id: string;
  type:
    | "payment"
    | "expense"
    | "milestone_completed"
    | "milestone_created"
    | "project_created";
  date: string;
  title: string;
  description?: string;
  amount?: number;
  icon: ReactNode;
  color: string; // Tailwind color class
  metadata?: Record<string, any>;
};

// Example timeline rendering:
const TimelineItemComponent = ({ item }: { item: TimelineItem }) => (
  <div className="flex gap-4 mb-6 last:mb-0">
    {/* Icon */}
    <div
      className={`flex-shrink-0 w-10 h-10 rounded-full ${item.color} flex items-center justify-center`}
    >
      {item.icon}
    </div>

    {/* Content */}
    <div className="flex-1">
      <div className="flex items-start justify-between mb-1">
        <h4 className="font-semibold">{item.title}</h4>
        <span className="text-xs text-base-content/60">
          {formatDate(item.date, "relative")}
        </span>
      </div>
      {item.description && (
        <p className="text-sm text-base-content/70 mb-2">{item.description}</p>
      )}
      {item.amount && (
        <div className="text-lg font-bold text-primary">
          {formatCurrency(item.amount)}
        </div>
      )}
      {item.metadata && (
        <div className="flex gap-4 text-xs text-base-content/60 mt-2">
          {Object.entries(item.metadata).map(([key, value]) => (
            <span key={key}>
              {key}: {value}
            </span>
          ))}
        </div>
      )}
    </div>
  </div>
);
```

### Milestone Card Component

```tsx
const MilestoneCard = ({ milestone }: { milestone: Milestone }) => {
  const progress = calculateMilestoneProgress(milestone);
  const isComplete = milestone.status === "completed";
  const isActive = milestone.status === "in-progress";

  return (
    <div
      className={`card glass bg-base-100/30 backdrop-blur-md border border-white/10 p-4 mb-3 ${
        isComplete ? "border-success/30" : isActive ? "border-primary/30" : ""
      }`}
    >
      <div className="flex items-center gap-4">
        {/* Status Icon */}
        <div
          className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
            isComplete
              ? "bg-success/20 text-success"
              : isActive
              ? "bg-primary/20 text-primary"
              : "bg-base-content/10 text-base-content/40"
          }`}
        >
          {isComplete ? "✅" : isActive ? "🔄" : "⏸️"}
        </div>

        {/* Details */}
        <div className="flex-1">
          <h4 className="font-semibold mb-1">{milestone.name}</h4>
          <div className="flex items-center gap-4 text-sm text-base-content/60">
            <span>{formatCurrency(milestone.amount)}</span>
            {milestone.dueDate && (
              <span>Due: {formatDate(milestone.dueDate)}</span>
            )}
          </div>
        </div>

        {/* Progress */}
        <div className="flex-shrink-0 w-32">
          <div className="text-xs text-base-content/60 mb-1">{progress}%</div>
          <progress
            className={`progress ${
              isComplete ? "progress-success" : "progress-primary"
            } w-full`}
            value={progress}
            max="100"
          />
        </div>

        {/* Actions */}
        <div className="dropdown dropdown-end">
          <button className="btn btn-ghost btn-sm btn-circle">⋯</button>
          <ul className="dropdown-content menu p-2 shadow-lg bg-base-100 rounded-box w-52">
            <li>
              <a onClick={() => handleEditMilestone(milestone)}>Edit</a>
            </li>
            {!isComplete && (
              <li>
                <a onClick={() => handleCompleteMilestone(milestone)}>
                  Mark Complete
                </a>
              </li>
            )}
            <li>
              <a
                onClick={() => handleDeleteMilestone(milestone)}
                className="text-error"
              >
                Delete
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
```

### Loading State

```tsx
{isLoading ? (
  <div className="space-y-6">
    <CardSkeleton /> {/* Header */}
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
    </div>
    <CardSkeleton className="h-96" /> {/* Timeline */}
  </div>
) : (
  // Actual content
)}
```

### Error State

```tsx
{
  !project && !isLoading && (
    <div className="alert alert-error glass">
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
        ...
      </svg>
      <div>
        <h3 className="font-bold">Project not found</h3>
        <p className="text-sm">
          The project you're looking for doesn't exist or has been deleted.
        </p>
      </div>
      <button onClick={() => navigate("/projects")} className="btn btn-sm">
        Back to Projects
      </button>
    </div>
  );
}
```

### Responsive Design

| Breakpoint          | Layout                                                  |
| ------------------- | ------------------------------------------------------- |
| **xs (< 640px)**    | Stack all cards vertically, hide some columns in tables |
| **md (640-1024px)** | Stats 2 columns, tabs full width                        |
| **lg (> 1024px)**   | Stats 4 columns, tables show all columns                |

### Accessibility

- Proper heading hierarchy (h1 for project name)
- Tab panel has `role="tabpanel"` and `aria-labelledby`
- Timeline uses semantic `<ol>` list
- All actions have aria-labels

---

## MODAL 1: Add/Edit Project

### Purpose

Create new project or edit existing project with full details including milestones.

### Modal Layout

```
┌─────────────────────────────────────────────────────────────┐
│  [Modal Header]                                         [×]  │
│  ● Create New Project / Edit Project                        │
│  ──────────────────────────────────────────────────────────  │
│                                                              │
│  Project Details                                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Project Name *                                         │ │
│  │ [Input: Website Redesign                          ]    │ │
│  │                                                         │ │
│  │ Client *                                                │ │
│  │ [Dropdown: Select client... ▼             ]  [+ New]   │ │
│  │                                                         │ │
│  │ Total Amount *                                          │ │
│  │ [$] [15000                                ]            │ │
│  │                                                         │ │
│  │ ┌──────────────────────┐  ┌──────────────────────┐   │ │
│  │ │ Start Date *         │  │ End Date *           │   │ │
│  │ │ [📅 2025-01-15  ]   │  │ [📅 2025-03-31  ]   │   │ │
│  │ └──────────────────────┘  └──────────────────────┘   │ │
│  │                                                         │ │
│  │ Tags (optional)                                        │ │
│  │ [Input: web, design, urgent                       ]    │ │
│  │ [Suggestions: #wordpress #ecommerce #redesign]         │ │
│  │                                                         │ │
│  │ Notes (optional)                                       │ │
│  │ [Textarea: Project includes homepage redesign...  ]    │ │
│  │                                                         │ │
│  │ ☑ This is a recurring project                         │ │
│  │ ☐ Notify me of overdue payments                       │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  Milestones (optional)                              [+ Add]  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ 1. Discovery & Planning        $2,500    Due: 1/31    │ │
│  │    [Edit] [Delete]                                     │ │
│  │                                                         │ │
│  │ 2. Design Phase                $3,500    Due: 2/15    │ │
│  │    [Edit] [Delete]                                     │ │
│  │                                                         │ │
│  │ [+ Add Milestone]                                      │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ──────────────────────────────────────────────────────────  │
│  Total Milestones: $6,000 / Project Total: $15,000          │
│  ⚠️ Warning: Milestones total ($6,000) is less than         │
│     project total ($15,000). Consider adding more.           │
│  ──────────────────────────────────────────────────────────  │
│                                                              │
│  [Cancel]                              [Save Project]        │
└─────────────────────────────────────────────────────────────┘
```

### Components Used

| Component             | Purpose             | Props                                  |
| --------------------- | ------------------- | -------------------------------------- |
| `Modal`               | Container           | `open={isOpen}, onClose={handleClose}` |
| `Input`               | Text fields         | Various                                |
| `Select` / `Dropdown` | Client selection    | Searchable, with "Add New" option      |
| `DatePicker`          | Date inputs         | Min/max validation                     |
| `Textarea`            | Notes field         | Auto-resize                            |
| `Checkbox`            | Flags               | Recurring, notifications               |
| `TagInput`            | Tags field          | Comma-separated, suggestions           |
| `Button` (ghost)      | Cancel              | Closes modal                           |
| `Button` (primary)    | Save                | Submits form                           |
| `Alert`               | Validation warnings | Milestone total mismatch               |

### Data Dependencies

**API Calls:**

```typescript
// On modal open (if editing)
const project = await getProjectById(projectId);
const client = await getClientById(project.clientId);

// Get clients for dropdown
const clients = await getClients();

// On save
if (isEditMode) {
  await updateProject(projectId, formData);
} else {
  const newProject = await createProject(formData);
  // Auto-create reminders if notifyOverdue checked
  if (formData.notifyOverdue) {
    await createReminder({
      projectId: newProject.id,
      type: "overdue",
      // ...reminder config
    });
  }
}

// If milestones were added/edited
await Promise.all(
  formData.milestones.map((m) =>
    m.id ? updateMilestone(m.id, m) : createMilestone({ ...m, projectId })
  )
);
```

**State:**

```typescript
const [formData, setFormData] = useState<ProjectInput>({
  name: "",
  clientId: "",
  totalAmount: 0,
  startDate: new Date().toISOString().split("T")[0],
  endDate: "",
  tags: [],
  notes: "",
  isRecurring: false,
  notifyOverdue: false,
  milestones: [],
});
const [clients, setClients] = useState<Client[]>([]);
const [errors, setErrors] = useState<Record<string, string>>({});
const [isSubmitting, setIsSubmitting] = useState(false);
const [showAddClient, setShowAddClient] = useState(false);
```

### User Interactions

**1. Client Selection:**

- Dropdown with search
- Shows client name and company
- "+ New Client" option opens Add Client modal inline
- After creating client, auto-select in project form

**2. Date Pickers:**

- Start date: Default to today
- End date: Must be >= start date
- Calendar picker with quick options (1 month, 3 months, 6 months)

**3. Tags Input:**

- Type and press Enter to add tag
- Show recent/suggested tags below
- Click suggestion to add
- Click tag to remove

**4. Milestones:**

- **Add Milestone:** Opens inline milestone form or separate mini-modal
- **Edit Milestone:** Opens same form, pre-filled
- **Delete Milestone:** Confirm, then remove from list
- **Validation:** Sum of milestone amounts should equal project total (warning if not)

**5. Recurring Checkbox:**

- When checked, show additional fields:
  - Frequency (monthly, quarterly, annually)
  - Next recurrence date

**6. Save:**

- Validate all required fields
- Check date logic (end >= start)
- Check milestone total (warn if mismatch)
- Submit to API
- Show success toast
- Close modal
- Refresh project list/detail

**7. Cancel:**

- If form is dirty (has unsaved changes), show confirmation
- Close modal without saving

### Validation Rules

| Field        | Rule                      | Error Message                        |
| ------------ | ------------------------- | ------------------------------------ |
| Project Name | Required, min 1 char      | "Project name is required"           |
| Client       | Required, valid client ID | "Please select a client"             |
| Total Amount | Required, > 0             | "Amount must be greater than 0"      |
| Start Date   | Required, valid date      | "Invalid start date"                 |
| End Date     | Required, >= start date   | "End date must be after start date"  |
| Tags         | Optional, max 10 tags     | "Maximum 10 tags allowed"            |
| Milestones   | Optional, valid amounts   | "Milestone amounts must be positive" |

### Milestone Sub-Form

```tsx
const MilestoneForm = ({ milestone, onSave, onCancel }) => (
  <div className="bg-base-200 rounded-lg p-4 mb-2">
    <h5 className="font-semibold mb-3">
      {milestone ? "Edit Milestone" : "Add Milestone"}
    </h5>
    <div className="space-y-3">
      <Input
        label="Milestone Name *"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g., Discovery & Planning"
      />
      <Input
        label="Amount *"
        type="number"
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
        placeholder="0.00"
        prefix="$"
      />
      <DatePicker label="Due Date" value={dueDate} onChange={setDueDate} />
      <div className="flex gap-2">
        <button onClick={onCancel} className="btn btn-ghost btn-sm flex-1">
          Cancel
        </button>
        <button onClick={handleSave} className="btn btn-primary btn-sm flex-1">
          Save Milestone
        </button>
      </div>
    </div>
  </div>
);
```

### Responsive Design

- **Desktop:** Modal width 800px, 2-column date pickers
- **Mobile:** Full-screen modal, stack all inputs

### Accessibility

- Focus trap within modal
- Escape key closes (with confirm if dirty)
- Auto-focus on project name field
- All inputs have labels
- Error messages linked with `aria-describedby`

---

## MODAL 2: Quick Add Payment

### Purpose

Quickly add a payment transaction with smart defaults and suggestions.

### Modal Layout

```
┌─────────────────────────────────────────────────────────────┐
│  [Modal Header]                                         [×]  │
│  💵 Add Payment                                              │
│  ──────────────────────────────────────────────────────────  │
│                                                              │
│  Quick Suggestions                              [Dismiss]    │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ 💡 Based on your recent activity:                      │ │
│  │ • "Website Redesign" project is 50% complete. Add the  │ │
│  │   next milestone payment of $3,500?  [Use This]        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  Payment Details                                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Project *                                               │ │
│  │ [Dropdown: Website Redesign ▼                ]         │ │
│  │ Progress: 50% • Remaining: $7,500                      │ │
│  │                                                         │ │
│  │ Amount *                                                │ │
│  │ [$] [3500                                 ]            │ │
│  │ ⚠️ This payment exceeds remaining amount ($7,500)      │ │
│  │                                                         │ │
│  │ Date *                                                  │ │
│  │ [📅 2025-03-20                            ]            │ │
│  │                                                         │ │
│  │ Payment Source *                                        │ │
│  │ [Dropdown: Bank Transfer ▼                   ] [+ New] │ │
│  │                                                         │ │
│  │ Reference / Invoice # (optional)                       │ │
│  │ [Input: INV-2025-003                          ]        │ │
│  │                                                         │ │
│  │ Notes (optional)                                       │ │
│  │ [Textarea: Milestone 2 payment...             ]        │ │
│  │                                                         │ │
│  │ Attachments (optional)                         [Upload]│ │
│  │ ┌────────────────────────────────────────────────────┐│ │
│  │ │ 📄 invoice_march.pdf (234 KB)            [× Remove]││ │
│  │ │ 🖼️ screenshot.png (89 KB)                [× Remove]││ │
│  │ └────────────────────────────────────────────────────┘│ │
│  │                                                         │ │
│  │ ☐ Mark as disputed                                     │ │
│  │ ☐ Create reminder for next payment                    │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  Summary                                                     │
│  • Project will be 73% complete after this payment           │
│  • Remaining: $4,000 ($500 over budget if disputed)          │
│  ──────────────────────────────────────────────────────────  │
│                                                              │
│  [Cancel]                                [Add Payment]       │
└─────────────────────────────────────────────────────────────┘
```

### Components Used

| Component             | Purpose             | Props                                  |
| --------------------- | ------------------- | -------------------------------------- |
| `Modal`               | Container           | `open={isOpen}, onClose={handleClose}` |
| `Alert` (info)        | Quick suggestions   | Dismissible                            |
| `Select` (searchable) | Project dropdown    | Shows progress and remaining           |
| `Input` (number)      | Amount field        | With currency prefix                   |
| `DatePicker`          | Date selection      | Default to today                       |
| `Select`              | Payment source      | With "+ New Source" option             |
| `Input`               | Reference/invoice # | Optional                               |
| `Textarea`            | Notes               | Auto-resize                            |
| `FileUpload`          | Attachments         | Drag & drop, max 5MB each              |
| `Checkbox`            | Flags               | Disputed, reminder                     |
| `Alert` (warning)     | Overpayment warning | Shows if amount > remaining            |
| `Button`              | Actions             | Cancel, Save                           |

### Data Dependencies

**API Calls:**

```typescript
// On modal open
const projects = await getProjects({ status: ["active"] });
const sources = await getSources({ filter: { type: "income" } });

// Get quick add suggestions
const suggestions = await getQuickAddSuggestions("payment");

// If project pre-selected (from Dashboard/Project Detail)
const projectStats = await calculateProjectStats(projectId);

// On save
const payment = await createPayment(formData);

// Upload attachments
if (attachments.length > 0) {
  await Promise.all(
    attachments.map((file) => uploadAttachment(payment.id, file, "payment"))
  );
}

// Create reminder if checked
if (formData.createReminder) {
  await createReminder({
    projectId: formData.projectId,
    type: "next_payment",
    dueDate: calculateNextPaymentDate(project),
  });
}

// Trigger recalculations
await calculateProjectStats(formData.projectId);
await calculateDashboardStats();
```

**State:**

```typescript
const [formData, setFormData] = useState<PaymentInput>({
  projectId: preSelectedProjectId || "",
  amount: 0,
  date: new Date().toISOString().split("T")[0],
  sourceId: "",
  reference: "",
  notes: "",
  isDisputed: false,
  createReminder: false,
});
const [projects, setProjects] = useState<Project[]>([]);
const [sources, setSources] = useState<Source[]>([]);
const [suggestions, setSuggestions] = useState<QuickAddSuggestion[]>([]);
const [attachments, setAttachments] = useState<File[]>([]);
const [errors, setErrors] = useState<Record<string, string>>({});
const [isSubmitting, setIsSubmitting] = useState(false);
```

### User Interactions

**1. Quick Suggestions:**

- Show at top if suggestions available
- Click "Use This" to auto-fill form with suggestion data
- Click "Dismiss" to hide suggestions

**2. Project Selection:**

- Searchable dropdown
- Shows: Project name, client name, progress, remaining amount
- After selection, display project progress bar below
- Show warning if amount exceeds remaining

**3. Amount Input:**

- Auto-focus if project pre-selected
- Show overpayment warning if amount > remaining
- Allow override (some projects may go over budget)

**4. Payment Source:**

- Dropdown with existing sources
- "+ New Source" opens inline form or mini-modal
- After creating source, auto-select in payment form

**5. Attachments:**

- Drag & drop zone
- Click to browse files
- Show file preview (icon, name, size)
- Remove button per file
- Validate: Max 5MB per file, image/PDF formats

**6. Disputed Checkbox:**

- When checked, show additional note field: "Dispute reason"
- Mark payment with disputed flag

**7. Create Reminder:**

- Auto-calculate next expected payment date
- Create reminder after saving payment

**8. Save:**

- Validate all required fields
- Check overpayment warning (allow but warn)
- Upload attachments (convert to base64)
- Create payment record
- Show success toast
- Auto-close modal after 1 second
- Trigger event to refresh data

### Validation Rules

| Field       | Rule                       | Error Message                    |
| ----------- | -------------------------- | -------------------------------- |
| Project     | Required, valid project ID | "Please select a project"        |
| Amount      | Required, > 0              | "Amount must be greater than 0"  |
| Date        | Required, valid date       | "Invalid payment date"           |
| Source      | Required, valid source ID  | "Please select a payment source" |
| Attachments | Optional, max 5MB each     | "File size exceeds 5MB limit"    |

### Overpayment Warning

```tsx
{
  formData.amount > remainingAmount && (
    <div className="alert alert-warning">
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
          clipRule="evenodd"
        />
      </svg>
      <div>
        <h4 className="font-bold">Overpayment Warning</h4>
        <p className="text-sm">
          This payment ({formatCurrency(formData.amount)}) exceeds the remaining
          amount ({formatCurrency(remainingAmount)}). Project will be{" "}
          {formatPercentage(overagePercent)} over budget.
        </p>
      </div>
    </div>
  );
}
```

### Responsive Design

- **Desktop:** Modal width 600px
- **Mobile:** Full-screen modal, stack all inputs

### Accessibility

- Focus trap within modal
- Escape key closes
- All inputs labeled
- File upload has keyboard support

---

## MODAL 3: Quick Add Expense

### Purpose

Quickly add an expense transaction with category selection.

### Modal Layout

```
┌─────────────────────────────────────────────────────────────┐
│  [Modal Header]                                         [×]  │
│  📉 Add Expense                                              │
│  ──────────────────────────────────────────────────────────  │
│                                                              │
│  Expense Details                                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Project (optional)                                      │ │
│  │ [Dropdown: Select project... ▼                ]        │ │
│  │ Leave empty for general business expense               │ │
│  │                                                         │ │
│  │ Amount *                                                │ │
│  │ [$] [340                                  ]            │ │
│  │                                                         │ │
│  │ Date *                                                  │ │
│  │ [📅 2025-03-18                            ]            │ │
│  │                                                         │ │
│  │ Category *                                              │ │
│  │ [Dropdown: Software & Tools ▼                 ] [+ New]│ │
│  │                                                         │ │
│  │ Description *                                           │ │
│  │ [Input: Adobe XD subscription (March)         ]        │ │
│  │                                                         │ │
│  │ Notes (optional)                                       │ │
│  │ [Textarea: Monthly subscription...            ]        │ │
│  │                                                         │ │
│  │ Attachments (optional)                         [Upload]│ │
│  │ ┌────────────────────────────────────────────────────┐│ │
│  │ │ 📄 receipt.pdf (156 KB)                  [× Remove]││ │
│  │ └────────────────────────────────────────────────────┘│ │
│  │                                                         │ │
│  │ ☐ This is a recurring expense                         │ │
│  │   [Monthly ▼] starting from [2025-03-18]              │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ──────────────────────────────────────────────────────────  │
│  Total expenses this month: $2,480 (+$340)                   │
│  ──────────────────────────────────────────────────────────  │
│                                                              │
│  [Cancel]                                [Add Expense]       │
└─────────────────────────────────────────────────────────────┘
```

### Components Used

| Component             | Purpose          | Props                                  |
| --------------------- | ---------------- | -------------------------------------- |
| `Modal`               | Container        | `open={isOpen}, onClose={handleClose}` |
| `Select` (searchable) | Project dropdown | Optional                               |
| `Input` (number)      | Amount field     | With currency prefix                   |
| `DatePicker`          | Date selection   | Default to today                       |
| `Select`              | Category         | With "+ New Category" option           |
| `Input`               | Description      | Required                               |
| `Textarea`            | Notes            | Optional, auto-resize                  |
| `FileUpload`          | Attachments      | Drag & drop, receipts                  |
| `Checkbox`            | Recurring flag   | Shows additional fields                |
| `Select`              | Frequency        | Monthly, Quarterly, Annually           |
| `Button`              | Actions          | Cancel, Save                           |

### Data Dependencies

**API Calls:**

```typescript
// On modal open
const projects = await getProjects({ status: ["active"] });
const categories = await getCategories({ filter: { type: "expense" } });

// Get month-to-date expenses
const monthExpenses = await getExpenses({
  filter: { dateFrom: startOfMonth(), dateTo: endOfMonth() },
});
const monthTotal = monthExpenses.reduce((sum, e) => sum + e.amount, 0);

// On save
const expense = await createExpense(formData);

// Upload attachments
if (attachments.length > 0) {
  await Promise.all(
    attachments.map((file) => uploadAttachment(expense.id, file, "expense"))
  );
}

// If recurring, create recurring template
if (formData.isRecurring) {
  await createRecurringTemplate({
    type: "expense",
    frequency: formData.frequency,
    amount: formData.amount,
    nextDate: formData.date,
    categoryId: formData.categoryId,
    description: formData.description,
    projectId: formData.projectId,
  });
}

// Trigger recalculations
if (formData.projectId) {
  await calculateProjectStats(formData.projectId);
}
await calculateDashboardStats();
```

**State:**

```typescript
const [formData, setFormData] = useState<ExpenseInput>({
  projectId: preSelectedProjectId || null,
  amount: 0,
  date: new Date().toISOString().split("T")[0],
  categoryId: "",
  description: "",
  notes: "",
  isRecurring: false,
  frequency: "monthly",
});
const [projects, setProjects] = useState<Project[]>([]);
const [categories, setCategories] = useState<Category[]>([]);
const [attachments, setAttachments] = useState<File[]>([]);
const [monthTotal, setMonthTotal] = useState(0);
const [errors, setErrors] = useState<Record<string, string>>({});
const [isSubmitting, setIsSubmitting] = useState(false);
```

### User Interactions

**1. Project Selection (Optional):**

- Searchable dropdown
- Allow blank (general business expense)
- If selected, expense counts toward project stats

**2. Category Selection:**

- Dropdown with existing categories
- "+ New Category" opens inline form
- Categories grouped (if implementation supports groups)

**3. Recurring Expense:**

- When checked, show:
  - Frequency dropdown (Monthly, Quarterly, Annually)
  - Start date
  - Optional end date (for limited recurring)
- Create recurring template after saving

**4. Attachments:**

- Upload receipt images or PDFs
- Show preview thumbnails

**5. Save:**

- Validate required fields
- Upload attachments
- Create expense record
- If recurring, create template
- Show success toast
- Close modal
- Trigger event to refresh data

### Validation Rules

| Field       | Rule                        | Error Message                   |
| ----------- | --------------------------- | ------------------------------- |
| Amount      | Required, > 0               | "Amount must be greater than 0" |
| Date        | Required, valid date        | "Invalid expense date"          |
| Category    | Required, valid category ID | "Please select a category"      |
| Description | Required, min 3 chars       | "Description is required"       |
| Attachments | Optional, max 5MB each      | "File size exceeds 5MB limit"   |

### Responsive Design

- **Desktop:** Modal width 600px
- **Mobile:** Full-screen modal, stack all inputs

### Accessibility

- Same as payment modal

---

## MODAL 4: Attachment Viewer

### Purpose

View, download, and manage attachments (images, PDFs) for payments/expenses.

### Modal Layout

```
┌─────────────────────────────────────────────────────────────┐
│  [Modal Header]                                         [×]  │
│  📎 Attachments (3)                                          │
│  ──────────────────────────────────────────────────────────  │
│                                                              │
│  [Carousel / Gallery]                                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                                                         │ │
│  │              [← Previous]                               │ │
│  │                                                         │ │
│  │                [Image/PDF Preview]                      │ │
│  │                                                         │ │
│  │              [Next →]                                   │ │
│  │                                                         │ │
│  │  ● ○ ○  (Indicator dots)                               │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  invoice_march.pdf                               1 of 3      │
│  Uploaded: Mar 20, 2025 • Size: 234 KB                      │
│                                                              │
│  [Download]  [Delete]  [Full Screen]                        │
└─────────────────────────────────────────────────────────────┘
```

### Components Used

| Component       | Purpose           | Props                        |
| --------------- | ----------------- | ---------------------------- |
| `Modal` (large) | Container         | `open={isOpen}, size="xl"`   |
| `Carousel`      | Image/PDF gallery | Swipeable, keyboard nav      |
| `Image`         | Image preview     | Lazy load, zoom on click     |
| `PDFViewer`     | PDF embed         | Use `<iframe>` or PDF.js     |
| `Button`        | Actions           | Download, Delete, Fullscreen |
| `Badge`         | File count        | "3 attachments"              |

### Data Dependencies

**API Calls:**

```typescript
// On modal open
const attachments = await getAttachments({
  entityId: paymentId || expenseId,
  entityType: "payment" || "expense",
});

// Attachments are stored as base64, so decode for display
const attachmentUrls = attachments.map((a) => ({
  ...a,
  url: `data:${a.mimeType};base64,${a.data}`,
}));

// On delete
await deleteAttachment(attachmentId);
```

**State:**

```typescript
const [attachments, setAttachments] = useState<Attachment[]>([]);
const [currentIndex, setCurrentIndex] = useState(0);
const [isFullscreen, setIsFullscreen] = useState(false);
```

### User Interactions

**1. Navigation:**

- Previous/Next buttons
- Keyboard: Arrow keys
- Touch: Swipe left/right
- Indicator dots show current position

**2. Download:**

- Click "Download" button
- Use `<a download>` with data URL

**3. Delete:**

- Confirm deletion
- Remove attachment from list
- If last attachment, close modal

**4. Fullscreen:**

- Opens in browser fullscreen mode
- Escape to exit

### File Type Handling

```tsx
const renderAttachment = (attachment: Attachment) => {
  if (attachment.mimeType.startsWith("image/")) {
    return (
      <img
        src={attachment.url}
        alt={attachment.fileName}
        className="max-h-[60vh] max-w-full object-contain mx-auto"
      />
    );
  } else if (attachment.mimeType === "application/pdf") {
    return (
      <iframe
        src={attachment.url}
        className="w-full h-[60vh] border-0"
        title={attachment.fileName}
      />
    );
  } else {
    return (
      <div className="text-center p-12">
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
        <p className="text-base-content/60">Preview not available</p>
        <button
          onClick={() => downloadAttachment(attachment)}
          className="btn btn-primary btn-sm mt-4"
        >
          Download {attachment.fileName}
        </button>
      </div>
    );
  }
};
```

### Responsive Design

- **Desktop:** Modal width 1200px, large previews
- **Mobile:** Full-screen modal, touch swipe gestures

### Accessibility

- Keyboard navigation (arrows, Escape)
- Alt text on images
- Focus trap
- Screen reader announces current index

---

**Continue to Part 5C for Settings, Import/Export, Reports, and any additional screens...**

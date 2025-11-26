# PREMIUM PLAN — Part 3: Automated Functions & Business Logic (API-Based)

**Project:** Agency Payment Tracker — Premium Edition
**Date:** October 24, 2025
**Architecture:** REST API with MongoDB Backend

---

## ⚠️ IMPORTANT: Backend-Calculated Data

**All auto-calculations are now performed on the backend:**

- **Project Statistics**: Backend calculates totals, progress, profit (MongoDB aggregations)
- **Dashboard Metrics**: Backend provides calculated stats via `/api/dashboard/stats`
- **Reminders & Notifications**: Backend cron jobs check due dates and send alerts
- **Recurring Payments**: Backend jobs create automatic payment records
- **Auto-Backup**: Backend scheduled backups to cloud storage

**Frontend responsibilities:**

- Fetch pre-calculated data from API endpoints
- Display loading states during async operations
- Trigger backend jobs via API calls when needed

See `API_ARCHITECTURE.md` for endpoint details.
See `BACKEND_SETUP.md` for server-side job scheduling (node-cron).

---

## 1. Auto-Calculation System

### Project Statistics Calculator

**Triggers:** After every payment/expense CREATE, UPDATE, DELETE

```typescript
export const calculateProjectStats = async (
  projectId: string
): Promise<ProjectStats> => {
  const project = await getProjectById(projectId);
  if (!project) {
    throw new NotFoundError(`Project ${projectId} not found`);
  }

  // Get all payments and expenses
  const payments = await getPaymentsByProjectId(projectId);
  const expenses = await getExpensesByProjectId(projectId);

  // Calculate totals
  const totalReceived = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const remaining = project.totalAmount - totalReceived;
  const progress =
    project.totalAmount > 0
      ? Math.min((totalReceived / project.totalAmount) * 100, 100)
      : 0;
  const netProfit = totalReceived - totalExpenses;

  // Calculate days remaining
  const today = new Date();
  const endDate = new Date(project.endDate);
  const daysRemaining = Math.ceil(
    (endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Determine status flags
  const isOverdue = endDate < today && remaining > 0;
  const isCompleted = remaining <= 0;

  return {
    projectId,
    totalReceived,
    totalExpenses,
    remaining,
    progress,
    netProfit,
    paymentCount: payments.length,
    expenseCount: expenses.length,
    isOverdue,
    isCompleted,
    daysRemaining,
  };
};

// Batch calculation for multiple projects
export const calculateMultipleProjectStats = async (
  projectIds: string[]
): Promise<Map<string, ProjectStats>> => {
  const statsMap = new Map<string, ProjectStats>();

  // Parallel calculation for performance
  const results = await Promise.all(
    projectIds.map((id) => calculateProjectStats(id))
  );

  results.forEach((stats) => {
    statsMap.set(stats.projectId, stats);
  });

  return statsMap;
};

// Recalculation trigger wrapper
export const recalculateProjectStats = async (
  projectId: string
): Promise<void> => {
  const stats = await calculateProjectStats(projectId);

  // Auto-update project status based on stats
  const project = await getProjectById(projectId);
  if (!project) return;

  let newStatus = project.status;

  // Auto-mark as completed if fully paid
  if (stats.isCompleted && project.status === "active") {
    newStatus = "completed";
    await updateProject(projectId, { status: "completed" });
  }

  // Emit event for UI refresh (if using event system)
  emitEvent("project:stats:updated", { projectId, stats });
};
```

---

### Dashboard Statistics Calculator

**Triggers:** On dashboard load, after any payment/expense/project change

```typescript
export const calculateDashboardStats = async (): Promise<DashboardStats> => {
  const projects = await getProjects();
  const payments = await getPayments();
  const expenses = await getExpenses();

  // Filter active projects only
  const activeProjects = projects.filter((p) => p.status === "active");

  // Calculate totals
  const totalBilled = activeProjects.reduce((sum, p) => sum + p.totalAmount, 0);
  const totalReceived = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const outstanding = totalBilled - totalReceived;
  const netProfit = totalReceived - totalExpenses;

  // Project counts
  const completedProjects = projects.filter(
    (p) => p.status === "completed"
  ).length;

  // Calculate overdue projects
  const today = new Date();
  const overdueProjectsCount = await Promise.all(
    activeProjects.map(async (p) => {
      const stats = await calculateProjectStats(p.id);
      return stats.isOverdue;
    })
  ).then((results) => results.filter(Boolean).length);

  // This month calculations
  const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const thisMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const receivedThisMonth = payments
    .filter((p) => {
      const date = new Date(p.date);
      return date >= thisMonthStart && date <= thisMonthEnd;
    })
    .reduce((sum, p) => sum + p.amount, 0);

  const expensesThisMonth = expenses
    .filter((e) => {
      const date = new Date(e.date);
      return date >= thisMonthStart && date <= thisMonthEnd;
    })
    .reduce((sum, e) => sum + e.amount, 0);

  const projectsCompletedThisMonth = projects.filter((p) => {
    if (p.status !== "completed") return false;
    const updated = new Date(p.updatedAt);
    return updated >= thisMonthStart && updated <= thisMonthEnd;
  }).length;

  // Recent activity (last 5)
  const recentPayments = [...payments]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const recentExpenses = [...expenses]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return {
    totalBilled,
    totalReceived,
    totalExpenses,
    outstanding,
    netProfit,
    activeProjects: activeProjects.length,
    completedProjects,
    overdueProjects: overdueProjectsCount,
    receivedThisMonth,
    expensesThisMonth,
    projectsCompletedThisMonth,
    recentPayments,
    recentExpenses,
  };
};
```

---

### Client Statistics Calculator

```typescript
export const calculateClientStats = async (
  clientId: string
): Promise<ClientStats> => {
  const projects = await getProjectsByClientId(clientId);

  // Get all payments and expenses for this client's projects
  const allPayments: Payment[] = [];
  const allExpenses: Expense[] = [];

  for (const project of projects) {
    const payments = await getPaymentsByProjectId(project.id);
    const expenses = await getExpensesByProjectId(project.id);
    allPayments.push(...payments);
    allExpenses.push(...expenses);
  }

  const totalRevenue = allPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalExpenses = allExpenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalRevenue - totalExpenses;

  const activeProjects = projects.filter((p) => p.status === "active").length;
  const completedProjects = projects.filter(
    (p) => p.status === "completed"
  ).length;

  return {
    clientId,
    projectCount: projects.length,
    totalRevenue,
    totalExpenses,
    netProfit,
    activeProjects,
    completedProjects,
  };
};
```

---

## 2. Auto-Completion Detection

### Project Auto-Completion

**Trigger:** After payment CREATE/UPDATE/DELETE

```typescript
export const checkAndAutoCompleteProject = async (
  projectId: string
): Promise<boolean> => {
  const stats = await calculateProjectStats(projectId);
  const project = await getProjectById(projectId);

  if (!project) return false;

  // Auto-complete if fully paid
  if (stats.remaining <= 0 && project.status === "active") {
    await updateProject(projectId, { status: "completed" });

    // Send notification
    await createNotification({
      type: "success",
      title: "Project Completed",
      message: `${project.name} has been fully paid and marked as completed.`,
    });

    return true;
  }

  return false;
};
```

### Milestone Auto-Completion

**Trigger:** After payment CREATE with milestoneId

```typescript
export const checkAndAutoCompleteMilestone = async (
  milestoneId: string,
  paymentAmount: number,
  paymentDate: string
): Promise<boolean> => {
  const milestone = await getMilestoneById(milestoneId);
  if (!milestone || milestone.completed) return false;

  // Auto-complete if payment amount matches milestone amount (within 1 cent tolerance)
  if (Math.abs(paymentAmount - milestone.amount) < 0.01) {
    await updateMilestone(milestoneId, {
      completed: true,
      completedDate: paymentDate,
    });

    return true;
  }

  return false;
};
```

---

## 3. Overdue Detection & Flagging

### Auto-Detect Overdue Projects

**Trigger:** Daily background job OR on-demand when viewing projects list

```typescript
export const detectOverdueProjects = async (): Promise<Project[]> => {
  const projects = await getProjects({ status: ["active"] });
  const today = new Date();
  const overdueProjects: Project[] = [];

  for (const project of projects) {
    const stats = await calculateProjectStats(project.id);

    if (stats.isOverdue) {
      overdueProjects.push(project);
    }
  }

  return overdueProjects;
};

// Create reminders for overdue projects
export const createOverdueReminders = async (): Promise<Reminder[]> => {
  const overdueProjects = await detectOverdueProjects();
  const reminders: Reminder[] = [];

  for (const project of overdueProjects) {
    const stats = await calculateProjectStats(project.id);
    const client = await getClientById(project.clientId);

    const reminder: Reminder = {
      id: generateId(),
      type: "overdue_project",
      projectId: project.id,
      message: `${project.name} (${client?.name}) is overdue by ${Math.abs(
        stats.daysRemaining
      )} days. Outstanding: ${formatCurrency(stats.remaining)}`,
      dueDate: project.endDate,
      dismissed: false,
      createdAt: new Date().toISOString(),
    };

    await db.reminders.setItem(reminder.id, reminder);
    reminders.push(reminder);
  }

  return reminders;
};
```

### Upcoming Payment Reminders

**Trigger:** Daily background job

```typescript
export const createUpcomingPaymentReminders = async (
  daysBefore: number = 3
): Promise<Reminder[]> => {
  const projects = await getProjects({ status: ["active"] });
  const today = new Date();
  const targetDate = new Date(today);
  targetDate.setDate(today.getDate() + daysBefore);

  const reminders: Reminder[] = [];

  for (const project of projects) {
    const endDate = new Date(project.endDate);

    // Check if end date is within reminder window
    if (endDate > today && endDate <= targetDate) {
      const stats = await calculateProjectStats(project.id);

      // Only remind if there's outstanding balance
      if (stats.remaining > 0) {
        const client = await getClientById(project.clientId);

        const reminder: Reminder = {
          id: generateId(),
          type: "payment_due",
          projectId: project.id,
          message: `Payment for ${project.name} (${client?.name}) is due in ${
            stats.daysRemaining
          } days. Outstanding: ${formatCurrency(stats.remaining)}`,
          dueDate: project.endDate,
          dismissed: false,
          createdAt: new Date().toISOString(),
        };

        await db.reminders.setItem(reminder.id, reminder);
        reminders.push(reminder);
      }
    }
  }

  return reminders;
};
```

---

## 4. Recurring Payment Automation

### Generate Recurring Payment Suggestions

**Trigger:** Daily background job OR on dashboard load

```typescript
export const generateRecurringPaymentSuggestions = async (): Promise<
  RecurringPaymentSuggestion[]
> => {
  const clients = await getClients();
  const recurringClients = clients.filter(
    (c) => c.isRecurring && c.recurringTemplate
  );
  const today = new Date();
  const suggestions: RecurringPaymentSuggestion[] = [];

  for (const client of recurringClients) {
    if (!client.recurringTemplate) continue;

    const template = client.recurringTemplate;
    const nextDueDate = calculateNextDueDate(template, today);

    // Check if within reminder window
    const reminderDate = new Date(nextDueDate);
    reminderDate.setDate(reminderDate.getDate() - template.reminderDaysBefore);

    if (today >= reminderDate && today <= nextDueDate) {
      // Find active recurring project for this client
      const projects = await getProjectsByClientId(client.id);
      const recurringProject = projects.find(
        (p) => p.isRecurring && p.status === "active"
      );

      if (recurringProject) {
        suggestions.push({
          id: generateId(),
          clientId: client.id,
          clientName: client.name,
          projectId: recurringProject.id,
          projectName: recurringProject.name,
          amount: template.amount,
          dueDate: nextDueDate.toISOString().split("T")[0],
          frequency: template.frequency,
          dismissed: false,
        });
      }
    }
  }

  return suggestions;
};

// Calculate next due date based on frequency
const calculateNextDueDate = (
  template: RecurringTemplate,
  fromDate: Date
): Date => {
  const startDate = new Date(template.startDate);
  const result = new Date(fromDate);

  switch (template.frequency) {
    case "weekly":
      // Next occurrence of dayOfWeek
      const daysUntilNext =
        ((template.dayOfWeek || 0) - result.getDay() + 7) % 7;
      result.setDate(result.getDate() + daysUntilNext);
      break;

    case "biweekly":
      // Find next biweekly occurrence
      const weeksSinceStart = Math.floor(
        (result.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 7)
      );
      const nextBiweeklyWeeks = Math.ceil(weeksSinceStart / 2) * 2;
      result.setTime(
        startDate.getTime() + nextBiweeklyWeeks * 7 * 24 * 60 * 60 * 1000
      );
      break;

    case "monthly":
      // Next occurrence of dayOfMonth
      result.setDate(template.dayOfMonth || 1);
      if (result < fromDate) {
        result.setMonth(result.getMonth() + 1);
      }
      break;

    case "quarterly":
      // Next quarter
      result.setDate(template.dayOfMonth || 1);
      result.setMonth(Math.ceil((result.getMonth() + 1) / 3) * 3);
      if (result < fromDate) {
        result.setMonth(result.getMonth() + 3);
      }
      break;

    case "yearly":
      // Next year
      const yearStart = new Date(startDate);
      yearStart.setFullYear(result.getFullYear());
      result.setTime(yearStart.getTime());
      if (result < fromDate) {
        result.setFullYear(result.getFullYear() + 1);
      }
      break;
  }

  return result;
};

// Auto-create recurring payment (when user confirms suggestion)
export const createRecurringPayment = async (
  suggestion: RecurringPaymentSuggestion
): Promise<Payment> => {
  const client = await getClientById(suggestion.clientId);
  if (!client?.recurringTemplate) {
    throw new ValidationError("Client does not have a recurring template");
  }

  // Find default source (or let user select)
  const sources = await getSources();
  const defaultSource = sources[0]; // You could add user preference for default source

  const payment = await createPayment({
    projectId: suggestion.projectId,
    amount: suggestion.amount,
    date: suggestion.dueDate,
    sourceId: defaultSource.id,
    type: "one-time",
    notes: `Recurring payment for ${client.recurringTemplate.frequency} billing`,
  });

  return payment;
};
```

---

## 5. Quick Add Auto-Linking

### Smart Project Suggestion

**Trigger:** When user opens Quick Add payment modal

```typescript
export const suggestProjectForQuickAdd = async (): Promise<Project[]> => {
  const projects = await getProjects({ status: ["active"] });

  // Sort by recent activity (most recent payments first)
  const projectsWithActivity = await Promise.all(
    projects.map(async (p) => {
      const payments = await getPaymentsByProjectId(p.id);
      const lastPaymentDate =
        payments.length > 0
          ? Math.max(...payments.map((pay) => new Date(pay.date).getTime()))
          : 0;

      return { project: p, lastActivity: lastPaymentDate };
    })
  );

  // Sort by last activity, then by incomplete projects
  projectsWithActivity.sort((a, b) => {
    // Prioritize incomplete projects
    const aStats = calculateProjectStats(a.project.id);
    const bStats = calculateProjectStats(b.project.id);

    // If both incomplete or both complete, sort by activity
    return b.lastActivity - a.lastActivity;
  });

  return projectsWithActivity.slice(0, 5).map((p) => p.project);
};

// Auto-suggest based on client name or project name input
export const smartSearchProjects = async (
  query: string
): Promise<Project[]> => {
  if (!query || query.length < 2) {
    return await suggestProjectForQuickAdd();
  }

  const projects = await getProjects({ status: ["active"] });
  const lowerQuery = query.toLowerCase();

  // Search in project name, client name, and tags
  const matches: Array<{ project: Project; score: number }> = [];

  for (const project of projects) {
    let score = 0;
    const client = await getClientById(project.clientId);

    // Exact match in project name (highest priority)
    if (project.name.toLowerCase() === lowerQuery) {
      score += 100;
    } else if (project.name.toLowerCase().includes(lowerQuery)) {
      score += 50;
    } else if (project.name.toLowerCase().startsWith(lowerQuery)) {
      score += 70;
    }

    // Match in client name
    if (client?.name.toLowerCase().includes(lowerQuery)) {
      score += 30;
    }

    // Match in tags
    if (project.tags?.toLowerCase().includes(lowerQuery)) {
      score += 20;
    }

    if (score > 0) {
      matches.push({ project, score });
    }
  }

  // Sort by score (highest first)
  matches.sort((a, b) => b.score - a.score);

  return matches.slice(0, 10).map((m) => m.project);
};
```

---

## 6. CSV Import Validation & Auto-Mapping

### Column Auto-Detection

```typescript
export const autoDetectCSVColumns = (headers: string[]): ColumnMapping => {
  const mapping: ColumnMapping = {};

  // Common column name variations
  const patterns = {
    name: ["name", "project name", "title", "project"],
    clientId: ["client", "client name", "customer"],
    totalAmount: ["amount", "total", "budget", "total amount", "price"],
    startDate: ["start", "start date", "begin date", "from"],
    endDate: ["end", "end date", "due date", "to", "deadline"],
    isRecurring: ["recurring", "is recurring", "repeat"],
    tags: ["tags", "labels", "categories"],
    notes: ["notes", "description", "comments"],
  };

  headers.forEach((header, index) => {
    const normalized = header.toLowerCase().trim();

    for (const [field, variations] of Object.entries(patterns)) {
      if (variations.some((v) => normalized.includes(v))) {
        mapping[field] = index;
        break;
      }
    }
  });

  return mapping;
};

// Validate CSV row
export const validateCSVRow = async (
  row: string[],
  mapping: ColumnMapping,
  rowNumber: number
): Promise<{ valid: boolean; errors: string[]; warnings: string[] }> => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Extract values using mapping
  const name = row[mapping.name]?.trim();
  const clientName = row[mapping.clientId]?.trim();
  const totalAmount = parseFloat(row[mapping.totalAmount] || "0");
  const startDate = row[mapping.startDate]?.trim();
  const endDate = row[mapping.endDate]?.trim();

  // Validation
  if (!name) {
    errors.push(`Row ${rowNumber}: Project name is required`);
  }

  if (!clientName) {
    errors.push(`Row ${rowNumber}: Client name is required`);
  } else {
    // Check if client exists
    const client = await findClientByName(clientName);
    if (!client) {
      warnings.push(
        `Row ${rowNumber}: Client "${clientName}" not found, will be created`
      );
    }
  }

  if (!totalAmount || totalAmount <= 0) {
    errors.push(`Row ${rowNumber}: Total amount must be greater than 0`);
  }

  if (!startDate || !isValidDate(startDate)) {
    errors.push(`Row ${rowNumber}: Invalid start date`);
  }

  if (!endDate || !isValidDate(endDate)) {
    errors.push(`Row ${rowNumber}: Invalid end date`);
  } else if (startDate && new Date(endDate) < new Date(startDate)) {
    errors.push(`Row ${rowNumber}: End date must be after start date`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
};

// Auto-import with client creation
export const importCSVProjects = async (
  rows: string[][],
  mapping: ColumnMapping
): Promise<{ imported: Project[]; errors: string[]; warnings: string[] }> => {
  const imported: Project[] = [];
  const allErrors: string[] = [];
  const allWarnings: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const validation = await validateCSVRow(row, mapping, i + 2); // +2 for 1-indexed and header row

    if (!validation.valid) {
      allErrors.push(...validation.errors);
      continue;
    }

    allWarnings.push(...validation.warnings);

    try {
      // Auto-create client if doesn't exist
      const clientName = row[mapping.clientId].trim();
      let client = await findClientByName(clientName);

      if (!client) {
        client = await createClient({ name: clientName });
      }

      // Create project
      const project = await createProject({
        name: row[mapping.name].trim(),
        clientId: client.id,
        totalAmount: parseFloat(row[mapping.totalAmount]),
        startDate: row[mapping.startDate].trim(),
        endDate: row[mapping.endDate].trim(),
        isRecurring:
          row[mapping.isRecurring]?.toLowerCase() === "true" || false,
        tags: row[mapping.tags]?.trim(),
        notes: row[mapping.notes]?.trim(),
      });

      imported.push(project);
    } catch (error) {
      allErrors.push(`Row ${i + 2}: ${error.message}`);
    }
  }

  return {
    imported,
    errors: allErrors,
    warnings: allWarnings,
  };
};
```

---

## 7. Auto-Backup System

### IndexedDB Auto-Backup

```typescript
export const createAutoBackup = async (): Promise<Backup> => {
  const timestamp = new Date().toISOString();

  // Export all data
  const projects = await getProjects();
  const payments = await getPayments();
  const expenses = await getExpenses();
  const clients = await getClients();
  const sources = await getSources();
  const categories = await getCategories();

  const backup: Backup = {
    id: generateId(),
    timestamp,
    version: "1.0",
    data: {
      projects,
      payments,
      expenses,
      clients,
      sources,
      categories,
    },
  };

  // Store backup in separate IndexedDB store
  await db.backups.setItem(backup.id, backup);

  // Update settings
  await updateSettings({ lastBackup: timestamp });

  return backup;
};

// Scheduled auto-backup (daily)
export const scheduleAutoBackup = () => {
  const BACKUP_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

  setInterval(async () => {
    const settings = await getSettings();

    if (settings.autoBackup) {
      try {
        await createAutoBackup();
        console.log("Auto-backup completed successfully");
      } catch (error) {
        console.error("Auto-backup failed:", error);
      }
    }
  }, BACKUP_INTERVAL);
};

// Restore from backup
export const restoreFromBackup = async (backupId: string): Promise<void> => {
  const backup = await db.backups.getItem(backupId);
  if (!backup) {
    throw new NotFoundError("Backup not found");
  }

  // Clear existing data
  await db.projects.clear();
  await db.payments.clear();
  await db.expenses.clear();
  await db.clients.clear();
  await db.sources.clear();
  await db.categories.clear();

  // Restore from backup
  for (const project of backup.data.projects) {
    await db.projects.setItem(project.id, project);
  }
  for (const payment of backup.data.payments) {
    await db.payments.setItem(payment.id, payment);
  }
  for (const expense of backup.data.expenses) {
    await db.expenses.setItem(expense.id, expense);
  }
  for (const client of backup.data.clients) {
    await db.clients.setItem(client.id, client);
  }
  for (const source of backup.data.sources) {
    await db.sources.setItem(source.id, source);
  }
  for (const category of backup.data.categories) {
    await db.categories.setItem(category.id, category);
  }
};
```

---

## 8. Validation Automation

### Real-Time Validation Hooks

```typescript
// Form validation helper with debouncing
export const useFieldValidation = (
  fieldName: string,
  value: any,
  rules: ValidationRule[]
): { error: string | null; isValidating: boolean } => {
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      setIsValidating(true);

      for (const rule of rules) {
        const result = await rule.validate(value);
        if (!result.valid) {
          setError(result.message);
          setIsValidating(false);
          return;
        }
      }

      setError(null);
      setIsValidating(false);
    }, 300); // Debounce 300ms

    return () => clearTimeout(timeoutId);
  }, [value]);

  return { error, isValidating };
};

// Common validation rules
export const ValidationRules = {
  required: (message: string = "This field is required"): ValidationRule => ({
    validate: (value) => ({
      valid: value !== undefined && value !== null && value !== "",
      message,
    }),
  }),

  minLength: (min: number, message?: string): ValidationRule => ({
    validate: (value) => ({
      valid: !value || value.length >= min,
      message: message || `Must be at least ${min} characters`,
    }),
  }),

  maxLength: (max: number, message?: string): ValidationRule => ({
    validate: (value) => ({
      valid: !value || value.length <= max,
      message: message || `Must be less than ${max} characters`,
    }),
  }),

  email: (message: string = "Invalid email format"): ValidationRule => ({
    validate: (value) => ({
      valid: !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      message,
    }),
  }),

  positive: (message: string = "Must be greater than 0"): ValidationRule => ({
    validate: (value) => ({
      valid: !value || parseFloat(value) > 0,
      message,
    }),
  }),

  dateAfter: (afterDate: string, message?: string): ValidationRule => ({
    validate: (value) => ({
      valid: !value || new Date(value) >= new Date(afterDate),
      message: message || `Must be on or after ${afterDate}`,
    }),
  }),

  asyncUnique: (
    checkFn: (value: any) => Promise<boolean>,
    message: string
  ): ValidationRule => ({
    validate: async (value) => {
      if (!value) return { valid: true, message: "" };
      const isUnique = await checkFn(value);
      return {
        valid: isUnique,
        message,
      };
    },
  }),
};
```

---

## 9. Event System for Reactivity

### Event Emitter for Cross-Component Updates

```typescript
type EventType =
  | "project:created"
  | "project:updated"
  | "project:deleted"
  | "payment:created"
  | "payment:updated"
  | "payment:deleted"
  | "expense:created"
  | "expense:updated"
  | "expense:deleted"
  | "project:stats:updated"
  | "dashboard:refresh";

type EventListener = (data: any) => void;

class EventBus {
  private listeners: Map<EventType, EventListener[]> = new Map();

  on(event: EventType, listener: EventListener): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(listener);
  }

  off(event: EventType, listener: EventListener): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(listener);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  emit(event: EventType, data?: any): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach((listener) => listener(data));
    }
  }
}

export const eventBus = new EventBus();

// Usage in components
export const useAutoRefresh = (event: EventType, callback: () => void) => {
  useEffect(() => {
    eventBus.on(event, callback);
    return () => eventBus.off(event, callback);
  }, [event, callback]);
};
```

---

## 10. Background Jobs System

### Job Scheduler

```typescript
export const initializeBackgroundJobs = () => {
  // Daily jobs (run at midnight)
  scheduleDaily(async () => {
    await createOverdueReminders();
    await createUpcomingPaymentReminders();
    await createAutoBackup();
  });

  // Hourly jobs
  scheduleHourly(async () => {
    // Check for recurring payment suggestions
    const suggestions = await generateRecurringPaymentSuggestions();
    if (suggestions.length > 0) {
      eventBus.emit("dashboard:refresh");
    }
  });
};

const scheduleDaily = (job: () => Promise<void>) => {
  const now = new Date();
  const tomorrow = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    0,
    0,
    0
  );
  const msUntilMidnight = tomorrow.getTime() - now.getTime();

  setTimeout(() => {
    job();
    setInterval(job, 24 * 60 * 60 * 1000); // Every 24 hours
  }, msUntilMidnight);
};

const scheduleHourly = (job: () => Promise<void>) => {
  job(); // Run immediately
  setInterval(job, 60 * 60 * 1000); // Every hour
};
```

---

## 11. Smart Defaults System

### Context-Aware Default Values

```typescript
export const getSmartDefaults = async (
  formType: "project" | "payment" | "expense"
): Promise<any> => {
  const settings = await getSettings();

  switch (formType) {
    case "project":
      const recentProjects = await getProjects();
      const lastProject = recentProjects[0];

      return {
        startDate: new Date().toISOString().split("T")[0],
        endDate: new Date(
          Date.now() + settings.defaultProjectDuration * 24 * 60 * 60 * 1000
        )
          .toISOString()
          .split("T")[0],
        isRecurring: false,
        clientId: lastProject?.clientId, // Suggest last used client
      };

    case "payment":
      const recentPayments = await getPayments();
      const lastPayment = recentPayments[0];
      const suggestedProjects = await suggestProjectForQuickAdd();

      return {
        date: new Date().toISOString().split("T")[0],
        projectId: suggestedProjects[0]?.id,
        sourceId: lastPayment?.sourceId, // Suggest last used source
        type: "one-time",
        verified: false,
      };

    case "expense":
      const recentExpenses = await getExpenses();
      const lastExpense = recentExpenses[0];

      return {
        date: new Date().toISOString().split("T")[0],
        categoryId: lastExpense?.categoryId, // Suggest last used category
      };
  }
};
```

---

**Next:** Part 4 will cover Premium UI Patterns from Vision UI (gradient cards, radial progress, mini-charts, advanced tables, animations, glassmorphism)

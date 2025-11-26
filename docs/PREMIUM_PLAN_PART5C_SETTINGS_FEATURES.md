# PREMIUM PLAN — Part 5C: Screen Specifications (Settings, Import/Export, Reports, Notifications)

**Project:** Agency Payment Tracker — Premium Edition
**Date:** October 24, 2025

---

## SCREEN 6: Settings

### Purpose

Manage clients, payment sources, expense categories, and application preferences.

### Layout Structure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Breadcrumb: Dashboard > Settings]                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Settings                                                                    │
│  ──────────────────────────────────────────────────────────────────────────  │
│                                                                              │
│  [Tabs: ● Clients  ○ Payment Sources  ○ Categories  ○ General  ○ About]    │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                              │
│  TAB 1: CLIENTS                                              [+ Add Client]  │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  Search: [🔍                                            ]            │  │
│  │                                                                       │  │
│  │  ┌────────────────────────────────────────────────────────────────┐ │  │
│  │  │ Client          │ Company    │ Projects│ Total Billed│ Actions││ │  │
│  │  ├────────────────────────────────────────────────────────────────┤ │  │
│  │  │ John Doe        │ Acme Corp  │    5    │   $75,000   │ E V D ││ │  │
│  │  │ john@acme.com   │            │         │             │       ││ │  │
│  │  │ [Recurring]     │            │         │             │       ││ │  │
│  │  ├────────────────────────────────────────────────────────────────┤ │  │
│  │  │ Jane Smith      │ Beta Inc   │    2    │   $30,000   │ E V D ││ │  │
│  │  │ jane@beta.io    │            │         │             │       ││ │  │
│  │  ├────────────────────────────────────────────────────────────────┤ │  │
│  │  │ ...more rows...                                                 │ │  │
│  │  └────────────────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  TAB 2: PAYMENT SOURCES                                 [+ Add Source]       │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  ┌────────────────────────────────────────────────────────────────┐ │  │
│  │  │ Source Name       │ Type    │ Total Received│ Active│ Actions ││ │  │
│  │  ├────────────────────────────────────────────────────────────────┤ │  │
│  │  │ Bank Transfer     │ Income  │    $120,000   │  ✅   │  E D   ││ │  │
│  │  │ PayPal            │ Income  │     $25,000   │  ✅   │  E D   ││ │  │
│  │  │ Stripe            │ Income  │     $50,000   │  ✅   │  E D   ││ │  │
│  │  │ Check Payment     │ Income  │      $5,000   │  ❌   │  E D   ││ │  │
│  │  └────────────────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  TAB 3: EXPENSE CATEGORIES                              [+ Add Category]     │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  ┌────────────────────────────────────────────────────────────────┐ │  │
│  │  │ Category Name     │ Type    │ Total Spent │ Active│ Actions   ││ │  │
│  │  ├────────────────────────────────────────────────────────────────┤ │  │
│  │  │ Software & Tools  │ Expense │   $12,000   │  ✅   │  E D     ││ │  │
│  │  │ Marketing         │ Expense │    $8,500   │  ✅   │  E D     ││ │  │
│  │  │ Office Supplies   │ Expense │    $2,300   │  ✅   │  E D     ││ │  │
│  │  │ Travel            │ Expense │    $5,600   │  ❌   │  E D     ││ │  │
│  │  └────────────────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  TAB 4: GENERAL PREFERENCES                                                  │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  Currency                                                             │  │
│  │  [Dropdown: USD ($) ▼                                            ]    │  │
│  │                                                                       │  │
│  │  Date Format                                                          │  │
│  │  [Dropdown: MM/DD/YYYY ▼                                         ]    │  │
│  │                                                                       │  │
│  │  Theme (Dark Mode)                                                    │  │
│  │  [Toggle: ON ───●]                                                   │  │
│  │                                                                       │  │
│  │  Notifications                                                        │  │
│  │  ☑ Email reminders for overdue payments                              │  │
│  │  ☑ Desktop notifications for new transactions                        │  │
│  │  ☑ Weekly summary reports                                            │  │
│  │                                                                       │  │
│  │  Auto-Backup                                                          │  │
│  │  [Toggle: ON ───●]  Daily at [02:00 AM ▼]                           │  │
│  │  Last backup: March 20, 2025 at 2:00 AM                             │  │
│  │  [Backup Now]                                                         │  │
│  │                                                                       │  │
│  │  [Save Preferences]                                                   │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  TAB 5: ABOUT                                                                │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  Agency Payment Tracker — Premium Edition                             │  │
│  │  Version 1.0.0                                                        │  │
│  │                                                                       │  │
│  │  Built with Vite + React + TypeScript + DaisyUI                      │  │
│  │                                                                       │  │
│  │  Data stored locally using IndexedDB (localforage)                   │  │
│  │  Total storage used: 12.3 MB of 50 MB available                     │  │
│  │                                                                       │  │
│  │  [View Documentation]  [Report Issue]  [Clear All Data]             │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Tab 1: Clients

#### Components Used

| Component            | Purpose        | Props/Details                          |
| -------------------- | -------------- | -------------------------------------- |
| `Input` (search)     | Filter clients | Debounced, searches name/email/company |
| `Button` (primary)   | Add new client | Opens Add Client modal                 |
| `AdvancedTable`      | Clients table  | Sortable columns                       |
| `Badge`              | Recurring flag | Shows if client has recurring projects |
| `Button` (ghost, xs) | Actions        | Edit, View Projects, Delete            |

#### Data Dependencies

```typescript
// On load
const clients = await getClients();

// Calculate stats for each client
const clientsWithStats = await Promise.all(
  clients.map(async (c) => ({
    ...c,
    stats: await calculateClientStats(c.id),
  }))
);
```

#### User Interactions

1. **Search:** Filter clients by name, email, or company
2. **Add Client:** Opens Add/Edit Client modal
3. **Edit:** Opens pre-filled modal
4. **View Projects:** Navigate to Projects List filtered by client
5. **Delete:**
   - Check if client has projects
   - If yes, show error: "Cannot delete client with active projects"
   - If no, confirm and delete

#### Table Columns

| Column       | Content                      | Sortable |
| ------------ | ---------------------------- | -------- |
| Client       | Name, email, recurring badge | ✅       |
| Company      | Company name                 | ✅       |
| Projects     | Count of projects            | ✅       |
| Total Billed | Sum of all project amounts   | ✅       |
| Actions      | Edit, View, Delete           | ❌       |

---

### Tab 2: Payment Sources

#### Components Used

| Component            | Purpose         | Props/Details                     |
| -------------------- | --------------- | --------------------------------- |
| `Button` (primary)   | Add new source  | Opens Add Source modal            |
| `AdvancedTable`      | Sources table   | Sortable columns                  |
| `Badge`              | Active status   | Green (active) or Gray (inactive) |
| `Toggle`             | Active/Inactive | In Edit modal                     |
| `Button` (ghost, xs) | Actions         | Edit, Soft Delete                 |

#### Data Dependencies

```typescript
// On load
const sources = await getSources();

// Calculate usage for each source
const sourcesWithStats = sources.map((s) => ({
  ...s,
  totalReceived: payments
    .filter((p) => p.sourceId === s.id)
    .reduce((sum, p) => sum + p.amount, 0),
  usageCount: payments.filter((p) => p.sourceId === s.id).length,
}));
```

#### User Interactions

1. **Add Source:** Opens Add/Edit Source modal
   - Name (required)
   - Type: Income (default for payment sources)
   - Active toggle (default: ON)
2. **Edit:** Opens pre-filled modal
3. **Delete (Soft):**
   - Check if source is used in any payments
   - If yes, soft delete (set `isActive = false`)
   - If no, hard delete
   - Confirm before action

#### Validation

- Source name required
- No duplicate names (case-insensitive)

---

### Tab 3: Expense Categories

#### Components Used

Same as Payment Sources tab, but for categories.

#### Data Dependencies

```typescript
// On load
const categories = await getCategories();

// Calculate usage for each category
const categoriesWithStats = categories.map((c) => ({
  ...c,
  totalSpent: expenses
    .filter((e) => e.categoryId === c.id)
    .reduce((sum, e) => sum + e.amount, 0),
  usageCount: expenses.filter((e) => e.categoryId === c.id).length,
}));
```

#### User Interactions

Same as Payment Sources, but for categories.

---

### Tab 4: General Preferences

#### Components Used

| Component          | Purpose                  | Props/Details                      |
| ------------------ | ------------------------ | ---------------------------------- |
| `Select`           | Currency selection       | USD, EUR, GBP, etc.                |
| `Select`           | Date format              | MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD |
| `Toggle`           | Dark mode                | ON/OFF                             |
| `Checkbox` group   | Notification preferences | Multiple options                   |
| `Toggle`           | Auto-backup              | ON/OFF                             |
| `TimePicker`       | Backup time              | 24-hour format                     |
| `Button` (ghost)   | Manual backup            | Triggers backup now                |
| `Button` (primary) | Save                     | Updates settings                   |

#### Data Dependencies

```typescript
// On load
const settings = await getSettings();

// On save
await updateSettings(formData);

// Manual backup
const backupData = await createBackup();
// Download JSON file
downloadFile("backup.json", JSON.stringify(backupData));
```

#### User Interactions

1. **Currency:** Select from list, affects display formatting globally
2. **Date Format:** Select preference, affects all date displays
3. **Dark Mode:** Toggle between light/dark themes (apply immediately)
4. **Notifications:**
   - Email reminders (future feature, show as coming soon)
   - Desktop notifications (browser permission required)
   - Weekly summary (create reminder for every Monday)
5. **Auto-Backup:**
   - Toggle ON/OFF
   - Select time (default 2:00 AM)
   - Show last backup timestamp
6. **Backup Now:** Trigger manual backup, download JSON file
7. **Save Preferences:** Update settings in localforage

#### Settings Schema

```typescript
type Settings = {
  currency: string; // 'USD', 'EUR', 'GBP'
  dateFormat: string; // 'MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'
  theme: "light" | "dark";
  notifications: {
    emailReminders: boolean;
    desktopNotifications: boolean;
    weeklySummary: boolean;
  };
  autoBackup: {
    enabled: boolean;
    time: string; // '02:00'
    lastBackup: string | null; // ISO timestamp
  };
  isOnboarded: boolean;
};
```

---

### Tab 5: About

#### Components Used

| Component        | Purpose        | Props/Details                           |
| ---------------- | -------------- | --------------------------------------- |
| `Card` (glass)   | Info container | Version, tech stack                     |
| `Progress`       | Storage usage  | Visual bar                              |
| `Button` (ghost) | Documentation  | Opens external link                     |
| `Button` (ghost) | Report issue   | Opens GitHub issues (if applicable)     |
| `Button` (error) | Clear all data | Dangerous action, requires confirmation |

#### User Interactions

1. **View Documentation:** Opens README or docs site
2. **Report Issue:** Opens GitHub issues page
3. **Clear All Data:**
   - Show danger modal: "This will permanently delete ALL data. Are you sure?"
   - Require typing "DELETE" to confirm
   - On confirm: Clear all localforage stores, reload app

#### Storage Calculation

```typescript
// Estimate storage usage
const calculateStorageUsage = async () => {
  const keys = await localforage.keys();
  let totalSize = 0;

  for (const key of keys) {
    const data = await localforage.getItem(key);
    const serialized = JSON.stringify(data);
    totalSize += new Blob([serialized]).size;
  }

  return {
    used: totalSize,
    total: 50 * 1024 * 1024, // 50 MB typical IndexedDB quota
    percentage: (totalSize / (50 * 1024 * 1024)) * 100,
  };
};
```

---

## SCREEN 7: Import/Export

### Purpose

Import data from CSV files and export data to CSV/JSON/PDF formats.

### Layout Structure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Breadcrumb: Dashboard > Import/Export]                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Import/Export Data                                                          │
│  ──────────────────────────────────────────────────────────────────────────  │
│                                                                              │
│  [Tabs: ● Import  ○ Export]                                                 │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                              │
│  TAB 1: IMPORT                                                               │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  Import from CSV                                                      │  │
│  │                                                                       │  │
│  │  Select data type to import:                                         │  │
│  │  ● Projects  ○ Payments  ○ Expenses  ○ Clients                      │  │
│  │                                                                       │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐│  │
│  │  │                                                                  ││  │
│  │  │           [📁 Drag & Drop CSV File Here]                        ││  │
│  │  │                   or click to browse                             ││  │
│  │  │                                                                  ││  │
│  │  └─────────────────────────────────────────────────────────────────┘│  │
│  │                                                                       │  │
│  │  [Download Sample Template]                                          │  │
│  │                                                                       │  │
│  │  ── After file selected: ───────────────────────────────────────    │  │
│  │                                                                       │  │
│  │  📄 projects.csv (12 KB) uploaded                       [× Remove]   │  │
│  │                                                                       │  │
│  │  Preview & Column Mapping:                                           │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐│  │
│  │  │ CSV Column          →  Map To Field                             ││  │
│  │  ├─────────────────────────────────────────────────────────────────┤│  │
│  │  │ project_name        →  [Project Name ▼         ]  ✅           ││  │
│  │  │ client_name         →  [Client          ▼         ]  ✅           ││  │
│  │  │ total_amount        →  [Total Amount    ▼         ]  ✅           ││  │
│  │  │ start_date          →  [Start Date      ▼         ]  ✅           ││  │
│  │  │ end_date            →  [End Date        ▼         ]  ✅           ││  │
│  │  │ custom_field        →  [Ignore          ▼         ]  ⚠️           ││  │
│  │  └─────────────────────────────────────────────────────────────────┘│  │
│  │                                                                       │  │
│  │  Validation Results:                                                  │  │
│  │  ✅ 15 valid rows                                                    │  │
│  │  ⚠️  3 rows with warnings (missing optional fields)                 │  │
│  │  ❌ 2 rows with errors (invalid dates)                              │  │
│  │                                                                       │  │
│  │  [View Errors]  [Fix in CSV]                                         │  │
│  │                                                                       │  │
│  │  ☑ Skip rows with errors                                            │  │
│  │  ☐ Update existing records (match by name)                          │  │
│  │                                                                       │  │
│  │  [Cancel]                                     [Import 15 Projects]   │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  TAB 2: EXPORT                                                               │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  Export Data                                                          │  │
│  │                                                                       │  │
│  │  Select data to export:                                              │  │
│  │  ☑ Projects (23)                                                     │  │
│  │  ☑ Payments (145)                                                    │  │
│  │  ☑ Expenses (89)                                                     │  │
│  │  ☑ Clients (12)                                                      │  │
│  │  ☑ Sources (5)                                                       │  │
│  │  ☑ Categories (8)                                                    │  │
│  │                                                                       │  │
│  │  Date Range (optional):                                              │  │
│  │  From: [📅 2024-01-01    ]  To: [📅 2025-12-31    ]                │  │
│  │                                                                       │  │
│  │  Export Format:                                                       │  │
│  │  ● CSV (Spreadsheet)  ○ JSON (Backup)  ○ PDF (Report)              │  │
│  │                                                                       │  │
│  │  CSV Options:                                                         │  │
│  │  ☑ Include headers                                                   │  │
│  │  ☐ Separate files for each data type                                │  │
│  │                                                                       │  │
│  │  [Export Data]                                                        │  │
│  │                                                                       │  │
│  │  ── Recent Exports: ────────────────────────────────────────────    │  │
│  │  📄 full_backup_2025-03-20.json (234 KB)             [Download]     │  │
│  │  📄 projects_export_2025-03-15.csv (45 KB)           [Download]     │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Tab 1: Import

#### Components Used

| Component                       | Purpose            | Props/Details                         |
| ------------------------------- | ------------------ | ------------------------------------- |
| `RadioGroup`                    | Data type selector | Projects, Payments, Expenses, Clients |
| `FileUpload`                    | CSV upload         | Drag & drop, .csv only                |
| `Button` (link)                 | Sample template    | Downloads template CSV                |
| `Table`                         | Column mapping     | Dropdown per row                      |
| `Alert` (success/warning/error) | Validation results | Shows counts                          |
| `Checkbox`                      | Import options     | Skip errors, update existing          |
| `Button` (primary)              | Import action      | Processes CSV                         |

#### Data Dependencies

```typescript
// On file upload
const csvData = await parseCSV(file);

// Auto-detect column mapping
const mapping = autoDetectColumns(csvData.headers, dataType);

// Validate rows
const validation = await validateImportData(csvData.rows, mapping, dataType);

// On import
const results = await importData(csvData.rows, mapping, dataType, options);
// Returns: { imported: 15, skipped: 2, errors: [...] }
```

#### User Interactions

1. **Select Data Type:** Choose what type of data to import
2. **Upload CSV:** Drag & drop or browse
3. **Download Template:** Get sample CSV with correct format
4. **Map Columns:**
   - Auto-detect attempts to match columns
   - User can manually adjust dropdowns
   - Required fields must be mapped
   - Unknown columns can be ignored
5. **View Validation:**
   - Green badge: Valid rows count
   - Yellow badge: Warnings (missing optional fields)
   - Red badge: Errors (invalid data)
6. **View Errors:** Opens modal with detailed error list
7. **Import Options:**
   - Skip rows with errors: Only import valid rows
   - Update existing: Match by name/email, update if found
8. **Import:** Process CSV, show progress bar, show results

#### CSV Templates

**Projects Template:**

```csv
project_name,client_name,total_amount,start_date,end_date,tags,notes,is_recurring
Website Redesign,Acme Corp,15000,2025-01-15,2025-03-31,"web,design",Redesign homepage,false
```

**Payments Template:**

```csv
project_name,amount,date,source,reference,notes,is_disputed
Website Redesign,2500,2025-01-20,Bank Transfer,INV-001,Initial payment,false
```

**Expenses Template:**

```csv
project_name,amount,date,category,description,notes
Website Redesign,340,2025-01-18,Software & Tools,Adobe XD subscription,
```

**Clients Template:**

```csv
name,email,company,is_recurring,notes
John Doe,john@acme.com,Acme Corp,true,VIP client
```

#### Validation Rules

```typescript
const validateImportData = (rows, mapping, dataType) => {
  const results = { valid: [], warnings: [], errors: [] };

  rows.forEach((row, index) => {
    const errors = [];
    const warnings = [];

    // Check required fields
    if (dataType === "projects") {
      if (!row[mapping.name]) errors.push("Project name is required");
      if (!row[mapping.clientId]) errors.push("Client is required");
      if (!row[mapping.totalAmount] || isNaN(row[mapping.totalAmount]))
        errors.push("Valid total amount is required");
      if (!isValidDate(row[mapping.startDate]))
        errors.push("Invalid start date");
      if (!isValidDate(row[mapping.endDate])) errors.push("Invalid end date");

      // Warnings
      if (!row[mapping.notes]) warnings.push("Notes are empty");
    }

    if (errors.length > 0) {
      results.errors.push({ row: index + 2, errors }); // +2 for header row and 1-indexing
    } else if (warnings.length > 0) {
      results.warnings.push({ row: index + 2, warnings });
    } else {
      results.valid.push({ row: index + 2, data: row });
    }
  });

  return results;
};
```

---

### Tab 2: Export

#### Components Used

| Component          | Purpose           | Props/Details                   |
| ------------------ | ----------------- | ------------------------------- |
| `Checkbox` group   | Data selection    | Multiple types                  |
| `DatePicker` × 2   | Date range filter | Optional                        |
| `RadioGroup`       | Format selection  | CSV, JSON, PDF                  |
| `Checkbox` group   | CSV options       | Headers, separate files         |
| `Button` (primary) | Export action     | Generates download              |
| `Card`             | Recent exports    | File list with download buttons |

#### Data Dependencies

```typescript
// On export
const data = await exportData({
  types: ["projects", "payments", "expenses", "clients"],
  dateFrom: dateRange.from,
  dateTo: dateRange.to,
  format: "csv" | "json" | "pdf",
  options: {
    includeHeaders: true,
    separateFiles: false,
  },
});

// Download file
if (format === "csv") {
  downloadFile("export.csv", data);
} else if (format === "json") {
  downloadFile("backup.json", JSON.stringify(data, null, 2));
} else if (format === "pdf") {
  // Generate PDF report using jsPDF or similar
  downloadFile("report.pdf", pdfBlob);
}
```

#### User Interactions

1. **Select Data:** Check which entities to export
2. **Date Range:** Optional filter (exports all if empty)
3. **Format:**
   - **CSV:** Spreadsheet-friendly, separate sheets or combined
   - **JSON:** Complete backup with all relationships
   - **PDF:** Formatted report with charts and summaries
4. **CSV Options:** Headers, separate files per type
5. **Export:** Generate and download file(s)
6. **Recent Exports:** Quick re-download of previous exports (stored in localStorage)

---

## SCREEN 8: Reports & Analytics

### Purpose

View detailed financial reports, charts, and analytics.

### Layout Structure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Breadcrumb: Dashboard > Reports]                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Reports & Analytics                                                         │
│  ──────────────────────────────────────────────────────────────────────────  │
│                                                                              │
│  Date Range: [📅 Jan 1, 2025] to [📅 Dec 31, 2025]        [Apply] [Reset] │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  Financial Summary                                                    │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐│  │
│  │  │ Total Income│  │ Total Expense│  │ Net Profit │  │ Profit Margin││  │
│  │  │  $195,000   │  │   $45,000   │  │  $150,000  │  │    76.9%     ││  │
│  │  │  [Chart]    │  │  [Chart]    │  │  [Chart]   │  │   [Radial]   ││  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘│  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌──────────────────────────────────────┐  ┌──────────────────────────┐   │
│  │  Income vs Expenses (Monthly)         │  │  Top Clients by Revenue  │   │
│  │  ┌────────────────────────────────┐  │  │  1. Acme Corp - $75k    │   │
│  │  │  [Line Chart]                  │  │  │  2. Beta Inc - $45k     │   │
│  │  │  Income (green line)           │  │  │  3. Gamma LLC - $30k    │   │
│  │  │  Expenses (red line)           │  │  │  4. Delta Co - $25k     │   │
│  │  │  Net Profit (purple area)      │  │  │  5. Epsilon - $20k      │   │
│  │  └────────────────────────────────┘  │  │                          │   │
│  └──────────────────────────────────────┘  └──────────────────────────┘   │
│                                                                              │
│  ┌──────────────────────────────────────┐  ┌──────────────────────────┐   │
│  │  Expense Breakdown by Category        │  │  Project Status          │   │
│  │  ┌────────────────────────────────┐  │  │  ┌────────────────────┐ │   │
│  │  │  [Pie/Donut Chart]             │  │  │  │  [Bar Chart]       │ │   │
│  │  │  Software: 40% ($18k)          │  │  │  │  Active: 5         │ │   │
│  │  │  Marketing: 30% ($13.5k)       │  │  │  │  Completed: 12     │ │   │
│  │  │  Office: 15% ($6.75k)          │  │  │  │  Archived: 3       │ │   │
│  │  │  Travel: 15% ($6.75k)          │  │  │  │  Overdue: 1        │ │   │
│  │  └────────────────────────────────┘  │  │  └────────────────────┘ │   │
│  └──────────────────────────────────────┘  └──────────────────────────┘   │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  Payment Timeline                                                     │  │
│  │  ┌────────────────────────────────────────────────────────────────┐ │  │
│  │  │  [Area Chart - Cumulative Payments Over Time]                  │ │  │
│  │  │  X-axis: Months (Jan - Dec)                                    │ │  │
│  │  │  Y-axis: Cumulative Amount ($0 - $200k)                        │ │  │
│  │  └────────────────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  [Export Report as PDF]  [Export Data as CSV]  [Share Report]              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Components Used

| Component                 | Purpose            | Props/Details        |
| ------------------------- | ------------------ | -------------------- |
| `DatePicker` × 2          | Date range filter  | From/To              |
| `Button`                  | Apply filter       | Refresh charts       |
| `StatCardPremium` × 4     | Summary stats      | With mini charts     |
| `LineChart`               | Income vs Expenses | Monthly breakdown    |
| `PieChart` / `DonutChart` | Category breakdown | Expenses by category |
| `BarChart`                | Project status     | Count by status      |
| `AreaChart`               | Payment timeline   | Cumulative over time |
| `Card` (glass)            | Top clients list   | Ranked by revenue    |
| `Button` group            | Export actions     | PDF, CSV, Share      |

### Data Dependencies

```typescript
// On load or date range change
const reports = await generateReports({
  dateFrom: dateRange.from,
  dateTo: dateRange.to,
});

// Returns:
{
  summary: {
    totalIncome: 195000,
    totalExpenses: 45000,
    netProfit: 150000,
    profitMargin: 76.9,
  },
  monthlyData: [
    { month: 'Jan', income: 15000, expenses: 3500, netProfit: 11500 },
    // ...
  ],
  expensesByCategory: [
    { category: 'Software & Tools', amount: 18000, percentage: 40 },
    // ...
  ],
  projectsByStatus: [
    { status: 'active', count: 5 },
    { status: 'completed', count: 12 },
    { status: 'archived', count: 3 },
    { status: 'overdue', count: 1 },
  ],
  topClients: [
    { clientId: '...', name: 'Acme Corp', totalRevenue: 75000 },
    // ...
  ],
  paymentTimeline: [
    { date: '2025-01-01', cumulativeAmount: 0 },
    { date: '2025-01-15', cumulativeAmount: 2500 },
    // ...
  ],
}
```

### User Interactions

1. **Date Range Filter:**
   - Select from/to dates
   - Quick presets: This Month, Last Month, This Quarter, This Year
   - Click "Apply" to refresh all charts
2. **Export PDF:** Generate comprehensive report with all charts
3. **Export CSV:** Export raw data behind charts
4. **Share Report:** Copy shareable link (future feature)

### Chart Libraries

Use **Recharts** or **Chart.js** for React:

- Line Chart: Income vs Expenses over time
- Pie/Donut Chart: Expense breakdown
- Bar Chart: Project status distribution
- Area Chart: Cumulative payment timeline

---

## SCREEN 9: Notifications Center

### Purpose

View all notifications, reminders, and alerts.

### Layout Structure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Breadcrumb: Dashboard > Notifications]                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Notifications                                            [Mark All as Read] │
│  ──────────────────────────────────────────────────────────────────────────  │
│                                                                              │
│  [Tabs: ● All (12)  ○ Unread (5)  ○ Reminders (3)  ○ Alerts (2)]          │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  ⚠️  OVERDUE PAYMENT                                        [× Dismiss] │  │
│  │  Project "Website Redesign" has an overdue payment of $5,000          │  │
│  │  Due: March 15, 2025 (5 days ago)                                     │  │
│  │  [View Project]  [Add Payment]                                        │  │
│  │  2 hours ago                                                          │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  🔔 REMINDER                                             [× Dismiss]   │  │
│  │  Follow up with "Mobile App" project                                  │  │
│  │  Next milestone payment ($3,500) expected today                       │  │
│  │  [View Project]  [Snooze]                                            │  │
│  │  5 hours ago                                                          │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  ✅ PROJECT COMPLETED                                    [× Dismiss]   │  │
│  │  "E-commerce Platform" has been marked as completed!                  │  │
│  │  Final payment: $10,000 received                                      │  │
│  │  [View Project]                                                       │  │
│  │  Yesterday                                                            │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  💡 SUGGESTION                                           [× Dismiss]   │  │
│  │  You have 3 projects ready for recurring payment setup                │  │
│  │  [Review Projects]                                                    │  │
│  │  2 days ago                                                           │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  [Load More]                                                                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Components Used

| Component              | Purpose              | Props/Details                     |
| ---------------------- | -------------------- | --------------------------------- |
| `Tabs`                 | Filter notifications | All, Unread, Reminders, Alerts    |
| `Button`               | Mark all read        | Bulk action                       |
| `Card` (glass) × N     | Notification items   | Icon, title, description, actions |
| `Button` (ghost, xs)   | Dismiss              | Remove notification               |
| `Button` (primary, xs) | Action               | View, Snooze, etc.                |
| `Badge`                | Unread indicator     | Red dot or count                  |

### Data Dependencies

```typescript
// On load
const notifications = await getNotifications({
  filter: activeTab, // 'all', 'unread', 'reminders', 'alerts'
  sort: { field: "createdAt", direction: "desc" },
  pagination: { page: 1, pageSize: 20 },
});

// Notification types
type Notification = {
  id: string;
  type: "overdue" | "reminder" | "completed" | "suggestion" | "alert";
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  metadata: {
    projectId?: string;
    paymentId?: string;
    // ... other context
  };
  actions: Array<{
    label: string;
    action: () => void;
  }>;
};
```

### User Interactions

1. **Tab Filter:** Switch between All, Unread, Reminders, Alerts
2. **Mark All as Read:** Bulk update all notifications
3. **Dismiss:** Remove individual notification
4. **Action Buttons:** Context-specific actions (View Project, Add Payment, etc.)
5. **Snooze:** For reminders, postpone for later (1 hour, 1 day, 1 week)

### Notification Types

| Type       | Icon | Color  | Example                      |
| ---------- | ---- | ------ | ---------------------------- |
| Overdue    | ⚠️   | Red    | Payment overdue              |
| Reminder   | 🔔   | Blue   | Follow-up reminder           |
| Completed  | ✅   | Green  | Project completed            |
| Suggestion | 💡   | Yellow | Recurring payment suggestion |
| Alert      | 🚨   | Orange | Budget exceeded              |

---

## SCREEN 10: Client Detail Page (Bonus)

### Purpose

View all projects and stats for a specific client.

### Layout Structure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Breadcrumb: Dashboard > Clients > Acme Corp]               [← Back]       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  [Client Header]                                                      │  │
│  │  Acme Corp                                         [Edit] [Archive]   │  │
│  │  Contact: John Doe • john@acme.com                                    │  │
│  │  [🔁 Recurring Client]                                                │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │
│  │ Total Billed│  │ Total Paid  │  │ Outstanding │  │ # Projects  │      │
│  │  $75,000    │  │  $65,000    │  │  $10,000    │  │      5      │      │
│  │  3 years    │  │  86.7%      │  │  13.3%      │  │  2 active   │      │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘      │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  Projects                                                 [+ New]      │  │
│  │  ┌────────────────────────────────────────────────────────────────┐ │  │
│  │  │ [Table of projects for this client]                            │ │  │
│  │  │ Same format as Projects List screen                            │ │  │
│  │  └────────────────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  Payment History                                                      │  │
│  │  ┌────────────────────────────────────────────────────────────────┐ │  │
│  │  │ [Timeline of all payments from this client]                    │ │  │
│  │  └────────────────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Components Used

Same as Project Detail page, but focused on client data.

### Data Dependencies

```typescript
// On load
const client = await getClientById(clientId);
const stats = await calculateClientStats(clientId);
const projects = await getProjects({ filter: { clientIds: [clientId] } });
const payments = await getPayments({ filter: { clientId } });
```

---

## COMPONENT: Help Widget (Floating)

### Purpose

Persistent floating help button with expandable panel.

### Layout

```
Bottom-left corner of screen:
┌────────────────────────┐
│  [? Help]  [• 3]       │ ← Collapsed (badge shows unread tips)
└────────────────────────┘

When expanded:
┌────────────────────────────────────────────┐
│  Help & Tips                          [×]  │
│  ──────────────────────────────────────   │
│                                            │
│  🎯 Quick Actions:                         │
│  • Press [Alt + P] to add payment          │
│  • Press [Alt + E] to add expense          │
│  • Press [/] to search                     │
│                                            │
│  💡 Tips:                                  │
│  • Set up recurring projects for regular   │
│    clients to automate reminders           │
│  • Use tags to organize projects           │
│                                            │
│  [View Documentation]  [Contact Support]   │
└────────────────────────────────────────────┘
```

### Components Used

| Component             | Purpose        | Props/Details              |
| --------------------- | -------------- | -------------------------- |
| `Button` (circle, lg) | Toggle button  | Fixed position bottom-left |
| `Badge`               | Unread count   | Red notification badge     |
| `Card` (glass)        | Expanded panel | Slide-up animation         |
| `Button` (link)       | Help links     | Documentation, support     |

### Data

Static content (no API calls), can be extended to show contextual tips based on current page.

---

## SCREEN 11: Search (Global)

### Purpose

Global search across all entities (projects, clients, payments, expenses).

### Trigger

- Keyboard shortcut: `/` (slash key)
- Click search icon in navbar

### Modal Layout

```
┌─────────────────────────────────────────────────────────────┐
│  🔍 Search everything...                                [×]  │
│  [Input field - auto-focused]                               │
│  ──────────────────────────────────────────────────────────  │
│                                                              │
│  Results:                                                    │
│                                                              │
│  Projects (3)                                                │
│  ● Website Redesign - Acme Corp                             │
│  ● Mobile App - Beta Inc                                    │
│  ● E-commerce Platform - Gamma LLC                          │
│                                                              │
│  Clients (2)                                                 │
│  ● John Doe (Acme Corp) - john@acme.com                     │
│  ● Jane Smith (Beta Inc) - jane@beta.io                     │
│                                                              │
│  Payments (5)                                                │
│  ● $2,500 - Website Redesign - Mar 20, 2025                 │
│  ● $5,000 - Mobile App - Mar 18, 2025                       │
│  ...                                                         │
│                                                              │
│  [No results found for "query"]                             │
└─────────────────────────────────────────────────────────────┘
```

### Components Used

| Component            | Purpose        | Props/Details           |
| -------------------- | -------------- | ----------------------- |
| `Modal` (fullscreen) | Search overlay | CMD+K / / to open       |
| `Input` (large)      | Search field   | Auto-focused, debounced |
| `Card` × N           | Result groups  | Grouped by entity type  |
| `List`               | Results        | Click to navigate       |

### Data Dependencies

```typescript
// Debounced search (300ms)
const results = await searchAll(query);

// Returns grouped results
{
  projects: [...],
  clients: [...],
  payments: [...],
  expenses: [...],
}
```

### User Interactions

1. **Type to Search:** Debounced, searches across all entities
2. **Keyboard Navigation:** Arrow keys to move, Enter to select
3. **Click Result:** Navigate to detail page
4. **Escape:** Close modal

---

## SUMMARY: All Screens

| #   | Screen             | Purpose             | Key Features                                                             |
| --- | ------------------ | ------------------- | ------------------------------------------------------------------------ |
| 1   | **Login/Sign In**  | Authentication      | Split-screen, email/password, remember me                                |
| 2   | **Onboarding**     | First-time setup    | 3-step wizard, create client & project                                   |
| 3   | **Dashboard**      | Main overview       | Hero card, stats, projects grid, activity timeline, FAB                  |
| 4   | **Projects List**  | Browse projects     | Table/grid views, filters, tabs, pagination, bulk actions                |
| 5   | **Project Detail** | Single project view | Stats cards, timeline, payments/expenses tabs, milestones, quick actions |
| 6   | **Settings**       | Configuration       | Clients, sources, categories, preferences, about                         |
| 7   | **Import/Export**  | Data management     | CSV import with validation, export to CSV/JSON/PDF                       |
| 8   | **Reports**        | Analytics           | Charts, financial summary, top clients, expense breakdown                |
| 9   | **Notifications**  | Alerts & reminders  | Overdue alerts, suggestions, action buttons                              |
| 10  | **Client Detail**  | Single client view  | Projects list, payment history, stats                                    |
| 11  | **Global Search**  | Quick find          | Search all entities, keyboard shortcut                                   |

### Modals (Cross-Screen)

| #   | Modal                  | Trigger                         | Key Features                                        |
| --- | ---------------------- | ------------------------------- | --------------------------------------------------- |
| 1   | **Add/Edit Project**   | New Project button, Edit button | Full form, milestones editor, validation            |
| 2   | **Quick Add Payment**  | FAB, + Payment button           | Smart suggestions, overpayment warning, attachments |
| 3   | **Quick Add Expense**  | FAB, + Expense button           | Category selection, recurring options, receipts     |
| 4   | **Attachment Viewer**  | View receipt/invoice            | Image/PDF carousel, download, delete                |
| 5   | **Add/Edit Client**    | Settings > Clients              | Name, email, company, recurring flag                |
| 6   | **Add/Edit Source**    | Settings > Sources              | Name, type, active toggle                           |
| 7   | **Add/Edit Category**  | Settings > Categories           | Name, type, active toggle                           |
| 8   | **Add/Edit Milestone** | Project modal, Project detail   | Name, amount, due date                              |
| 9   | **Confirm Delete**     | Delete actions                  | Warning message, type to confirm                    |
| 10  | **Invoice Preview**    | Generate invoice action         | PDF preview, download                               |

### Floating Components (Always Visible)

| Component               | Position                 | Purpose                              |
| ----------------------- | ------------------------ | ------------------------------------ |
| **Help Widget**         | Bottom-left              | Quick help, keyboard shortcuts, tips |
| **FAB (Speed Dial)**    | Bottom-right (Dashboard) | Quick add payment/expense            |
| **Toast Notifications** | Top-right                | Success/error messages               |

---

**All screens, features, and functionalities documented. Ready for Part 6 (Implementation Roadmap)!**

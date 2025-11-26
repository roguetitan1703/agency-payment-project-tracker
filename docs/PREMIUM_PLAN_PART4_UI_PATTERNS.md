# PREMIUM PLAN — Part 4: Premium UI Patterns from Vision UI

**Project:** Agency Payment Tracker — Premium Edition
**Date:** October 24, 2025

---

## 1. Vision UI Analysis Summary

From the 6 Vision UI screens provided, I've identified these premium patterns:

### **Sign In/Sign Up Screens:**

- Split-screen layout (hero image left, form right)
- Glassmorphic form containers with backdrop blur
- Gradient backgrounds (purple/blue futuristic theme)
- Social login buttons with icons
- Remember me toggle with smooth styling
- Subtle shadows and border glow effects

### **Dashboard Screen:**

- Multi-section grid layout (3-4 columns)
- Gradient hero card ("Welcome back") with curves
- Stats cards with icons and trend indicators
- Mini sparkline charts inside stat cards
- Project cards with images and team avatars
- Floating help widget (bottom left)
- Card hover effects with elevation changes

### **Billing/Profile Screen:**

- Credit card UI with gradient background
- Toggle switches for settings
- Avatar with edit badge
- Social media links with icon buttons
- Stat cards showing balance and trends
- Mini charts inside cards (consumption, efficiency)

### **Tables Screen:**

- Advanced data table with alternating row colors
- Inline action buttons (Edit, View All)
- Avatar lists in cells
- Progress bars in table cells
- Badge indicators for status
- Table header with subtle styling

---

## 2. Premium Card Patterns

### Pattern 1: Gradient Hero Card

**Visual Reference:** Dashboard "Welcome back" card

```tsx
// GradientHeroCard.tsx
export const GradientHeroCard = ({
  title,
  subtitle,
  actionText,
  onAction,
}: Props) => {
  return (
    <div
      className="card glass bg-gradient-to-br from-primary/40 via-secondary/30 to-accent/20 
                    backdrop-blur-xl border border-white/10 
                    hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500
                    relative overflow-hidden"
    >
      {/* Animated background blob */}
      <div
        className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary to-secondary 
                      opacity-20 blur-3xl rounded-full animate-pulse"
      />

      <div className="card-body relative z-10">
        <h2
          className="card-title text-3xl font-bold bg-gradient-to-r from-primary to-secondary 
                       bg-clip-text text-transparent"
        >
          {title}
        </h2>
        <p className="text-base-content/70">{subtitle}</p>
        {actionText && (
          <div className="card-actions justify-end mt-4">
            <button
              onClick={onAction}
              className="btn btn-primary btn-sm gap-2 group"
            >
              {actionText}
              <svg
                className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
```

**Usage in Dashboard:**

```tsx
<GradientHeroCard
  title="Welcome back!"
  subtitle={`Nice to see you again, ${userName}`}
  actionText="Turn on your car"
/>
```

---

### Pattern 2: Glassmorphic Stat Card with Icon

**Visual Reference:** Dashboard stat cards with balance, efficiency, battery health

```tsx
// StatCardPremium.tsx
export const StatCardPremium = ({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  chart,
}: StatCardProps) => {
  return (
    <div
      className="stat glass bg-base-100/30 backdrop-blur-md border border-white/10 
                    hover:bg-base-100/40 hover:border-primary/30 
                    transition-all duration-300 rounded-xl p-4"
    >
      {/* Icon container with gradient background */}
      <div className="stat-figure text-primary">
        <div
          className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 
                        flex items-center justify-center"
        >
          <Icon className="w-6 h-6" />
        </div>
      </div>

      <div className="stat-title text-base-content/60 text-sm font-medium">
        {title}
      </div>

      <div className="stat-value text-2xl font-bold flex items-baseline gap-2">
        {value}
        {trend && (
          <span
            className={`text-sm font-medium flex items-center gap-1 
                           ${trend === "up" ? "text-success" : "text-error"}`}
          >
            {trend === "up" ? "↗" : "↘"} {trendValue}
          </span>
        )}
      </div>

      {chart && (
        <div className="stat-desc mt-2">
          <MiniSparkline data={chart} height={40} />
        </div>
      )}
    </div>
  );
};
```

**Usage:**

```tsx
<StatCardPremium
  title="Total Received"
  value={formatCurrency(45231)}
  icon={TrendingUpIcon}
  trend="up"
  trendValue="+12%"
  chart={[30, 40, 35, 50, 49, 60, 70, 91, 125, 145]}
/>
```

---

### Pattern 3: Radial Progress Card

**Visual Reference:** Dashboard "Satisfaction Rate" and "Referral Tracking" cards

```tsx
// RadialProgressCard.tsx
export const RadialProgressCard = ({
  title,
  percentage,
  subtitle,
  color = "primary",
}: Props) => {
  return (
    <div
      className="card glass bg-base-100/30 backdrop-blur-md border border-white/10 
                    hover:shadow-xl transition-all duration-300"
    >
      <div className="card-body items-center text-center">
        <h3 className="card-title text-sm font-medium text-base-content/70">
          {title}
        </h3>

        {/* Radial Progress */}
        <div className="relative w-32 h-32 my-4">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-base-300/20"
            />
            {/* Progress circle */}
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 56}`}
              strokeDashoffset={`${2 * Math.PI * 56 * (1 - percentage / 100)}`}
              className={`text-${color} transition-all duration-1000 ease-out`}
              strokeLinecap="round"
            />
          </svg>

          {/* Center text */}
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <span className="text-3xl font-bold">{percentage}%</span>
            <span className="text-xs text-base-content/60">{subtitle}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
```

**Usage:**

```tsx
<RadialProgressCard
  title="Project Completion"
  percentage={68}
  subtitle="Current load"
  color="primary"
/>
```

---

### Pattern 4: Project Card with Image & Avatars

**Visual Reference:** Dashboard project cards ("Modern", "Scandinavian", "Minimalist")

```tsx
// ProjectCardPremium.tsx
export const ProjectCardPremium = ({
  project,
  imageUrl,
  teamMembers,
  onClick,
}: Props) => {
  const stats = useProjectStats(project.id);

  return (
    <div
      className="card glass bg-base-100/20 backdrop-blur-md border border-white/10 
                    hover:bg-base-100/30 hover:scale-105 hover:shadow-2xl 
                    transition-all duration-300 cursor-pointer"
      onClick={onClick}
    >
      {/* Project image with overlay gradient */}
      <figure className="relative h-48 overflow-hidden">
        <img
          src={imageUrl || "/placeholder-project.jpg"}
          alt={project.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-base-100 via-transparent to-transparent" />

        {/* Status badge */}
        <div className="absolute top-4 right-4">
          <div
            className={`badge badge-sm glass ${
              project.status === "active"
                ? "badge-success"
                : project.status === "completed"
                ? "badge-primary"
                : "badge-ghost"
            }`}
          >
            {project.status}
          </div>
        </div>
      </figure>

      <div className="card-body">
        {/* Project info */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-base-content/60 uppercase tracking-wide">
              Project #{project.id.slice(0, 6)}
            </p>
            <h3 className="card-title text-lg mt-1">{project.name}</h3>
          </div>
        </div>

        {/* Description (truncated) */}
        <p className="text-sm text-base-content/70 line-clamp-2">
          {project.notes || "No description available"}
        </p>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-base-content/60">Progress</span>
            <span className="font-semibold">{Math.round(stats.progress)}%</span>
          </div>
          <progress
            className="progress progress-primary h-2"
            value={stats.progress}
            max="100"
          />
        </div>

        {/* Footer: Team avatars + View button */}
        <div className="card-actions justify-between items-center mt-4">
          {/* Team avatars */}
          <div className="avatar-group -space-x-3">
            {teamMembers.slice(0, 3).map((member, i) => (
              <div key={i} className="avatar border-2 border-base-100">
                <div className="w-8 h-8">
                  <img src={member.avatar} alt={member.name} />
                </div>
              </div>
            ))}
            {teamMembers.length > 3 && (
              <div className="avatar placeholder border-2 border-base-100">
                <div className="w-8 h-8 bg-neutral text-neutral-content text-xs">
                  +{teamMembers.length - 3}
                </div>
              </div>
            )}
          </div>

          <button className="btn btn-sm btn-ghost gap-2">
            View All
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
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
```

---

### Pattern 5: Credit Card UI Component

**Visual Reference:** Billing screen credit card display

```tsx
// CreditCardDisplay.tsx
export const CreditCardDisplay = ({
  balance,
  cardNumber,
  validThru,
  cvv,
}: Props) => {
  return (
    <div
      className="card bg-gradient-to-br from-primary via-secondary to-accent 
                    text-primary-content shadow-2xl w-full max-w-md h-56 
                    relative overflow-hidden"
    >
      {/* Card chip decoration */}
      <div className="absolute top-12 left-8 w-12 h-10 bg-warning/30 rounded-md" />

      {/* Visa logo or brand */}
      <div className="absolute top-8 right-8">
        <span className="text-2xl font-bold opacity-80">VISA</span>
      </div>

      <div className="card-body justify-between">
        {/* Balance */}
        <div>
          <p className="text-xs opacity-70 uppercase tracking-wider">
            Credit Balance
          </p>
          <h2 className="text-4xl font-bold mt-1">
            ${balance.toLocaleString()}
          </h2>

          {/* Trend indicator */}
          <div className="flex items-center gap-2 mt-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm">+12% this month</span>
          </div>
        </div>

        {/* Card details */}
        <div className="flex justify-between items-end">
          <div>
            <p className="text-xs opacity-70">CARD NUMBER</p>
            <p className="font-mono text-sm tracking-wider mt-1">
              {cardNumber.replace(/(.{4})/g, "$1 ")}
            </p>
          </div>

          <div className="flex gap-6">
            <div>
              <p className="text-xs opacity-70">VALID THRU</p>
              <p className="font-mono text-sm mt-1">{validThru}</p>
            </div>
            <div>
              <p className="text-xs opacity-70">CVV</p>
              <p className="font-mono text-sm mt-1">{cvv}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Background pattern */}
      <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
    </div>
  );
};
```

---

## 3. Advanced Table Pattern

**Visual Reference:** Tables screen with Authors and Projects tables

```tsx
// AdvancedTable.tsx
export const AdvancedTable = <T extends Record<string, any>>({
  data,
  columns,
  onEdit,
  onDelete,
}: AdvancedTableProps<T>) => {
  return (
    <div
      className="card glass bg-base-100/30 backdrop-blur-md border border-white/10 
                    overflow-hidden"
    >
      <div className="overflow-x-auto">
        <table className="table table-zebra">
          <thead>
            <tr className="border-b border-white/10">
              {columns.map((col, i) => (
                <th
                  key={i}
                  className="text-xs font-semibold uppercase tracking-wider 
                                       text-base-content/70"
                >
                  {col.header}
                </th>
              ))}
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} className="hover:bg-base-100/40 transition-colors">
                {columns.map((col, j) => (
                  <td key={j} className="text-sm">
                    {col.render ? col.render(row) : row[col.accessor]}
                  </td>
                ))}
                <td className="text-right">
                  <div className="flex gap-2 justify-end">
                    {onEdit && (
                      <button
                        onClick={() => onEdit(row)}
                        className="btn btn-ghost btn-xs"
                      >
                        Edit
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(row)}
                        className="btn btn-ghost btn-xs text-error"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Custom cell renderers for rich content
export const TableCellRenderers = {
  // Avatar with name
  userWithAvatar: (user: { name: string; email: string; avatar?: string }) => (
    <div className="flex items-center gap-3">
      <div className="avatar">
        <div className="w-10 h-10 rounded-lg">
          <img src={user.avatar || "/default-avatar.png"} alt={user.name} />
        </div>
      </div>
      <div>
        <div className="font-semibold">{user.name}</div>
        <div className="text-xs opacity-60">{user.email}</div>
      </div>
    </div>
  ),

  // Status badge
  statusBadge: (status: string) => {
    const colors = {
      active: "badge-success",
      online: "badge-success",
      completed: "badge-primary",
      done: "badge-primary",
      offline: "badge-ghost",
      archived: "badge-ghost",
      working: "badge-warning",
      canceled: "badge-error",
    };

    return (
      <div
        className={`badge badge-sm ${
          colors[status.toLowerCase()] || "badge-ghost"
        }`}
      >
        {status}
      </div>
    );
  },

  // Progress bar
  progressBar: (progress: number) => (
    <div className="flex items-center gap-3">
      <progress
        className="progress progress-primary w-24 h-2"
        value={progress}
        max="100"
      />
      <span className="text-xs font-semibold">{progress}%</span>
    </div>
  ),

  // Currency with color
  currency: (amount: number) => (
    <span
      className={`font-semibold ${amount < 0 ? "text-error" : "text-success"}`}
    >
      {amount < 0 ? "-" : ""}${Math.abs(amount).toLocaleString()}
    </span>
  ),

  // Date with relative time
  dateRelative: (date: string) => {
    const d = new Date(date);
    const relative = formatDistanceToNow(d, { addSuffix: true });

    return (
      <div>
        <div className="font-medium">{format(d, "MMM dd, yyyy")}</div>
        <div className="text-xs opacity-60">{relative}</div>
      </div>
    );
  },

  // Avatar group
  avatarGroup: (users: Array<{ name: string; avatar: string }>) => (
    <div className="avatar-group -space-x-3">
      {users.slice(0, 3).map((user, i) => (
        <div key={i} className="avatar border-2 border-base-100">
          <div className="w-8 h-8">
            <img src={user.avatar} alt={user.name} />
          </div>
        </div>
      ))}
      {users.length > 3 && (
        <div className="avatar placeholder border-2 border-base-100">
          <div className="w-8 h-8 bg-neutral text-neutral-content text-xs">
            +{users.length - 3}
          </div>
        </div>
      )}
    </div>
  ),
};
```

**Usage:**

```tsx
<AdvancedTable
  data={projects}
  columns={[
    {
      header: "Project",
      accessor: "name",
      render: (row) =>
        TableCellRenderers.userWithAvatar({
          name: row.name,
          email: getClientName(row.clientId),
          avatar: row.avatar,
        }),
    },
    {
      header: "Budget",
      accessor: "totalAmount",
      render: (row) => TableCellRenderers.currency(row.totalAmount),
    },
    {
      header: "Status",
      accessor: "status",
      render: (row) => TableCellRenderers.statusBadge(row.status),
    },
    {
      header: "Completion",
      accessor: "progress",
      render: (row) => TableCellRenderers.progressBar(row.progress),
    },
  ]}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>
```

---

## 4. Mini Chart Components

### Sparkline Chart

```tsx
// MiniSparkline.tsx
export const MiniSparkline = ({
  data,
  height = 40,
  color = "primary",
}: Props) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min;

  const points = data
    .map((value, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = ((value - min) / range) * 100;
      return `${x},${100 - y}`;
    })
    .join(" ");

  return (
    <svg
      viewBox="0 0 100 100"
      className="w-full"
      style={{ height: `${height}px` }}
      preserveAspectRatio="none"
    >
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className={`text-${color} opacity-70`}
        vectorEffect="non-scaling-stroke"
      />

      {/* Area fill */}
      <polygon
        points={`0,100 ${points} 100,100`}
        fill="currentColor"
        className={`text-${color} opacity-10`}
      />
    </svg>
  );
};
```

### Mini Bar Chart

```tsx
// MiniBarChart.tsx
export const MiniBarChart = ({ data, height = 60 }: Props) => {
  const max = Math.max(...data);

  return (
    <div
      className="flex items-end justify-between gap-1"
      style={{ height: `${height}px` }}
    >
      {data.map((value, i) => (
        <div
          key={i}
          className="bg-primary rounded-t flex-1 transition-all duration-300 hover:bg-primary-focus"
          style={{ height: `${(value / max) * 100}%` }}
        />
      ))}
    </div>
  );
};
```

### Radial Chart (Donut)

```tsx
// RadialChart.tsx
export const RadialChart = ({
  percentage,
  size = 120,
  strokeWidth = 10,
  color = "primary",
}: Props) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-base-300/20"
        />

        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={`text-${color} transition-all duration-1000 ease-out`}
          strokeLinecap="round"
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center flex-col">
        <span className="text-2xl font-bold">{percentage}%</span>
      </div>
    </div>
  );
};
```

---

## 5. Profile Section Pattern

**Visual Reference:** Billing screen profile card

```tsx
// ProfileCard.tsx
export const ProfileCard = ({ user, stats }: Props) => {
  return (
    <div className="card glass bg-base-100/30 backdrop-blur-md border border-white/10">
      <div className="card-body">
        {/* Avatar with edit badge */}
        <div className="flex items-start gap-4">
          <div className="indicator">
            <span className="indicator-item badge badge-primary badge-sm cursor-pointer">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </span>
            <div className="avatar">
              <div className="w-20 h-20 rounded-xl ring ring-primary ring-offset-base-100 ring-offset-2">
                <img src={user.avatar} alt={user.name} />
              </div>
            </div>
          </div>

          <div className="flex-1">
            <h3 className="text-xl font-bold">{user.name}</h3>
            <p className="text-sm text-base-content/60">{user.email}</p>

            {/* Social links */}
            <div className="flex gap-2 mt-3">
              <a href="#" className="btn btn-circle btn-xs btn-ghost">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                </svg>
              </a>
              <a href="#" className="btn btn-circle btn-xs btn-ghost">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
              <a href="#" className="btn btn-circle btn-xs btn-ghost">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="divider my-2" />

        {/* Profile info */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-base-content/60">Full Name:</span>
            <span className="font-semibold">{user.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-base-content/60">Mobile:</span>
            <span className="font-semibold">{user.phone}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-base-content/60">Email:</span>
            <span className="font-semibold">{user.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-base-content/60">Location:</span>
            <span className="font-semibold">{user.location}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
```

---

## 6. Settings Toggle Groups

**Visual Reference:** Billing screen "Platform Settings" section

```tsx
// SettingsToggleGroup.tsx
export const SettingsToggleGroup = ({ title, settings, onChange }: Props) => {
  return (
    <div className="card glass bg-base-100/30 backdrop-blur-md border border-white/10">
      <div className="card-body">
        <h3 className="card-title text-lg mb-4">{title}</h3>

        <div className="space-y-4">
          {settings.map((setting) => (
            <div
              key={setting.id}
              className="flex items-center justify-between p-3 
                                             rounded-lg hover:bg-base-100/40 transition-colors"
            >
              <div className="flex-1">
                <h4 className="font-semibold text-sm">{setting.label}</h4>
                {setting.description && (
                  <p className="text-xs text-base-content/60 mt-1">
                    {setting.description}
                  </p>
                )}
              </div>

              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={setting.enabled}
                onChange={(e) => onChange(setting.id, e.target.checked)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
```

**Usage:**

```tsx
<SettingsToggleGroup
  title="Notification Preferences"
  settings={[
    {
      id: "payment-reminders",
      label: "Payment Reminders",
      description: "Get notified 3 days before payment is due",
      enabled: true,
    },
    {
      id: "overdue-alerts",
      label: "Overdue Alerts",
      description: "Alert when projects become overdue",
      enabled: true,
    },
    {
      id: "weekly-summary",
      label: "Weekly Summary",
      description: "Receive weekly project summary emails",
      enabled: false,
    },
  ]}
  onChange={handleSettingChange}
/>
```

---

## 7. Floating Help Widget

**Visual Reference:** Dashboard bottom-left help button

```tsx
// HelpWidget.tsx
export const HelpWidget = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating button */}
      <div className="fixed bottom-8 left-8 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="btn btn-circle btn-lg glass bg-primary/90 hover:bg-primary 
                     text-primary-content shadow-2xl shadow-primary/30
                     hover:scale-110 transition-all duration-300"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </button>

        {/* Badge for unread notifications */}
        <div className="absolute -top-2 -right-2">
          <div className="badge badge-error badge-sm">2</div>
        </div>
      </div>

      {/* Help panel */}
      {isOpen && (
        <div className="fixed bottom-28 left-8 z-50 w-80 animate-in slide-in-from-bottom-4">
          <div
            className="card glass bg-base-100/95 backdrop-blur-xl border border-white/10 
                          shadow-2xl"
          >
            <div className="card-body">
              <div className="flex items-center justify-between mb-4">
                <h3 className="card-title text-lg">Need help?</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="btn btn-ghost btn-sm btn-circle"
                >
                  ✕
                </button>
              </div>

              <p className="text-sm text-base-content/70 mb-4">
                Please check our documentation or contact support.
              </p>

              <div className="space-y-2">
                <button className="btn btn-sm btn-block justify-start gap-2">
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
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                  Documentation
                </button>

                <button className="btn btn-sm btn-block justify-start gap-2">
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
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  Contact Support
                </button>

                <button className="btn btn-sm btn-block justify-start gap-2">
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
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  Video Tutorials
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
```

---

## 8. Animation & Transition System

### Framer Motion Variants

```typescript
// animations.ts
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3, ease: "easeOut" },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
  transition: { duration: 0.2, ease: "easeOut" },
};

export const slideInRight = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 50 },
  transition: { duration: 0.3, ease: "easeOut" },
};

export const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const cardHover = {
  rest: { scale: 1, boxShadow: "0 10px 30px -15px rgba(0, 0, 0, 0.3)" },
  hover: {
    scale: 1.05,
    boxShadow: "0 20px 40px -15px rgba(168, 85, 247, 0.4)",
    transition: { duration: 0.3, ease: "easeOut" },
  },
};
```

### Loading Skeleton

```tsx
// LoadingSkeleton.tsx
export const CardSkeleton = () => (
  <div className="card glass bg-base-100/30 backdrop-blur-md animate-pulse">
    <div className="card-body">
      <div className="h-6 bg-base-300/50 rounded w-3/4 mb-2" />
      <div className="h-4 bg-base-300/50 rounded w-1/2 mb-4" />
      <div className="h-20 bg-base-300/50 rounded w-full" />
    </div>
  </div>
);

export const TableSkeleton = ({ rows = 5 }: Props) => (
  <div className="space-y-2">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-4 animate-pulse">
        <div className="h-12 bg-base-300/50 rounded flex-1" />
        <div className="h-12 bg-base-300/50 rounded w-32" />
        <div className="h-12 bg-base-300/50 rounded w-24" />
      </div>
    ))}
  </div>
);
```

---

## 9. Complete Glassmorphism Theme

### Enhanced Tailwind Config

```javascript
// tailwind.config.js
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      backdropBlur: {
        xs: "2px",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
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
        "glass-lg": "0 20px 60px 0 rgba(31, 38, 135, 0.5)",
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        darkCrystal: {
          primary: "#a855f7",
          "primary-focus": "#9333ea",
          "primary-content": "#ffffff",
          secondary: "#6366f1",
          "secondary-focus": "#4f46e5",
          "secondary-content": "#ffffff",
          accent: "#f472b6",
          "accent-focus": "#ec4899",
          "accent-content": "#ffffff",
          neutral: "#1f2937",
          "neutral-focus": "#111827",
          "neutral-content": "#e5e7eb",
          "base-100": "#0f172a",
          "base-200": "#1e293b",
          "base-300": "#334155",
          "base-content": "#f1f5f9",
          info: "#3b82f6",
          success: "#10b981",
          warning: "#f59e0b",
          error: "#ef4444",
        },
      },
    ],
  },
};
```

### Global Glass Styles

```css
/* src/index.css */
@import "tailwindcss";

/* Enhanced glassmorphism */
.glass-premium {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
}

.glass-hover {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.glass-hover:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(168, 85, 247, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 12px 40px 0 rgba(168, 85, 247, 0.2);
}

/* Gradient text */
.gradient-text {
  background: linear-gradient(135deg, #a855f7 0%, #6366f1 50%, #f472b6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Animated gradient background */
.gradient-animated {
  background: linear-gradient(-45deg, #a855f7, #6366f1, #f472b6, #a855f7);
  background-size: 400% 400%;
  animation: gradient 15s ease infinite;
}

@keyframes gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

/* Scrollbar styling */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: rgba(168, 85, 247, 0.5);
  border-radius: 4px;
  transition: background 0.3s;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(168, 85, 247, 0.7);
}
```

---

**Next:** Part 5 will cover detailed Screen-by-Screen Specifications with exact layouts, components, data dependencies, and interactions for all 8+ screens.

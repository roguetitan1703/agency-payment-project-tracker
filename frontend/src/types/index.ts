// Core entity types (condensed but complete implementations)
export type UUID = string;

export type Project = {
  id: UUID;
  name: string;
  clientId: UUID;
  totalAmount: number;
  startDate: string; // ISO
  endDate: string; // ISO
  isRecurring?: boolean;
  tags?: string[];
  notes?: string;
  createdAt: string;
  updatedAt?: string;
};

export type Milestone = {
  id: UUID;
  projectId: UUID;
  title: string;
  amount: number;
  dueDate?: string;
  completed: boolean;
  createdAt: string;
  updatedAt?: string;
};

export type Payment = {
  id: UUID;
  projectId?: UUID;
  clientId?: UUID;
  amount: number;
  date: string; // ISO
  sourceId?: UUID;
  note?: string;
  createdAt: string;
  updatedAt?: string;
};

export type Expense = {
  id: UUID;
  projectId?: UUID;
  categoryId?: UUID;
  amount: number;
  date: string;
  note?: string;
  createdAt: string;
  updatedAt?: string;
};

export type Client = {
  id: UUID;
  name: string;
  email?: string;
  company?: string;
  phone?: string;
  createdAt: string;
  updatedAt?: string;
};

export type Source = {
  id: UUID;
  name: string;
  type?: string;
  active?: boolean;
  createdAt: string;
  updatedAt?: string;
};

export type Category = {
  id: UUID;
  name: string;
  active?: boolean;
  createdAt: string;
  updatedAt?: string;
};

// Input types
export type ProjectInput = Omit<Project, "id" | "createdAt" | "updatedAt"> & {
  milestones?: Milestone[];
};
export type PaymentInput = Omit<Payment, "id" | "createdAt" | "updatedAt">;
export type ExpenseInput = Omit<Expense, "id" | "createdAt" | "updatedAt">;

// Filters
export type ProjectFilter = {
  searchQuery?: string;
  status?: string[];
  tags?: string[];
  clientId?: UUID;
};

export type PaginationConfig = { page: number; limit: number };

// Auth types
export type User = {
  id: UUID;
  email: string;
  name?: string;
  createdAt: string;
};

export type LoginInput = {
  email: string;
  password: string;
  rememberMe?: boolean;
};
export type RegisterInput = { email: string; password: string; name?: string };
export type AuthResponse = { token: string; user: User };

// Dashboard types
export type DashboardStats = {
  totalReceived: number;
  totalExpenses: number;
  netProfit: number;
  activeProjects: number;
  recentExpenses: Expense[];
};

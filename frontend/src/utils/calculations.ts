import { Payment, Expense } from "../types";

export const sumPayments = (payments: Payment[]) => {
  return payments.reduce((s, p) => s + (p?.amount || 0), 0);
};

export const sumExpenses = (expenses: Expense[]) => {
  return expenses.reduce((s, e) => s + (e?.amount || 0), 0);
};

export const projectProgress = (received: number, total: number) => {
  if (!total || total <= 0) return 0;
  const p = (received / total) * 100;
  return Math.min(100, Math.max(0, Math.round(p)));
};

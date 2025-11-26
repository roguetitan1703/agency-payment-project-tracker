import React from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "../api/client";
import { Expense } from "../types";

const fetchExpenses = async (): Promise<Expense[]> => {
  const res = await apiClient.get("/expenses");
  return res.data.expenses || res.data;
};

const ExpensesPage: React.FC = () => {
  const { data, isLoading, error } = useQuery(["expenses"], fetchExpenses);

  if (isLoading) return <div>Loading expenses...</div>;
  if (error) return <div className="text-error">Failed to load expenses</div>;

  const expenses = data as Expense[];

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Expenses</h1>
      <div className="space-y-3">
        {expenses.map((e) => (
          <div key={e.id} className="card p-3">
            <div className="flex justify-between">
              <div>
                <div>{e.amount}</div>
                <div className="text-sm opacity-70">{e.date}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExpensesPage;

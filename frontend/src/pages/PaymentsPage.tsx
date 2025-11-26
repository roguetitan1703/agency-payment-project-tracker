import React from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "../api/client";
import { Payment } from "../types";

const fetchPayments = async (): Promise<Payment[]> => {
  const res = await apiClient.get("/payments");
  return res.data.payments || res.data;
};

const PaymentsPage: React.FC = () => {
  const { data, isLoading, error } = useQuery(["payments"], fetchPayments);

  if (isLoading) return <div>Loading payments...</div>;
  if (error) return <div className="text-error">Failed to load payments</div>;

  const payments = data as Payment[];

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Payments</h1>
      <div className="space-y-3">
        {payments.map((p) => (
          <div key={p.id} className="card p-3">
            <div className="flex justify-between">
              <div>
                <div>{p.amount}</div>
                <div className="text-sm opacity-70">{p.date}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PaymentsPage;

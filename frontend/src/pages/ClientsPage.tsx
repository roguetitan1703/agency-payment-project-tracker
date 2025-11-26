import React from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "../api/client";
import { Client } from "../types";

const fetchClients = async (): Promise<Client[]> => {
  const res = await apiClient.get("/clients");
  return res.data.clients || res.data;
};

const ClientsPage: React.FC = () => {
  const { data, isLoading, error } = useQuery(["clients"], fetchClients);

  if (isLoading) return <div>Loading clients...</div>;
  if (error) return <div className="text-error">Failed to load clients</div>;

  const clients = data as Client[];

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Clients</h1>
      <div className="space-y-3">
        {clients.map((c) => (
          <div key={c.id} className="card p-3">
            <div className="flex justify-between">
              <div>
                <div className="font-medium">{c.name}</div>
                <div className="text-sm opacity-70">{c.company}</div>
              </div>
              <div className="text-sm">{c.email}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClientsPage;

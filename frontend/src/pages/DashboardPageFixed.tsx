import React from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "../api/client";
import { DashboardStats } from "../types";
import { currency } from "../utils/formatters";
import GradientHeroCard from "../components/ui/GradientHeroCard";
import StatCardPremium from "../components/ui/StatCardPremium";
import RadialProgressCard from "../components/ui/RadialProgressCard";

const fetchStats = async (): Promise<DashboardStats> => {
  const res = await apiClient.get("/dashboard/stats");
  return res.data;
};

const DashboardPage: React.FC = () => {
  const { data, isLoading, error } = useQuery<DashboardStats, Error>({
    queryKey: ["dashboardStats"],
    queryFn: fetchStats,
  });

  if (isLoading) return <div>Loading dashboard...</div>;
  if (error)
    return <div className="text-error">Failed to load dashboard stats</div>;

  const stats = (data || {}) as DashboardStats;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <GradientHeroCard
            title="Welcome back!"
            subtitle={`You have ${stats.activeProjects || 0} active projects`}
            actionText="View reports"
            onAction={() => {}}
          />
        </div>

        <div className="space-y-4">
          <StatCardPremium
            title="Total Received"
            value={currency(stats.totalReceived || 0)}
            trend="up"
            trendValue="+12%"
            chart={[30, 40, 35, 50, 49, 60, 70, 91]}
          />

          <StatCardPremium
            title="Total Expenses"
            value={currency(stats.totalExpenses || 0)}
            trend="down"
            trendValue="-3%"
            chart={[20, 30, 25, 40, 39, 50, 60, 55]}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="card p-4 glass-premium">
            <h3 className="font-semibold mb-2">Overview</h3>
            <p className="text-sm text-base-content/70">
              Summary and quick actions will appear here.
            </p>
          </div>
        </div>

        <div>
          <RadialProgressCard
            title="Project Completion"
            percentage={68}
            subtitle="Overall"
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

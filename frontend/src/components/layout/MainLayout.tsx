import React from "react";
import { Link, Outlet } from "react-router-dom";

const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen">
      <div className="navbar bg-base-200 px-4">
        <div className="flex-1">
          <Link to="/dashboard" className="btn btn-ghost normal-case text-xl">
            Agency Tracker
          </Link>
        </div>
        <div className="flex-none">
          <Link to="/settings" className="btn btn-ghost">
            Settings
          </Link>
        </div>
      </div>
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;

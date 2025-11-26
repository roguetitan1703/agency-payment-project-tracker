import React from "react";
import { Outlet } from "react-router-dom";

const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="w-full max-w-4xl">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;

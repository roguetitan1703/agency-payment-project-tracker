import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";

// Pages
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPageFixed";
import ProjectsPage from "./pages/ProjectsPage";
import ProjectDetailPage from "./pages/ProjectDetailPage";
import PaymentsPage from "./pages/PaymentsPage";
import ExpensesPage from "./pages/ExpensesPage";
import ClientsPage from "./pages/ClientsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import SettingsPage from "./pages/SettingsPage";

// Layouts
import MainLayout from "./components/layout/MainLayout";
import AuthLayout from "./components/layout/AuthLayout";

const queryClient = new QueryClient();

function App() {
  const isAuthenticated = !!localStorage.getItem("authToken");

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          <Route element={<MainLayout />}>
            <Route
              path="/dashboard"
              element={
                isAuthenticated ? <DashboardPage /> : <Navigate to="/login" />
              }
            />
            <Route
              path="/projects"
              element={
                isAuthenticated ? <ProjectsPage /> : <Navigate to="/login" />
              }
            />
            <Route
              path="/projects/:id"
              element={
                isAuthenticated ? (
                  <ProjectDetailPage />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/payments"
              element={
                isAuthenticated ? <PaymentsPage /> : <Navigate to="/login" />
              }
            />
            <Route
              path="/expenses"
              element={
                isAuthenticated ? <ExpensesPage /> : <Navigate to="/login" />
              }
            />
            <Route
              path="/clients"
              element={
                isAuthenticated ? <ClientsPage /> : <Navigate to="/login" />
              }
            />
            <Route
              path="/analytics"
              element={
                isAuthenticated ? <AnalyticsPage /> : <Navigate to="/login" />
              }
            />
            <Route
              path="/settings"
              element={
                isAuthenticated ? <SettingsPage /> : <Navigate to="/login" />
              }
            />
          </Route>

          <Route
            path="/"
            element={
              <Navigate to={isAuthenticated ? "/dashboard" : "/login"} />
            }
          />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" />
    </QueryClientProvider>
  );
}

export default App;

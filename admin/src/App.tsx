import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import LoginPage from "./pages/LoginPage";
import AdminLayout from "./components/AdminLayout";
import Dashboard from "./pages/Dashboard";
import FlatsPage from "./pages/FlatsPage";
import UsersPage from "./pages/UsersPage";
import WithdrawalsPage from "./pages/WithdrawalsPage";
import ReportsPage from "./pages/ReportsPage";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthed = !!Cookies.get("adminToken");
  return isAuthed ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <Routes>
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="flats" element={<FlatsPage />} />
                  <Route path="users" element={<UsersPage />} />
                  <Route path="withdrawals" element={<WithdrawalsPage />} />
                  <Route path="reports" element={<ReportsPage />} />
                </Routes>
              </AdminLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

import { Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { authApi } from "./api";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";

function ProtectedRoute({ children, adminOnly }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authApi
      .me()
      .then((res) => setUser(res.data?.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== "admin") return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute adminOnly>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

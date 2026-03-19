import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { adminApi, authApi } from "../api";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([adminApi.dashboard(), adminApi.users()])
      .then(([statsRes, usersRes]) => {
        setStats(statsRes.data);
        setUsers(usersRes.data?.users || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="admin-loading">Loading admin dashboard...</div>;
  if (error) return <div className="admin-error">{error}</div>;

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div>
          <h1>Admin Dashboard</h1>
          <nav className="main-nav">
            <Link to="/">Tasks</Link>
            <Link to="/admin" className="admin-link active">Admin Dashboard</Link>
          </nav>
        </div>
        <button
          className="admin-logout-btn"
          onClick={async () => {
            await authApi.logout();
            navigate("/admin-login", { replace: true });
          }}
        >
          Logout
        </button>
      </header>

      <div className="admin-stats">
        <div className="stat-card">
          <span className="stat-value">{stats?.totalUsers ?? 0}</span>
          <span className="stat-label">Total Users</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats?.totalTasks ?? 0}</span>
          <span className="stat-label">Total Tasks</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats?.completedTasks ?? 0}</span>
          <span className="stat-label">Completed Tasks</span>
        </div>
      </div>

      <section className="admin-users">
        <h2>All Users</h2>
        <table className="users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td><span className={`role-badge ${u.role}`}>{u.role}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

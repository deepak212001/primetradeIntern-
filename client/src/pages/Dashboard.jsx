import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { authApi, tasksApi } from "../api";
import "./Dashboard.css";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ title: "", description: "", status: "pending", priority: "medium" });

  const loadUser = () => {
    authApi.me().then((res) => setUser(res.data?.user));
  };

  const loadTasks = (page = 1) => {
    setLoading(true);
    tasksApi
      .list({ page, limit: 10 })
      .then((res) => {
        setTasks(res.data?.tasks || []);
        setPagination(res.data?.pagination || {});
      })
      .catch((err) => setMessage({ type: "error", text: err.message }))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadUser();
    loadTasks();
  }, []);

  const showMsg = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 4000);
  };

  const openCreate = () => {
    setForm({ title: "", description: "", status: "pending", priority: "medium" });
    setModal("create");
  };

  const openEdit = (task) => {
    setForm({
      title: task.title,
      description: task.description || "",
      status: task.status,
      priority: task.priority,
    });
    setModal({ type: "edit", id: task._id });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await tasksApi.create(form);
      showMsg("success", "Task created!");
      setModal(null);
      loadTasks(pagination.page || 1);
    } catch (err) {
      showMsg("error", err.message);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await tasksApi.update(modal.id, form);
      showMsg("success", "Task updated!");
      setModal(null);
      loadTasks(pagination.page || 1);
    } catch (err) {
      showMsg("error", err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this task?")) return;
    try {
      await tasksApi.delete(id);
      showMsg("success", "Task deleted!");
      loadTasks(pagination.page || 1);
    } catch (err) {
      showMsg("error", err.message);
    }
  };

  const handleLogout = () => {
    authApi.logout().then(() => window.location.href = "/login");
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>Task Manager</h1>
          <nav className="main-nav">
            <Link to="/">Tasks</Link>
            <Link to="/admin" className="admin-link">Admin Dashboard</Link>
          </nav>
        </div>
        <div className="header-right">
          <span className="user-info">{user?.name} ({user?.email})</span>
          {user?.role === "admin" && <span className="role-badge">Admin</span>}
          <button onClick={handleLogout} className="btn-outline">Logout</button>
        </div>
      </header>

      {message.text && (
        <div className={`message ${message.type}`}>{message.text}</div>
      )}

      <main className="dashboard-main">
        <div className="tasks-header">
          <h2>My Tasks</h2>
          <button onClick={openCreate} className="btn-primary">+ New Task</button>
        </div>

        {loading ? (
          <p className="loading">Loading tasks...</p>
        ) : tasks.length === 0 ? (
          <p className="empty">No tasks yet. Create one!</p>
        ) : (
          <ul className="task-list">
            {tasks.map((t) => (
              <li key={t._id} className="task-item">
                <div className="task-content">
                  <span className={`badge status-${t.status}`}>{t.status}</span>
                  <span className={`badge priority-${t.priority}`}>{t.priority}</span>
                  <strong>{t.title}</strong>
                  {t.description && <span className="task-desc">{t.description}</span>}
                </div>
                <div className="task-actions">
                  <button onClick={() => openEdit(t)} className="btn-sm">Edit</button>
                  <button onClick={() => handleDelete(t._id)} className="btn-sm danger">Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {pagination.totalPages > 1 && (
          <div className="pagination">
            <button
              disabled={pagination.page <= 1}
              onClick={() => loadTasks(pagination.page - 1)}
            >
              Prev
            </button>
            <span>Page {pagination.page} of {pagination.totalPages}</span>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => loadTasks(pagination.page + 1)}
            >
              Next
            </button>
          </div>
        )}
      </main>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{modal === "create" ? "New Task" : "Edit Task"}</h3>
            <form onSubmit={modal === "create" ? handleCreate : handleUpdate}>
              <label>
                Title *
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </label>
              <label>
                Description
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                />
              </label>
              <label>
                Status
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </label>
              <label>
                Priority
                <select
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </label>
              <div className="modal-actions">
                <button type="button" onClick={() => setModal(null)}>Cancel</button>
                <button type="submit">{modal === "create" ? "Create" : "Update"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

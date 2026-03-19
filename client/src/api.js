const API_BASE = "https://primetrade-intern-karz.vercel.app/api/v1";

const fetchApi = async (path, options = {}) => {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || "Request failed");
  }
  return data;
};

export const authApi = {
  register: (body) => fetchApi("/users/register", { method: "POST", body: JSON.stringify(body) }),
  login: (body) => fetchApi("/users/login", { method: "POST", body: JSON.stringify(body) }),
  logout: () => fetchApi("/users/logout", { method: "POST" }),
  me: () => fetchApi("/users/me"),
};

export const tasksApi = {
  list: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return fetchApi(`/tasks${q ? `?${q}` : ""}`);
  },
  get: (id) => fetchApi(`/tasks/${id}`),
  create: (body) => fetchApi("/tasks", { method: "POST", body: JSON.stringify(body) }),
  update: (id, body) => fetchApi(`/tasks/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  delete: (id) => fetchApi(`/tasks/${id}`, { method: "DELETE" }),
};

export const adminApi = {
  dashboard: () => fetchApi("/admin/dashboard"),
  users: () => fetchApi("/admin/users"),
};

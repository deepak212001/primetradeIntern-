const API_BASE = "https://primetrade-intern-karz.vercel.app/api/v1";
// const API_BASE = "http://localhost:7000/api/v1";
const TOKEN_KEY = "auth_token";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
};

const fetchApi = async (path, options = {}) => {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
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
  logout: async () => {
    await fetchApi("/users/logout", { method: "POST" });
    setToken(null);
  },
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
  login: (body) => fetchApi("/admin/login", { method: "POST", body: JSON.stringify(body) }),
  logout: async () => {
    await fetchApi("/admin/logout", { method: "POST" });
    setToken(null);
  },
  dashboard: () => fetchApi("/admin/dashboard"),
  users: () => fetchApi("/admin/users"),
};

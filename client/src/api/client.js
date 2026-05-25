const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export async function apiRequest(path, options = {}) {
  const { skipAuth = false, headers: customHeaders = {}, ...rest } = options;

  const headers = {
    "Content-Type": "application/json",
    ...customHeaders,
  };

  if (!skipAuth) {
    const token = localStorage.getItem("token");
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  let response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...rest,
      headers,
    });
  } catch {
    throw new Error(
      `Cannot connect to the server at ${API_URL}. Open a terminal, run: cd server → node server.js`
    );
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || "Request failed");
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const authApi = {
  login: (body) =>
    apiRequest("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
      skipAuth: true,
    }),
  register: (body) =>
    apiRequest("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
      skipAuth: true,
    }),
  forgotPassword: (body) =>
    apiRequest("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify(body),
      skipAuth: true,
    }),
  resetPassword: (body) =>
    apiRequest("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(body),
      skipAuth: true,
    }),
  verifyOtp: (body) =>
    apiRequest("/api/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify(body),
      skipAuth: true,
    }),
};

export const predictApi = {
  analyze: (body) =>
    apiRequest("/api/predict", {
      method: "POST",
      body: JSON.stringify(body),
    }),
};

export const historyApi = {
  list: () => apiRequest("/api/history"),
  remove: (id) =>
    apiRequest(`/api/history/${id}`, {
      method: "DELETE",
    }),
  clearAll: () =>
    apiRequest("/api/history", {
      method: "DELETE",
    }),
};

export const dashboardApi = {
  stats: () => apiRequest("/api/dashboard/stats"),
};

export const userApi = {
  getProfile: () => apiRequest("/api/user/profile"),
  updateProfile: (body) =>
    apiRequest("/api/user/profile", {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  getSettings: () => apiRequest("/api/user/settings"),
  updateSettings: (body) =>
    apiRequest("/api/user/settings", {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  changePassword: (body) =>
    apiRequest("/api/user/password", {
      method: "PUT",
      body: JSON.stringify(body),
    }),
};

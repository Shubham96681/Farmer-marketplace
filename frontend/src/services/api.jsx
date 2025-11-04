import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:8001";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ✅ Named exports for different API groups
export const productAPI = {
  getAll: (params = {}) => api.get("/api/products", { params }),
  getById: (id) => api.get(`/api/products/${id}`),
  create: (data) => api.post("/api/products", data),
  update: (id, data) => api.put(`/api/products/${id}`, data),
  delete: (id) => api.delete(`/api/products/${id}`),
};

export const orderAPI = {
  create: (data) => api.post("/api/orders", data),
  getMyOrders: () => api.get("/api/orders/my-orders"),
  getFarmerOrders: () => api.get("/api/orders/farmer-orders"),
  updateStatus: (orderId, status) =>
    api.patch(`/api/orders/${orderId}/status`, { status }),
  cancel: (orderId) => api.post(`/api/orders/${orderId}/cancel`),
};

export const analyticsAPI = {
  getBuyerAnalytics: () => api.get("/api/analytics/buyer"),
  getFarmerAnalytics: (farmerId) =>
    api.get(`/api/analytics/farmer/${farmerId}`),
};

export const authAPI = {
  login: (data) => api.post("/api/auth/login", data),
  register: (data) => api.post("/api/auth/register", data),
  verify: (data) => api.post("/api/auth/verify", data),
};

// ✅ IMPORTANT: Only keep ONE default export (this one at the bottom)
export default api;

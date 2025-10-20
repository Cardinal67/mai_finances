import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

export const dashboardAPI = {
  getSummary: (params) => api.get('/dashboard/summary', { params }),
  calculateWhatIf: (data) => api.post('/dashboard/what-if-spending', data),
};

export const paymentsAPI = {
  getAll: (params) => api.get('/payments', { params }),
  getById: (id) => api.get(`/payments/${id}`),
  create: (data) => api.post('/payments', data),
  update: (id, data) => api.put(`/payments/${id}`, data),
  delete: (id) => api.delete(`/payments/${id}`),
  recordTransaction: (id, data) => api.post(`/payments/${id}/transactions`, data),
  getTransactions: (id) => api.get(`/payments/${id}/transactions`),
  reschedule: (id, data) => api.put(`/payments/${id}/reschedule`, data),
  getHistory: (id) => api.get(`/payments/${id}/history`),
};

export const incomeAPI = {
  getAll: (params) => api.get('/income', { params }),
  getById: (id) => api.get(`/income/${id}`),
  create: (data) => api.post('/income', data),
  update: (id, data) => api.put(`/income/${id}`, data),
  delete: (id) => api.delete(`/income/${id}`),
  receive: (id, data) => api.post(`/income/${id}/receive`, data),
  getTransactions: (id) => api.get(`/income/${id}/transactions`),
  getUpcoming: (params) => api.get('/income/upcoming', { params }),
  getStats: (params) => api.get('/income/stats', { params }),
};

export const accountsAPI = {
  getAll: (params) => api.get('/accounts', { params }),
  getById: (id, params) => api.get(`/accounts/${id}`, { params }),
  create: (data) => api.post('/accounts', data),
  update: (id, data) => api.put(`/accounts/${id}`, data),
  delete: (id) => api.delete(`/accounts/${id}`),
  getSafeToSpend: (id, params) => api.get(`/accounts/${id}/safe-to-spend`, { params }),
};

export const contactsAPI = {
  getAll: (params) => api.get('/contacts', { params }),
  getById: (id) => api.get(`/contacts/${id}`),
  create: (data) => api.post('/contacts', data),
  update: (id, data) => api.put(`/contacts/${id}`, data),
  delete: (id) => api.delete(`/contacts/${id}`),
  rename: (id, data) => api.put(`/contacts/${id}/rename`, data),
  getPayments: (id) => api.get(`/contacts/${id}/payments`),
};

export const categoriesAPI = {
  getAll: (params) => api.get('/categories', { params }),
  getById: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

export const spendingPlansAPI = {
  getAll: (params) => api.get('/spending-plans', { params }),
  getById: (id) => api.get(`/spending-plans/${id}`),
  create: (data) => api.post('/spending-plans', data),
  update: (id, data) => api.put(`/spending-plans/${id}`, data),
  delete: (id) => api.delete(`/spending-plans/${id}`),
  complete: (id) => api.post(`/spending-plans/${id}/complete`),
};

export const preferencesAPI = {
  get: () => api.get('/preferences'),
  update: (data) => api.put('/preferences', data),
  getDashboardLayout: () => api.get('/preferences/dashboard-layout'),
  updateDashboardLayout: (data) => api.put('/preferences/dashboard-layout', data),
  reset: () => api.post('/preferences/reset'),
};

export const calendarAPI = {
  getEvents: (params) => api.get('/calendar', { params }),
};

export const searchAPI = {
  search: (params) => api.get('/search', { params }),
};

export default api;


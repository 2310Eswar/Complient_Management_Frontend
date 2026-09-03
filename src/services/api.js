import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8082/api';

const API = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor to attach JWT token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('complaint_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor for 401 handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('complaint_token');
      localStorage.removeItem('complaint_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => API.post('/auth/login', credentials),
  register: (data) => API.post('/auth/register', data),
  me: () => API.get('/auth/me'),
  forgotPassword: (data) => API.post('/auth/forgot-password', data),
  verifyOtp: (data) => API.post('/auth/verify-otp', data),
  resetPassword: (data) => API.post('/auth/reset-password', data),
};

export const complaintAPI = {
  create: (formData) => API.post('/complaints', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getMyComplaints: () => API.get('/complaints/my'),
  getAllComplaints: (params) => API.get('/complaints', { params }),
  getById: (id) => API.get(`/complaints/${id}`),
  updateStatus: (id, statusData) => API.put(`/complaints/${id}/status`, statusData),
  assignStaff: (id, staffData) => API.put(`/complaints/${id}/assign`, staffData),
  assignTechnician: (id, data) => API.post(`/complaints/${id}/assign-technician`, data),
  getTechnicianComplaints: () => API.get('/technician/complaints'),
  submitUpdate: (id, formData) => API.post(`/complaints/${id}/updates`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getUpdates: (id) => API.get(`/complaints/${id}/updates`),
  addComment: (id, commentData) => API.post(`/complaints/${id}/comments`, commentData),
  addAttachments: (id, formData) => API.post(`/complaints/${id}/attachments`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

export const updateAPI = {
  getPendingApprovals: () => API.get('/admin/pending-approvals'),
  approve: (updateId, data) => API.put(`/updates/${updateId}/approve`, data),
  reject: (updateId, data) => API.put(`/updates/${updateId}/reject`, data),
};

export const categoryAPI = {
  getAll: () => API.get('/categories'),
  create: (data) => API.post('/categories', data),
};

export const analyticsAPI = {
  getSummary: () => API.get('/analytics/summary'),
  getStaffUsers: () => API.get('/users/staff'),
};

export const userAPI = {
  requestRole: (data) => API.post('/users/request-role', data),
  getAllUsers: () => API.get('/users'),
  updateUserRole: (userId, data) => API.put(`/users/${userId}/role`, data),
  toggleUserStatus: (userId) => API.put(`/users/${userId}/toggle-status`),
};

export default API;

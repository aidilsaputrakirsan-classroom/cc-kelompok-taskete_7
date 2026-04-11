/**
 * SIMCUTI — API Service Layer
 * Axios instance + semua fungsi panggilan API
 */
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// ==================== AXIOS INSTANCE ====================
const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Request interceptor — tambahkan Bearer token secara otomatis
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('simcuti_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — tangani 401 (token expired)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('simcuti_token');
      localStorage.removeItem('simcuti_user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// ==================== HELPER ====================
const handleError = (error) => {
  const msg =
    error.response?.data?.detail ||
    error.response?.data?.message ||
    error.message ||
    'Terjadi kesalahan.';
  throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg));
};

// ==================== AUTH API ====================

export const authAPI = {
  register: async (data) => {
    try {
      const res = await api.post('/auth/register', data);
      return res.data;
    } catch (e) { handleError(e); }
  },

  login: async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      return res.data; // { access_token, token_type, user }
    } catch (e) { handleError(e); }
  },

  me: async () => {
    try {
      const res = await api.get('/auth/me');
      return res.data;
    } catch (e) { handleError(e); }
  },
};

// ==================== LEAVES API ====================

export const leavesAPI = {
  // Karyawan: ajukan cuti baru
  create: async (data) => {
    try {
      const res = await api.post('/leaves', data);
      return res.data;
    } catch (e) { handleError(e); }
  },

  // Karyawan: riwayat cuti milik sendiri
  myLeaves: async (params = {}) => {
    try {
      const res = await api.get('/leaves', { params });
      return res.data;
    } catch (e) { handleError(e); }
  },

  // Admin: semua pengajuan
  allLeaves: async (params = {}) => {
    try {
      const res = await api.get('/leaves/all', { params });
      return res.data;
    } catch (e) { handleError(e); }
  },

  // Detail satu pengajuan
  getById: async (id) => {
    try {
      const res = await api.get(`/leaves/${id}`);
      return res.data;
    } catch (e) { handleError(e); }
  },

  // Admin: approve
  approve: async (id) => {
    try {
      const res = await api.put(`/leaves/${id}/approve`);
      return res.data;
    } catch (e) { handleError(e); }
  },

  // Admin: reject
  reject: async (id, rejectionNote = '') => {
    try {
      const res = await api.put(`/leaves/${id}/reject`, { rejection_note: rejectionNote });
      return res.data;
    } catch (e) { handleError(e); }
  },
};

// ==================== HOLIDAYS API ====================

export const holidaysAPI = {
  getAll: async () => {
    try {
      const res = await api.get('/holidays');
      return res.data;
    } catch (e) { handleError(e); }
  },

  create: async (data) => {
    try {
      const res = await api.post('/holidays', data);
      return res.data;
    } catch (e) { handleError(e); }
  },

  delete: async (id) => {
    try {
      await api.delete(`/holidays/${id}`);
      return true;
    } catch (e) { handleError(e); }
  },
};

// ==================== ANALYTICS API ====================

export const analyticsAPI = {
  saw: async () => {
    try {
      const res = await api.get('/analytics/saw');
      return res.data;
    } catch (e) { handleError(e); }
  },

  summary: async () => {
    try {
      const res = await api.get('/analytics/summary');
      return res.data;
    } catch (e) { handleError(e); }
  },
};

// ==================== SYSTEM API ====================

export const systemAPI = {
  health: async () => {
    try {
      const res = await api.get('/health');
      return res.data;
    } catch (e) { handleError(e); }
  },
};

export default api;

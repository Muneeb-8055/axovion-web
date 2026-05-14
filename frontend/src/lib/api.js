import axios from 'axios';

// API Configuration
// In production (Vercel), use the environment variable
// In development, use localhost
export const BACKEND_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
export const API = BACKEND_URL;

// Debug logging (remove in production if desired)
console.log('API URL:', API);

export const api = axios.create({
  baseURL: API,
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000,
});

// Attach auth token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ax_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Public api (no auth interceptor side-effects)
export const publicApi = {
  submitAudit: (data) => api.post('/audit', data),
  getReport: (id) => api.get(`/audit/report/${id}`),
  sendChat: (data) => api.post('/chat', data),
  getChat: (sessionId) => api.get(`/chat/${sessionId}`),
  createBooking: (data) => api.post('/booking', data),
  newsletterSignup: (data) => api.post('/newsletter', data),
  getSettings: () => api.get('/settings'),
};

export const adminApi = {
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  // audits
  listAudits: (params) => api.get('/audits', { params }),
  getAudit: (id) => api.get(`/audits/${id}`),
  updateAudit: (id, data) => api.put(`/audits/${id}`, data),
  deleteAudit: (id) => api.delete(`/audits/${id}`),
  regenerateReport: (id) => api.post(`/audit/regenerate/${id}`),
  resendReport: (id) => api.post(`/audit/resend-report/${id}`),
  // chats
  listChats: () => api.get('/chats'),
  getChat: (id) => api.get(`/chats/${id}`),
  deleteChat: (id) => api.delete(`/chats/${id}`),
  // bookings
  listBookings: () => api.get('/bookings'),
  updateBookingStatus: (id, status) => api.put(`/bookings/${id}?status=${status}`),
  deleteBooking: (id) => api.delete(`/bookings/${id}`),
  // tasks
  listTasks: () => api.get('/tasks'),
  createTask: (data) => api.post('/tasks', data),
  updateTask: (id, data) => api.put(`/tasks/${id}`, data),
  deleteTask: (id) => api.delete(`/tasks/${id}`),
  // emails
  listEmails: () => api.get('/emails'),
  sendEmail: (data) => api.post('/emails/send', data),
  // calls
  listCalls: () => api.get('/calls'),
  triggerCall: (data) => api.post('/calls/trigger', data),
  callsHealth: () => api.get('/calls/health'),
  retellAgents: () => api.get('/calls/agents/retell'),
  updateCall: (id, status, outcome) => api.put(`/calls/${id}?status=${status}${outcome ? `&outcome=${encodeURIComponent(outcome)}` : ''}`),
  // analytics
  dashboard: () => api.get('/analytics/dashboard'),
  funnel: () => api.get('/analytics/funnel'),
  timeseries: (days = 14) => api.get(`/analytics/timeseries?days=${days}`),
  sources: () => api.get('/analytics/sources'),
  // settings
  getSettings: () => api.get('/settings/admin'),
  updateSettings: (data) => api.put('/settings/admin', data),
  listNewsletter: () => api.get('/newsletter/list'),
};

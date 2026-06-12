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

// Separate instance for employee portal (uses different token key)
export const empApi = axios.create({
  baseURL: API,
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000,
});

// Attach admin auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ax_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Attach employee auth token
empApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('ax_emp_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Employee-facing API methods (uses empApi instance with ax_emp_token)
empApi.login = (data) => empApi.post('/auth/login', data);
empApi.getMySummary = () => empApi.get('/attendance/my/summary');
empApi.getMyAttendance = (limit) => empApi.get('/attendance/my', { params: { limit } });
empApi.clockIn = () => empApi.post('/attendance/clock-in');
empApi.clockOut = () => empApi.post('/attendance/clock-out');
empApi.requestCorrection = (data) => empApi.post('/attendance/correct', data);
empApi.getMyLeaves = (limit) => empApi.get('/leaves/my', { params: { limit } });
empApi.getMyLeaveBalance = () => empApi.get('/leaves/balance/my');
empApi.applyLeave = (data) => empApi.post('/leaves', data);
empApi.getMyOvertime = (limit) => empApi.get('/overtime/my', { params: { limit } });
empApi.listTasks = () => empApi.get('/tasks');
empApi.updateMyTaskStatus = (id, status) => empApi.patch(`/tasks/${id}/status?status=${status}`);
empApi.getMyProfile = () => empApi.get('/employees/me');
empApi.getNotifications = () => empApi.get('/notifications');
empApi.markNotificationsRead = () => empApi.put('/notifications/mark-read');

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
  listMyTasks: () => api.get('/tasks/my'),
  createTask: (data) => api.post('/tasks', data),
  updateTask: (id, data) => api.put(`/tasks/${id}`, data),
  updateMyTaskStatus: (id, status) => api.patch(`/tasks/${id}/status?status=${status}`),
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

  // === EMS: Employees ===
  listEmployees: () => api.get('/employees'),
  getEmployee: (id) => api.get(`/employees/${id}`),
  getMyProfile: () => api.get('/employees/me'),
  createEmployee: (data) => api.post('/employees', data),
  updateEmployee: (id, data) => api.put(`/employees/${id}`, data),
  deleteEmployee: (id) => api.delete(`/employees/${id}`),
  deactivateEmployee: (id) => api.put(`/employees/${id}/deactivate`),
  reactivateEmployee: (id) => api.put(`/employees/${id}/reactivate`),
  updateAdminPermissions: (adminId, data) => api.put(`/employees/admins/${adminId}/permissions`, data),
  getEmployeeProfileSummary: (id) => api.get(`/employees/${id}/profile-summary`),

  // === EMS: Attendance ===
  clockIn: () => api.post('/attendance/clock-in'),
  clockOut: () => api.post('/attendance/clock-out'),
  getMyAttendance: (limit) => api.get('/attendance/my', { params: { limit } }),
  getMySummary: () => api.get('/attendance/my/summary'),
  listAttendance: (params) => api.get('/attendance', { params }),
  getPendingAttendance: () => api.get('/attendance/pending'),
  verifyAttendance: (data) => api.post('/attendance/verify', data),
  requestCorrection: (data) => api.post('/attendance/correct', data),
  approveCorrection: (id) => api.put(`/attendance/correct/${id}/approve`),
  getMonthlyAttendance: (empId, month, year) => api.get(`/attendance/summary/${empId}/${month}/${year}`),

  // === EMS: Leaves ===
  applyLeave: (data) => api.post('/leaves', data),
  getMyLeaves: (limit) => api.get('/leaves/my', { params: { limit } }),
  getMyLeaveBalance: () => api.get('/leaves/balance/my'),
  listLeaves: (params) => api.get('/leaves', { params }),
  getEmployeeLeaveBalance: (id) => api.get(`/leaves/balance/${id}`),
  approveLeave: (id) => api.put(`/leaves/${id}/approve`),
  rejectLeave: (id, reason) => api.put(`/leaves/${id}/reject`, { reason }),

  // === EMS: Overtime ===
  logOvertime: (data) => api.post('/overtime', data),
  listOvertime: (params) => api.get('/overtime', { params }),
  getMyOvertime: (limit) => api.get('/overtime/my', { params: { limit } }),
  getEmployeeOvertime: (id, limit) => api.get(`/overtime/${id}`, { params: { limit } }),

  // === EMS: Reports ===
  getMonthlySummary: (month) => api.get(`/reports/monthly-summary/${month}`),
  getHoursTrends: (empId, months) => api.get(`/reports/hours-trends/${empId}`, { params: { months } }),
  getLeaveUsage: (month) => api.get(`/reports/leave-usage/${month}`),
  getAttendanceRates: (month) => api.get(`/reports/attendance-rates/${month}`),
  getTargetMissers: (month) => api.get(`/reports/target-missers/${month}`),
  getOvertimeTracking: (month) => api.get(`/reports/overtime-tracking/${month}`),

  // === Notifications ===
  getNotifications: () => api.get('/notifications'),
  markNotificationsRead: () => api.put('/notifications/mark-read'),
};

import axios from 'axios';

// Detect whether running in local development or deployed in production
const isLocalhost =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === '0.0.0.0');

let rawPartnerBase = '';

if (isLocalhost) {
  // Local Development: Always prioritize local backend on port 8080
  rawPartnerBase =
    import.meta.env.VITE_LOCAL_API_URL ||
    (import.meta.env.DEV ? import.meta.env.VITE_API_URL : null) ||
    'http://localhost:8080/api';
} else {
  // Production / Deployed (Vercel, Netlify, Cloud): Use .env.production or relative /api
  rawPartnerBase = (import.meta.env.VITE_API_URL || '').trim();
  if (!rawPartnerBase) {
    rawPartnerBase = '/api';
  }
}

if (rawPartnerBase.endsWith('/')) rawPartnerBase = rawPartnerBase.slice(0, -1);
if (!rawPartnerBase.endsWith('/v1')) rawPartnerBase += '/v1';

export const API_BASE = rawPartnerBase;

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('fitempire_partner_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      console.warn('Partner API returned 401 for URL:', err.config?.url);
    }
    return Promise.reject(err);
  }
);

export const partnerApi = {
  login: (email: string, password: string) =>
    apiClient.post('/auth/login', { email, password }),
    
  getProfile: () =>
    apiClient.get('/users/profile/me'),

  getDashboardStats: () =>
    apiClient.get('/admin/dashboard/stats'),

  getDashboardActivity: () =>
    apiClient.get('/admin/dashboard/activity'),

  getRevenueChart: (period = 'week') =>
    apiClient.get(`/admin/dashboard/revenue?period=${period}`),

  getGymDetails: () =>
    apiClient.get('/gyms/my-gyms'),

  verifyPass: (passCode: string, gymId?: string) =>
    apiClient.post('/bookings/verify-qr', { code: passCode, gymId }),

  getAttendances: (gymId?: string) =>
    apiClient.get('/bookings/attendances', { params: { gymId } }),

  confirmCheckIn: (bookingId: string) =>
    apiClient.post(`/bookings/${bookingId}/check-in`),

  getClasses: () =>
    apiClient.get('/classes'),

  createClass: (classData: any) =>
    apiClient.post('/classes', classData),

  getSettlements: () =>
    apiClient.get('/admin/settlements'),

  getMyPlans: () =>
    apiClient.get('/memberships/plans/my-gym'),

  uploadPhoto: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post('/upload/gym-photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  updateGymDetails: (data: any) =>
    apiClient.put('/gyms/my-gyms', data),

  resetPasswordByEmail: (email: string, newPassword = 'Password@123') =>
    apiClient.post('/admin/users/reset-password-by-email', { email, newPassword }),
};


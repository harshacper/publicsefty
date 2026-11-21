import axios from 'axios';
import {
  User,
  Complaint,
  PoliceStation,
  TrackingHistoryItem,
  NotificationItem,
  DashboardMetrics,
} from '../types';

const API = axios.create({
  baseURL: '/api',
});

// Request interceptor to attach JWT token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle token expiry
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const isAuthRoute =
        window.location.pathname.includes('/login') ||
        window.location.pathname.includes('/register');
      if (!isAuthRoute && localStorage.getItem('token')) {
        // clear expired token
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    return Promise.reject(error);
  }
);

/* ================= AUTH API ================= */
export const registerUser = async (data: any) => {
  const res = await API.post('/auth/register', data);
  return res.data;
};

export const loginUser = async (data: any) => {
  const res = await API.post('/auth/login', data);
  return res.data;
};

export const adminLoginApi = async (data: any) => {
  const res = await API.post('/admin/login', data);
  return res.data;
};

export const getMe = async () => {
  const res = await API.get<{ success: boolean; user: User }>('/auth/me');
  return res.data;
};

export const updateProfileApi = async (data: Partial<User>) => {
  const res = await API.put('/auth/profile', data);
  return res.data;
};

export const changePasswordApi = async (data: { currentPassword: string; newPassword: string }) => {
  const res = await API.post('/auth/change-password', data);
  return res.data;
};

export const forgotPasswordApi = async (email: string) => {
  const res = await API.post('/auth/forgot-password', { email });
  return res.data;
};

/* ================= COMPLAINTS API ================= */
export const submitComplaint = async (formData: FormData) => {
  const res = await API.post<{ success: boolean; trackingId: string; complaint: Complaint; message?: string }>(
    '/complaints',
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    }
  );
  return res.data;
};

export const getMyComplaints = async () => {
  const res = await API.get<{ success: boolean; count: number; complaints: Complaint[]; message?: string }>(
    '/complaints/my'
  );
  return res.data;
};

export const getComplaintTracking = async (trackingId: string) => {
  const res = await API.get<{
    success: boolean;
    complaint: Complaint;
    trackingHistory: TrackingHistoryItem[];
    message?: string;
  }>(`/complaints/${encodeURIComponent(trackingId)}`);
  return res.data;
};

/* ================= POLICE STATIONS API ================= */
export const getPoliceStations = async (params?: { city?: string; search?: string }) => {
  const res = await API.get<{ success: boolean; count: number; stations: PoliceStation[] }>(
    '/police-stations',
    { params }
  );
  return res.data;
};

export const findNearestStations = async (data: {
  latitude: number;
  longitude: number;
  radius?: number;
  includeOsm?: boolean;
}) => {
  const res = await API.post<{
    success: boolean;
    incidentCoordinates: { latitude: number; longitude: number };
    recommendedStation: PoliceStation | null;
    stations: PoliceStation[];
  }>('/locations/nearest-stations', data);
  return res.data;
};

/* ================= ADMIN API ================= */
export const getAdminDashboardData = async () => {
  const res = await API.get<{
    success: boolean;
    metrics: DashboardMetrics;
    charts: {
      categoryCounts: Record<string, number>;
      statusCounts: Record<string, number>;
      monthlyCounts: Record<string, number>;
      cityCounts: Record<string, number>;
      stationCounts: Record<string, number>;
    };
    recentComplaints: Complaint[];
  }>('/admin/dashboard');
  return res.data;
};

export const getAdminComplaintsList = async (params: any) => {
  const res = await API.get<{
    success: boolean;
    total: number;
    page: number;
    limit: number;
    complaints: Complaint[];
  }>('/admin/complaints', { params });
  return res.data;
};

export const updateComplaintStatusApi = async (id: string, data: any) => {
  const res = await API.patch(`/admin/complaints/${id}/status`, data);
  return res.data;
};

export const assignPoliceStationApi = async (id: string, data: { stationId: string; notes?: string }) => {
  const res = await API.patch(`/admin/complaints/${id}/assign`, data);
  return res.data;
};

export const createPoliceStationApi = async (data: Partial<PoliceStation>) => {
  const res = await API.post('/admin/police-stations', data);
  return res.data;
};

export const updatePoliceStationApi = async (id: string, data: Partial<PoliceStation>) => {
  const res = await API.put(`/admin/police-stations/${id}`, data);
  return res.data;
};

export const deletePoliceStationApi = async (id: string) => {
  const res = await API.delete(`/admin/police-stations/${id}`);
  return res.data;
};

export const exportComplaintsCsvUrl = '/api/admin/reports/export-csv';

export const getAdminUsersList = async () => {
  const res = await API.get<{ success: boolean; count: number; users: User[] }>('/admin/users');
  return res.data;
};

/* ================= NOTIFICATIONS API ================= */
export const getNotifications = async () => {
  const res = await API.get<{
    success: boolean;
    unreadCount: number;
    notifications: NotificationItem[];
  }>('/notifications');
  return res.data;
};

export const markNotificationRead = async (id: string) => {
  const res = await API.patch(`/notifications/${id}/read`);
  return res.data;
};

export default API;

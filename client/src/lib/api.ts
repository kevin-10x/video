import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/stores/authStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().accessToken;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = useAuthStore.getState().refreshToken;
        if (!refreshToken) throw new Error('No refresh token');
        
        const response = await axios.post(`${API_URL}/api/auth/refresh`, {
          refreshToken,
        });
        
        const { accessToken, refreshToken: newRefreshToken } = response.data;
        useAuthStore.getState().setTokens(accessToken, newRefreshToken);
        
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        
        return api(originalRequest);
      } catch {
        useAuthStore.getState().logout();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export const authApi = {
  register: (data: { email: string; password: string; name?: string; username?: string }) =>
    api.post('/auth/register', data),
  
  login: (data: { email: string; password: string; rememberMe?: boolean }) =>
    api.post('/auth/login', data),
  
  logout: () => api.post('/auth/logout'),
  
  refresh: (refreshToken: string) => api.post('/auth/refresh', { refreshToken }),
  
  me: () => api.get('/auth/me'),
  
  updateProfile: (data: { name?: string; username?: string; bio?: string; avatar?: string }) =>
    api.patch('/auth/me', data),
  
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.post('/auth/change-password', data),
  
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  
  resetPassword: (token: string, password: string) =>
    api.post('/auth/reset-password', { token, password }),
};

export const projectApi = {
  list: (params?: { page?: number; limit?: number; status?: string; type?: string }) =>
    api.get('/projects', { params }),
  
  create: (data: any) => api.post('/projects', data),
  
  get: (id: string) => api.get(`/projects/${id}`),
  
  update: (id: string, data: any) => api.patch(`/projects/${id}`, data),
  
  delete: (id: string) => api.delete(`/projects/${id}`),
  
  duplicate: (id: string) => api.post(`/projects/${id}/duplicate`),
  
  getUploadUrl: (id: string, data: { fileName: string; fileType: string; fileSize: number }) =>
    api.post(`/projects/${id}/upload-url`, data),
  
  startProcessing: (id: string) => api.post(`/projects/${id}/start`),
  
  share: (id: string) => api.post(`/projects/${id}/share`),
  
  unshare: (id: string) => api.delete(`/projects/${id}/share`),
  
  getShared: (token: string) => api.get(`/projects/shared/${token}`),
};

export const jobApi = {
  list: (params?: { page?: number; limit?: number; status?: string; type?: string; projectId?: string }) =>
    api.get('/jobs', { params }),
  
  get: (id: string) => api.get(`/jobs/${id}`),
  
  cancel: (id: string) => api.post(`/jobs/${id}/cancel`),
  
  retry: (id: string) => api.post(`/jobs/${id}/retry`),
};

export const assetApi = {
  list: (params?: { page?: number; limit?: number; type?: string; projectId?: string; tags?: string }) =>
    api.get('/assets', { params }),
  
  create: (data: any) => api.post('/assets', data),
  
  getUploadUrl: (data: { fileName: string; fileType: string; fileSize: number; type: string; projectId?: string }) =>
    api.post('/assets/upload-url', data),
  
  get: (id: string) => api.get(`/assets/${id}`),
  
  update: (id: string, data: any) => api.patch(`/assets/${id}`, data),
  
  delete: (id: string) => api.delete(`/assets/${id}`),
  
  getDownloadUrl: (id: string) => api.post(`/assets/${id}/download`),
  
  getAfricanLibrary: () => api.get('/assets/african/library'),
};

export const exportApi = {
  list: (params?: { page?: number; limit?: number; projectId?: string }) =>
    api.get('/exports', { params }),
  
  create: (data: { projectId: string; quality: string; format: string; watermark?: boolean; includesAudio?: boolean; subtitleIds?: string[] }) =>
    api.post('/exports', data),
  
  get: (id: string) => api.get(`/exports/${id}`),
  
  getDownloadUrl: (id: string) => api.get(`/exports/${id}/download`),
};

export const userApi = {
  getProfile: () => api.get('/users/me/profile'),
  
  getStats: () => api.get('/users/me/stats'),
  
  updatePreferences: (data: any) => api.patch('/users/me/preferences', data),
  
  listSessions: () => api.get('/users/me/sessions'),
  
  revokeSession: (id: string) => api.delete(`/users/me/sessions/${id}`),
  
  listApiKeys: () => api.get('/users/me/api-keys'),
  
  createApiKey: (data: { name: string; expiresAt?: string }) => api.post('/users/me/api-keys', data),
  
  deleteApiKey: (id: string) => api.delete(`/users/me/api-keys/${id}`),
};

export const notificationApi = {
  list: (params?: { page?: number; limit?: number; unreadOnly?: boolean; type?: string }) =>
    api.get('/notifications', { params }),
  
  markRead: (id: string) => api.patch(`/notifications/${id}/read`),
  
  markAllRead: () => api.patch('/notifications/read-all'),
  
  delete: (id: string) => api.delete(`/notifications/${id}`),
};
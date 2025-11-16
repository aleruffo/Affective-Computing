import axios from 'axios';
import {
  AnalysisResponse,
  UploadResponse,
  UserProfile,
  UserProfileResponse,
  DashboardStats,
  CalendarResponse,
  EmotionTrendsResponse,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const uploadVideo = async (videoBlob: Blob): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('video', videoBlob, 'recording.webm');

  const response = await api.post<UploadResponse>('/upload-video', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

export const getAnalysisStatus = async (id: string): Promise<AnalysisResponse> => {
  const response = await api.get<AnalysisResponse>(`/analysis/${id}`);
  return response.data;
};

export const healthCheck = async (): Promise<{ status: string }> => {
  const response = await api.get('/health');
  return response.data;
};

// User Profile API
export const setupUserProfile = async (profile: UserProfile): Promise<UserProfileResponse> => {
  const response = await api.post<UserProfileResponse>('/user/setup', profile);
  return response.data;
};

export const getUserProfile = async (): Promise<UserProfileResponse> => {
  const response = await api.get<UserProfileResponse>('/user/profile');
  return response.data;
};

export const updateUserProfile = async (profile: UserProfile): Promise<UserProfileResponse> => {
  const response = await api.put<UserProfileResponse>('/user/profile', profile);
  return response.data;
};

export const deleteUserProfile = async (): Promise<{ message: string }> => {
  const response = await api.delete<{ message: string }>('/user/profile');
  return response.data;
};

// Dashboard API
export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await api.get<DashboardStats>('/dashboard/stats');
  return response.data;
};

export const getCalendarData = async (year?: number, month?: number): Promise<CalendarResponse> => {
  const params = new URLSearchParams();
  if (year) params.append('year', year.toString());
  if (month) params.append('month', month.toString());
  
  const response = await api.get<CalendarResponse>(
    `/dashboard/calendar${params.toString() ? `?${params.toString()}` : ''}`
  );
  return response.data;
};

export const getEmotionTrends = async (days?: number): Promise<EmotionTrendsResponse> => {
  const params = days ? `?days=${days}` : '';
  const response = await api.get<EmotionTrendsResponse>(`/dashboard/trends${params}`);
  return response.data;
};

export default api;

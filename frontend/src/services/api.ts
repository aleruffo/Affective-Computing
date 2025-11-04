import axios from 'axios';
import { AnalysisResponse, UploadResponse } from '../types';

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

export default api;

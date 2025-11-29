import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = Cookies.get('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('token');
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  register: async (data: { email: string; password: string; name: string }) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },
  
  login: async (data: { email: string; password: string }) => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },
  
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Forms API
export const formsApi = {
  generate: async (prompt: string) => {
    const response = await api.post('/forms/generate', { prompt });
    return response.data;
  },
  
  getAll: async (page = 1, limit = 10) => {
    const response = await api.get('/forms', { params: { page, limit } });
    return response.data;
  },
  
  getById: async (id: string) => {
    const response = await api.get(`/forms/${id}`);
    return response.data;
  },
  
  update: async (id: string, data: Partial<{ title: string; description: string; isPublic: boolean }>) => {
    const response = await api.put(`/forms/${id}`, data);
    return response.data;
  },
  
  delete: async (id: string) => {
    const response = await api.delete(`/forms/${id}`);
    return response.data;
  },
  
  getSubmissions: async (formId: string, page = 1, limit = 20) => {
    const response = await api.get(`/forms/${formId}/submissions`, { params: { page, limit } });
    return response.data;
  },
};

// Submissions API
export const submissionsApi = {
  submit: async (formId: string, data: FormData) => {
    const response = await api.post(`/submissions/${formId}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// Upload API
export const uploadApi = {
  uploadImage: async (file: File, isPublic = false) => {
    const formData = new FormData();
    formData.append('image', file);
    
    const endpoint = isPublic ? '/upload/public' : '/upload/image';
    const response = await api.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

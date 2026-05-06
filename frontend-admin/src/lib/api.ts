import axios, { AxiosRequestConfig, Method } from 'axios';
import { API_URL } from './constants';

// Create Axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('nla_access_token') : null;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor to handle token expiration/401s
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config?.url?.includes('/auth/login');
    
    if (error.response?.status === 401 && !isLoginRequest) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('nla_access_token');
        localStorage.removeItem('nla_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Wrapper to standardise API calls
export const fetchApi = async (endpoint: string, options: RequestInit = {}) => {
  try {
    const method = (options.method || 'GET') as Method;
    let data = undefined;

    if (options.body) {
      if (options.body instanceof FormData) {
        data = options.body;
      } else {
        try {
          data = JSON.parse(options.body as string);
        } catch (e) {
          data = options.body;
        }
      }
    }
    
    // Convert RequestInit headers to plain object for Axios
    const customHeaders: Record<string, string> = {};
    if (options.headers) {
      const headers = new Headers(options.headers);
      headers.forEach((value, key) => {
        customHeaders[key] = value;
      });
    }

    const config: AxiosRequestConfig = {
      url: endpoint,
      method,
      data,
      headers: options.body instanceof FormData 
        ? { ...customHeaders } 
        : { ...customHeaders }
    };

    // Axios handles FormData Content-Type automatically if we don't set it
    if (options.body instanceof FormData && config.headers) {
      delete config.headers['Content-Type'];
    }
    
    const response = await api(config);
    return response.data;
  } catch (error: any) {
    // Standardize error format for our app
    if (error.response) {
      throw new Error(error.response.data.message || 'API Error');
    } else if (error.request) {
      throw new Error('No response from server');
    } else {
      throw new Error(error.message);
    }
  }
};

export async function uploadFile(
  file: File, 
  folder: string = 'uploads',
  onProgress?: (progress: number) => void
): Promise<string> {
  // Proactive check for Vercel's payload limit (usually 4.5MB)
  if (file.size > 4 * 1024 * 1024) {
    throw new Error('File size exceeds 4MB limit. Please compress your image before uploading.');
  }

  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post(`/upload/file?folder=${folder}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      }
    });

    if (!response.data || !response.data.data) {
      throw new Error('Invalid response from server');
    }

    return response.data.data.fileUrl;
  } catch (error: any) {
    console.error('Upload Error:', error);
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw error;
  }
}

export default api;

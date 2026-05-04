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

export async function uploadFileToS3(file: File, folder: string = 'uploads'): Promise<string> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const token = typeof window !== 'undefined' ? localStorage.getItem('nla_access_token') : null;
    // Send folder in query string to ensure it's available to Multer immediately
    const response = await fetch(`${API_URL}/upload/file?folder=${folder}`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    const res = await response.json();
    if (!response.ok) throw new Error(res.message || 'Upload failed');

    return res.data.fileUrl;
  } catch (error: any) {
    console.error('Upload Error:', error);
    throw error;
  }
}

export default api;

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '@/config/constants';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add auth token if available (for future auth implementation)
    const token = typeof window !== 'undefined'
      ? localStorage.getItem('authToken')
      : null;

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    // Handle common error scenarios (only log in development for specific errors)
    const isDevelopment = process.env.NODE_ENV === 'development';

    if (error.response) {
      const status = error.response.status;

      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          if (typeof window !== 'undefined') {
            localStorage.removeItem('authToken');
            // Could redirect to login page here
          }
          if (isDevelopment) console.warn(`Auth Error: ${status}`);
          break;
        case 403:
          if (isDevelopment) console.warn('Forbidden - Access denied');
          break;
        case 404:
          // Skip logging 404 - expected when API is down, falls back to mock data
          break;
        case 500:
          if (isDevelopment) console.warn('Server error');
          break;
        default:
          if (isDevelopment && status >= 400) console.warn(`HTTP Error: ${status}`);
      }
    } else if (error.request && isDevelopment) {
      // Network error - only log in development
      console.warn('Network error - no response received');
    }

    return Promise.reject(error);
  }
);

export default apiClient;

// Helper function to get error message
export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || error.message || 'An error occurred';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

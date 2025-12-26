import axios from 'axios';
import { getSelectedServerUrl } from './serverConfig';

// Create axios instance
const api = axios.create({
  timeout: 30000,
});

// Request interceptor - add server URL and auth token
api.interceptors.request.use(
  (config) => {
    // Get the selected server's URL
    const serverUrl = getSelectedServerUrl();
    if (serverUrl) {
      // Set the base URL dynamically
      config.baseURL = `${serverUrl}/api`;
    } else {
      // Fallback to relative URL if no server selected (shouldn't happen in normal flow)
      config.baseURL = '/api';
    }

    // Add auth token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

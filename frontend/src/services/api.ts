import axios from "axios";
import { ENV } from "../config/env";
import { useAuthStore } from "../store/useAuthStore";
import { APP_STORAGE_KEYS } from "../constants";

const api = axios.create({
  baseURL: ENV.API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Attach JWT token if present
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token || localStorage.getItem(APP_STORAGE_KEYS.AUTH_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Intercept responses and errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Check if error is unauthorized (401) and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Placeholder for refresh token request:
        // const { data } = await axios.post(`${ENV.API_URL}/auth/refresh`);
        // useAuthStore.getState().login(data.token, data.user);
        // originalRequest.headers.Authorization = `Bearer ${data.token}`;
        // return api(originalRequest);
        
        // For now, if unauthorized, log out the user and clean state
        useAuthStore.getState().logout();
      } catch (refreshError) {
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }
    
    // Centralized API Error Formatting
    const apiError = {
      message: error.response?.data?.message || error.message || "An unexpected error occurred",
      status: error.response?.status || 500,
      errors: error.response?.data?.errors || null,
    };
    
    return Promise.reject(apiError);
  }
);

export default api;

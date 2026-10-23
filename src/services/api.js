/* eslint-disable import/no-named-as-default-member */
import axios from 'axios';
import { ENV } from '../config/env';
import { tokenStorage } from './tokenStorage';

export const api = axios.create({
  baseURL: ENV.API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    try {
      const token = await tokenStorage.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // Continue request even if token lookup fails
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.request.use(
  (config) => {
    console.log(
      `[API REQUEST] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`
    );

    return config;
  },
  (error) => Promise.reject(error)
);

let onUnauthorizedCallback = null;

export const setUnauthorizedHandler = (callback) => {
  onUnauthorizedCallback = callback;
};

api.interceptors.response.use(
  (response) => {
    console.log(
      `[API RESPONSE] ${response.status} ${response.config.url}`
    );

    return response;
  },
  async (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';

    console.log('[API ERROR]', {
      url,
      status,
      message: error.message,
      data: error.response?.data,
    });

    // If 401 on an authenticated endpoint (not login or register), token is expired/invalid
    if (status === 401 && !url.includes('/auth/login') && !url.includes('/auth/register')) {
      try {
        await tokenStorage.clearAuth();
      } catch {
        // Ignore storage error during cleanup
      }
      if (typeof onUnauthorizedCallback === 'function') {
        onUnauthorizedCallback(error);
      }
    }

    return Promise.reject(error);
  }
);

/**
 * User & Resident Dashboard API
 */
export const getUserDashboard = async () => {
  const response = await api.get('/users/me/dashboard');
  return response.data;
};

export const userApi = {
  getUserDashboard,
};


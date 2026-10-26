/* eslint-disable import/no-named-as-default-member */
import axios from 'axios';
import { ENV } from '../config/env';
import { tokenStorage } from './tokenStorage';

export const api = axios.create({
  baseURL: ENV.API_URL,
  adapter: ['fetch', 'xhr'],
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

    const method = (config.method || 'get').toUpperCase();
    const fullUrl = `${config.baseURL || ''}${config.url || ''}`;
    console.log(`[API Request] ${method} ${fullUrl}`, {
      params: config.params,
      data: config.data,
    });

    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    const method = (response.config?.method || 'get').toUpperCase();
    const fullUrl = `${response.config?.baseURL || ''}${response.config?.url || ''}`;
    console.log(`[API Response] ${response.status} ${method} ${fullUrl}`, response.data);
    return response;
  },
  (error) => {
    const method = (error.config?.method || 'unknown').toUpperCase();
    const fullUrl = error.config
      ? `${error.config.baseURL || ''}${error.config.url || ''}`
      : 'unknown url';
    console.error(`[API Response Error] ${error.response?.status || 'Error'} ${method} ${fullUrl}`, {
      message: error.message,
      data: error.response?.data,
    });
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


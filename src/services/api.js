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

let onUnauthorizedCallback = null;

export const setUnauthorizedHandler = (callback) => {
  onUnauthorizedCallback = callback;
};

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
  async (error) => {
    const method = (error.config?.method || 'unknown').toUpperCase();
    const fullUrl = error.config
      ? `${error.config.baseURL || ''}${error.config.url || ''}`
      : 'unknown url';
    const status = error.response?.status;

    console.error(`[API Response Error] ${status || 'Error'} ${method} ${fullUrl}`, {
      message: error.message,
      data: error.response?.data,
    });

    // If 401 on an authenticated endpoint (not login or register), token is expired/invalid
    if (status === 401 && !fullUrl.includes('/auth/login') && !fullUrl.includes('/auth/register')) {
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

/**
 * Admin Dashboard API
 */
export const getAdminDashboard = async () => {
  const response = await api.get('/admin/dashboard');
  return response.data;
};

/**
 * Cash Payment Requests API
 */
export const getPendingCashRequests = async () => {
  const response = await api.get('/cash-payments/admin/pending');
  return response.data;
};

export const verifyCashRequest = async (requestId, payload) => {
  const response = await api.post(`/cash-payments/${requestId}/verify`, payload);
  return response.data;
};

export const rejectCashRequest = async (requestId, adminNote) => {
  const response = await api.post(`/cash-payments/${requestId}/reject`, null, {
    params: adminNote ? { adminNote } : undefined,
  });
  return response.data;
};

export const getCashRequestById = async (requestId) => {
  const response = await api.get(`/cash-payments/${requestId}`);
  return response.data;
};

export const getCashRequestsByRoom = async (roomId) => {
  const response = await api.get(`/cash-payments/room/${roomId}`);
  return response.data;
};

/**
 * Online Payments API
 */
export const getPendingOnlinePayments = async () => {
  const response = await api.get('/payments/admin/pending');
  return response.data;
};

export const verifyOnlinePayment = async (paymentId) => {
  const response = await api.put(`/payments/${paymentId}/verify`);
  return response.data;
};

export const rejectOnlinePayment = async (paymentId) => {
  const response = await api.post(`/payments/${paymentId}/reject`);
  return response.data;
};

export const getPaymentById = async (paymentId) => {
  const response = await api.get(`/payments/${paymentId}`);
  return response.data;
};

export const getPaymentsByRoom = async (roomId) => {
  const response = await api.get(`/payments/room/${roomId}`);
  return response.data;
};

/**
 * Payment Allocations API
 */
export const createPaymentAllocation = async (payload) => {
  const response = await api.post('/payment-allocations', payload);
  return response.data;
};

export const getAllocationsByPayment = async (paymentId) => {
  const response = await api.get(`/payment-allocations/payment/${paymentId}`);
  return response.data;
};

export const getAllocationsByMaintenance = async (maintenanceId) => {
  const response = await api.get(`/payment-allocations/maintenance/${maintenanceId}`);
  return response.data;
};

/**
 * Maintenance API
 */
export const getMaintenanceByRoom = async (roomId) => {
  const response = await api.get(`/maintenance/room/${roomId}`);
  return response.data;
};

export const getMaintenanceByRoomAndMonth = async (roomId, billingMonth) => {
  const response = await api.get(`/maintenance/room/${roomId}/month/${billingMonth}`);
  return response.data;
};

/**
 * Rooms API
 */
export const getAllRooms = async () => {
  const response = await api.get('/rooms');
  return response.data;
};

export const getRoomById = async (roomId) => {
  const response = await api.get(`/rooms/id/${roomId}`);
  return response.data;
};

export const getRoomByNumber = async (roomNumber) => {
  const response = await api.get(`/rooms/${roomNumber}`);
  return response.data;
};

export const createRoom = async ({ roomNumber, maintenanceExempt = false }) => {
  const response = await api.post('/rooms', { roomNumber, maintenanceExempt });
  return response.data;
};

export const updateRoomExemption = async (roomId, maintenanceExempt) => {
  const response = await api.patch(`/rooms/${roomId}/exemption`, null, {
    params: { maintenanceExempt },
  });
  return response.data;
};

/**
 * Resident & User Administration API (Admin only)
 */
export const getAllResidents = async () => {
  const response = await api.get('/admin/users');
  return response.data;
};

export const getResidentByRoomId = async (roomId) => {
  const response = await api.get(`/admin/users/room/${roomId}`);
  return response.data;
};

export const resetResidentPassword = async (userId) => {
  const response = await api.post(`/admin/users/${userId}/reset-password`);
  return response.data;
};

export const adminApi = {
  getAdminDashboard,
  getPendingCashRequests,
  verifyCashRequest,
  rejectCashRequest,
  getCashRequestById,
  getCashRequestsByRoom,
  getPendingOnlinePayments,
  verifyOnlinePayment,
  rejectOnlinePayment,
  getPaymentById,
  getPaymentsByRoom,
  createPaymentAllocation,
  getAllocationsByPayment,
  getAllocationsByMaintenance,
  getMaintenanceByRoom,
  getMaintenanceByRoomAndMonth,
  getAllRooms,
  getRoomById,
  getRoomByNumber,
  createRoom,
  updateRoomExemption,
  getAllResidents,
  getResidentByRoomId,
  resetResidentPassword,
};


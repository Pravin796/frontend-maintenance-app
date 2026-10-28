/* eslint-disable import/no-named-as-default-member */
import axios from 'axios';
import { ENV } from '../config/env';
import { tokenStorage } from './tokenStorage';

export const api = axios.create({
  baseURL: ENV.API_URL,
  adapter: ['xhr', 'fetch'],
  headers: {
    'Content-Type': 'application/json',
  },
});

let onUnauthorizedCallback = null;
let onPasswordChangeRequiredCallback = null;

export const setUnauthorizedHandler = (callback) => {
  onUnauthorizedCallback = callback;
};

export const setPasswordChangeRequiredHandler = (callback) => {
  onPasswordChangeRequiredCallback = callback;
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
    } else if (
      status === 403 &&
      typeof error.response?.data?.message === 'string' &&
      error.response.data.message.toLowerCase().includes('password change required')
    ) {
      if (typeof onPasswordChangeRequiredCallback === 'function') {
        onPasswordChangeRequiredCallback(error);
      }
    }

    return Promise.reject(error);
  }
);

/**
 * User & Resident Dashboard and Payment API
 */
export const getUserDashboard = async () => {
  const response = await api.get('/users/me/dashboard');
  return response.data;
};

export const getMyPayments = async () => {
  const response = await api.get('/payments/my');
  return response.data;
};

export const getMyMaintenance = async () => {
  const response = await api.get('/maintenance/my');
  return response.data;
};

export const createPayment = async ({ amount, method = 'ONLINE' }) => {
  const response = await api.post('/payments', { amount, method });
  return response.data;
};

export const uploadImage = async (uri, folder = 'payment_proofs') => {
  const formData = new FormData();
  const rawFilename = uri.split('/').pop() || 'proof.jpg';
  const filename = rawFilename.includes('.') ? rawFilename : `${rawFilename}.jpg`;
  const match = /\.(\w+)$/.exec(filename);
  const ext = match ? match[1].toLowerCase() : 'jpg';
  let type = 'image/jpeg';
  if (ext === 'png') type = 'image/png';
  else if (ext === 'webp') type = 'image/webp';
  else if (ext === 'gif') type = 'image/gif';

  formData.append('file', {
    uri,
    name: filename,
    type,
  });

  if (folder) {
    formData.append('folder', folder);
  }

  const token = await tokenStorage.getToken();
  const uploadUrl = `${ENV.API_URL}/uploads/image`;

  console.log(`[API Request] POST ${uploadUrl}`, {
    filename,
    type,
    folder,
  });

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', uploadUrl);
    xhr.timeout = 60000;

    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    }

    // In React Native, do NOT explicitly set Content-Type for FormData.
    // React Native's native NetworkingModule will automatically set
    // 'multipart/form-data; boundary=...' with the correct boundary parameter.

    xhr.onload = () => {
      let data;
      try {
        data = JSON.parse(xhr.responseText);
      } catch {
        data = { message: xhr.responseText };
      }

      console.log(`[API Response] ${xhr.status} POST ${uploadUrl}`, data);

      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(data);
      } else {
        const error = new Error(
          data?.message || `Upload failed with status ${xhr.status}`
        );
        error.response = { status: xhr.status, data };
        console.error(`[API Response Error] ${xhr.status} POST ${uploadUrl}`, {
          message: error.message,
          data,
        });
        reject(error);
      }
    };

    xhr.onerror = (e) => {
      console.error('[API Request Error] Upload network error', e);
      const error = new Error('Network error during image upload. Please check your connection.');
      reject(error);
    };

    xhr.ontimeout = () => {
      console.error('[API Request Error] Upload timed out');
      const error = new Error('Image upload timed out. Please try again.');
      reject(error);
    };

    xhr.send(formData);
  });
};

export const updatePaymentProof = async (paymentId, { transactionReference, screenshotUrl, screenshotPublicId }) => {
  const response = await api.patch(`/payments/${paymentId}/proof`, {
    transactionReference,
    screenshotUrl,
    screenshotPublicId,
  });
  return response.data;
};

export const createCashPaymentRequest = async ({ amount, roomId }) => {
  const payload = { amount };
  if (roomId != null) {
    payload.roomId = roomId;
  }
  const response = await api.post('/cash-payments', payload);
  return response.data;
};

export const userApi = {
  getUserDashboard,
  getMyPayments,
  getMyMaintenance,
  createPayment,
  uploadImage,
  updatePaymentProof,
  createCashPaymentRequest,
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

export const createMaintenance = async ({ roomId, billingMonth }) => {
  const response = await api.post('/maintenance', { roomId, billingMonth });
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
  createMaintenance,
  getAllRooms,
  getRoomById,
  getRoomByNumber,
  createRoom,
  updateRoomExemption,
  getAllResidents,
  getResidentByRoomId,
  resetResidentPassword,
};


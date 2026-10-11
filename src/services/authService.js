import { api } from './api';
import { tokenStorage } from './tokenStorage';

export const authService = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', {
      mobileNumber: credentials.mobileNumber,
      password: credentials.password,
    });
    const data = response.data;
    if (data && data.token) {
      const user = {
        userId: data.userId,
        roomNumber: data.roomNumber,
        mobileNumber: data.mobileNumber,
        role: data.role,
        mustChangePassword: data.mustChangePassword,
      };
      await tokenStorage.saveAuth(data.token, user);
    }
    return data;
  },

  logout: async () => {
    await tokenStorage.clearAuth();
  },

  getCurrentUser: async () => {
    return await tokenStorage.getUser();
  },

  getStoredToken: async () => {
    return await tokenStorage.getToken();
  },

  changePassword: async ({ currentPassword, newPassword, confirmPassword }) => {
    const response = await api.post('/auth/change-password', {
      currentPassword,
      newPassword,
      confirmPassword,
    });
    const currentUser = await tokenStorage.getUser();
    if (currentUser) {
      const updatedUser = {
        ...currentUser,
        mustChangePassword: false,
      };
      await tokenStorage.saveUser(updatedUser);
    }
    return response.data;
  },

  updateStoredUser: async (updatedUser) => {
    await tokenStorage.saveUser(updatedUser);
    return updatedUser;
  },
};


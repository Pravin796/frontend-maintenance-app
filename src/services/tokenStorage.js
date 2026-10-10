import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'rm_auth_token';
const USER_KEY = 'rm_auth_user';

let memoryStorage = {};

const isSecureStoreAvailable = async () => {
  if (Platform.OS === 'web') return false;
  try {
    return await SecureStore.isAvailableAsync();
  } catch {
    return false;
  }
};

export const tokenStorage = {
  saveAuth: async (token, user) => {
    if (!token) return;

    const available = await isSecureStoreAvailable();
    const userString = user ? JSON.stringify(user) : null;

    if (available) {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
      if (userString) {
        await SecureStore.setItemAsync(USER_KEY, userString);
      }
    } else {
      memoryStorage[TOKEN_KEY] = token;
      if (userString) {
        memoryStorage[USER_KEY] = userString;
      }
    }
  },

  getToken: async () => {
    const available = await isSecureStoreAvailable();
    if (available) {
      return await SecureStore.getItemAsync(TOKEN_KEY);
    }
    return memoryStorage[TOKEN_KEY] || null;
  },

  getUser: async () => {
    const available = await isSecureStoreAvailable();
    let rawUser = null;
    if (available) {
      rawUser = await SecureStore.getItemAsync(USER_KEY);
    } else {
      rawUser = memoryStorage[USER_KEY] || null;
    }

    if (!rawUser) return null;
    try {
      return JSON.parse(rawUser);
    } catch {
      return null;
    }
  },

  clearAuth: async () => {
    const available = await isSecureStoreAvailable();
    if (available) {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(USER_KEY);
    }
    delete memoryStorage[TOKEN_KEY];
    delete memoryStorage[USER_KEY];
  },
};

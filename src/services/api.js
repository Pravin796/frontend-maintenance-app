import axios from 'axios';
import { ENV } from '../config/env';

export const api = axios.create({
  baseURL: ENV.API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Note: No authentication interceptors yet.

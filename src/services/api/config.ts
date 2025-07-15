import axios from "axios";
import { storageService } from "./storage.service";
const IDENTITY_BASE_URL = process.env.EXPO_PUBLIC_IDENTITY_URL || 'https://identity.dev-roqit.com';
const BACKEND_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'https://api.dev-roqit.com';

export const IdentityApi = axios.create({
  baseURL: IDENTITY_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});
export const BackendApi = axios.create({
  baseURL: BACKEND_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

IdentityApi.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

BackendApi.interceptors.request.use(
  async (config) => {
    const token = await storageService.getItem('token');
    if (token) {
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

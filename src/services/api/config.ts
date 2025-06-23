import axios from "axios";
const IDENTITY_BASE_URL = process.env.EXPO_PUBLIC_IDENTITY_URL;
const BACKEND_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

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

// Add request interceptor for auth token
IdentityApi.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

BackendApi.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

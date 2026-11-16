import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { env } from '../config/env';
import type { AuthResponse } from '../types/api';
import { authEvents } from '../utils/authEvents';
import { tokenStorage } from '../utils/tokenStorage';

const REQUEST_TIMEOUT_MS = 15000;
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 800;

interface TrackedRequestConfig extends InternalAxiosRequestConfig {
  _retryCount?: number;
  _retry?: boolean;
}

const api = axios.create({
  baseURL: env.apiUrl,
  timeout: REQUEST_TIMEOUT_MS,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = tokenStorage.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const isRetryable = (error: AxiosError) => {
  const config = error.config;
  if (!config || config.method !== 'get' || axios.isCancel(error)) {
    return false;
  }
  return !error.response || error.response.status >= 500;
};

const isRejectedByServer = (error: unknown) =>
  axios.isAxiosError(error) && (error.response?.status === 401 || error.response?.status === 403);

const forceLogout = async () => {
  await tokenStorage.clear();
  authEvents.emitLogout();
};

let refreshPromise: Promise<string | null> | null = null;

const refreshAccessToken = async () => {
  const refreshToken = await tokenStorage.getRefreshToken();
  if (!refreshToken) {
    return null;
  }
  const { data } = await axios.post<AuthResponse>(
    `${env.apiUrl}/auth/refresh`,
    { refreshToken },
    { timeout: REQUEST_TIMEOUT_MS },
  );
  await tokenStorage.setTokens(data);
  return data.token;
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as TrackedRequestConfig | undefined;

    if (config && isRetryable(error)) {
      config._retryCount = (config._retryCount ?? 0) + 1;
      if (config._retryCount <= MAX_RETRIES) {
        await wait(RETRY_DELAY_MS * config._retryCount);
        return api(config);
      }
    }

    const isUnauthorized = error.response?.status === 401;
    const isAuthRoute = config?.url?.startsWith('/auth/');

    if (!isUnauthorized || !config || config._retry || isAuthRoute) {
      return Promise.reject(error);
    }

    config._retry = true;

    try {
      refreshPromise ??= refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
      const newToken = await refreshPromise;
      if (!newToken) {
        await forceLogout();
        return Promise.reject(error);
      }
      config.headers.Authorization = `Bearer ${newToken}`;
      return api(config);
    } catch (refreshError) {
      if (isRejectedByServer(refreshError)) {
        await forceLogout();
      }
      return Promise.reject(error);
    }
  },
);

export default api;

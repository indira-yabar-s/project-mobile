import type { AuthResponse, LoginCredentials, RegisterPayload, User } from '../types/api';
import { tokenStorage } from '../utils/tokenStorage';
import api from './api';

export const authService = {
  async login(credentials: LoginCredentials): Promise<User> {
    const { data } = await api.post<AuthResponse>('/auth/login', credentials);
    await tokenStorage.setTokens(data);
    return data.user;
  },

  async register(payload: RegisterPayload): Promise<User> {
    const { data } = await api.post<AuthResponse>('/auth/register', payload);
    await tokenStorage.setTokens(data);
    return data.user;
  },

  async restoreSession(): Promise<User | null> {
    try {
      const refreshToken = await tokenStorage.getRefreshToken();
      if (!refreshToken) return null;

      const { data } = await api.post<AuthResponse>('/auth/refresh', { refreshToken });
      await tokenStorage.setTokens(data);
      return data.user;
    } catch {
      await tokenStorage.clear().catch(() => undefined);
      return null;
    }
  },

  logout() {
    return tokenStorage.clear();
  },
};

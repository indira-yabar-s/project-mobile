import * as SecureStore from 'expo-secure-store';
import type { AuthTokens } from '../types/api';

const REFRESH_TOKEN_KEY = 'refreshToken';

let accessToken: string | null = null;

export const tokenStorage = {
  getAccessToken: () => accessToken,

  getRefreshToken: () => SecureStore.getItemAsync(REFRESH_TOKEN_KEY),

  async setTokens({ token, refreshToken }: AuthTokens) {
    accessToken = token;
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
  },

  async clear() {
    accessToken = null;
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  },
};

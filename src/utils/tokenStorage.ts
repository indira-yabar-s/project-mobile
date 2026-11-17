import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import type { AuthTokens } from '../types/api';

const REFRESH_TOKEN_KEY = 'refreshToken';

let accessToken: string | null = null;

// expo-secure-store no existe en el navegador: en web el refresh token se guarda en localStorage.
const isWeb = Platform.OS === 'web';

const storage = {
  getItem: async (key: string): Promise<string | null> => {
    if (isWeb) {
      try {
        return globalThis.localStorage?.getItem(key) ?? null;
      } catch {
        return null;
      }
    }
    return SecureStore.getItemAsync(key);
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (isWeb) {
      try {
        globalThis.localStorage?.setItem(key, value);
      } catch {
        // almacenamiento no disponible: la sesion dura solo mientras la pestana este abierta
      }
      return;
    }
    await SecureStore.setItemAsync(key, value);
  },
  deleteItem: async (key: string): Promise<void> => {
    if (isWeb) {
      try {
        globalThis.localStorage?.removeItem(key);
      } catch {
        // nada que borrar
      }
      return;
    }
    await SecureStore.deleteItemAsync(key);
  },
};

export const tokenStorage = {
  getAccessToken: () => accessToken,

  getRefreshToken: () => storage.getItem(REFRESH_TOKEN_KEY),

  async setTokens({ token, refreshToken }: AuthTokens) {
    accessToken = token;
    await storage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },

  async clear() {
    accessToken = null;
    await storage.deleteItem(REFRESH_TOKEN_KEY);
  },
};

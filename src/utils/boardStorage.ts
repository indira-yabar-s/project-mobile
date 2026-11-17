import AsyncStorage from '@react-native-async-storage/async-storage';
import type { SavedChart } from '../types/charts';

const keyFor = (userId: number) => `analyticsBoard:${userId}`;

/** Tablero de gráficos fijados, guardado en el dispositivo por usuario. Solo guarda recetas, nunca cifras. */
export const boardStorage = {
  async get(userId: number): Promise<SavedChart[]> {
    try {
      const stored = await AsyncStorage.getItem(keyFor(userId));
      const parsed: unknown = stored ? JSON.parse(stored) : [];
      return Array.isArray(parsed) ? (parsed as SavedChart[]) : [];
    } catch {
      return [];
    }
  },

  async set(userId: number, charts: SavedChart[]) {
    try {
      await AsyncStorage.setItem(keyFor(userId), JSON.stringify(charts));
    } catch {
      return;
    }
  },
};

import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemePreference = 'light' | 'dark' | 'system';

const THEME_PREFERENCE_KEY = 'themePreference';

const isThemePreference = (value: string | null): value is ThemePreference =>
  value === 'light' || value === 'dark' || value === 'system';

export const themeStorage = {
  async get(): Promise<ThemePreference> {
    try {
      const stored = await AsyncStorage.getItem(THEME_PREFERENCE_KEY);
      return isThemePreference(stored) ? stored : 'system';
    } catch {
      return 'system';
    }
  },

  async set(preference: ThemePreference) {
    try {
      await AsyncStorage.setItem(THEME_PREFERENCE_KEY, preference);
    } catch {
      return;
    }
  },
};

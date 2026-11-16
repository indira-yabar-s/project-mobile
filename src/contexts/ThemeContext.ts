import type { Theme } from '@react-navigation/native';
import { createContext } from 'react';
import type { ThemePreference } from '../utils/themeStorage';

export interface ThemeContextValue {
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
  isDark: boolean;
  navigationTheme: Theme;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

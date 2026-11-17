import { DarkTheme, DefaultTheme, type Theme } from '@react-navigation/native';
import { MD3DarkTheme, MD3LightTheme, type MD3Theme } from 'react-native-paper';

export const lightTheme: MD3Theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#2f4b7c',
    onPrimary: '#ffffff',
    primaryContainer: '#d5deec',
    onPrimaryContainer: '#16233c',
    secondary: '#5b7db1',
    onSecondary: '#ffffff',
    secondaryContainer: '#e8edf5',
    onSecondaryContainer: '#1e3052',
    tertiary: '#b7791f',
    onTertiary: '#ffffff',
    tertiaryContainer: '#fdecd3',
    onTertiaryContainer: '#4a2c05',
    // Fondo ligeramente tintado y tarjetas blancas: las tarjetas se separan del fondo sin sombras fuertes.
    background: '#f4f6fb',
    surface: '#ffffff',
    surfaceVariant: '#e6ebf3',
    onSurface: '#141b2b',
    onSurfaceVariant: '#4a5567',
    outline: '#7a8699',
    outlineVariant: '#d6dce7',
    elevation: {
      level0: 'transparent',
      level1: '#ffffff',
      level2: '#f8fafd',
      level3: '#f0f4fa',
      level4: '#ebf0f7',
      level5: '#e5ebf5',
    },
  },
};

export const darkTheme: MD3Theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#8fa9d1',
    onPrimary: '#16233c',
    primaryContainer: '#2d4471',
    onPrimaryContainer: '#e8edf5',
    secondary: '#7d9cc9',
    onSecondary: '#16233c',
    secondaryContainer: '#203051',
    onSecondaryContainer: '#d5deec',
    tertiary: '#e9a95c',
    tertiaryContainer: '#4a3210',
    onTertiaryContainer: '#fdecd3',
    background: '#0f141c',
    surface: '#161d29',
    surfaceVariant: '#2a3444',
    onSurfaceVariant: '#b6c0d0',
    outline: '#8591a5',
    outlineVariant: '#303b4d',
    elevation: {
      level0: 'transparent',
      level1: '#1a2230',
      level2: '#1e2736',
      level3: '#222c3d',
      level4: '#253042',
      level5: '#293548',
    },
  },
};

const buildNavigationTheme = (base: Theme, paperTheme: MD3Theme): Theme => ({
  ...base,
  colors: {
    primary: paperTheme.colors.primary,
    background: paperTheme.colors.background,
    card: paperTheme.colors.surface,
    text: paperTheme.colors.onSurface,
    border: paperTheme.colors.outlineVariant,
    notification: paperTheme.colors.error,
  },
});

export const navigationLightTheme = buildNavigationTheme(DefaultTheme, lightTheme);
export const navigationDarkTheme = buildNavigationTheme(DarkTheme, darkTheme);

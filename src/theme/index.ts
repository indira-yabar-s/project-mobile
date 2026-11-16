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
    tertiary: '#e9a95c',
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
    background: '#10151e',
    surface: '#161d29',
  },
};

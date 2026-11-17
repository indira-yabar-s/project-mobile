import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from 'react-native-paper';
import { OfflineBanner } from './OfflineBanner';

/** Ancho máximo del contenido: en celulares no cambia nada; en tablet y web evita líneas kilométricas. */
export const CONTENT_MAX_WIDTH = 960;
export const FORM_MAX_WIDTH = 640;

interface ScreenContainerProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  maxWidth?: number;
}

export function ScreenContainer({ children, style, maxWidth = CONTENT_MAX_WIDTH }: ScreenContainerProps) {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <OfflineBanner />
      <View style={[styles.content, { maxWidth }, style]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { alignSelf: 'center', flex: 1, width: '100%' },
});

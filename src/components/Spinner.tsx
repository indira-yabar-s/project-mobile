import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

interface SpinnerProps {
  fullScreen?: boolean;
  label?: string;
}

export function Spinner({ fullScreen = false, label }: SpinnerProps) {
  const theme = useTheme();

  return (
    <View
      style={[styles.container, fullScreen ? styles.fullScreen : styles.inline]}
      accessibilityRole="progressbar"
      accessibilityLabel={label ?? 'Cargando'}
    >
      <ActivityIndicator size="large" color={theme.colors.primary} />
      {label ? (
        <Text variant="bodyMedium" style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>
          {label}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
  fullScreen: { flex: 1 },
  inline: { padding: 32 },
  label: { marginTop: 12 },
});

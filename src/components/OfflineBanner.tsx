import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useIsOnline } from '../hooks/useIsOnline';

export function OfflineBanner() {
  const theme = useTheme();
  const isOnline = useIsOnline();

  if (isOnline) return null;

  return (
    <View
      accessibilityRole="alert"
      style={[styles.banner, { backgroundColor: theme.colors.errorContainer }]}
    >
      <MaterialCommunityIcons name="wifi-off" size={18} color={theme.colors.onErrorContainer} />
      <Text variant="labelLarge" style={{ color: theme.colors.onErrorContainer }}>
        Sin conexión a internet
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
});

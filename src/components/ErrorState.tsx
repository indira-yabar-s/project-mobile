import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  const theme = useTheme();

  return (
    <View
      accessibilityRole="alert"
      style={[
        styles.container,
        { backgroundColor: theme.colors.errorContainer, borderColor: theme.colors.error },
      ]}
    >
      <MaterialCommunityIcons name="alert-outline" size={36} color={theme.colors.error} />
      <Text variant="bodyMedium" style={[styles.message, { color: theme.colors.onErrorContainer }]}>
        {message}
      </Text>
      {onRetry ? (
        <Button mode="outlined" icon="refresh" onPress={onRetry} style={styles.retry}>
          Reintentar
        </Button>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    margin: 16,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  message: { marginTop: 12, textAlign: 'center' },
  retry: { marginTop: 16 },
});

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';
import { useIsOnline } from '../hooks/useIsOnline';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  const theme = useTheme();
  const isOnline = useIsOnline();
  const wasOnline = useRef(isOnline);
  const retryRef = useRef(onRetry);

  useEffect(() => {
    retryRef.current = onRetry;
  });

  useEffect(() => {
    if (isOnline && !wasOnline.current) {
      retryRef.current?.();
    }
    wasOnline.current = isOnline;
  }, [isOnline]);

  return (
    <View
      accessibilityRole="alert"
      style={[
        styles.container,
        { backgroundColor: theme.colors.errorContainer, borderColor: theme.colors.error },
      ]}
    >
      <MaterialCommunityIcons name={isOnline ? 'alert-outline' : 'wifi-off'} size={36} color={theme.colors.error} />
      <Text variant="bodyMedium" style={[styles.message, { color: theme.colors.onErrorContainer }]}>
        {isOnline ? message : 'Sin conexión a internet. Reintentaremos automáticamente cuando vuelva.'}
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

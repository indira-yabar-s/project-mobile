import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Card, Text, useTheme } from 'react-native-paper';
import { Spinner } from './Spinner';

interface DashboardCardProps {
  title: string;
  action?: ReactNode;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  isEmpty?: boolean;
  emptyText?: string;
  children?: ReactNode;
}

export function DashboardCard({
  title,
  action,
  isLoading = false,
  error,
  onRetry,
  isEmpty = false,
  emptyText,
  children,
}: DashboardCardProps) {
  const theme = useTheme();
  let content = children;

  if (error) {
    content = (
      <View style={styles.center} accessibilityRole="alert">
        <Text variant="bodyMedium" style={{ color: theme.colors.error, textAlign: 'center' }}>
          {error}
        </Text>
        {onRetry ? (
          <Button mode="outlined" onPress={onRetry} style={styles.retry}>
            Reintentar
          </Button>
        ) : null}
      </View>
    );
  } else if (isLoading && isEmpty) {
    content = <Spinner />;
  } else if (isEmpty) {
    content = (
      <Text variant="bodyMedium" style={[styles.empty, { color: theme.colors.onSurfaceVariant }]}>
        {emptyText}
      </Text>
    );
  }

  return (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.header}>
          <Text variant="titleMedium">{title}</Text>
          {action}
        </View>
        {content}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginHorizontal: 16 },
  header: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'space-between', marginBottom: 12 },
  center: { alignItems: 'center', paddingVertical: 16 },
  retry: { marginTop: 12 },
  empty: { paddingVertical: 24, textAlign: 'center' },
});

import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

interface InfoItemProps {
  label: string;
  children: ReactNode;
}

export function InfoItem({ label, children }: InfoItemProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
        {label.toUpperCase()}
      </Text>
      {typeof children === 'string' || typeof children === 'number' ? (
        <Text variant="bodyLarge" style={styles.value}>
          {children}
        </Text>
      ) : (
        <View style={styles.value}>{children}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: 6 },
  value: { marginTop: 2 },
});

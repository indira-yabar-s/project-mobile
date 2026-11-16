import type { ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import { Card, Text } from 'react-native-paper';

interface VisualCardProps {
  title?: string;
  children: ReactNode;
}

export function VisualCard({ title, children }: VisualCardProps) {
  return (
    <Card mode="outlined" style={styles.card}>
      <Card.Content>
        {title ? (
          <Text variant="titleSmall" style={styles.title}>
            {title}
          </Text>
        ) : null}
        {children}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { alignSelf: 'stretch' },
  title: { fontWeight: '600', marginBottom: 12 },
});

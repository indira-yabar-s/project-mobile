import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';
import { Skeleton } from './Skeleton';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

interface StatCardProps {
  title: string;
  value?: string | number;
  hint?: string;
  icon?: IconName;
  delta?: number | null;
  isLoading?: boolean;
}

function Delta({ value }: { value: number | null | undefined }) {
  const theme = useTheme();
  if (value === null || value === undefined || Number.isNaN(value)) return null;

  const isUp = value >= 0;
  const color = isUp ? (theme.dark ? '#4ade80' : '#16a34a') : theme.colors.error;

  return (
    <View
      style={styles.delta}
      accessibilityLabel={`${isUp ? '+' : ''}${value.toFixed(1)}% frente al periodo anterior`}
    >
      <MaterialCommunityIcons name={isUp ? 'trending-up' : 'trending-down'} size={16} color={color} />
      <Text variant="labelMedium" style={{ color }}>
        {`${isUp ? '+' : ''}${value.toFixed(1)}%`}
      </Text>
    </View>
  );
}

export function StatCard({ title, value, hint, icon, delta, isLoading = false }: StatCardProps) {
  const theme = useTheme();

  return (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.header}>
          <Text variant="labelLarge" style={{ color: theme.colors.onSurfaceVariant }}>
            {title}
          </Text>
          {icon ? <MaterialCommunityIcons name={icon} size={20} color={theme.colors.primary} /> : null}
        </View>
        {isLoading ? (
          <View style={styles.skeletons}>
            <Skeleton width={110} height={26} />
            <Skeleton width={80} height={12} />
          </View>
        ) : (
          <>
            <Text variant="headlineSmall" style={styles.value}>
              {value}
            </Text>
            <View style={styles.footer}>
              <Delta value={delta} />
              {hint ? (
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  {hint}
                </Text>
              ) : null}
            </View>
          </>
        )}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1 },
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  value: { fontWeight: '700', marginTop: 8 },
  footer: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  delta: { alignItems: 'center', flexDirection: 'row', gap: 2 },
  skeletons: { gap: 10, marginTop: 12 },
});

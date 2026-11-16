import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import type { GroupedSales } from '../types/reports';
import { formatCurrency } from '../utils/format';

interface SalesBarChartProps {
  data: GroupedSales[];
}

export function SalesBarChart({ data }: SalesBarChartProps) {
  const theme = useTheme();
  const maxValue = Math.max(...data.map((item) => item.total), 1);

  return (
    <View style={styles.container}>
      {data.map((item) => (
        <View
          key={item.grupo}
          style={styles.row}
          accessibilityLabel={`${item.grupo}: ${formatCurrency(item.total)}`}
        >
          <View style={styles.labels}>
            <Text variant="bodyMedium" style={styles.group} numberOfLines={1}>
              {item.grupo}
            </Text>
            <Text variant="labelLarge">{formatCurrency(item.total)}</Text>
          </View>
          <View style={[styles.track, { backgroundColor: theme.colors.surfaceVariant }]}>
            <View
              style={[
                styles.bar,
                { backgroundColor: theme.colors.primary, width: `${(item.total / maxValue) * 100}%` },
              ]}
            />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  row: { gap: 4 },
  labels: { alignItems: 'center', flexDirection: 'row', gap: 8, justifyContent: 'space-between' },
  group: { flex: 1 },
  track: { borderRadius: 4, height: 8, overflow: 'hidden' },
  bar: { borderRadius: 4, height: 8 },
});

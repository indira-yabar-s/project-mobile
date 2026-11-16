import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { formatVisualValue, type VisualFormat, type VisualPoint } from '../utils/visuals';
import { VisualCard } from './VisualCard';

interface VisualBarChartProps {
  title?: string;
  points: VisualPoint[];
  format: VisualFormat;
}

export function VisualBarChart({ title, points, format }: VisualBarChartProps) {
  const theme = useTheme();
  const maxValue = Math.max(...points.map((point) => point.value), 1);

  return (
    <VisualCard title={title}>
      <View style={styles.container} accessibilityLabel={title || 'Gráfico de barras'}>
        {points.map((point, index) => {
          const text = formatVisualValue(point.value, format);
          const ratio = Math.min(Math.max(point.value, 0) / maxValue, 1);
          return (
            <View key={`${point.label}-${index}`} style={styles.row} accessibilityLabel={`${point.label}: ${text}`}>
              <View style={styles.labels}>
                <Text variant="bodyMedium" style={styles.label} numberOfLines={1}>
                  {point.label}
                </Text>
                <Text variant="labelLarge">{text}</Text>
              </View>
              <View style={[styles.track, { backgroundColor: theme.colors.surfaceVariant }]}>
                <View style={[styles.bar, { backgroundColor: theme.colors.primary, width: `${ratio * 100}%` }]} />
              </View>
            </View>
          );
        })}
      </View>
    </VisualCard>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  row: { gap: 4 },
  labels: { alignItems: 'center', flexDirection: 'row', gap: 8, justifyContent: 'space-between' },
  label: { flex: 1 },
  track: { borderRadius: 4, height: 8, overflow: 'hidden' },
  bar: { borderRadius: 4, height: 8 },
});

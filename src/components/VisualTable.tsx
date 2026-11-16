import { ScrollView, StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { formatVisualValue, type VisualColumn, type VisualRow } from '../utils/visuals';
import { VisualCard } from './VisualCard';

interface VisualTableProps {
  title?: string;
  columns: VisualColumn[];
  rows: VisualRow[];
}

const COLUMN_WIDTH = 112;

function formatCell(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'number') return formatVisualValue(value);
  if (typeof value === 'object') return '—';
  return String(value);
}

export function VisualTable({ title, columns, rows }: VisualTableProps) {
  const theme = useTheme();

  return (
    <VisualCard title={title}>
      <ScrollView horizontal showsHorizontalScrollIndicator>
        <View accessibilityLabel={title || 'Tabla'}>
          <View style={[styles.row, styles.header, { borderBottomColor: theme.colors.outline }]}>
            {columns.map((column) => (
              <Text key={column.key} variant="labelLarge" style={styles.cell} numberOfLines={2}>
                {column.header}
              </Text>
            ))}
          </View>
          {rows.map((row, rowIndex) => (
            <View key={rowIndex} style={[styles.row, { borderBottomColor: theme.colors.outlineVariant }]}>
              {columns.map((column) => (
                <Text key={column.key} variant="bodyMedium" style={styles.cell}>
                  {formatCell(row[column.key])}
                </Text>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </VisualCard>
  );
}

const styles = StyleSheet.create({
  row: { borderBottomWidth: StyleSheet.hairlineWidth, flexDirection: 'row' },
  header: { borderBottomWidth: 1 },
  cell: { paddingHorizontal: 8, paddingVertical: 8, width: COLUMN_WIDTH },
});

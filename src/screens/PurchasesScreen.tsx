import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Button, Card, FAB, Text, useTheme } from 'react-native-paper';
import { Badge } from '../components/Badge';
import { DataList } from '../components/DataList';
import { DateRangeFilter } from '../components/DateRangeFilter';
import { ScreenContainer } from '../components/ScreenContainer';
import { SortChips } from '../components/SortChips';
import { usePagination, type FetchPageArgs } from '../hooks/usePagination';
import { useRefreshOnFocus } from '../hooks/useRefreshOnFocus';
import { useSort } from '../hooks/useSort';
import { purchaseService } from '../services/purchaseService';
import type { PurchasesStackParamList } from '../types/navigation';
import type { PurchaseOrder } from '../types/purchases';
import { getLastDaysRange, type DateRange } from '../utils/dates';
import { formatCurrency, formatDateTime } from '../utils/format';
import { ORDER_STATUS_BADGES } from '../utils/sales';

type Props = NativeStackScreenProps<PurchasesStackParamList, 'PurchasesList'>;

type SortField = 'fechaEmision' | 'total';

const SORT_LABELS: Record<SortField, string> = {
  fechaEmision: 'Fecha',
  total: 'Total',
};

export function PurchasesScreen({ navigation }: Props) {
  const theme = useTheme();
  const [range, setRange] = useState<DateRange>(() => getLastDaysRange(30));
  const { field, direction, sort, toggle } = useSort<SortField>('fechaEmision', 'desc');
  const { desde, hasta } = range;

  const fetchPage = useCallback(
    ({ page, size, signal }: FetchPageArgs) => purchaseService.getAll({ page, size, sort, desde, hasta }, signal),
    [sort, desde, hasta],
  );
  const pagination = usePagination(fetchPage);
  const { refresh } = pagination;

  useRefreshOnFocus(refresh);

  const goToCreate = () => navigation.navigate('PurchaseForm');

  const header = (
    <View>
      <DateRangeFilter desde={desde} hasta={hasta} onChange={setRange} />
      <SortChips labels={SORT_LABELS} field={field} direction={direction} onChange={toggle} />
    </View>
  );

  const renderItem = (purchase: PurchaseOrder) => {
    const badge = ORDER_STATUS_BADGES[purchase.estado] ?? { variant: 'neutral' as const, label: purchase.estado };

    return (
      <Pressable
        onPress={() => navigation.navigate('PurchaseDetail', { id: purchase.id })}
        accessibilityRole="button"
        accessibilityLabel={`Ver detalle de la compra ${purchase.id}`}
      >
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.titleRow}>
              <View style={styles.titleInfo}>
                <Text variant="titleMedium">{purchase.proveedorRazonSocial}</Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  {formatDateTime(purchase.fechaEmision)}
                </Text>
              </View>
              <Badge variant={badge.variant}>{badge.label}</Badge>
            </View>
            <View style={styles.footer}>
              <Text variant="titleMedium">{formatCurrency(purchase.total)}</Text>
            </View>
          </Card.Content>
        </Card>
      </Pressable>
    );
  };

  return (
    <ScreenContainer>
      <DataList
        pagination={pagination}
        header={header}
        renderItem={renderItem}
        keyExtractor={(purchase) => String(purchase.id)}
        emptyTitle="No hay compras en este rango"
        emptyDescription="Cambia las fechas o registra una nueva compra."
        emptyAction={
          <Button mode="contained" onPress={goToCreate}>
            Registrar compra
          </Button>
        }
      />
      <FAB icon="plus" label="Nueva compra" onPress={goToCreate} style={styles.fab} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: { marginHorizontal: 16, marginTop: 12 },
  titleRow: { alignItems: 'flex-start', flexDirection: 'row', gap: 8, justifyContent: 'space-between' },
  titleInfo: { flex: 1 },
  footer: { alignItems: 'flex-end', marginTop: 8 },
  fab: { bottom: 16, position: 'absolute', right: 16 },
});

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Button, Card, FAB, Text, useTheme } from 'react-native-paper';
import { Badge } from '../components/Badge';
import { DataList } from '../components/DataList';
import { DateRangeFilter } from '../components/DateRangeFilter';
import { FilterChips } from '../components/FilterChips';
import { ScreenContainer } from '../components/ScreenContainer';
import { SortChips } from '../components/SortChips';
import { usePagination, type FetchPageArgs } from '../hooks/usePagination';
import { useRefreshOnFocus } from '../hooks/useRefreshOnFocus';
import { useSort } from '../hooks/useSort';
import { salesService } from '../services/salesService';
import type { SalesStackParamList } from '../types/navigation';
import type { SalesOrder } from '../types/sales';
import { getLastDaysRange, type DateRange } from '../utils/dates';
import { formatCurrency, formatDateTime } from '../utils/format';
import { ORDER_STATUS_BADGES, PAYMENT_METHODS, SALES_CHANNELS, labelOf } from '../utils/sales';

type Props = NativeStackScreenProps<SalesStackParamList, 'SalesList'>;

type SortField = 'fechaEmision' | 'total';

const SORT_LABELS: Record<SortField, string> = {
  fechaEmision: 'Fecha',
  total: 'Total',
};

const STATUS_OPTIONS = [
  { value: 'TODAS', label: 'Todas' },
  { value: 'COMPLETADA', label: 'Completadas' },
  { value: 'PENDIENTE', label: 'Pendientes' },
  { value: 'ANULADA', label: 'Anuladas' },
];

export function SalesScreen({ navigation }: Props) {
  const theme = useTheme();
  const [range, setRange] = useState<DateRange>(() => getLastDaysRange(30));
  const [statusFilter, setStatusFilter] = useState('TODAS');
  const { field, direction, sort, toggle } = useSort<SortField>('fechaEmision', 'desc');
  const { desde, hasta } = range;

  const fetchPage = useCallback(
    ({ page, size, signal }: FetchPageArgs) => salesService.getAll({ page, size, sort, desde, hasta }, signal),
    [sort, desde, hasta],
  );
  const pagination = usePagination(fetchPage);
  const { refresh } = pagination;

  useRefreshOnFocus(refresh);

  const filteredItems =
    statusFilter === 'TODAS' ? pagination.items : pagination.items.filter((sale) => sale.estado === statusFilter);
  const isFiltering = statusFilter !== 'TODAS' && pagination.items.length > 0;

  const goToCreate = () => navigation.navigate('SaleForm');

  const header = (
    <View>
      <DateRangeFilter desde={desde} hasta={hasta} onChange={setRange} />
      <FilterChips label="Filtrar por estado" options={STATUS_OPTIONS} value={statusFilter} onChange={setStatusFilter} />
      <SortChips labels={SORT_LABELS} field={field} direction={direction} onChange={toggle} />
    </View>
  );

  const renderItem = (sale: SalesOrder) => {
    const badge = ORDER_STATUS_BADGES[sale.estado] ?? { variant: 'neutral' as const, label: sale.estado };

    return (
      <Pressable
        onPress={() => navigation.navigate('SaleDetail', { id: sale.id })}
        accessibilityRole="button"
        accessibilityLabel={`Ver detalle de la venta ${sale.id}`}
      >
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.titleRow}>
              <View style={styles.titleInfo}>
                <Text variant="titleMedium">{sale.clienteNombre ?? 'Cliente general'}</Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  {formatDateTime(sale.fechaEmision)}
                </Text>
              </View>
              <Badge variant={badge.variant}>{badge.label}</Badge>
            </View>
            <View style={styles.footer}>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                {`${labelOf(PAYMENT_METHODS, sale.medioPago)} · ${labelOf(SALES_CHANNELS, sale.canal)}`}
              </Text>
              <Text variant="titleMedium">{formatCurrency(sale.total)}</Text>
            </View>
          </Card.Content>
        </Card>
      </Pressable>
    );
  };

  return (
    <ScreenContainer>
      <DataList
        pagination={{ ...pagination, items: filteredItems }}
        header={header}
        renderItem={renderItem}
        keyExtractor={(sale) => String(sale.id)}
        emptyTitle={isFiltering ? 'Sin ventas con este estado' : 'No hay ventas en este rango'}
        emptyDescription={
          isFiltering
            ? 'Prueba con otro estado o cambia las fechas.'
            : 'Cambia las fechas o registra una nueva venta.'
        }
        emptyAction={
          isFiltering ? undefined : (
            <Button mode="contained" onPress={goToCreate}>
              Registrar venta
            </Button>
          )
        }
      />
      <FAB icon="plus" label="Nueva venta" onPress={goToCreate} style={styles.fab} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: { marginHorizontal: 16, marginTop: 12 },
  titleRow: { alignItems: 'flex-start', flexDirection: 'row', gap: 8, justifyContent: 'space-between' },
  titleInfo: { flex: 1 },
  footer: { alignItems: 'center', flexDirection: 'row', gap: 8, justifyContent: 'space-between', marginTop: 8 },
  fab: { bottom: 16, position: 'absolute', right: 16 },
});

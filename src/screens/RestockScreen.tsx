import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, SegmentedButtons, Text, useTheme } from 'react-native-paper';
import { Badge } from '../components/Badge';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { ScreenContainer } from '../components/ScreenContainer';
import { Spinner } from '../components/Spinner';
import { useFetch } from '../hooks/useFetch';
import { useRefreshOnFocus } from '../hooks/useRefreshOnFocus';
import { reportService } from '../services/reportService';
import type { PurchasesStackParamList } from '../types/navigation';
import type { RestockSuggestion, RestockUrgency } from '../types/reports';
import { getErrorMessage } from '../utils/errors';
import { formatCurrency } from '../utils/format';

type Props = NativeStackScreenProps<PurchasesStackParamList, 'Restock'>;

const COVERAGE_OPTIONS = [
  { value: '14', label: '2 semanas' },
  { value: '21', label: '3 semanas' },
  { value: '30', label: '1 mes' },
];

const URGENCY_BADGES: Record<RestockUrgency, { variant: 'danger' | 'warning' | 'neutral'; label: string }> = {
  AGOTADO: { variant: 'danger', label: 'Agotado' },
  CRITICO: { variant: 'danger', label: 'Crítico' },
  PRONTO: { variant: 'warning', label: 'Pronto' },
  PLANIFICAR: { variant: 'neutral', label: 'Planificar' },
};

const NO_SUPPLIER_KEY = 'sin-proveedor';

interface SupplierGroup {
  key: string;
  proveedorId: number | null;
  name: string;
  items: RestockSuggestion[];
  cost: number;
}

function describe(item: RestockSuggestion): string {
  const pace =
    item.ventaDiaria >= 1
      ? `vende ${item.ventaDiaria.toFixed(1)} por día`
      : item.ventaDiaria > 0
        ? `vende ${(item.ventaDiaria * 7).toFixed(1)} por semana`
        : 'sin ventas recientes';

  if (item.urgencia === 'AGOTADO') return `Sin stock · ${pace}`;
  if (item.diasRestantes === null) return `Quedan ${item.stock}, bajo el mínimo de ${item.stockMinimo}`;
  const runsOut = item.diasRestantes <= 0 ? 'se agota hoy' : `se agota en ${item.diasRestantes} días`;
  return `Quedan ${item.stock} · ${pace} · ${runsOut}`;
}

export function RestockScreen({ navigation }: Props) {
  const theme = useTheme();
  const [coverage, setCoverage] = useState('21');
  const [isPulling, setIsPulling] = useState(false);

  const suggestions = useFetch(
    useCallback(
      (signal: AbortSignal) => reportService.getRestockSuggestions({ cobertura: Number(coverage) }, signal),
      [coverage],
    ),
  );
  const { refetch } = suggestions;

  useRefreshOnFocus(refetch);

  const items = useMemo(() => suggestions.data ?? [], [suggestions.data]);

  const groups = useMemo(() => {
    const byKey = new Map<string, SupplierGroup>();
    for (const item of items) {
      const key = item.proveedorId === null ? NO_SUPPLIER_KEY : String(item.proveedorId);
      const group = byKey.get(key) ?? {
        key,
        proveedorId: item.proveedorId,
        name: item.proveedorRazonSocial ?? 'Sin compras anteriores',
        items: [],
        cost: 0,
      };
      group.items.push(item);
      group.cost += Number(item.costoEstimado);
      byKey.set(key, group);
    }
    // El servidor ya ordena por urgencia: el grupo con lo más urgente queda primero.
    return [...byKey.values()];
  }, [items]);

  const totalCost = groups.reduce((sum, group) => sum + group.cost, 0);
  const urgentCount = items.filter((item) => item.urgencia === 'AGOTADO' || item.urgencia === 'CRITICO').length;
  const dailyRisk = items
    .filter((item) => item.urgencia === 'AGOTADO')
    .reduce((sum, item) => sum + Number(item.ventaEnRiesgoDiaria), 0);

  const preparePurchase = (group: SupplierGroup) =>
    navigation.navigate('PurchaseForm', {
      proveedorId: group.proveedorId ?? undefined,
      lineas: group.items.map((item) => ({
        productoId: item.productoId,
        varianteId: item.varianteId,
        cantidad: item.cantidadSugerida,
        precioUnitario: Number(item.costoUnitario),
      })),
    });

  const handleRefresh = () => {
    setIsPulling(true);
    refetch();
  };

  if (suggestions.error && !suggestions.data) {
    return (
      <ScreenContainer>
        <ErrorState message={getErrorMessage(suggestions.error) ?? 'Ocurrió un error inesperado'} onRetry={refetch} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isPulling && suggestions.isLoading} onRefresh={handleRefresh} />}
      >
        <View style={styles.intro}>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            Calculado con tus ventas de los últimos 30 días. Elige para cuánto tiempo quieres abastecerte.
          </Text>
          <SegmentedButtons value={coverage} onValueChange={setCoverage} buttons={COVERAGE_OPTIONS} />
        </View>

        {!suggestions.data ? (
          <Spinner />
        ) : items.length === 0 ? (
          <EmptyState
            icon="check-circle-outline"
            title="No necesitas reponer nada"
            description="Con tu ritmo de venta actual, tu stock alcanza para el periodo elegido. Mientras más ventas registres, más precisa será la sugerencia."
          />
        ) : (
          <>
            <Card style={[styles.summary, { backgroundColor: theme.colors.primaryContainer }]}>
              <Card.Content style={styles.summaryContent}>
                <View style={styles.summaryItem}>
                  <Text variant="headlineSmall" style={[styles.bold, { color: theme.colors.onPrimaryContainer }]}>
                    {items.length}
                  </Text>
                  <Text variant="labelMedium" style={{ color: theme.colors.onPrimaryContainer }}>
                    {`tallas por reponer${urgentCount > 0 ? ` · ${urgentCount} urgentes` : ''}`}
                  </Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text variant="headlineSmall" style={[styles.bold, { color: theme.colors.onPrimaryContainer }]}>
                    {formatCurrency(totalCost)}
                  </Text>
                  <Text variant="labelMedium" style={{ color: theme.colors.onPrimaryContainer }}>
                    inversión estimada
                  </Text>
                </View>
              </Card.Content>
              {dailyRisk > 0 ? (
                <Card.Content style={styles.risk}>
                  <MaterialCommunityIcons name="alert-circle-outline" size={18} color={theme.colors.error} />
                  <Text variant="bodySmall" style={[styles.riskText, { color: theme.colors.onPrimaryContainer }]}>
                    {`Lo que ya está agotado te hace dejar de vender unos ${formatCurrency(dailyRisk)} por día.`}
                  </Text>
                </Card.Content>
              ) : null}
            </Card>

            {groups.map((group) => (
              <Card key={group.key} style={styles.group}>
                <Card.Content>
                  <View style={styles.groupHeader}>
                    <View style={styles.groupTitle}>
                      <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                        {group.proveedorId === null ? 'Elige proveedor al comprar' : 'Último proveedor'}
                      </Text>
                      <Text variant="titleMedium" style={styles.bold}>
                        {group.name}
                      </Text>
                    </View>
                    <Text variant="titleMedium">{formatCurrency(group.cost)}</Text>
                  </View>

                  {group.items.map((item) => {
                    const badge = URGENCY_BADGES[item.urgencia] ?? URGENCY_BADGES.PLANIFICAR;
                    return (
                      <View
                        key={item.varianteId}
                        style={[styles.row, { borderTopColor: theme.colors.outlineVariant }]}
                      >
                        <View style={styles.rowInfo}>
                          <View style={styles.rowTitle}>
                            <Text variant="bodyLarge" style={styles.rowName}>
                              {item.producto}
                            </Text>
                            <Badge variant={badge.variant}>{badge.label}</Badge>
                          </View>
                          <Text variant="bodyMedium">{`Talla ${item.talla} · ${item.color}`}</Text>
                          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                            {describe(item)}
                          </Text>
                        </View>
                        <View style={styles.rowQty}>
                          <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                            Comprar
                          </Text>
                          <Text variant="titleLarge" style={[styles.bold, { color: theme.colors.primary }]}>
                            {item.cantidadSugerida}
                          </Text>
                        </View>
                      </View>
                    );
                  })}

                  <Button
                    mode="contained"
                    icon="cart-arrow-down"
                    onPress={() => preparePurchase(group)}
                    style={styles.action}
                    contentStyle={styles.actionContent}
                  >
                    Preparar compra
                  </Button>
                </Card.Content>
              </Card>
            ))}

            <Text variant="bodySmall" style={[styles.note, { color: theme.colors.onSurfaceVariant }]}>
              La compra se abre con estas cantidades ya cargadas y puedes ajustarlas antes de registrarla. El stock
              solo cambia cuando registras la compra.
            </Text>
          </>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { gap: 16, paddingBottom: 32, paddingTop: 16 },
  intro: { gap: 12, paddingHorizontal: 16 },
  bold: { fontWeight: '700' },
  summary: { marginHorizontal: 16 },
  summaryContent: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  summaryItem: { flex: 1, minWidth: 130 },
  risk: { alignItems: 'center', flexDirection: 'row', gap: 8, marginTop: 12 },
  riskText: { flex: 1 },
  group: { marginHorizontal: 16 },
  groupHeader: { alignItems: 'flex-end', flexDirection: 'row', gap: 12, justifyContent: 'space-between', marginBottom: 12 },
  groupTitle: { flex: 1 },
  row: { alignItems: 'center', borderTopWidth: StyleSheet.hairlineWidth, flexDirection: 'row', gap: 12, paddingVertical: 12 },
  rowInfo: { flex: 1, gap: 2 },
  rowTitle: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  rowName: { fontWeight: '600' },
  rowQty: { alignItems: 'center', minWidth: 64 },
  action: { marginTop: 8 },
  actionContent: { minHeight: 44 },
  note: { paddingHorizontal: 16 },
});

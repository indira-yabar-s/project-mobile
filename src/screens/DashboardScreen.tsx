import { useNavigation, type NavigationProp } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { Button, SegmentedButtons, Text, useTheme } from 'react-native-paper';
import { Badge } from '../components/Badge';
import { DailySalesChart } from '../components/DailySalesChart';
import { DashboardCard } from '../components/DashboardCard';
import { DateRangeFilter } from '../components/DateRangeFilter';
import { OnboardingChecklist, type ChecklistStep } from '../components/OnboardingChecklist';
import { QuickActions, type QuickAction } from '../components/QuickActions';
import { SalesBarChart } from '../components/SalesBarChart';
import { ScreenContainer } from '../components/ScreenContainer';
import { SelectField } from '../components/SelectField';
import { StatCard } from '../components/StatCard';
import { WeatherCard } from '../components/WeatherCard';
import { useAuth } from '../hooks/useAuth';
import { useFetch } from '../hooks/useFetch';
import { useWeather } from '../hooks/useWeather';
import { clientService } from '../services/clientService';
import { productService } from '../services/productService';
import { reportService } from '../services/reportService';
import { salesService } from '../services/salesService';
import { stockService } from '../services/stockService';
import type { AppDrawerParamList, MainTabsParamList } from '../types/navigation';
import type { DailySalesPoint, RankingCriterion, SalesGrouping } from '../types/reports';
import {
  formatShortDay,
  getDaysList,
  getLastDaysRange,
  getPreviousRange,
  percentChange,
  type DateRange,
} from '../utils/dates';
import { getErrorMessage } from '../utils/errors';
import { formatCurrency } from '../utils/format';

const GROUPINGS: { value: SalesGrouping; label: string }[] = [
  { value: 'MEDIO_PAGO', label: 'Medio de pago' },
  { value: 'CANAL', label: 'Canal' },
  { value: 'CATEGORIA', label: 'Categoría' },
  { value: 'DIA_SEMANA', label: 'Día de la semana' },
  { value: 'HORA', label: 'Hora' },
];

const CRITERIA: { value: RankingCriterion; label: string }[] = [
  { value: 'UNIDADES', label: 'Unidades' },
  { value: 'GANANCIA', label: 'Ganancia' },
];

export function DashboardScreen() {
  const { user, isAdmin } = useAuth();
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp<MainTabsParamList>>();
  const drawerNavigation = useNavigation<NavigationProp<AppDrawerParamList>>();
  const restock = useFetch(
    useCallback(
      (signal: AbortSignal) => (isAdmin ? reportService.getRestockSuggestions({}, signal) : Promise.resolve(null)),
      [isAdmin],
    ),
  );
  const [range, setRange] = useState<DateRange>(() => getLastDaysRange(30));
  const [grouping, setGrouping] = useState<SalesGrouping>('MEDIO_PAGO');
  const [criterion, setCriterion] = useState<RankingCriterion>('UNIDADES');
  const [isPulling, setIsPulling] = useState(false);
  const { desde, hasta } = range;

  const previousRange = getPreviousRange(range);
  const prevDesde = previousRange.desde;
  const prevHasta = previousRange.hasta;

  const summary = useFetch(
    useCallback(
      (signal: AbortSignal) => (isAdmin ? reportService.getSummary({ desde, hasta }, signal) : Promise.resolve(null)),
      [isAdmin, desde, hasta],
    ),
  );
  const previous = useFetch(
    useCallback(
      (signal: AbortSignal) =>
        isAdmin ? reportService.getSummary({ desde: prevDesde, hasta: prevHasta }, signal) : Promise.resolve(null),
      [isAdmin, prevDesde, prevHasta],
    ),
  );
  const daily = useFetch(
    useCallback(
      (signal: AbortSignal): Promise<DailySalesPoint[] | null> =>
        isAdmin
          ? Promise.all(
              getDaysList(hasta, 7).map(async (day) => {
                const result = await reportService.getSummary({ desde: day, hasta: day }, signal);
                return { label: formatShortDay(day), total: Number(result.totalVendido ?? 0) };
              }),
            )
          : Promise.resolve(null),
      [isAdmin, hasta],
    ),
  );
  const grouped = useFetch(
    useCallback(
      (signal: AbortSignal) =>
        isAdmin ? reportService.getGroupedSales({ desde, hasta, por: grouping }, signal) : Promise.resolve(null),
      [isAdmin, desde, hasta, grouping],
    ),
  );
  const top = useFetch(
    useCallback(
      (signal: AbortSignal) =>
        isAdmin
          ? reportService.getTopProducts({ desde, hasta, criterio: criterion, limite: 5 }, signal)
          : Promise.resolve(null),
      [isAdmin, desde, hasta, criterion],
    ),
  );
  const productCount = useFetch(useCallback((signal: AbortSignal) => productService.getAll({ size: 1 }, signal), []));
  const clientCount = useFetch(useCallback((signal: AbortSignal) => clientService.getAll({ size: 1 }, signal), []));
  const salesCount = useFetch(useCallback((signal: AbortSignal) => salesService.getAll({ size: 1 }, signal), []));
  const lowStock = useFetch(useCallback((signal: AbortSignal) => stockService.getLowStock({ size: 5 }, signal), []));

  const { forecast, location } = useWeather();

  const all = [summary, previous, daily, grouped, top, productCount, clientCount, salesCount, lowStock, forecast];
  const anyLoading = all.some((request) => request.isLoading);

  if (isPulling && !anyLoading) {
    setIsPulling(false);
  }

  const handleRefresh = () => {
    setIsPulling(true);
    all.forEach((request) => request.refetch());
  };

  const lowStockItems = lowStock.data?.content ?? [];

  const checklistSteps: ChecklistStep[] | null =
    productCount.data && clientCount.data && salesCount.data
      ? [
          {
            label: 'Registra tu primer producto',
            done: productCount.data.totalElements > 0,
            onPress: () => navigation.navigate('ProductsTab', { screen: 'ProductForm', initial: false }),
          },
          {
            label: 'Agrega a tu primer cliente',
            done: clientCount.data.totalElements > 0,
            onPress: () => navigation.navigate('ClientsTab', { screen: 'ClientForm', initial: false }),
          },
          {
            label: 'Registra tu primera venta',
            done: salesCount.data.totalElements > 0,
            onPress: () => navigation.navigate('SalesTab', { screen: 'SaleForm', initial: false }),
          },
        ]
      : null;

  const current = summary.data;
  const prev = previous.data;
  const deltaOf = (key: 'totalVendido' | 'ganancia' | 'ticketPromedio' | 'unidadesVendidas') =>
    current && prev ? percentChange(current[key], prev[key]) : null;
  const salesDelta = deltaOf('totalVendido');

  let summaryPhrase: string | null = null;
  if (current) {
    summaryPhrase =
      current.numeroVentas === 0
        ? 'Aún no registraste ventas en este periodo.'
        : `En este periodo vendiste ${formatCurrency(current.totalVendido)} en ${current.numeroVentas} ventas` +
          (salesDelta === null
            ? '.'
            : `, un ${Math.abs(salesDelta).toFixed(1)}% ${salesDelta >= 0 ? 'más' : 'menos'} que el periodo anterior.`);
  }

  const restockItems = restock.data ?? [];
  const restockUrgent = restockItems.filter((item) => item.urgencia === 'AGOTADO' || item.urgencia === 'CRITICO').length;
  const restockCost = restockItems.reduce((sum, item) => sum + Number(item.costoEstimado), 0);

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches';
  const firstName = user?.nombre?.trim().split(/\s+/)[0] ?? 'bienvenido';
  const todayText = now.toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' });
  const todayLabel = todayText.charAt(0).toUpperCase() + todayText.slice(1);

  const quickActions: QuickAction[] = [
    {
      label: 'Nueva venta',
      icon: 'cart-plus',
      primary: true,
      onPress: () => navigation.navigate('SalesTab', { screen: 'SaleForm', initial: false }),
    },
    {
      label: 'Escanear',
      icon: 'barcode-scan',
      onPress: () => navigation.navigate('ProductsTab', { screen: 'ProductScanner', initial: false }),
    },
    {
      label: 'Nuevo producto',
      icon: 'tag-plus-outline',
      onPress: () => navigation.navigate('ProductsTab', { screen: 'ProductForm', initial: false }),
    },
    ...(isAdmin
      ? [
          {
            label: 'Analítica IA',
            icon: 'chart-box-outline' as const,
            onPress: () => drawerNavigation.navigate('AnalyticsDrawer', { screen: 'Analytics' }),
          },
        ]
      : []),
    {
      label: 'Nuevo cliente',
      icon: 'account-plus-outline',
      onPress: () => navigation.navigate('ClientsTab', { screen: 'ClientForm', initial: false }),
    },
  ];

  return (
    <ScreenContainer>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isPulling && anyLoading} onRefresh={handleRefresh} />}
      >
        <View style={styles.header}>
          <Text variant="labelLarge" style={{ color: theme.colors.primary }}>
            {todayLabel}
          </Text>
          <Text variant="headlineSmall" accessibilityRole="header" style={styles.greeting}>
            {`${greeting}, ${firstName}`}
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            {isAdmin ? (summaryPhrase ?? 'Resumen de tu negocio') : 'Alertas de inventario'}
          </Text>
        </View>

        <QuickActions actions={quickActions} />

        {checklistSteps ? <OnboardingChecklist steps={checklistSteps} /> : null}

        {isAdmin && restockItems.length > 0 ? (
          <DashboardCard
            title="Reposición inteligente"
            action={
              <Button
                compact
                mode="text"
                onPress={() => drawerNavigation.navigate('PurchasesDrawer', { screen: 'Restock', initial: false })}
              >
                Ver plan de compra
              </Button>
            }
          >
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              {`${restockItems.length} tallas por reponer` +
                (restockUrgent > 0 ? `, ${restockUrgent} urgentes` : '') +
                `. Inversión estimada: ${formatCurrency(restockCost)}.`}
            </Text>
            {restockItems.slice(0, 3).map((item) => (
              <View key={item.varianteId} style={[styles.stockRow, { borderBottomColor: theme.colors.outlineVariant }]}>
                <View style={styles.topInfo}>
                  <Text variant="bodyMedium" style={styles.topName}>
                    {item.producto}
                  </Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    {`Talla ${item.talla} · ${item.color} · ` +
                      (item.stock <= 0
                        ? 'agotado'
                        : item.diasRestantes === null
                          ? 'bajo el mínimo'
                          : `se agota en ${item.diasRestantes} días`)}
                  </Text>
                </View>
                <Badge variant={item.urgencia === 'AGOTADO' || item.urgencia === 'CRITICO' ? 'danger' : 'warning'}>
                  {`Comprar ${item.cantidadSugerida}`}
                </Badge>
              </View>
            ))}
          </DashboardCard>
        ) : null}

        <WeatherCard forecast={forecast} location={location} />

        {isAdmin ? (
          <>
            <DateRangeFilter desde={desde} hasta={hasta} onChange={setRange} />

            {summary.error ? (
              <DashboardCard
                title="Resumen"
                error={getErrorMessage(summary.error)}
                onRetry={summary.refetch}
              />
            ) : (
              <View style={styles.grid}>
                <View style={styles.gridRow}>
                  <StatCard
                    title="Total vendido"
                    icon="cash"
                    isLoading={!summary.data}
                    value={summary.data ? formatCurrency(summary.data.totalVendido) : undefined}
                    delta={deltaOf('totalVendido')}
                    hint={summary.data ? `${summary.data.numeroVentas} ventas` : undefined}
                  />
                  <StatCard
                    title="Ganancia"
                    icon="percent-outline"
                    isLoading={!summary.data}
                    value={summary.data ? formatCurrency(summary.data.ganancia) : undefined}
                    delta={deltaOf('ganancia')}
                    hint={summary.data ? `Margen ${summary.data.margenPorcentaje}%` : undefined}
                  />
                </View>
                <View style={styles.gridRow}>
                  <StatCard
                    title="Ticket promedio"
                    icon="receipt-text-outline"
                    isLoading={!summary.data}
                    value={summary.data ? formatCurrency(summary.data.ticketPromedio) : undefined}
                    delta={deltaOf('ticketPromedio')}
                  />
                  <StatCard
                    title="Unidades"
                    icon="shopping-outline"
                    isLoading={!summary.data}
                    value={summary.data ? summary.data.unidadesVendidas : undefined}
                    delta={deltaOf('unidadesVendidas')}
                  />
                </View>
              </View>
            )}

            <DashboardCard
              title="Ventas de los últimos 7 días"
              isLoading={daily.isLoading}
              error={daily.error ? getErrorMessage(daily.error) : null}
              onRetry={daily.refetch}
              isEmpty={!daily.data}
              emptyText=""
            >
              {daily.data ? <DailySalesChart data={daily.data} /> : null}
            </DashboardCard>

            <DashboardCard
              title="Ventas agrupadas"
              isLoading={grouped.isLoading}
              error={grouped.error ? getErrorMessage(grouped.error) : null}
              onRetry={grouped.refetch}
              isEmpty={!grouped.data || grouped.data.length === 0}
              emptyText="No hay ventas en el rango seleccionado"
              action={
                <View style={styles.select}>
                  <SelectField
                    label="Agrupar por"
                    value={grouping}
                    options={GROUPINGS}
                    onChange={(value) => setGrouping(value as SalesGrouping)}
                  />
                </View>
              }
            >
              {grouped.data ? <SalesBarChart data={grouped.data} /> : null}
            </DashboardCard>

            <DashboardCard
              title="Top productos"
              isLoading={top.isLoading}
              error={top.error ? getErrorMessage(top.error) : null}
              onRetry={top.refetch}
              isEmpty={!top.data || top.data.length === 0}
              emptyText="Aún no hay productos vendidos en este rango"
              action={
                <SegmentedButtons
                  density="small"
                  value={criterion}
                  onValueChange={(value) => setCriterion(value as RankingCriterion)}
                  buttons={CRITERIA}
                />
              }
            >
              {top.data
                ? top.data.map((item, index) => (
                    <View
                      key={item.productoId}
                      style={[styles.topRow, { borderBottomColor: theme.colors.outlineVariant }]}
                    >
                      <Text variant="labelLarge" style={[styles.topRank, { color: theme.colors.onSurfaceVariant }]}>
                        {index + 1}
                      </Text>
                      <View style={styles.topInfo}>
                        <Text variant="bodyMedium" style={styles.topName}>
                          {item.producto}
                        </Text>
                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                          {item.categoria}
                        </Text>
                      </View>
                      <View style={styles.topValues}>
                        <Text variant="bodyMedium">{`${item.unidades} unid.`}</Text>
                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                          {formatCurrency(item.ganancia)}
                        </Text>
                      </View>
                    </View>
                  ))
                : null}
            </DashboardCard>
          </>
        ) : null}

        <DashboardCard
          title="Stock bajo"
          isLoading={lowStock.isLoading}
          error={lowStock.error ? getErrorMessage(lowStock.error) : null}
          onRetry={lowStock.refetch}
          isEmpty={lowStockItems.length === 0}
          emptyText="Todo el inventario está por encima del mínimo"
          action={
            <Button
              compact
              mode="text"
              onPress={() => navigation.navigate('ProductsTab', { screen: 'ProductsList' })}
            >
              Ver productos
            </Button>
          }
        >
          {lowStockItems.map((variant) => (
            <View key={variant.id} style={[styles.stockRow, { borderBottomColor: theme.colors.outlineVariant }]}>
              <View style={styles.topInfo}>
                <Text variant="bodyMedium" style={styles.topName}>
                  {variant.productoNombre}
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  {`Talla ${variant.talla} · ${variant.color}`}
                </Text>
              </View>
              <Badge variant="warning">{`${variant.stock} / mín. ${variant.stockMinimo}`}</Badge>
            </View>
          ))}
          {lowStock.data && lowStock.data.totalElements > lowStockItems.length ? (
            <Text variant="bodySmall" style={[styles.stockNote, { color: theme.colors.onSurfaceVariant }]}>
              {`Mostrando ${lowStockItems.length} de ${lowStock.data.totalElements} variantes con stock bajo.`}
            </Text>
          ) : null}
        </DashboardCard>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { gap: 16, paddingBottom: 32, paddingTop: 8 },
  header: { gap: 2, paddingHorizontal: 16, paddingTop: 8 },
  greeting: { fontWeight: '700' },
  grid: { gap: 12, paddingHorizontal: 16 },
  gridRow: { flexDirection: 'row', gap: 12 },
  select: { minWidth: 170 },
  topRow: { alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth, flexDirection: 'row', gap: 12, paddingVertical: 10 },
  topRank: { width: 20 },
  topInfo: { flex: 1 },
  topName: { fontWeight: '600' },
  topValues: { alignItems: 'flex-end' },
  stockRow: { alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth, flexDirection: 'row', gap: 12, paddingVertical: 10 },
  stockNote: { marginTop: 12 },
});

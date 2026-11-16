import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Text, useTheme } from 'react-native-paper';
import { Badge } from '../components/Badge';
import { ErrorState } from '../components/ErrorState';
import { InfoItem } from '../components/InfoItem';
import { ScreenContainer } from '../components/ScreenContainer';
import { Spinner } from '../components/Spinner';
import { useFetch } from '../hooks/useFetch';
import { salesService } from '../services/salesService';
import type { SalesStackParamList } from '../types/navigation';
import { getErrorMessage } from '../utils/errors';
import { formatCurrency, formatDateTime } from '../utils/format';
import { ORDER_STATUS_BADGES, PAYMENT_METHODS, SALES_CHANNELS, labelOf } from '../utils/sales';

type Props = NativeStackScreenProps<SalesStackParamList, 'SaleDetail'>;

export function SaleDetailScreen({ navigation, route }: Props) {
  const { id } = route.params;
  const theme = useTheme();
  const sale = useFetch(useCallback((signal: AbortSignal) => salesService.getById(id, signal), [id]));

  if (sale.error) {
    return (
      <ScreenContainer>
        <ErrorState message={getErrorMessage(sale.error) ?? 'Ocurrió un error inesperado'} onRetry={sale.refetch} />
      </ScreenContainer>
    );
  }

  if (!sale.data) {
    return (
      <ScreenContainer>
        <Spinner fullScreen />
      </ScreenContainer>
    );
  }

  const order = sale.data;
  const badge = ORDER_STATUS_BADGES[order.estado] ?? { variant: 'neutral' as const, label: order.estado };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="headlineSmall">{`Venta #${id}`}</Text>

        <Card>
          <Card.Content>
            <InfoItem label="Fecha">{formatDateTime(order.fechaEmision)}</InfoItem>
            <InfoItem label="Cliente">{order.clienteNombre ?? 'Cliente general'}</InfoItem>
            <InfoItem label="Medio de pago">{labelOf(PAYMENT_METHODS, order.medioPago)}</InfoItem>
            <InfoItem label="Canal">{labelOf(SALES_CHANNELS, order.canal)}</InfoItem>
            <InfoItem label="Estado">
              <Badge variant={badge.variant}>{badge.label}</Badge>
            </InfoItem>
          </Card.Content>
        </Card>

        <Text variant="titleMedium">Productos</Text>
        {order.detalles.map((line) => (
          <Card key={line.id}>
            <Card.Content>
              <Text variant="bodyLarge" style={styles.lineName}>
                {line.varianteDescripcion}
              </Text>
              <View style={styles.lineRow}>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                  {`${line.cantidad} × ${formatCurrency(line.precioUnitario)}`}
                </Text>
                <Text variant="titleSmall">{formatCurrency(line.subtotal)}</Text>
              </View>
            </Card.Content>
          </Card>
        ))}

        <Text variant="headlineSmall" style={styles.total}>
          {`Total: ${formatCurrency(order.total)}`}
        </Text>

        <Button mode="contained" icon="plus" onPress={() => navigation.navigate('SaleForm')}>
          Nueva venta
        </Button>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { gap: 12, padding: 16, paddingBottom: 32 },
  lineName: { fontWeight: '600' },
  lineRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  total: { fontWeight: '700', textAlign: 'right' },
});

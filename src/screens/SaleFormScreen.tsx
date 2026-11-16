import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { ErrorState } from '../components/ErrorState';
import { OrderWizard } from '../components/OrderWizard';
import { SaleLineFields } from '../components/SaleLineFields';
import { ScreenContainer } from '../components/ScreenContainer';
import { SelectField } from '../components/SelectField';
import { Spinner } from '../components/Spinner';
import { SummaryRow } from '../components/SummaryRow';
import { useFetch } from '../hooks/useFetch';
import { useOrderLines } from '../hooks/useOrderLines';
import { useSnackbar } from '../hooks/useSnackbar';
import type { Product } from '../types/products';
import { clientService } from '../services/clientService';
import { productService } from '../services/productService';
import { salesService } from '../services/salesService';
import type { SalesStackParamList } from '../types/navigation';
import type { PaymentMethod, SalesChannel } from '../types/sales';
import { getErrorMessage } from '../utils/errors';
import { formatCurrency } from '../utils/format';
import { getLineSubtotal } from '../utils/orderLines';
import { PAYMENT_METHODS, SALES_CHANNELS, labelOf } from '../utils/sales';

type Props = NativeStackScreenProps<SalesStackParamList, 'SaleForm'>;

const STEPS = ['Datos', 'Productos', 'Confirmar'];
const LAST_STEP = STEPS.length - 1;

export function SaleFormScreen({ navigation, route }: Props) {
  const { showMessage } = useSnackbar();
  const [step, setStep] = useState(0);
  const [clienteId, setClienteId] = useState('');
  const [medioPago, setMedioPago] = useState<PaymentMethod>('EFECTIVO');
  const [canal, setCanal] = useState<SalesChannel>('TIENDA');
  const [showErrors, setShowErrors] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scannedProducts, setScannedProducts] = useState<Product[]>([]);
  const { lines, addLine, removeLine, updateLine, total, isValid } = useOrderLines('sale');
  const scannedCode = route.params?.scannedCode;
  const scannedLineKey = route.params?.lineKey;

  const products = useFetch(
    useCallback((signal: AbortSignal) => productService.getAll({ size: 100, soloActivos: true }, signal), []),
  );
  const clients = useFetch(useCallback((signal: AbortSignal) => clientService.getAll({ size: 100 }, signal), []));

  useEffect(() => {
    if (!scannedCode || !scannedLineKey) return;
    navigation.setParams({ scannedCode: undefined, lineKey: undefined });

    productService
      .getAll({ search: scannedCode, size: 10, soloActivos: true })
      .then((page) => {
        const wanted = scannedCode.toLowerCase();
        const match =
          page.content.find((product) => product.codigo.toLowerCase() === wanted) ??
          (page.content.length === 1 ? page.content[0] : undefined);

        if (!match) {
          showMessage(`No encontramos un producto activo con el código "${scannedCode}"`, 'error');
          return;
        }

        setScannedProducts((current) => (current.some((item) => item.id === match.id) ? current : [...current, match]));
        updateLine(scannedLineKey, {
          productoId: String(match.id),
          varianteId: '',
          stock: null,
          precioUnitario: String(match.precioVenta),
        });
        showMessage(`Producto agregado: ${match.nombre}`, 'success');
      })
      .catch((error: unknown) => {
        showMessage(getErrorMessage(error) ?? 'No se pudo buscar el producto escaneado', 'error');
      });
  }, [scannedCode, scannedLineKey, navigation, showMessage, updateLine]);

  const handleNext = () => {
    if (step === 1 && !isValid) {
      setShowErrors(true);
      return;
    }
    setStep((current) => Math.min(current + 1, LAST_STEP));
  };

  const handleBack = () => {
    if (step === 0) {
      navigation.goBack();
    } else {
      setStep((current) => current - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const sale = await salesService.create({
        clienteId: clienteId ? Number(clienteId) : null,
        medioPago,
        canal: canal || null,
        detalles: lines.map((line) => ({
          varianteId: Number(line.varianteId),
          cantidad: Number(line.cantidad),
          precioUnitario: Number(line.precioUnitario),
        })),
      });
      showMessage('Venta registrada correctamente', 'success');
      navigation.replace('SaleDetail', { id: sale.id });
    } catch (error) {
      showMessage(getErrorMessage(error) ?? 'No se pudo registrar la venta', 'error');
      setIsSubmitting(false);
    }
  };

  const loadError = products.error ?? clients.error;

  if (loadError) {
    return (
      <ScreenContainer>
        <ErrorState
          message={getErrorMessage(loadError) ?? 'Ocurrió un error inesperado'}
          onRetry={() => {
            products.refetch();
            clients.refetch();
          }}
        />
      </ScreenContainer>
    );
  }

  if (!products.data || !clients.data) {
    return (
      <ScreenContainer>
        <Spinner fullScreen />
      </ScreenContainer>
    );
  }

  const loadedProducts = products.data.content;
  const productList = [
    ...loadedProducts,
    ...scannedProducts.filter((scanned) => !loadedProducts.some((item) => item.id === scanned.id)),
  ];
  const clientList = clients.data.content;
  const client = clientList.find((item) => String(item.id) === clienteId);

  const clientOptions = clientList.map((item) => ({ value: String(item.id), label: `${item.nombre} (${item.documento})` }));

  return (
    <OrderWizard
      steps={STEPS}
      step={step}
      total={total}
      isSubmitting={isSubmitting}
      submitLabel="Registrar venta"
      onBack={handleBack}
      onNext={handleNext}
      onSubmit={handleSubmit}
    >
      {step === 0 ? (
        <View>
          <SelectField
            label="Cliente"
            value={clienteId}
            options={clientOptions}
            emptyLabel="Cliente general"
            hint="Opcional. Sin cliente se registra como venta general."
            onChange={setClienteId}
          />
          <SelectField
            label="Medio de pago"
            value={medioPago}
            options={PAYMENT_METHODS}
            onChange={(value) => setMedioPago(value as PaymentMethod)}
          />
          <SelectField
            label="Canal de venta"
            value={canal}
            options={SALES_CHANNELS}
            onChange={(value) => setCanal(value as SalesChannel)}
          />
        </View>
      ) : null}

      {step === 1 ? (
        <View>
          <Text variant="titleMedium">Productos de la venta</Text>
          {lines.map((line, index) => (
            <SaleLineFields
              key={line.key}
              line={line}
              index={index}
              products={productList}
              showErrors={showErrors}
              canRemove={lines.length > 1}
              onChange={(patch) => updateLine(line.key, patch)}
              onRemove={() => removeLine(line.key)}
              onScan={() => navigation.navigate('SaleScanner', { lineKey: line.key })}
            />
          ))}
          <Button mode="outlined" icon="plus" onPress={addLine} style={styles.addLine}>
            Agregar línea
          </Button>
        </View>
      ) : null}

      {step === LAST_STEP ? (
        <View>
          <Text variant="titleMedium">Revisa tu venta</Text>
          <SummaryRow label="Cliente" value={client ? client.nombre : 'Cliente general'} />
          <SummaryRow label="Medio de pago" value={labelOf(PAYMENT_METHODS, medioPago)} />
          <SummaryRow label="Canal" value={labelOf(SALES_CHANNELS, canal)} />
          {lines.map((line) => {
            const product = productList.find((item) => String(item.id) === line.productoId);
            return (
              <SummaryRow
                key={line.key}
                label={`${line.cantidad} × ${product?.nombre ?? 'Producto'}`}
                value={formatCurrency(getLineSubtotal(line))}
              />
            );
          })}
        </View>
      ) : null}
    </OrderWizard>
  );
}

const styles = StyleSheet.create({
  addLine: { marginTop: 16 },
});

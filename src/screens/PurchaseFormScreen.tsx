import { useNavigation, type NavigationProp } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, HelperText, Text } from 'react-native-paper';
import { ErrorState } from '../components/ErrorState';
import { OrderWizard } from '../components/OrderWizard';
import { SaleLineFields } from '../components/SaleLineFields';
import { ScreenContainer } from '../components/ScreenContainer';
import { SelectField } from '../components/SelectField';
import { Spinner } from '../components/Spinner';
import { SummaryRow } from '../components/SummaryRow';
import { useFetch } from '../hooks/useFetch';
import { useOrderLines } from '../hooks/useOrderLines';
import { useRefreshOnFocus } from '../hooks/useRefreshOnFocus';
import { useSnackbar } from '../hooks/useSnackbar';
import { productService } from '../services/productService';
import { purchaseService } from '../services/purchaseService';
import { supplierService } from '../services/supplierService';
import type { AppDrawerParamList, PurchasesStackParamList } from '../types/navigation';
import { getErrorMessage } from '../utils/errors';
import { formatCurrency } from '../utils/format';
import { createPrefilledLine, getLineSubtotal } from '../utils/orderLines';

type Props = NativeStackScreenProps<PurchasesStackParamList, 'PurchaseForm'>;

const STEPS = ['Proveedor', 'Productos', 'Confirmar'];
const LAST_STEP = STEPS.length - 1;

export function PurchaseFormScreen({ navigation, route }: Props) {
  const drawerNavigation = useNavigation<NavigationProp<AppDrawerParamList>>();
  const { showMessage } = useSnackbar();
  const prefill = route.params;
  const hasPrefilledLines = Boolean(prefill?.lineas?.length);
  // Si la compra viene de Reposición con proveedor y productos, se abre directo en el paso de productos.
  const [step, setStep] = useState(prefill?.proveedorId && hasPrefilledLines ? 1 : 0);
  const [proveedorId, setProveedorId] = useState(prefill?.proveedorId ? String(prefill.proveedorId) : '');
  const [showErrors, setShowErrors] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { lines, addLine, removeLine, updateLine, total, isValid } = useOrderLines(
    'purchase',
    prefill?.lineas?.map(createPrefilledLine),
  );

  const products = useFetch(
    useCallback((signal: AbortSignal) => productService.getAll({ size: 100, soloActivos: true }, signal), []),
  );
  const suppliers = useFetch(useCallback((signal: AbortSignal) => supplierService.getAll({ size: 100 }, signal), []));

  useRefreshOnFocus(suppliers.refetch);

  const handleNext = () => {
    if (step === 0 && !proveedorId) {
      setShowErrors(true);
      return;
    }
    if (step === 1 && !isValid) {
      setShowErrors(true);
      return;
    }
    setShowErrors(false);
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
      const purchase = await purchaseService.create({
        proveedorId: Number(proveedorId),
        detalles: lines.map((line) => ({
          varianteId: Number(line.varianteId),
          cantidad: Number(line.cantidad),
          precioUnitario: Number(line.precioUnitario),
        })),
      });
      showMessage('Compra registrada. El stock fue actualizado', 'success');
      navigation.replace('PurchaseDetail', { id: purchase.id });
    } catch (error) {
      showMessage(getErrorMessage(error) ?? 'No se pudo registrar la compra', 'error');
      setIsSubmitting(false);
    }
  };

  const loadError = products.error ?? suppliers.error;

  if (loadError) {
    return (
      <ScreenContainer>
        <ErrorState
          message={getErrorMessage(loadError) ?? 'Ocurrió un error inesperado'}
          onRetry={() => {
            products.refetch();
            suppliers.refetch();
          }}
        />
      </ScreenContainer>
    );
  }

  if (!products.data || !suppliers.data) {
    return (
      <ScreenContainer>
        <Spinner fullScreen />
      </ScreenContainer>
    );
  }

  const productList = products.data.content;
  const supplierList = suppliers.data.content;
  const supplier = supplierList.find((item) => String(item.id) === proveedorId);

  const supplierOptions = supplierList.map((item) => ({ value: String(item.id), label: `${item.razonSocial} (${item.ruc})` }));

  return (
    <OrderWizard
      steps={STEPS}
      step={step}
      total={total}
      isSubmitting={isSubmitting}
      submitLabel="Registrar compra"
      onBack={handleBack}
      onNext={handleNext}
      onSubmit={handleSubmit}
    >
      {step === 0 ? (
        <View>
          <SelectField
            label="Proveedor"
            value={proveedorId}
            options={supplierOptions}
            placeholder="Selecciona..."
            error={showErrors && !proveedorId ? 'Elige un proveedor' : undefined}
            onChange={setProveedorId}
          />
          {supplierList.length === 0 ? (
            <View>
              <HelperText type="info" visible>
                Aún no tienes proveedores.
              </HelperText>
              <Button
                mode="outlined"
                icon="plus"
                onPress={() => drawerNavigation.navigate('SuppliersDrawer', { screen: 'SupplierForm', initial: false })}
              >
                Crear proveedor
              </Button>
            </View>
          ) : null}
        </View>
      ) : null}

      {step === 1 ? (
        <View>
          <Text variant="titleMedium">Productos comprados</Text>
          {hasPrefilledLines ? (
            <HelperText type="info" visible>
              Cantidades sugeridas según tu ritmo de venta. Ajusta la cantidad y el costo a lo que realmente compraste.
            </HelperText>
          ) : null}
          {lines.map((line, index) => (
            <SaleLineFields
              key={line.key}
              line={line}
              index={index}
              mode="purchase"
              products={productList}
              showErrors={showErrors}
              canRemove={lines.length > 1}
              onChange={(patch) => updateLine(line.key, patch)}
              onRemove={() => removeLine(line.key)}
            />
          ))}
          <Button mode="outlined" icon="plus" onPress={addLine} style={styles.addLine}>
            Agregar línea
          </Button>
        </View>
      ) : null}

      {step === LAST_STEP ? (
        <View>
          <Text variant="titleMedium">Revisa tu compra</Text>
          <SummaryRow label="Proveedor" value={supplier ? supplier.razonSocial : '—'} />
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

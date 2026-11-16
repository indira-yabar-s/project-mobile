import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, FAB, IconButton, Text, useTheme } from 'react-native-paper';
import { Badge } from '../components/Badge';
import { DataList } from '../components/DataList';
import { ErrorState } from '../components/ErrorState';
import { ScreenContainer } from '../components/ScreenContainer';
import { SortChips } from '../components/SortChips';
import { StockAdjustDialog } from '../components/StockAdjustDialog';
import { StockEntryDialog } from '../components/StockEntryDialog';
import { VariantEditDialog } from '../components/VariantEditDialog';
import { VariantForm } from '../components/VariantForm';
import { useFetch } from '../hooks/useFetch';
import { usePagination, type FetchPageArgs } from '../hooks/usePagination';
import { useSnackbar } from '../hooks/useSnackbar';
import { useSort } from '../hooks/useSort';
import { productService } from '../services/productService';
import { stockService } from '../services/stockService';
import { variantService } from '../services/variantService';
import type { ProductsStackParamList } from '../types/navigation';
import type { ProductVariant, VariantPayload } from '../types/products';
import { getErrorMessage } from '../utils/errors';

type Props = NativeStackScreenProps<ProductsStackParamList, 'ProductVariants'>;

type SortField = 'id' | 'talla' | 'color' | 'stock';

const SORT_LABELS: Record<SortField, string> = {
  id: 'Recientes',
  talla: 'Talla',
  color: 'Color',
  stock: 'Stock',
};

export function ProductVariantsScreen({ route }: Props) {
  const { id } = route.params;
  const { showMessage } = useSnackbar();
  const theme = useTheme();
  const { field, direction, sort, toggle } = useSort<SortField>('id');
  const [isCreating, setIsCreating] = useState(false);
  const [variantForStock, setVariantForStock] = useState<ProductVariant | null>(null);
  const [variantForAdjust, setVariantForAdjust] = useState<ProductVariant | null>(null);
  const [variantForEdit, setVariantForEdit] = useState<ProductVariant | null>(null);

  const product = useFetch(useCallback((signal: AbortSignal) => productService.getById(id, signal), [id]));

  const fetchPage = useCallback(
    ({ page, size, signal }: FetchPageArgs) => variantService.getByProduct(id, { page, size, sort }, signal),
    [id, sort],
  );
  const pagination = usePagination(fetchPage);
  const { refresh } = pagination;

  const productName = product.data?.nombre ?? 'Producto';

  const handleCreateVariant = async (values: {
    talla: string;
    color: string;
    sku: string | null;
    stockMinimo: number;
    stockInicial: number;
  }) => {
    let created: ProductVariant;
    try {
      created = await variantService.create(id, {
        talla: values.talla,
        color: values.color,
        sku: values.sku,
        stockMinimo: values.stockMinimo,
      });
    } catch (error) {
      showMessage(getErrorMessage(error) ?? 'No se pudo crear la variante', 'error');
      return false;
    }

    if (values.stockInicial > 0) {
      try {
        await stockService.registerInbound({
          varianteId: created.id,
          cantidad: values.stockInicial,
          motivo: 'Stock inicial',
        });
        showMessage(`Variante creada con ${values.stockInicial} unidades de stock`, 'success');
      } catch (error) {
        showMessage(
          `La variante se creó, pero no se pudo registrar el stock: ${getErrorMessage(error) ?? 'error inesperado'}`,
          'error',
        );
      }
    } else {
      showMessage('Variante creada correctamente', 'success');
    }

    setIsCreating(false);
    refresh();
    return true;
  };

  const handleStockEntry = async ({ cantidad, motivo }: { cantidad: number; motivo: string | null }) => {
    if (!variantForStock) return;
    try {
      const movement = await stockService.registerInbound({ varianteId: variantForStock.id, cantidad, motivo });
      showMessage(`Entrada registrada. Nuevo stock: ${movement.stockResultante}`, 'success');
      setVariantForStock(null);
      refresh();
    } catch (error) {
      showMessage(getErrorMessage(error) ?? 'No se pudo registrar la entrada', 'error');
    }
  };

  const handleStockAdjust = async ({ nuevoStock, motivo }: { nuevoStock: number; motivo: string | null }) => {
    if (!variantForAdjust) return;
    try {
      const movement = await stockService.registerAdjustment({ varianteId: variantForAdjust.id, nuevoStock, motivo });
      showMessage(`Stock corregido. Nuevo stock: ${movement.stockResultante ?? nuevoStock}`, 'success');
      setVariantForAdjust(null);
      refresh();
    } catch (error) {
      showMessage(getErrorMessage(error) ?? 'No se pudo corregir el stock', 'error');
    }
  };

  const handleVariantEdit = async (payload: VariantPayload) => {
    if (!variantForEdit) return;
    try {
      await variantService.update(variantForEdit.id, payload);
      showMessage('Variante actualizada correctamente', 'success');
      setVariantForEdit(null);
      refresh();
    } catch (error) {
      showMessage(getErrorMessage(error) ?? 'No se pudo actualizar la variante', 'error');
    }
  };

  if (product.error) {
    return (
      <ScreenContainer>
        <ErrorState
          message={getErrorMessage(product.error) ?? 'Ocurrió un error inesperado'}
          onRetry={product.refetch}
        />
      </ScreenContainer>
    );
  }

  const header = (
    <View>
      <Text variant="titleMedium" style={styles.title}>
        {`Variantes de ${productName}`}
      </Text>
      <SortChips labels={SORT_LABELS} field={field} direction={direction} onChange={toggle} />
    </View>
  );

  const renderItem = (variant: ProductVariant) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.titleRow}>
          <View style={styles.titleInfo}>
            <Text variant="titleMedium">{`Talla ${variant.talla} · ${variant.color}`}</Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {`SKU: ${variant.sku ?? '—'}`}
            </Text>
          </View>
          {variant.stockBajo ? <Badge variant="warning">Stock bajo</Badge> : <Badge variant="success">OK</Badge>}
        </View>
        <Text variant="bodyMedium" style={styles.stock}>
          {`Stock: ${variant.stock} · Mínimo: ${variant.stockMinimo}`}
        </Text>
        <View style={styles.actions}>
          <IconButton
            icon="package-variant-plus"
            accessibilityLabel={`Registrar entrada de stock para talla ${variant.talla} ${variant.color}`}
            onPress={() => setVariantForStock(variant)}
          />
          <IconButton
            icon="tune-variant"
            accessibilityLabel={`Corregir stock de talla ${variant.talla} ${variant.color}`}
            onPress={() => setVariantForAdjust(variant)}
          />
          <IconButton
            icon="pencil-outline"
            accessibilityLabel={`Editar variante talla ${variant.talla} ${variant.color}`}
            onPress={() => setVariantForEdit(variant)}
          />
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <ScreenContainer>
      <DataList
        pagination={pagination}
        header={header}
        renderItem={renderItem}
        keyExtractor={(variant) => String(variant.id)}
        emptyTitle="Este producto aún no tiene variantes"
        emptyDescription="Agrega al menos una talla y color para poder registrar stock y vender."
      />
      <FAB icon="plus" label="Variante" onPress={() => setIsCreating(true)} style={styles.fab} />

      <VariantForm visible={isCreating} onSubmit={handleCreateVariant} onCancel={() => setIsCreating(false)} />
      <StockEntryDialog variant={variantForStock} onSubmit={handleStockEntry} onCancel={() => setVariantForStock(null)} />
      <StockAdjustDialog
        variant={variantForAdjust}
        onSubmit={handleStockAdjust}
        onCancel={() => setVariantForAdjust(null)}
      />
      <VariantEditDialog variant={variantForEdit} onSubmit={handleVariantEdit} onCancel={() => setVariantForEdit(null)} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { paddingHorizontal: 16, paddingTop: 12 },
  card: { marginHorizontal: 16, marginTop: 12 },
  titleRow: { alignItems: 'flex-start', flexDirection: 'row', gap: 8, justifyContent: 'space-between' },
  titleInfo: { flex: 1 },
  stock: { marginTop: 8 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 4 },
  fab: { bottom: 16, position: 'absolute', right: 16 },
});

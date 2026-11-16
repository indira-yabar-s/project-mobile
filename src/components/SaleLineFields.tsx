import { useNavigation, type NavigationProp } from '@react-navigation/native';
import { useCallback, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Card, HelperText, IconButton, Text, TextInput, useTheme } from 'react-native-paper';
import { useFetch } from '../hooks/useFetch';
import { variantService } from '../services/variantService';
import type { MainTabsParamList } from '../types/navigation';
import type { Product, ProductVariant } from '../types/products';
import { getErrorMessage } from '../utils/errors';
import { formatCurrency } from '../utils/format';
import { getLineSubtotal, validateLine, type OrderLine, type OrderMode } from '../utils/orderLines';
import { SelectField } from './SelectField';

interface SaleLineFieldsProps {
  line: OrderLine;
  index: number;
  products: Product[];
  mode?: OrderMode;
  showErrors: boolean;
  canRemove: boolean;
  onChange: (patch: Partial<Omit<OrderLine, 'key'>>) => void;
  onRemove: () => void;
  onScan?: () => void;
}

export function SaleLineFields({
  line,
  index,
  products,
  mode = 'sale',
  showErrors,
  canRemove,
  onChange,
  onRemove,
  onScan,
}: SaleLineFieldsProps) {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp<MainTabsParamList>>();
  const isSale = mode === 'sale';
  const { productoId } = line;

  const variants = useFetch(
    useCallback(
      (signal: AbortSignal) =>
        productoId
          ? variantService.getByProduct(Number(productoId), { size: 100 }, signal)
          : Promise.resolve(null),
      [productoId],
    ),
  );

  const variantList: ProductVariant[] = useMemo(
    () => (variants.isLoading ? [] : (variants.data?.content ?? [])),
    [variants.isLoading, variants.data],
  );
  const errors = showErrors ? validateLine(line, mode) : {};
  const hasNoVariants = Boolean(productoId) && !variants.isLoading && variants.data !== null && variantList.length === 0;

  const productOptions = products.map((product) => ({ value: String(product.id), label: product.nombre }));

  const stockLabel = (variant: ProductVariant) => {
    if (variant.stock > 0) return `stock ${variant.stock}`;
    return isSale ? 'agotado' : 'sin stock';
  };

  const variantOptions = variantList.map((variant) => ({
    value: String(variant.id),
    label: `Talla ${variant.talla} · ${variant.color} (${stockLabel(variant)})`,
    disabled: isSale && variant.stock <= 0,
  }));

  const handleProductChange = (value: string) => {
    const product = products.find((item) => String(item.id) === value);
    const suggested = isSale ? product?.precioVenta : product?.precioCompra;
    onChange({
      productoId: value,
      varianteId: '',
      stock: null,
      precioUnitario: suggested !== undefined && suggested !== null ? String(suggested) : '',
    });
  };

  const handleVariantChange = (value: string) => {
    const variant = variantList.find((item) => String(item.id) === value);
    onChange({ varianteId: value, stock: variant ? variant.stock : null });
  };

  return (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.header}>
          <Text variant="titleSmall">{`Línea ${index + 1}`}</Text>
          <View style={styles.headerActions}>
            {onScan ? (
              <IconButton
                icon="barcode-scan"
                accessibilityLabel={`Escanear producto para la línea ${index + 1}`}
                onPress={onScan}
                style={styles.remove}
              />
            ) : null}
          {canRemove ? (
            <IconButton
              icon="trash-can-outline"
              iconColor={theme.colors.error}
              accessibilityLabel={`Quitar línea ${index + 1}`}
              onPress={onRemove}
              style={styles.remove}
            />
          ) : null}
          </View>
        </View>

        <SelectField
          label="Producto"
          value={line.productoId}
          options={productOptions}
          placeholder="Selecciona..."
          error={errors.productoId}
          onChange={handleProductChange}
        />
        <SelectField
          label="Variante"
          value={line.varianteId}
          options={variantOptions}
          placeholder="Selecciona..."
          disabled={!productoId}
          isLoading={variants.isLoading && Boolean(productoId)}
          error={errors.varianteId ?? (variants.error ? (getErrorMessage(variants.error) ?? undefined) : undefined)}
          onChange={handleVariantChange}
        />

        {hasNoVariants ? (
          <View style={styles.noVariants}>
            <Text variant="bodySmall" style={{ color: theme.colors.tertiary }}>
              Este producto no tiene variantes.
            </Text>
            <Button
              compact
              mode="text"
              onPress={() =>
                navigation.navigate('ProductsTab', {
                  screen: 'ProductVariants',
                  params: { id: Number(productoId) },
                })
              }
            >
              Agrégalas aquí
            </Button>
          </View>
        ) : null}

        <View style={styles.row}>
          <View style={styles.rowItem}>
            <TextInput
              mode="outlined"
              label="Cantidad"
              value={line.cantidad}
              onChangeText={(cantidad) => onChange({ cantidad })}
              keyboardType="number-pad"
              error={Boolean(errors.cantidad)}
            />
            <HelperText type="error" visible={Boolean(errors.cantidad)}>
              {errors.cantidad}
            </HelperText>
          </View>
          <View style={styles.rowItem}>
            <TextInput
              mode="outlined"
              label={isSale ? 'Precio (S/)' : 'Costo (S/)'}
              value={line.precioUnitario}
              onChangeText={(precioUnitario) => onChange({ precioUnitario })}
              keyboardType="decimal-pad"
              error={Boolean(errors.precioUnitario)}
            />
            <HelperText type="error" visible={Boolean(errors.precioUnitario)}>
              {errors.precioUnitario}
            </HelperText>
          </View>
        </View>

        <Text variant="titleSmall" style={styles.subtotal}>
          {`Subtotal: ${formatCurrency(getLineSubtotal(line))}`}
        </Text>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginTop: 12 },
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  headerActions: { flexDirection: 'row' },
  remove: { margin: 0 },
  noVariants: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap' },
  row: { flexDirection: 'row', gap: 12 },
  rowItem: { flex: 1 },
  subtotal: { textAlign: 'right' },
});

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Card, FAB, IconButton, Text, useTheme } from 'react-native-paper';
import { Badge } from '../components/Badge';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { DataList } from '../components/DataList';
import { FilterChips } from '../components/FilterChips';
import { PriceDialog } from '../components/PriceDialog';
import { ScreenContainer } from '../components/ScreenContainer';
import { SearchInput } from '../components/SearchInput';
import { useAuth } from '../hooks/useAuth';
import { useDebounce } from '../hooks/useDebounce';
import { usePagination, type FetchPageArgs } from '../hooks/usePagination';
import { useRefreshOnFocus } from '../hooks/useRefreshOnFocus';
import { useSnackbar } from '../hooks/useSnackbar';
import { productService } from '../services/productService';
import type { ProductsStackParamList } from '../types/navigation';
import type { Product } from '../types/products';
import { getErrorMessage } from '../utils/errors';
import { formatCurrency } from '../utils/format';

type Props = NativeStackScreenProps<ProductsStackParamList, 'ProductsList'>;

type SortField = 'codigo' | 'nombre' | 'precioVenta';
type SortDirection = 'asc' | 'desc';

const SORT_LABELS: Record<SortField, string> = {
  nombre: 'Nombre',
  codigo: 'Código',
  precioVenta: 'Precio',
};

const STATUS_OPTIONS = [
  { value: 'activos', label: 'Activos' },
  { value: 'todos', label: 'Todos' },
];

export function ProductsScreen({ navigation }: Props) {
  const { isAdmin } = useAuth();
  const { showMessage } = useSnackbar();
  const theme = useTheme();
  const [search, setSearch] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [sortField, setSortField] = useState<SortField>('nombre');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [productToDeactivate, setProductToDeactivate] = useState<Product | null>(null);
  const [productToReprice, setProductToReprice] = useState<Product | null>(null);
  const [isDeactivating, setIsDeactivating] = useState(false);

  const searchTerm = useDebounce(search, 300).trim();
  const sort = `${sortField},${sortDirection}`;

  const fetchPage = useCallback(
    ({ page, size, signal }: FetchPageArgs) =>
      productService.getAll({ page, size, sort, soloActivos: !showInactive, search: searchTerm }, signal),
    [sort, showInactive, searchTerm],
  );
  const pagination = usePagination(fetchPage);
  const { refresh } = pagination;

  useRefreshOnFocus(refresh);

  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection((direction) => (direction === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field as SortField);
      setSortDirection('asc');
    }
  };

  const sortOptions = (Object.keys(SORT_LABELS) as SortField[]).map((field) => ({
    value: field,
    label: field === sortField ? `${SORT_LABELS[field]} ${sortDirection === 'asc' ? '↑' : '↓'}` : SORT_LABELS[field],
  }));

  const handleConfirmDeactivate = async () => {
    if (!productToDeactivate) return;
    setIsDeactivating(true);
    try {
      await productService.deactivate(productToDeactivate.id);
      showMessage(`"${productToDeactivate.nombre}" fue desactivado`, 'success');
      setProductToDeactivate(null);
      refresh();
    } catch (error) {
      showMessage(getErrorMessage(error) ?? 'No se pudo desactivar el producto', 'error');
    } finally {
      setIsDeactivating(false);
    }
  };

  const handleReprice = async (precioVenta: number) => {
    if (!productToReprice) return;
    try {
      await productService.patch(productToReprice.id, { precioVenta });
      showMessage(`Precio de "${productToReprice.nombre}" actualizado`, 'success');
      setProductToReprice(null);
      refresh();
    } catch (error) {
      showMessage(getErrorMessage(error) ?? 'No se pudo actualizar el precio', 'error');
    }
  };

  const goToCreate = () => navigation.navigate('ProductForm');

  const header = (
    <View>
      <SearchInput value={search} onChange={setSearch} placeholder="Buscar por código o nombre" />
      <FilterChips
        label="Filtrar por estado"
        options={STATUS_OPTIONS}
        value={showInactive ? 'todos' : 'activos'}
        onChange={(value) => setShowInactive(value === 'todos')}
      />
      <FilterChips label="Ordenar por" options={sortOptions} value={sortField} onChange={handleSort} />
    </View>
  );

  const renderItem = (product: Product) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.titleRow}>
          <View style={styles.titleInfo}>
            <Text variant="titleMedium">{product.nombre}</Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {`${product.codigo} · ${product.categoriaNombre ?? 'Sin categoría'}`}
            </Text>
          </View>
          <Badge variant={product.activo ? 'success' : 'neutral'}>{product.activo ? 'Activo' : 'Inactivo'}</Badge>
        </View>
        <View style={styles.metrics}>
          <Text variant="titleSmall">{formatCurrency(product.precioVenta)}</Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            {`Stock: ${product.stockTotal ?? 0}`}
          </Text>
        </View>
        <View style={styles.actions}>
          <IconButton
            icon="layers-outline"
            accessibilityLabel={`Variantes y stock de ${product.nombre}`}
            onPress={() => navigation.navigate('ProductVariants', { id: product.id })}
          />
          <IconButton
            icon="cash"
            accessibilityLabel={`Cambiar precio de ${product.nombre}`}
            onPress={() => setProductToReprice(product)}
          />
          <IconButton
            icon="pencil-outline"
            accessibilityLabel={`Editar ${product.nombre}`}
            onPress={() => navigation.navigate('ProductForm', { id: product.id })}
          />
          {isAdmin && product.activo ? (
            <IconButton
              icon="cancel"
              iconColor={theme.colors.error}
              accessibilityLabel={`Desactivar ${product.nombre}`}
              onPress={() => setProductToDeactivate(product)}
            />
          ) : null}
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
        keyExtractor={(product) => String(product.id)}
        emptyTitle={searchTerm ? 'Sin resultados' : 'Aún no tienes productos'}
        emptyDescription={
          searchTerm
            ? `No encontramos productos que coincidan con "${searchTerm}".`
            : 'Registra tu primer producto para empezar a controlar tu inventario.'
        }
        emptyAction={
          searchTerm ? undefined : (
            <Button mode="contained" onPress={goToCreate}>
              Crear producto
            </Button>
          )
        }
      />
      <FAB icon="plus" label="Nuevo" onPress={goToCreate} style={styles.fab} />

      <ConfirmDialog
        visible={Boolean(productToDeactivate)}
        title="Desactivar producto"
        message={`¿Seguro que quieres desactivar "${productToDeactivate?.nombre ?? ''}"? Dejará de aparecer en tus listados activos, pero conservarás su historial.`}
        confirmLabel="Desactivar"
        isLoading={isDeactivating}
        onConfirm={handleConfirmDeactivate}
        onCancel={() => setProductToDeactivate(null)}
      />
      <PriceDialog product={productToReprice} onSubmit={handleReprice} onCancel={() => setProductToReprice(null)} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: { marginHorizontal: 16, marginTop: 12 },
  titleRow: { alignItems: 'flex-start', flexDirection: 'row', gap: 8, justifyContent: 'space-between' },
  titleInfo: { flex: 1 },
  metrics: { alignItems: 'center', flexDirection: 'row', gap: 16, marginTop: 8 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 4 },
  fab: { bottom: 16, position: 'absolute', right: 16 },
});

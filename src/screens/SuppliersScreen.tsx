import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Card, FAB, Text, useTheme } from 'react-native-paper';
import { DataList } from '../components/DataList';
import { ScreenContainer } from '../components/ScreenContainer';
import { SearchInput } from '../components/SearchInput';
import { SortChips } from '../components/SortChips';
import { useDebounce } from '../hooks/useDebounce';
import { usePagination, type FetchPageArgs } from '../hooks/usePagination';
import { useRefreshOnFocus } from '../hooks/useRefreshOnFocus';
import { useSort } from '../hooks/useSort';
import { supplierService } from '../services/supplierService';
import type { SuppliersStackParamList } from '../types/navigation';
import type { Supplier } from '../types/purchases';

type Props = NativeStackScreenProps<SuppliersStackParamList, 'SuppliersList'>;

type SortField = 'razonSocial' | 'ruc';

const SORT_LABELS: Record<SortField, string> = {
  razonSocial: 'Razón social',
  ruc: 'RUC',
};

export function SuppliersScreen({ navigation }: Props) {
  const theme = useTheme();
  const [search, setSearch] = useState('');
  const { field, direction, sort, toggle } = useSort<SortField>('razonSocial');

  const searchTerm = useDebounce(search, 300).trim();

  const fetchPage = useCallback(
    ({ page, size, signal }: FetchPageArgs) => supplierService.getAll({ page, size, sort, search: searchTerm }, signal),
    [sort, searchTerm],
  );
  const pagination = usePagination(fetchPage);
  const { refresh } = pagination;

  useRefreshOnFocus(refresh);

  const goToCreate = () => navigation.navigate('SupplierForm');

  const header = (
    <View>
      <SearchInput value={search} onChange={setSearch} placeholder="Buscar por razón social o RUC" />
      <SortChips labels={SORT_LABELS} field={field} direction={direction} onChange={toggle} />
    </View>
  );

  const renderItem = (supplier: Supplier) => (
    <Card style={styles.card}>
      <Card.Content>
        <Text variant="titleMedium">{supplier.razonSocial}</Text>
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
          {`RUC ${supplier.ruc}`}
        </Text>
        <Text variant="bodyMedium" style={[styles.detail, { color: theme.colors.onSurfaceVariant }]}>
          {`Teléfono: ${supplier.telefono ?? '—'}`}
        </Text>
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
          {`Correo: ${supplier.correo ?? '—'}`}
        </Text>
      </Card.Content>
    </Card>
  );

  return (
    <ScreenContainer>
      <DataList
        pagination={pagination}
        header={header}
        renderItem={renderItem}
        keyExtractor={(supplier) => String(supplier.id)}
        emptyTitle={searchTerm ? 'Sin resultados' : 'Aún no tienes proveedores'}
        emptyDescription={
          searchTerm
            ? `No encontramos proveedores que coincidan con "${searchTerm}".`
            : 'Registra a tus proveedores para asociarlos a tus compras.'
        }
        emptyAction={
          searchTerm ? undefined : (
            <Button mode="contained" onPress={goToCreate}>
              Crear proveedor
            </Button>
          )
        }
      />
      <FAB icon="plus" label="Nuevo" onPress={goToCreate} style={styles.fab} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: { marginHorizontal: 16, marginTop: 12 },
  detail: { marginTop: 8 },
  fab: { bottom: 16, position: 'absolute', right: 16 },
});

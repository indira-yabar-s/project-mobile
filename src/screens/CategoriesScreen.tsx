import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Card, FAB, IconButton, Text, useTheme } from 'react-native-paper';
import { Badge } from '../components/Badge';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { DataList } from '../components/DataList';
import { ScreenContainer } from '../components/ScreenContainer';
import { SearchInput } from '../components/SearchInput';
import { SortChips } from '../components/SortChips';
import { useAuth } from '../hooks/useAuth';
import { useDebounce } from '../hooks/useDebounce';
import { usePagination, type FetchPageArgs } from '../hooks/usePagination';
import { useRefreshOnFocus } from '../hooks/useRefreshOnFocus';
import { useSnackbar } from '../hooks/useSnackbar';
import { useSort } from '../hooks/useSort';
import { categoryService } from '../services/categoryService';
import type { CategoriesStackParamList } from '../types/navigation';
import type { Category } from '../types/products';
import { getErrorMessage } from '../utils/errors';

type Props = NativeStackScreenProps<CategoriesStackParamList, 'CategoriesList'>;

type SortField = 'nombre';

const SORT_LABELS: Record<SortField, string> = {
  nombre: 'Nombre',
};

export function CategoriesScreen({ navigation }: Props) {
  const { isAdmin } = useAuth();
  const { showMessage } = useSnackbar();
  const theme = useTheme();
  const [search, setSearch] = useState('');
  const [categoryToDeactivate, setCategoryToDeactivate] = useState<Category | null>(null);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const { field, direction, sort, toggle } = useSort<SortField>('nombre');

  const searchTerm = useDebounce(search, 300).trim();

  const fetchPage = useCallback(
    ({ page, size, signal }: FetchPageArgs) => categoryService.getPage({ page, size, sort, search: searchTerm }, signal),
    [sort, searchTerm],
  );
  const pagination = usePagination(fetchPage);
  const { refresh } = pagination;

  useRefreshOnFocus(refresh);

  const handleConfirmDeactivate = async () => {
    if (!categoryToDeactivate) return;
    setIsDeactivating(true);
    try {
      await categoryService.deactivate(categoryToDeactivate.id);
      showMessage(`"${categoryToDeactivate.nombre}" fue desactivada`, 'success');
      setCategoryToDeactivate(null);
      refresh();
    } catch (error) {
      showMessage(getErrorMessage(error) ?? 'No se pudo desactivar la categoría', 'error');
    } finally {
      setIsDeactivating(false);
    }
  };

  const goToCreate = () => navigation.navigate('CategoryForm');

  const header = (
    <View>
      <SearchInput value={search} onChange={setSearch} placeholder="Buscar por nombre" />
      <SortChips labels={SORT_LABELS} field={field} direction={direction} onChange={toggle} />
    </View>
  );

  const renderItem = (category: Category) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.titleRow}>
          <View style={styles.titleInfo}>
            <Text variant="titleMedium">{category.nombre}</Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              {category.descripcion ?? '—'}
            </Text>
          </View>
          <Badge variant={category.activo ? 'success' : 'neutral'}>{category.activo ? 'Activa' : 'Inactiva'}</Badge>
        </View>
        <View style={styles.actions}>
          <IconButton
            icon="pencil-outline"
            accessibilityLabel={`Editar ${category.nombre}`}
            onPress={() => navigation.navigate('CategoryForm', { id: category.id })}
          />
          {isAdmin && category.activo ? (
            <IconButton
              icon="cancel"
              iconColor={theme.colors.error}
              accessibilityLabel={`Desactivar ${category.nombre}`}
              onPress={() => setCategoryToDeactivate(category)}
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
        keyExtractor={(category) => String(category.id)}
        emptyTitle={searchTerm ? 'Sin resultados' : 'Aún no tienes categorías'}
        emptyDescription={
          searchTerm
            ? `No encontramos categorías que coincidan con "${searchTerm}".`
            : 'Crea categorías para ordenar tus productos y ver reportes por categoría.'
        }
        emptyAction={
          searchTerm ? undefined : (
            <Button mode="contained" onPress={goToCreate}>
              Crear categoría
            </Button>
          )
        }
      />
      <FAB icon="plus" label="Nueva" onPress={goToCreate} style={styles.fab} />

      <ConfirmDialog
        visible={Boolean(categoryToDeactivate)}
        title="Desactivar categoría"
        message={`¿Desactivar "${categoryToDeactivate?.nombre ?? ''}"? Ya no aparecerá al crear productos nuevos y no se puede volver a activar. Los productos que ya la usan la conservan.`}
        confirmLabel="Desactivar"
        isLoading={isDeactivating}
        onConfirm={handleConfirmDeactivate}
        onCancel={() => setCategoryToDeactivate(null)}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: { marginHorizontal: 16, marginTop: 12 },
  titleRow: { alignItems: 'flex-start', flexDirection: 'row', gap: 8, justifyContent: 'space-between' },
  titleInfo: { flex: 1 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 4 },
  fab: { bottom: 16, position: 'absolute', right: 16 },
});

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
import { clientService } from '../services/clientService';
import type { Client } from '../types/clients';
import type { ClientsStackParamList } from '../types/navigation';
import { getErrorMessage } from '../utils/errors';

type Props = NativeStackScreenProps<ClientsStackParamList, 'ClientsList'>;

type SortField = 'nombre' | 'documento';

const SORT_LABELS: Record<SortField, string> = {
  nombre: 'Nombre',
  documento: 'Documento',
};

export function ClientsScreen({ navigation }: Props) {
  const { isAdmin } = useAuth();
  const { showMessage } = useSnackbar();
  const theme = useTheme();
  const [search, setSearch] = useState('');
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { field, direction, sort, toggle } = useSort<SortField>('nombre');

  const searchTerm = useDebounce(search, 300).trim();

  const fetchPage = useCallback(
    ({ page, size, signal }: FetchPageArgs) => clientService.getAll({ page, size, sort, search: searchTerm }, signal),
    [sort, searchTerm],
  );
  const pagination = usePagination(fetchPage);
  const { refresh } = pagination;

  useRefreshOnFocus(refresh);

  const handleConfirmDelete = async () => {
    if (!clientToDelete) return;
    setIsDeleting(true);
    try {
      await clientService.remove(clientToDelete.id);
      showMessage(`"${clientToDelete.nombre}" fue eliminado`, 'success');
      setClientToDelete(null);
      refresh();
    } catch (error) {
      showMessage(getErrorMessage(error) ?? 'No se pudo eliminar el cliente', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const goToCreate = () => navigation.navigate('ClientForm');

  const header = (
    <View>
      <SearchInput value={search} onChange={setSearch} placeholder="Buscar por nombre o documento" />
      <SortChips labels={SORT_LABELS} field={field} direction={direction} onChange={toggle} />
    </View>
  );

  const renderItem = (client: Client) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.titleRow}>
          <View style={styles.titleInfo}>
            <Text variant="titleMedium">{client.nombre}</Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {client.documento}
            </Text>
          </View>
          <Badge>{client.documento.length === 11 ? 'RUC' : 'DNI'}</Badge>
        </View>
        <Text variant="bodyMedium" style={[styles.detail, { color: theme.colors.onSurfaceVariant }]}>
          {`Teléfono: ${client.telefono ?? '—'}`}
        </Text>
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
          {`Correo: ${client.correo ?? '—'}`}
        </Text>
        <View style={styles.actions}>
          <IconButton
            icon="pencil-outline"
            accessibilityLabel={`Editar ${client.nombre}`}
            onPress={() => navigation.navigate('ClientForm', { id: client.id })}
          />
          {isAdmin ? (
            <IconButton
              icon="trash-can-outline"
              iconColor={theme.colors.error}
              accessibilityLabel={`Eliminar ${client.nombre}`}
              onPress={() => setClientToDelete(client)}
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
        keyExtractor={(client) => String(client.id)}
        emptyTitle={searchTerm ? 'Sin resultados' : 'Aún no tienes clientes'}
        emptyDescription={
          searchTerm
            ? `No encontramos clientes que coincidan con "${searchTerm}".`
            : 'Registra a tus clientes para asociarlos a tus ventas.'
        }
        emptyAction={
          searchTerm ? undefined : (
            <Button mode="contained" onPress={goToCreate}>
              Crear cliente
            </Button>
          )
        }
      />
      <FAB icon="plus" label="Nuevo" onPress={goToCreate} style={styles.fab} />

      <ConfirmDialog
        visible={Boolean(clientToDelete)}
        title="Eliminar cliente"
        message={`¿Seguro que quieres eliminar a "${clientToDelete?.nombre ?? ''}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setClientToDelete(null)}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: { marginHorizontal: 16, marginTop: 12 },
  titleRow: { alignItems: 'flex-start', flexDirection: 'row', gap: 8, justifyContent: 'space-between' },
  titleInfo: { flex: 1 },
  detail: { marginTop: 8 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 4 },
  fab: { bottom: 16, position: 'absolute', right: 16 },
});

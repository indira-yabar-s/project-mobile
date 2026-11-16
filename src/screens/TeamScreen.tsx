import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, FAB, IconButton, Text, useTheme } from 'react-native-paper';
import { Badge } from '../components/Badge';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { DataList } from '../components/DataList';
import { EmployeeDialog } from '../components/EmployeeDialog';
import { ScreenContainer } from '../components/ScreenContainer';
import { useAuth } from '../hooks/useAuth';
import { usePagination, type FetchPageArgs } from '../hooks/usePagination';
import { useRefreshOnFocus } from '../hooks/useRefreshOnFocus';
import { useSnackbar } from '../hooks/useSnackbar';
import { userService } from '../services/userService';
import type { EmployeePayload, User } from '../types/api';
import { getErrorMessage } from '../utils/errors';

export function TeamScreen() {
  const { user } = useAuth();
  const { showMessage } = useSnackbar();
  const theme = useTheme();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<User | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  const fetchPage = useCallback(
    ({ page, size, signal }: FetchPageArgs) => userService.getAll({ page, size }, signal),
    [],
  );
  const pagination = usePagination(fetchPage);
  const { refresh } = pagination;

  useRefreshOnFocus(refresh);

  const handleCreate = async (payload: EmployeePayload) => {
    try {
      await userService.createEmployee(payload);
      showMessage('Empleado agregado a tu equipo', 'success');
      setIsFormOpen(false);
      refresh();
    } catch (error) {
      showMessage(getErrorMessage(error) ?? 'No se pudo crear el empleado', 'error');
    }
  };

  const handleConfirmRemove = async () => {
    if (!memberToRemove) return;
    setIsRemoving(true);
    try {
      await userService.remove(memberToRemove.id);
      showMessage(`${memberToRemove.nombre} ya no tiene acceso`, 'success');
      setMemberToRemove(null);
      refresh();
    } catch (error) {
      showMessage(getErrorMessage(error) ?? 'No se pudo quitar el acceso', 'error');
    } finally {
      setIsRemoving(false);
    }
  };

  const header = (
    <Text variant="bodyMedium" style={[styles.intro, { color: theme.colors.onSurfaceVariant }]}>
      Como administrador, tú creas las cuentas de tus empleados. Ellos entran con su correo y pueden registrar ventas,
      compras y productos; los reportes y el equipo quedan solo para ti.
    </Text>
  );

  const renderItem = (member: User) => {
    const isAdminMember = member.role === 'ADMIN';
    const canRemove = member.id !== user?.id && !isAdminMember;

    return (
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.titleRow}>
            <View style={styles.titleInfo}>
              <Text variant="titleMedium">{member.nombre}</Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                {member.email}
              </Text>
            </View>
            <Badge variant={isAdminMember ? 'success' : 'neutral'}>{isAdminMember ? 'Administrador' : 'Empleado'}</Badge>
          </View>
          {canRemove ? (
            <View style={styles.actions}>
              <IconButton
                icon="trash-can-outline"
                iconColor={theme.colors.error}
                accessibilityLabel={`Quitar acceso a ${member.nombre}`}
                onPress={() => setMemberToRemove(member)}
              />
            </View>
          ) : null}
        </Card.Content>
      </Card>
    );
  };

  return (
    <ScreenContainer>
      <DataList
        pagination={pagination}
        header={header}
        renderItem={renderItem}
        keyExtractor={(member) => String(member.id)}
        emptyTitle="Aún no hay nadie en tu equipo"
      />
      <FAB icon="account-plus-outline" label="Agregar" onPress={() => setIsFormOpen(true)} style={styles.fab} />

      <EmployeeDialog visible={isFormOpen} onSubmit={handleCreate} onCancel={() => setIsFormOpen(false)} />

      <ConfirmDialog
        visible={Boolean(memberToRemove)}
        title="Quitar acceso"
        message={`¿Seguro que quieres quitar el acceso a "${memberToRemove?.nombre ?? ''}"? Ya no podrá iniciar sesión.`}
        confirmLabel="Quitar acceso"
        isLoading={isRemoving}
        onConfirm={handleConfirmRemove}
        onCancel={() => setMemberToRemove(null)}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  intro: { paddingHorizontal: 16, paddingTop: 12 },
  card: { marginHorizontal: 16, marginTop: 12 },
  titleRow: { alignItems: 'flex-start', flexDirection: 'row', gap: 8, justifyContent: 'space-between' },
  titleInfo: { flex: 1 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 4 },
  fab: { bottom: 16, position: 'absolute', right: 16 },
});

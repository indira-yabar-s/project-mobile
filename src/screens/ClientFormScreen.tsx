import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback } from 'react';
import { ClientForm, type ClientFormValues } from '../components/ClientForm';
import { ErrorState } from '../components/ErrorState';
import { FormContainer } from '../components/FormContainer';
import { ScreenContainer } from '../components/ScreenContainer';
import { Spinner } from '../components/Spinner';
import { useFetch } from '../hooks/useFetch';
import { useSnackbar } from '../hooks/useSnackbar';
import { clientService } from '../services/clientService';
import type { Client, ClientPayload } from '../types/clients';
import type { ClientsStackParamList } from '../types/navigation';
import { getErrorMessage } from '../utils/errors';

type Props = NativeStackScreenProps<ClientsStackParamList, 'ClientForm'>;

const EMPTY_VALUES: ClientFormValues = { documento: '', nombre: '', telefono: '', correo: '', direccion: '' };

const toFormValues = (client: Client): ClientFormValues => ({
  documento: client.documento,
  nombre: client.nombre,
  telefono: client.telefono ?? '',
  correo: client.correo ?? '',
  direccion: client.direccion ?? '',
});

export function ClientFormScreen({ navigation, route }: Props) {
  const id = route.params?.id;
  const isEditing = id !== undefined;
  const { showMessage } = useSnackbar();

  const client = useFetch(
    useCallback(
      (signal: AbortSignal) => (id !== undefined ? clientService.getById(id, signal) : Promise.resolve(null)),
      [id],
    ),
  );

  const handleSubmit = async (payload: ClientPayload) => {
    try {
      if (id !== undefined) {
        await clientService.update(id, payload);
        showMessage('Cliente actualizado correctamente', 'success');
      } else {
        await clientService.create(payload);
        showMessage('Cliente creado correctamente', 'success');
      }
      navigation.goBack();
    } catch (error) {
      showMessage(getErrorMessage(error) ?? 'No se pudo guardar el cliente', 'error');
    }
  };

  if (client.error) {
    return (
      <ScreenContainer>
        <ErrorState message={getErrorMessage(client.error) ?? 'Ocurrió un error inesperado'} onRetry={client.refetch} />
      </ScreenContainer>
    );
  }

  if (client.isLoading) {
    return (
      <ScreenContainer>
        <Spinner fullScreen />
      </ScreenContainer>
    );
  }

  return (
    <FormContainer>
      <ClientForm
        key={client.data?.id ?? 'new'}
        defaultValues={client.data ? toFormValues(client.data) : EMPTY_VALUES}
        onSubmit={handleSubmit}
        onCancel={navigation.goBack}
        submitLabel={isEditing ? 'Guardar cambios' : 'Crear cliente'}
      />
    </FormContainer>
  );
}

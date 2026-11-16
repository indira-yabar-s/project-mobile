import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FormContainer } from '../components/FormContainer';
import { SupplierForm, type SupplierFormValues } from '../components/SupplierForm';
import { useSnackbar } from '../hooks/useSnackbar';
import { supplierService } from '../services/supplierService';
import type { SuppliersStackParamList } from '../types/navigation';
import type { SupplierPayload } from '../types/purchases';
import { getErrorMessage } from '../utils/errors';

type Props = NativeStackScreenProps<SuppliersStackParamList, 'SupplierForm'>;

const EMPTY_VALUES: SupplierFormValues = { ruc: '', razonSocial: '', telefono: '', correo: '' };

export function SupplierFormScreen({ navigation }: Props) {
  const { showMessage } = useSnackbar();

  const handleSubmit = async (payload: SupplierPayload) => {
    try {
      const existing = await supplierService.getAll({ page: 1, size: 100 });
      if (existing.content.some((supplier) => supplier.ruc === payload.ruc)) {
        showMessage('Ya tienes registrado un proveedor con ese RUC', 'error');
        return;
      }
      await supplierService.create(payload);
      showMessage('Proveedor creado correctamente', 'success');
      navigation.goBack();
    } catch (error) {
      showMessage(getErrorMessage(error) ?? 'No se pudo crear el proveedor', 'error');
    }
  };

  return (
    <FormContainer>
      <SupplierForm
        defaultValues={EMPTY_VALUES}
        onSubmit={handleSubmit}
        onCancel={navigation.goBack}
        submitLabel="Crear proveedor"
      />
    </FormContainer>
  );
}

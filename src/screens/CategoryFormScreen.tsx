import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback } from 'react';
import { CategoryForm, type CategoryFormValues } from '../components/CategoryForm';
import { ErrorState } from '../components/ErrorState';
import { FormContainer } from '../components/FormContainer';
import { ScreenContainer } from '../components/ScreenContainer';
import { Spinner } from '../components/Spinner';
import { useFetch } from '../hooks/useFetch';
import { useSnackbar } from '../hooks/useSnackbar';
import { categoryService } from '../services/categoryService';
import type { CategoriesStackParamList } from '../types/navigation';
import type { Category, CategoryPayload } from '../types/products';
import { getErrorMessage } from '../utils/errors';

type Props = NativeStackScreenProps<CategoriesStackParamList, 'CategoryForm'>;

const EMPTY_VALUES: CategoryFormValues = { nombre: '', descripcion: '' };

const toFormValues = (category: Category): CategoryFormValues => ({
  nombre: category.nombre,
  descripcion: category.descripcion ?? '',
});

export function CategoryFormScreen({ navigation, route }: Props) {
  const id = route.params?.id;
  const isEditing = id !== undefined;
  const { showMessage } = useSnackbar();

  const category = useFetch(
    useCallback(
      (signal: AbortSignal) => (id !== undefined ? categoryService.getById(id, signal) : Promise.resolve(null)),
      [id],
    ),
  );

  const handleSubmit = async (payload: CategoryPayload) => {
    try {
      if (id !== undefined) {
        await categoryService.update(id, payload);
        showMessage('Categoría actualizada correctamente', 'success');
      } else {
        await categoryService.create(payload);
        showMessage('Categoría creada correctamente', 'success');
      }
      navigation.goBack();
    } catch (error) {
      showMessage(getErrorMessage(error) ?? 'No se pudo guardar la categoría', 'error');
    }
  };

  if (category.error) {
    return (
      <ScreenContainer>
        <ErrorState message={getErrorMessage(category.error) ?? 'Ocurrió un error inesperado'} onRetry={category.refetch} />
      </ScreenContainer>
    );
  }

  if (category.isLoading) {
    return (
      <ScreenContainer>
        <Spinner fullScreen />
      </ScreenContainer>
    );
  }

  return (
    <FormContainer>
      <CategoryForm
        key={category.data?.id ?? 'new'}
        defaultValues={category.data ? toFormValues(category.data) : EMPTY_VALUES}
        onSubmit={handleSubmit}
        onCancel={navigation.goBack}
        submitLabel={isEditing ? 'Guardar cambios' : 'Crear categoría'}
      />
    </FormContainer>
  );
}

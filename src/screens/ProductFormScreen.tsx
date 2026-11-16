import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback } from 'react';
import { FormContainer } from '../components/FormContainer';
import { ErrorState } from '../components/ErrorState';
import { ProductForm, type ProductFormValues } from '../components/ProductForm';
import { ScreenContainer } from '../components/ScreenContainer';
import { Spinner } from '../components/Spinner';
import { useFetch } from '../hooks/useFetch';
import { useSnackbar } from '../hooks/useSnackbar';
import { categoryService } from '../services/categoryService';
import { productService } from '../services/productService';
import type { ProductsStackParamList } from '../types/navigation';
import type { Product, ProductPayload } from '../types/products';
import { getErrorMessage } from '../utils/errors';

type Props = NativeStackScreenProps<ProductsStackParamList, 'ProductForm'>;

const EMPTY_VALUES: ProductFormValues = {
  codigo: '',
  nombre: '',
  descripcion: '',
  unidadMedida: 'UNIDAD',
  precioCompra: '',
  precioVenta: '',
  categoriaId: '',
};

const toFormValues = (product: Product): ProductFormValues => ({
  codigo: product.codigo,
  nombre: product.nombre,
  descripcion: product.descripcion ?? '',
  unidadMedida: product.unidadMedida ?? 'UNIDAD',
  precioCompra: product.precioCompra === null ? '' : String(product.precioCompra),
  precioVenta: product.precioVenta === null ? '' : String(product.precioVenta),
  categoriaId: product.categoriaId === null ? '' : String(product.categoriaId),
});

export function ProductFormScreen({ navigation, route }: Props) {
  const id = route.params?.id;
  const isEditing = id !== undefined;
  const { showMessage } = useSnackbar();

  const categories = useFetch(useCallback((signal: AbortSignal) => categoryService.getAll({}, signal), []));
  const product = useFetch(
    useCallback(
      (signal: AbortSignal) => (id !== undefined ? productService.getById(id, signal) : Promise.resolve(null)),
      [id],
    ),
  );

  const handleSubmit = async (payload: ProductPayload) => {
    try {
      if (id !== undefined) {
        await productService.update(id, payload);
        showMessage('Producto actualizado correctamente', 'success');
        navigation.goBack();
      } else {
        const created = await productService.create(payload);
        showMessage('Producto creado. Ahora agrega sus tallas y colores', 'success');
        navigation.replace('ProductVariants', { id: created.id });
      }
    } catch (error) {
      showMessage(getErrorMessage(error) ?? 'No se pudo guardar el producto', 'error');
    }
  };

  const handleRetry = () => {
    categories.refetch();
    product.refetch();
  };

  const error = categories.error ?? product.error;

  if (error) {
    return (
      <ScreenContainer>
        <ErrorState message={getErrorMessage(error) ?? 'Ocurrió un error inesperado'} onRetry={handleRetry} />
      </ScreenContainer>
    );
  }

  if (categories.isLoading || product.isLoading || !categories.data) {
    return (
      <ScreenContainer>
        <Spinner fullScreen />
      </ScreenContainer>
    );
  }

  return (
    <FormContainer>
      <ProductForm
        key={product.data?.id ?? 'new'}
        defaultValues={product.data ? toFormValues(product.data) : EMPTY_VALUES}
        categories={categories.data}
        onSubmit={handleSubmit}
        onCancel={navigation.goBack}
        submitLabel={isEditing ? 'Guardar cambios' : 'Crear producto'}
      />
    </FormContainer>
  );
}

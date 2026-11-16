import { useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { Button } from 'react-native-paper';
import type { Category, ProductPayload, UnitOfMeasure } from '../types/products';
import { FormSelectField } from './FormSelectField';
import { FormTextField } from './FormTextField';

export interface ProductFormValues {
  codigo: string;
  nombre: string;
  descripcion: string;
  unidadMedida: UnitOfMeasure;
  precioCompra: string;
  precioVenta: string;
  categoriaId: string;
}

interface ProductFormProps {
  defaultValues: ProductFormValues;
  categories: Category[];
  onSubmit: (payload: ProductPayload) => Promise<void>;
  onCancel: () => void;
  submitLabel: string;
}

const UNIT_OPTIONS: { value: UnitOfMeasure; label: string }[] = [
  { value: 'UNIDAD', label: 'UNIDAD' },
  { value: 'DOCENA', label: 'DOCENA' },
  { value: 'METRO', label: 'METRO' },
  { value: 'ROLLO', label: 'ROLLO' },
];

const toNullableNumber = (value: string) => (value.trim() === '' ? null : Number(value));

export function ProductForm({ defaultValues, categories, onSubmit, onCancel, submitLabel }: ProductFormProps) {
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<ProductFormValues>({ defaultValues, mode: 'onChange' });

  const categoryOptions = categories
    .filter((category) => category.activo !== false || String(category.id) === defaultValues.categoriaId)
    .map((category) => ({ value: String(category.id), label: category.nombre }));

  const submit = handleSubmit((values) =>
    onSubmit({
      codigo: values.codigo,
      nombre: values.nombre,
      descripcion: values.descripcion,
      unidadMedida: values.unidadMedida,
      precioCompra: toNullableNumber(values.precioCompra),
      precioVenta: Number(values.precioVenta),
      categoriaId: toNullableNumber(values.categoriaId),
    }),
  );

  return (
    <View>
      <FormTextField
        control={control}
        name="codigo"
        label="Código"
        placeholder="Ej: POL-001"
        hint="Identificador único dentro de tu empresa."
        autoCapitalize="characters"
        autoCorrect={false}
        rules={{ required: 'El código es obligatorio' }}
      />
      <FormTextField
        control={control}
        name="nombre"
        label="Nombre"
        placeholder="Ej: Polo básico de algodón"
        rules={{ required: 'El nombre es obligatorio' }}
      />
      <FormTextField
        control={control}
        name="descripcion"
        label="Descripción"
        placeholder="Detalles del producto (opcional)"
        multiline
        numberOfLines={3}
      />
      <FormSelectField
        control={control}
        name="categoriaId"
        label="Categoría"
        emptyLabel="Sin categoría"
        options={categoryOptions}
        hint="Opcional. Sirve para agrupar tus productos en los reportes."
      />
      <FormSelectField control={control} name="unidadMedida" label="Unidad de medida" options={UNIT_OPTIONS} />
      <FormTextField
        control={control}
        name="precioCompra"
        label="Precio de compra (S/)"
        placeholder="0.00"
        keyboardType="decimal-pad"
        hint="Opcional. Se usa para calcular tu ganancia."
        rules={{
          validate: (value) =>
            value.trim() === '' || (!Number.isNaN(Number(value)) && Number(value) >= 0) ||
            'El precio de compra no puede ser negativo',
        }}
      />
      <FormTextField
        control={control}
        name="precioVenta"
        label="Precio de venta (S/)"
        placeholder="0.00"
        keyboardType="decimal-pad"
        rules={{
          validate: (value) => Number(value) > 0 || 'El precio de venta debe ser mayor a 0',
        }}
      />

      <View style={styles.actions}>
        <Button mode="outlined" onPress={onCancel} disabled={isSubmitting} style={styles.action}>
          Cancelar
        </Button>
        <Button mode="contained" onPress={() => submit()} loading={isSubmitting} disabled={isSubmitting} style={styles.action}>
          {submitLabel}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  action: { flex: 1 },
});

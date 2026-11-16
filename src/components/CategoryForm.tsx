import { useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { Button } from 'react-native-paper';
import type { CategoryPayload } from '../types/products';
import { FormTextField } from './FormTextField';

export interface CategoryFormValues {
  nombre: string;
  descripcion: string;
}

interface CategoryFormProps {
  defaultValues: CategoryFormValues;
  onSubmit: (payload: CategoryPayload) => Promise<void>;
  onCancel: () => void;
  submitLabel: string;
}

const MAX_DESCRIPTION = 500;

export function CategoryForm({ defaultValues, onSubmit, onCancel, submitLabel }: CategoryFormProps) {
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<CategoryFormValues>({ defaultValues, mode: 'onChange' });

  const submit = handleSubmit((values) =>
    onSubmit({
      nombre: values.nombre.trim(),
      descripcion: values.descripcion.trim() || null,
    }),
  );

  return (
    <View>
      <FormTextField
        control={control}
        name="nombre"
        label="Nombre"
        placeholder="Ej: Polos"
        rules={{ required: 'El nombre es obligatorio' }}
      />
      <FormTextField
        control={control}
        name="descripcion"
        label="Descripción"
        placeholder="Opcional"
        multiline
        numberOfLines={3}
        rules={{
          maxLength: {
            value: MAX_DESCRIPTION,
            message: `La descripción no puede superar los ${MAX_DESCRIPTION} caracteres`,
          },
        }}
      />

      <View style={styles.actions}>
        <Button mode="outlined" onPress={onCancel} disabled={isSubmitting} style={styles.action}>
          Cancelar
        </Button>
        <Button
          mode="contained"
          onPress={() => submit()}
          loading={isSubmitting}
          disabled={isSubmitting}
          style={styles.action}
        >
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

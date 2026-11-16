import { useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { Button } from 'react-native-paper';
import type { ClientPayload } from '../types/clients';
import { FormTextField } from './FormTextField';

export interface ClientFormValues {
  documento: string;
  nombre: string;
  telefono: string;
  correo: string;
  direccion: string;
}

interface ClientFormProps {
  defaultValues: ClientFormValues;
  onSubmit: (payload: ClientPayload) => Promise<void>;
  onCancel: () => void;
  submitLabel: string;
}

const DOCUMENT_PATTERN = /^(\d{8}|\d{11})$/;
const PHONE_PATTERN = /^\+?\d{6,15}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ClientForm({ defaultValues, onSubmit, onCancel, submitLabel }: ClientFormProps) {
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<ClientFormValues>({ defaultValues, mode: 'onChange' });

  const submit = handleSubmit((values) =>
    onSubmit({
      documento: values.documento.trim(),
      nombre: values.nombre.trim(),
      telefono: values.telefono.trim() || null,
      correo: values.correo.trim() || null,
      direccion: values.direccion.trim() || null,
    }),
  );

  return (
    <View>
      <FormTextField
        control={control}
        name="documento"
        label="Documento"
        placeholder="DNI (8 dígitos) o RUC (11 dígitos)"
        keyboardType="number-pad"
        rules={{
          required: 'El documento es obligatorio',
          pattern: { value: DOCUMENT_PATTERN, message: 'Debe ser un DNI (8 dígitos) o un RUC (11 dígitos)' },
        }}
      />
      <FormTextField
        control={control}
        name="nombre"
        label="Nombre"
        placeholder="Ej: María Pérez"
        rules={{ required: 'El nombre es obligatorio' }}
      />
      <FormTextField
        control={control}
        name="telefono"
        label="Teléfono"
        placeholder="Ej: +51987654321"
        hint="Opcional. Entre 6 y 15 dígitos, con + opcional."
        keyboardType="phone-pad"
        rules={{
          pattern: { value: PHONE_PATTERN, message: 'Teléfono inválido: use entre 6 y 15 dígitos, con + opcional' },
        }}
      />
      <FormTextField
        control={control}
        name="correo"
        label="Correo"
        placeholder="cliente@correo.com"
        hint="Opcional."
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        rules={{ pattern: { value: EMAIL_PATTERN, message: 'Correo inválido' } }}
      />
      <FormTextField control={control} name="direccion" label="Dirección" placeholder="Opcional" />

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

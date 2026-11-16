import { useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { Button } from 'react-native-paper';
import type { SupplierPayload } from '../types/purchases';
import { FormTextField } from './FormTextField';

export interface SupplierFormValues {
  ruc: string;
  razonSocial: string;
  telefono: string;
  correo: string;
}

interface SupplierFormProps {
  defaultValues: SupplierFormValues;
  onSubmit: (payload: SupplierPayload) => Promise<void>;
  onCancel: () => void;
  submitLabel: string;
}

const RUC_PATTERN = /^\d{11}$/;
const PHONE_PATTERN = /^\+?\d{6,15}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function SupplierForm({ defaultValues, onSubmit, onCancel, submitLabel }: SupplierFormProps) {
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<SupplierFormValues>({ defaultValues, mode: 'onChange' });

  const submit = handleSubmit((values) =>
    onSubmit({
      ruc: values.ruc.trim(),
      razonSocial: values.razonSocial.trim(),
      telefono: values.telefono.trim() || null,
      correo: values.correo.trim() || null,
    }),
  );

  return (
    <View>
      <FormTextField
        control={control}
        name="ruc"
        label="RUC"
        placeholder="11 dígitos"
        keyboardType="number-pad"
        rules={{
          required: 'El RUC es obligatorio',
          pattern: { value: RUC_PATTERN, message: 'El RUC debe tener exactamente 11 dígitos' },
        }}
      />
      <FormTextField
        control={control}
        name="razonSocial"
        label="Razón social"
        placeholder="Ej: Textiles Gamarra S.A.C."
        rules={{ required: 'La razón social es obligatoria' }}
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
        placeholder="ventas@proveedor.com"
        hint="Opcional."
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        rules={{ pattern: { value: EMAIL_PATTERN, message: 'Correo inválido' } }}
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

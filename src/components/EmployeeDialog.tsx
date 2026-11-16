import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { TextInput } from 'react-native-paper';
import type { EmployeePayload } from '../types/api';
import { FormDialog } from './FormDialog';
import { FormTextField } from './FormTextField';

interface EmployeeDialogProps {
  visible: boolean;
  onSubmit: (payload: EmployeePayload) => Promise<void>;
  onCancel: () => void;
}

interface EmployeeFormValues {
  nombre: string;
  email: string;
  password: string;
}

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;
const PASSWORD_PATTERN = /^(?=.*[A-Z])(?=.*[0-9]).*$/;

function EmployeeDialogContent({ onSubmit, onCancel }: Omit<EmployeeDialogProps, 'visible'>) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<EmployeeFormValues>({
    mode: 'onChange',
    defaultValues: { nombre: '', email: '', password: '' },
  });

  return (
    <FormDialog
      visible
      title="Agregar empleado"
      submitLabel="Crear empleado"
      isSubmitting={isSubmitting}
      onSubmit={() =>
        handleSubmit((values) =>
          onSubmit({ nombre: values.nombre.trim(), email: values.email.trim(), password: values.password }),
        )()
      }
      onDismiss={onCancel}
    >
      <FormTextField
        control={control}
        name="nombre"
        label="Nombre"
        autoFocus
        rules={{ required: 'El nombre es obligatorio' }}
      />
      <FormTextField
        control={control}
        name="email"
        label="Correo electrónico"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        autoCorrect={false}
        rules={{
          required: 'El correo es obligatorio',
          pattern: { value: EMAIL_PATTERN, message: 'Ingresa un correo válido' },
        }}
      />
      <FormTextField
        control={control}
        name="password"
        label="Contraseña inicial"
        hint="Mínimo 8 caracteres, con una mayúscula y un número."
        secureTextEntry={!isPasswordVisible}
        autoCapitalize="none"
        autoComplete="new-password"
        autoCorrect={false}
        rules={{
          required: 'La contraseña es obligatoria',
          minLength: { value: 8, message: 'Debe tener al menos 8 caracteres' },
          pattern: { value: PASSWORD_PATTERN, message: 'Debe tener al menos una mayúscula y un número' },
        }}
        right={
          <TextInput.Icon
            icon={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
            onPress={() => setIsPasswordVisible((visible) => !visible)}
            forceTextInputFocus={false}
          />
        }
      />
    </FormDialog>
  );
}

export function EmployeeDialog({ visible, onSubmit, onCancel }: EmployeeDialogProps) {
  if (!visible) return null;
  return <EmployeeDialogContent onSubmit={onSubmit} onCancel={onCancel} />;
}

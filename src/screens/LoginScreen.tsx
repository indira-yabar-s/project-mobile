import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button, HelperText, TextInput } from 'react-native-paper';
import { FormTextField } from '../components/FormTextField';
import { AuthLayout } from '../components/AuthLayout';
import { useAuth } from '../hooks/useAuth';
import type { LoginCredentials } from '../types/api';
import type { AuthStackParamList } from '../types/navigation';
import { getErrorMessage } from '../utils/errors';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;

export function LoginScreen({ navigation }: Props) {
  const { login } = useAuth();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginCredentials>({
    mode: 'onChange',
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: LoginCredentials) => {
    setSubmitError(null);
    try {
      await login(values);
    } catch (error) {
      setSubmitError(getErrorMessage(error));
    }
  };

  return (
    <AuthLayout title="Iniciar sesión" subtitle="Entra para seguir con tu negocio.">
          <FormTextField
            control={control}
            name="email"
            label="Correo electrónico"
            placeholder="tu@correo.com"
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
            label="Contraseña"
            secureTextEntry={!isPasswordVisible}
            autoCapitalize="none"
            autoComplete="current-password"
            autoCorrect={false}
            returnKeyType="go"
            onSubmitEditing={() => handleSubmit(onSubmit)()}
            rules={{ required: 'La contraseña es obligatoria' }}
            right={
              <TextInput.Icon
                icon={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
                onPress={() => setIsPasswordVisible((visible) => !visible)}
              />
            }
          />

          <HelperText type="error" visible={Boolean(submitError)}>
            {submitError}
          </HelperText>

          <Button mode="contained" contentStyle={{ minHeight: 48 }} onPress={() => handleSubmit(onSubmit)()} loading={isSubmitting} disabled={isSubmitting}>
            Ingresar
          </Button>
          <Button mode="text" onPress={() => navigation.navigate('Register')} disabled={isSubmitting}>
            ¿No tienes cuenta? Regístrate
          </Button>
    </AuthLayout>
  );
}

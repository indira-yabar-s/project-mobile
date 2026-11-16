import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Button, HelperText, Text, TextInput, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FormTextField } from '../components/FormTextField';
import { useAuth } from '../hooks/useAuth';
import type { LoginCredentials } from '../types/api';
import type { AuthStackParamList } from '../types/navigation';
import { getErrorMessage } from '../utils/errors';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;

export function LoginScreen({ navigation }: Props) {
  const { login } = useAuth();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
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
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 24 }]}
        keyboardShouldPersistTaps="handled"
      >
        <Text variant="displaySmall" style={{ color: theme.colors.primary }}>
          Gamarrito
        </Text>
        <Text variant="headlineSmall" style={styles.title}>
          Iniciar sesión
        </Text>
        <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
          Entra para seguir con tu negocio.
        </Text>

        <View style={styles.form}>
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

          <Button mode="contained" onPress={() => handleSubmit(onSubmit)()} loading={isSubmitting} disabled={isSubmitting}>
            Ingresar
          </Button>
          <Button mode="text" onPress={() => navigation.navigate('Register')} disabled={isSubmitting}>
            ¿No tienes cuenta? Regístrate
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { flexGrow: 1, paddingHorizontal: 24 },
  title: { marginTop: 32 },
  subtitle: { marginTop: 4 },
  form: { marginTop: 24 },
});

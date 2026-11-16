import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Text, TextInput, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FormTextField } from '../components/FormTextField';
import { useAuth } from '../hooks/useAuth';
import { useSnackbar } from '../hooks/useSnackbar';
import { enterpriseService } from '../services/enterpriseService';
import type { AuthStackParamList } from '../types/navigation';
import { getErrorMessage } from '../utils/errors';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

interface RegisterFormValues {
  ruc: string;
  razonSocial: string;
  nombre: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const RUC_PATTERN = /^\d{11}$/;
const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;
const PASSWORD_PATTERN = /^(?=.*[A-Z])(?=.*[0-9]).*$/;

export function RegisterScreen({ navigation }: Props) {
  const { register: registerUser } = useAuth();
  const { showMessage } = useSnackbar();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [createdEnterpriseId, setCreatedEnterpriseId] = useState<number | null>(null);

  const {
    control,
    handleSubmit,
    getValues,
    formState: { isSubmitting },
  } = useForm<RegisterFormValues>({
    mode: 'onChange',
    defaultValues: { ruc: '', razonSocial: '', nombre: '', email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      let enterpriseId = createdEnterpriseId;
      if (enterpriseId === null) {
        const enterprise = await enterpriseService.create({
          ruc: values.ruc.trim(),
          razonSocial: values.razonSocial.trim(),
        });
        enterpriseId = enterprise.id;
        setCreatedEnterpriseId(enterpriseId);
      }
      await registerUser({
        nombre: values.nombre.trim(),
        email: values.email.trim(),
        password: values.password,
        enterpriseId,
      });
      showMessage('Cuenta creada. ¡Bienvenido!', 'success');
    } catch (error) {
      showMessage(getErrorMessage(error) ?? 'No se pudo crear la cuenta', 'error');
    }
  };

  const passwordToggle = (
    <TextInput.Icon
      icon={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
      onPress={() => setIsPasswordVisible((visible) => !visible)}
    />
  );

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
          Crea tu cuenta
        </Text>
        <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
          Registra tu negocio y tu usuario administrador. Después podrás agregar a tus empleados desde la sección Equipo.
        </Text>

        <View style={styles.form}>
          <Text variant="titleMedium" style={styles.section}>
            Tu negocio
          </Text>
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
            placeholder="Ej: Gamarra Textiles SAC"
            rules={{ required: 'La razón social es obligatoria' }}
          />

          <Text variant="titleMedium" style={styles.section}>
            Administrador
          </Text>
          <FormTextField
            control={control}
            name="nombre"
            label="Nombre"
            autoComplete="name"
            rules={{ required: 'El nombre es obligatorio' }}
          />
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
            right={passwordToggle}
          />
          <FormTextField
            control={control}
            name="confirmPassword"
            label="Confirmar contraseña"
            secureTextEntry={!isPasswordVisible}
            autoCapitalize="none"
            autoComplete="new-password"
            autoCorrect={false}
            rules={{
              required: 'Confirma tu contraseña',
              validate: (value) => value === getValues('password') || 'Las contraseñas no coinciden',
            }}
          />

          <Button
            mode="contained"
            onPress={() => handleSubmit(onSubmit)()}
            loading={isSubmitting}
            disabled={isSubmitting}
            style={styles.submit}
          >
            Crear cuenta
          </Button>
          <Button mode="text" onPress={() => navigation.navigate('Login')} disabled={isSubmitting}>
            ¿Ya tienes cuenta? Inicia sesión
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
  section: { marginBottom: 8, marginTop: 8 },
  submit: { marginTop: 8 },
});

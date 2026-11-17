import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Surface, Text, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { OfflineBanner } from './OfflineBanner';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

const WIDE_BREAKPOINT = 600;

/** Marco común de Login y Registro: marca arriba y, en pantallas anchas, el formulario dentro de una tarjeta centrada. */
export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isWide = width >= WIDE_BREAKPOINT;

  const body = (
    <>
      <View style={styles.brand}>
        <View style={[styles.logo, { backgroundColor: theme.colors.primary }]}>
          <MaterialCommunityIcons name="hanger" size={30} color={theme.colors.onPrimary} />
        </View>
        <View style={styles.brandText}>
          <Text variant="headlineMedium" style={[styles.brandName, { color: theme.colors.primary }]}>
            Gamarrito
          </Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            Tu negocio de Gamarra, bajo control
          </Text>
        </View>
      </View>

      <Text variant="headlineSmall" accessibilityRole="header" style={styles.title}>
        {title}
      </Text>
      <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
        {subtitle}
      </Text>

      <View style={styles.form}>{children}</View>
    </>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <OfflineBanner />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          isWide && styles.contentWide,
          { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 24 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {isWide ? (
          <Surface elevation={1} style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            {body}
          </Surface>
        ) : (
          body
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { flexGrow: 1, paddingHorizontal: 24 },
  contentWide: { alignItems: 'center', justifyContent: 'center' },
  card: { borderRadius: 24, maxWidth: 460, padding: 32, width: '100%' },
  brand: { alignItems: 'center', flexDirection: 'row', gap: 12 },
  logo: { alignItems: 'center', borderRadius: 16, height: 52, justifyContent: 'center', width: 52 },
  brandText: { flex: 1 },
  brandName: { fontWeight: '700' },
  title: { marginTop: 28 },
  subtitle: { marginTop: 4 },
  form: { marginTop: 20 },
});

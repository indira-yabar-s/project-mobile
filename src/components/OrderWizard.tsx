import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Surface, Text, useTheme } from 'react-native-paper';
import { formatCurrency } from '../utils/format';
import { ScreenContainer } from './ScreenContainer';
import { Stepper } from './Stepper';

interface OrderWizardProps {
  steps: string[];
  step: number;
  total: number;
  isSubmitting: boolean;
  submitLabel: string;
  cancelLabel?: string;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
  children: ReactNode;
}

export function OrderWizard({
  steps,
  step,
  total,
  isSubmitting,
  submitLabel,
  cancelLabel = 'Cancelar',
  onBack,
  onNext,
  onSubmit,
  children,
}: OrderWizardProps) {
  const theme = useTheme();
  const isFirst = step === 0;
  const isLast = step === steps.length - 1;

  return (
    <ScreenContainer>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Stepper steps={steps} current={step} />
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
        <Surface elevation={2} style={[styles.footer, { backgroundColor: theme.colors.surface }]}>
          <Text variant="titleMedium">{`Total: ${formatCurrency(total)}`}</Text>
          <View style={styles.actions}>
            <Button mode="outlined" onPress={onBack} disabled={isSubmitting} style={styles.action}>
              {isFirst ? cancelLabel : 'Atrás'}
            </Button>
            {isLast ? (
              <Button
                mode="contained"
                onPress={onSubmit}
                loading={isSubmitting}
                disabled={isSubmitting}
                style={styles.action}
              >
                {submitLabel}
              </Button>
            ) : (
              <Button mode="contained" icon="arrow-right" contentStyle={styles.nextContent} onPress={onNext} style={styles.action}>
                Continuar
              </Button>
            )}
          </View>
        </Surface>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 16, paddingBottom: 24 },
  footer: { gap: 12, padding: 16 },
  actions: { flexDirection: 'row', gap: 12 },
  action: { flex: 1 },
  nextContent: { flexDirection: 'row-reverse' },
});

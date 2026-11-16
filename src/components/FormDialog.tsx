import type { ReactNode } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Button, Dialog, HelperText, Portal } from 'react-native-paper';

interface FormDialogProps {
  visible: boolean;
  title: string;
  submitLabel?: string;
  isSubmitting?: boolean;
  error?: string | null;
  onSubmit: () => void;
  onDismiss: () => void;
  children: ReactNode;
}

export function FormDialog({
  visible,
  title,
  submitLabel = 'Guardar',
  isSubmitting = false,
  error,
  onSubmit,
  onDismiss,
  children,
}: FormDialogProps) {
  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss} dismissable={!isSubmitting} style={styles.dialog}>
        <Dialog.Title>{title}</Dialog.Title>
        <Dialog.ScrollArea style={styles.scrollArea}>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
            {children}
          </ScrollView>
        </Dialog.ScrollArea>
        {error ? (
          <HelperText type="error" visible style={styles.error}>
            {error}
          </HelperText>
        ) : null}
        <Dialog.Actions>
          <Button onPress={onDismiss} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onPress={onSubmit} loading={isSubmitting} disabled={isSubmitting}>
            {submitLabel}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  dialog: { maxHeight: '85%' },
  scrollArea: { paddingHorizontal: 0 },
  content: { paddingHorizontal: 24, paddingVertical: 8 },
  error: { paddingHorizontal: 24 },
});

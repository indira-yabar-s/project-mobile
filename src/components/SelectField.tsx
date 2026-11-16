import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Dialog, HelperText, List, Portal, TextInput } from 'react-native-paper';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  emptyLabel?: string;
  placeholder?: string;
  error?: string;
  hint?: string;
  disabled?: boolean;
  isLoading?: boolean;
}

export function SelectField({
  label,
  value,
  options,
  onChange,
  emptyLabel,
  placeholder,
  error,
  hint,
  disabled = false,
  isLoading = false,
}: SelectFieldProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selected = options.find((option) => option.value === value);
  const displayValue = selected?.label ?? (value === '' && emptyLabel ? emptyLabel : '');
  const items = emptyLabel ? [{ value: '', label: emptyLabel }, ...options] : options;
  const isDisabled = disabled || isLoading;

  const handleSelect = (next: string) => {
    onChange(next);
    setIsOpen(false);
  };

  return (
    <View>
      <Pressable
        onPress={() => setIsOpen(true)}
        disabled={isDisabled}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        <View pointerEvents="none">
          <TextInput
            mode="outlined"
            label={label}
            value={displayValue}
            placeholder={isLoading ? 'Cargando...' : placeholder}
            editable={false}
            error={Boolean(error)}
            disabled={isDisabled}
            right={<TextInput.Icon icon="menu-down" />}
          />
        </View>
      </Pressable>
      <HelperText type={error ? 'error' : 'info'} visible={Boolean(error || hint)}>
        {error ?? hint}
      </HelperText>
      <Portal>
        <Dialog visible={isOpen} onDismiss={() => setIsOpen(false)} style={styles.dialog}>
          <Dialog.Title>{label}</Dialog.Title>
          <Dialog.ScrollArea style={styles.scrollArea}>
            <ScrollView>
              {items.length === 0 ? (
                <List.Item title="Sin opciones disponibles" titleStyle={styles.noOptions} />
              ) : (
                items.map((option) => (
                  <List.Item
                    key={option.value}
                    title={option.label}
                    onPress={() => handleSelect(option.value)}
                    right={(props) =>
                      option.value === value ? <List.Icon {...props} icon="check" /> : null
                    }
                  />
                ))
              )}
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setIsOpen(false)}>Cancelar</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  dialog: { maxHeight: '80%' },
  scrollArea: { paddingHorizontal: 0 },
  noOptions: { fontStyle: 'italic' },
});

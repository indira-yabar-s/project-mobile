import { StyleSheet } from 'react-native';
import { Searchbar } from 'react-native-paper';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onScanPress?: () => void;
}

export function SearchInput({ value, onChange, placeholder = 'Buscar...', onScanPress }: SearchInputProps) {
  return (
    <Searchbar
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      accessibilityLabel={placeholder}
      autoCapitalize="none"
      autoCorrect={false}
      traileringIcon={onScanPress ? 'barcode-scan' : undefined}
      traileringIconAccessibilityLabel="Escanear código"
      onTraileringIconPress={onScanPress}
      style={styles.input}
    />
  );
}

const styles = StyleSheet.create({
  input: { marginHorizontal: 16, marginVertical: 8 },
});

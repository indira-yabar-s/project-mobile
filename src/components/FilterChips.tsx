import { ScrollView, StyleSheet } from 'react-native';
import { Chip } from 'react-native-paper';

export interface FilterChipOption {
  value: string;
  label: string;
}

interface FilterChipsProps {
  label: string;
  options: FilterChipOption[];
  value: string;
  onChange: (value: string) => void;
}

export function FilterChips({ label, options, value, onChange }: FilterChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      accessibilityLabel={label}
      contentContainerStyle={styles.content}
    >
      {options.map((option) => (
        <Chip
          key={option.value}
          selected={option.value === value}
          showSelectedCheck
          onPress={() => onChange(option.value)}
        >
          {option.label}
        </Chip>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { gap: 8, paddingHorizontal: 16, paddingVertical: 8 },
});

import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button } from 'react-native-paper';
import { DatePickerModal, es, registerTranslation } from 'react-native-paper-dates';
import { fromISODate, formatDisplayDate, getLastDaysRange, toISODate, type DateRange } from '../utils/dates';

registerTranslation('es', es);

const PRESETS = [
  { label: '7 días', days: 7 },
  { label: '30 días', days: 30 },
  { label: '90 días', days: 90 },
];

interface DateRangeFilterProps extends DateRange {
  onChange: (range: DateRange) => void;
}

export function DateRangeFilter({ desde, hasta, onChange }: DateRangeFilterProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  return (
    <View style={styles.container}>
      <Button mode="outlined" icon="calendar-range" onPress={() => setIsPickerOpen(true)}>
        {`${formatDisplayDate(desde)} - ${formatDisplayDate(hasta)}`}
      </Button>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presets}>
        {PRESETS.map((preset) => (
          <Button key={preset.days} mode="text" compact onPress={() => onChange(getLastDaysRange(preset.days))}>
            {preset.label}
          </Button>
        ))}
      </ScrollView>
      <DatePickerModal
        locale="es"
        mode="range"
        visible={isPickerOpen}
        onDismiss={() => setIsPickerOpen(false)}
        startDate={fromISODate(desde)}
        endDate={fromISODate(hasta)}
        label="Selecciona el rango"
        startLabel="Desde"
        endLabel="Hasta"
        saveLabel="Aplicar"
        onConfirm={({ startDate, endDate }) => {
          setIsPickerOpen(false);
          if (startDate && endDate) {
            onChange({ desde: toISODate(startDate), hasta: toISODate(endDate) });
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 4, paddingHorizontal: 16, paddingVertical: 8 },
  presets: { gap: 4 },
});

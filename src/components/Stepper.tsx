import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

interface StepperProps {
  steps: string[];
  current: number;
}

export function Stepper({ steps, current }: StepperProps) {
  const theme = useTheme();

  return (
    <View style={styles.container} accessibilityLabel={`Paso ${current + 1} de ${steps.length}: ${steps[current]}`}>
      <View style={styles.row}>
        {steps.map((label, index) => {
          const isDone = index < current;
          const isActive = index <= current;
          return (
            <View key={label} style={[styles.item, index < steps.length - 1 && styles.itemGrow]}>
              <View
                style={[
                  styles.circle,
                  { backgroundColor: isActive ? theme.colors.primary : theme.colors.surfaceVariant },
                ]}
              >
                {isDone ? (
                  <MaterialCommunityIcons name="check" size={16} color={theme.colors.onPrimary} />
                ) : (
                  <Text
                    variant="labelMedium"
                    style={{ color: isActive ? theme.colors.onPrimary : theme.colors.onSurfaceVariant }}
                  >
                    {index + 1}
                  </Text>
                )}
              </View>
              {index < steps.length - 1 ? (
                <View
                  style={[
                    styles.line,
                    { backgroundColor: isDone ? theme.colors.primary : theme.colors.surfaceVariant },
                  ]}
                />
              ) : null}
            </View>
          );
        })}
      </View>
      <Text variant="titleSmall" style={styles.caption}>
        {steps[current]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingVertical: 12 },
  row: { alignItems: 'center', flexDirection: 'row' },
  item: { alignItems: 'center', flexDirection: 'row' },
  itemGrow: { flex: 1 },
  circle: {
    alignItems: 'center',
    borderRadius: 14,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  line: { flex: 1, height: 2, marginHorizontal: 8 },
  caption: { marginTop: 8 },
});

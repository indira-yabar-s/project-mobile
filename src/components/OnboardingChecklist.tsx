import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import { Card, ProgressBar, Text, useTheme } from 'react-native-paper';

export interface ChecklistStep {
  label: string;
  done: boolean;
  onPress: () => void;
}

interface OnboardingChecklistProps {
  steps: ChecklistStep[];
}

export function OnboardingChecklist({ steps }: OnboardingChecklistProps) {
  const theme = useTheme();
  const done = steps.filter((step) => step.done).length;

  if (done === steps.length) return null;

  return (
    <Card style={[styles.card, { backgroundColor: theme.colors.primaryContainer }]}>
      <Card.Content>
        <View style={styles.header}>
          <Text variant="titleMedium" style={{ color: theme.colors.onPrimaryContainer }}>
            Empieza con tu negocio
          </Text>
          <Text variant="labelMedium" style={{ color: theme.colors.onPrimaryContainer }}>
            {`${done} de ${steps.length} pasos`}
          </Text>
        </View>
        {/* En web, ProgressBar ocupa el 100% del alto del padre: se envuelve en un View de alto fijo. */}
        <View style={styles.progressWrap}>
          <ProgressBar progress={done / steps.length} style={styles.progress} />
        </View>
        {steps.map((step) => (
          <Pressable
            key={step.label}
            onPress={step.onPress}
            disabled={step.done}
            accessibilityRole="button"
            accessibilityState={{ disabled: step.done, checked: step.done }}
            style={styles.step}
          >
            <MaterialCommunityIcons
              name={step.done ? 'check-circle' : 'circle-outline'}
              size={22}
              color={step.done ? (theme.dark ? '#4ade80' : '#16a34a') : theme.colors.onPrimaryContainer}
            />
            <Text
              variant="bodyMedium"
              style={[
                styles.stepLabel,
                { color: theme.colors.onPrimaryContainer },
                step.done && styles.stepDone,
              ]}
            >
              {step.label}
            </Text>
            {!step.done ? (
              <MaterialCommunityIcons name="chevron-right" size={20} color={theme.colors.onPrimaryContainer} />
            ) : null}
          </Pressable>
        ))}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginHorizontal: 16 },
  header: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'space-between' },
  progressWrap: { height: 6, marginVertical: 12, overflow: 'hidden' },
  progress: { borderRadius: 4, height: 6 },
  step: { alignItems: 'center', flexDirection: 'row', gap: 12, minHeight: 44 },
  stepLabel: { flex: 1 },
  stepDone: { opacity: 0.7, textDecorationLine: 'line-through' },
});

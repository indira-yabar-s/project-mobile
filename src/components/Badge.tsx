import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

type BadgeVariant = 'success' | 'danger' | 'warning' | 'neutral';

interface BadgeProps {
  children: string;
  variant?: BadgeVariant;
}

const PALETTE = {
  light: {
    success: { background: '#dcfce7', text: '#166534' },
    danger: { background: '#fee2e2', text: '#991b1b' },
    warning: { background: '#fef9c3', text: '#854d0e' },
  },
  dark: {
    success: { background: '#14532d', text: '#bbf7d0' },
    danger: { background: '#7f1d1d', text: '#fecaca' },
    warning: { background: '#713f12', text: '#fef08a' },
  },
};

export function Badge({ children, variant = 'neutral' }: BadgeProps) {
  const theme = useTheme();

  const colors =
    variant === 'neutral'
      ? { background: theme.colors.surfaceVariant, text: theme.colors.onSurfaceVariant }
      : PALETTE[theme.dark ? 'dark' : 'light'][variant];

  return (
    <View style={[styles.badge, { backgroundColor: colors.background }]}>
      <Text variant="labelSmall" style={{ color: colors.text }}>
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
});

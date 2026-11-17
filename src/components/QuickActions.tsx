import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, TouchableRipple, useTheme } from 'react-native-paper';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

export interface QuickAction {
  label: string;
  icon: IconName;
  onPress: () => void;
  primary?: boolean;
}

interface QuickActionsProps {
  actions: QuickAction[];
}

/** Accesos directos a las tareas de todos los días: lo más usado queda a un toque desde el inicio. */
export function QuickActions({ actions }: QuickActionsProps) {
  const theme = useTheme();

  return (
    <View style={styles.row}>
      {actions.map((action) => {
        const background = action.primary ? theme.colors.primary : theme.colors.elevation.level1;
        const foreground = action.primary ? theme.colors.onPrimary : theme.colors.onSurface;
        const iconBackground = action.primary ? 'rgba(255,255,255,0.18)' : theme.colors.secondaryContainer;
        const iconColor = action.primary ? theme.colors.onPrimary : theme.colors.primary;

        return (
          <TouchableRipple
            key={action.label}
            onPress={action.onPress}
            borderless
            accessibilityRole="button"
            accessibilityLabel={action.label}
            style={[
              styles.tile,
              { backgroundColor: background, borderColor: action.primary ? background : theme.colors.outlineVariant },
            ]}
          >
            <View style={styles.tileContent}>
              <View style={[styles.icon, { backgroundColor: iconBackground }]}>
                <MaterialCommunityIcons name={action.icon} size={22} color={iconColor} />
              </View>
              <Text variant="labelMedium" numberOfLines={2} style={[styles.label, { color: foreground }]}>
                {action.label}
              </Text>
            </View>
          </TouchableRipple>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10, paddingHorizontal: 16 },
  tile: { borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, flex: 1, minHeight: 88 },
  tileContent: { alignItems: 'center', flex: 1, gap: 8, justifyContent: 'center', paddingHorizontal: 6, paddingVertical: 12 },
  icon: { alignItems: 'center', borderRadius: 12, height: 40, justifyContent: 'center', width: 40 },
  label: { fontWeight: '600', textAlign: 'center' },
});

import {
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
  type DrawerContentComponentProps,
} from '@react-navigation/drawer';
import { StyleSheet, View } from 'react-native';
import { Avatar, Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';

export function AppDrawerContent(props: DrawerContentComponentProps) {
  const { user, logout } = useAuth();
  const theme = useTheme();
  const initials =
    (user?.nombre ?? '')
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('') || 'G';

  return (
    <DrawerContentScrollView {...props}>
      <View style={[styles.header, { borderBottomColor: theme.colors.outlineVariant }]}>
        <Avatar.Text size={48} label={initials} />
        <View style={styles.identity}>
          <Text variant="titleMedium" numberOfLines={1} style={styles.name}>
            {user?.nombre}
          </Text>
          <Text variant="bodySmall" numberOfLines={1} style={{ color: theme.colors.onSurfaceVariant }}>
            {user?.email}
          </Text>
          <View style={[styles.role, { backgroundColor: theme.colors.secondaryContainer }]}>
            <Text variant="labelSmall" style={{ color: theme.colors.onSecondaryContainer }}>
              {user?.role === 'ADMIN' ? 'Administrador' : 'Empleado'}
            </Text>
          </View>
        </View>
      </View>
      <DrawerItemList {...props} />
      <DrawerItem
        label="Cerrar sesión"
        icon={({ color, size }) => <MaterialCommunityIcons name="logout" color={color} size={size} />}
        onPress={logout}
      />
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
    paddingBottom: 16,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  identity: { flex: 1 },
  name: { fontWeight: '700' },
  role: { alignSelf: 'flex-start', borderRadius: 8, marginTop: 6, paddingHorizontal: 8, paddingVertical: 2 },
});

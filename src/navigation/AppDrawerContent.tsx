import {
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
  type DrawerContentComponentProps,
} from '@react-navigation/drawer';
import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';

export function AppDrawerContent(props: DrawerContentComponentProps) {
  const { user, logout } = useAuth();
  const theme = useTheme();

  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.header}>
        <Text variant="titleLarge" style={{ color: theme.colors.primary }}>
          Gamarrito
        </Text>
        <Text variant="titleSmall" style={styles.name}>
          {user?.nombre}
        </Text>
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
          {user?.email}
        </Text>
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
  header: { paddingHorizontal: 16, paddingVertical: 16 },
  name: { marginTop: 12 },
});

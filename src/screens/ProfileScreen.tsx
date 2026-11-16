import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Chip, SegmentedButtons, Text } from 'react-native-paper';
import { useAppTheme } from '../hooks/useAppTheme';
import { useAuth } from '../hooks/useAuth';
import type { ThemePreference } from '../utils/themeStorage';

const THEME_OPTIONS = [
  { value: 'light', label: 'Claro', icon: 'white-balance-sunny' },
  { value: 'dark', label: 'Oscuro', icon: 'weather-night' },
  { value: 'system', label: 'Sistema', icon: 'cellphone' },
];

export function ProfileScreen() {
  const { user, logout } = useAuth();
  const { preference, setPreference } = useAppTheme();

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Card>
        <Card.Content>
          <Text variant="titleLarge">{user?.nombre}</Text>
          <Text variant="bodyMedium" style={styles.email}>
            {user?.email}
          </Text>
          <View style={styles.roleRow}>
            <Chip icon={user?.role === 'ADMIN' ? 'shield-account' : 'account'}>
              {user?.role === 'ADMIN' ? 'Administrador' : 'Empleado'}
            </Chip>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.section}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Apariencia
          </Text>
          <SegmentedButtons
            value={preference}
            onValueChange={(value) => setPreference(value as ThemePreference)}
            buttons={THEME_OPTIONS}
          />
        </Card.Content>
      </Card>

      <Button mode="outlined" icon="logout" onPress={logout} style={styles.logout}>
        Cerrar sesión
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16 },
  email: { marginTop: 4 },
  roleRow: { flexDirection: 'row', marginTop: 12 },
  section: { marginTop: 16 },
  sectionTitle: { marginBottom: 12 },
  logout: { marginTop: 24 },
});

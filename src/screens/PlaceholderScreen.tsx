import { useRoute } from '@react-navigation/native';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

export function PlaceholderScreen() {
  const route = useRoute();

  return (
    <View style={styles.container}>
      <Text variant="titleMedium">{route.name}</Text>
      <Text variant="bodyMedium">Próximamente</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 4 },
});

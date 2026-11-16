import { useRoute } from '@react-navigation/native';
import { StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { ScreenContainer } from '../components/ScreenContainer';

export function PlaceholderScreen() {
  const route = useRoute();

  return (
    <ScreenContainer style={styles.container}>
      <Text variant="titleMedium">{route.name}</Text>
      <Text variant="bodyMedium">Próximamente</Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { justifyContent: 'center', alignItems: 'center', gap: 4 },
});

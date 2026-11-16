import { StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { env } from '../config/env';

export function HomeScreen() {
  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineMedium">Gamarrito</Text>
          <Text variant="bodyMedium" style={styles.text}>
            Base del proyecto lista.
          </Text>
          <Text variant="bodySmall" style={styles.text}>
            API: {env.apiUrl}
          </Text>
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 16 },
  card: { marginBottom: 16 },
  text: { marginTop: 8 },
});

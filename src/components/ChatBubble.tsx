import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import type { ChatMessage } from '../types/assistant';
import { AssistantVisual } from './AssistantVisual';
import { FormattedText } from './FormattedText';

interface ChatBubbleProps {
  message: ChatMessage;
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const theme = useTheme();
  const isUser = message.role === 'user';

  const backgroundColor = isUser
    ? theme.colors.primary
    : message.failed
      ? theme.colors.errorContainer
      : theme.colors.surfaceVariant;
  const color = isUser
    ? theme.colors.onPrimary
    : message.failed
      ? theme.colors.onErrorContainer
      : theme.colors.onSurfaceVariant;

  const bubble = (
    <View style={[styles.row, isUser ? styles.rowUser : styles.rowAssistant]}>
      <View style={[styles.bubble, { backgroundColor }]}>
        {isUser ? (
          <Text variant="bodyMedium" style={{ color }}>
            {message.text}
          </Text>
        ) : (
          <FormattedText text={message.text} textStyle={{ color }} />
        )}
      </View>
    </View>
  );

  if (isUser || !message.visual) return bubble;

  return (
    <View style={styles.withVisual}>
      {bubble}
      <AssistantVisual visual={message.visual} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row' },
  rowUser: { justifyContent: 'flex-end' },
  rowAssistant: { justifyContent: 'flex-start' },
  withVisual: { gap: 8 },
  bubble: { borderRadius: 16, maxWidth: '85%', paddingHorizontal: 12, paddingVertical: 8 },
});

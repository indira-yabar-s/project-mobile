import { useHeaderHeight } from '@react-navigation/elements';
import { useCallback, useMemo, useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { Chip, HelperText, IconButton, Text, TextInput, useTheme } from 'react-native-paper';
import { ChatBubble } from '../components/ChatBubble';
import { ScreenContainer } from '../components/ScreenContainer';
import { Spinner } from '../components/Spinner';
import { useFetch } from '../hooks/useFetch';
import { useSnackbar } from '../hooks/useSnackbar';
import { assistantService } from '../services/assistantService';
import type { ChatMessage } from '../types/assistant';
import { getErrorMessage } from '../utils/errors';

const MAX_LENGTH = 500;

const SUGGESTIONS = [
  '¿Cuáles son mis productos más vendidos?',
  '¿Qué productos tienen stock bajo?',
  '¿Cuánto he vendido esta semana?',
];

export function AssistantScreen() {
  const theme = useTheme();
  const headerHeight = useHeaderHeight();
  const { showMessage } = useSnackbar();
  const [draft, setDraft] = useState('');
  const [sessionMessages, setSessionMessages] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);
  const listRef = useRef<FlatList<ChatMessage>>(null);

  const history = useFetch(useCallback((signal: AbortSignal) => assistantService.getHistory({ page: 1, size: 20 }, signal), []));

  const historyMessages = useMemo<ChatMessage[]>(() => {
    const entries = [...(history.data?.content ?? [])].reverse();
    return entries.flatMap((entry) => [
      { id: `h-${entry.id}-q`, role: 'user' as const, text: entry.pregunta },
      {
        id: `h-${entry.id}-a`,
        role: 'assistant' as const,
        text: entry.respuesta ?? 'No se pudo obtener una respuesta.',
        failed: !entry.exitosa,
      },
    ]);
  }, [history.data]);

  const messages = useMemo(() => [...historyMessages, ...sessionMessages], [historyMessages, sessionMessages]);

  const sendQuestion = async () => {
    const question = draft.trim();
    if (!question || isSending) return;

    const messageId = `s-${Date.now()}`;
    setSessionMessages((current) => [...current, { id: messageId, role: 'user', text: question }]);
    setDraft('');
    setIsSending(true);

    try {
      const answer = await assistantService.ask(question);
      setSessionMessages((current) => [
        ...current,
        { id: `${messageId}-a`, role: 'assistant', text: answer.respuesta },
      ]);
      setRemaining(answer.consultasRestantesHoy);
    } catch (error) {
      setSessionMessages((current) => current.filter((message) => message.id !== messageId));
      setDraft(question);
      showMessage(getErrorMessage(error) ?? 'No se pudo obtener una respuesta', 'error');
    } finally {
      setIsSending(false);
    }
  };

  const scrollToEnd = () => listRef.current?.scrollToEnd({ animated: true });

  const isEmpty = !history.isLoading && messages.length === 0;

  const renderEmpty = () => {
    if (history.isLoading) return <Spinner />;
    if (!isEmpty) return undefined;

    return (
      <View style={styles.welcome}>
        <Text variant="bodyLarge" style={styles.welcomeText}>
          ¡Hola! Soy Gamarrito IA. Pregúntame sobre tus ventas, tu inventario o tus clientes.
        </Text>
        <View style={styles.suggestions}>
          {SUGGESTIONS.map((suggestion) => (
            <Chip key={suggestion} icon="lightbulb-outline" onPress={() => setDraft(suggestion)}>
              {suggestion}
            </Chip>
          ))}
        </View>
      </View>
    );
  };

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={headerHeight}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(message) => message.id}
          renderItem={({ item }) => <ChatBubble message={item} />}
          contentContainerStyle={styles.messages}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={scrollToEnd}
          ListHeaderComponent={
            history.error ? (
              <HelperText type="error" visible style={styles.historyError}>
                No se pudo cargar tu historial, pero puedes seguir preguntando.
              </HelperText>
            ) : undefined
          }
          ListEmptyComponent={renderEmpty()}
          ListFooterComponent={
            isSending ? (
              <View style={[styles.thinking, { backgroundColor: theme.colors.surfaceVariant }]}>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                  Gamarrito IA está pensando...
                </Text>
              </View>
            ) : undefined
          }
        />

        <View style={[styles.composer, { borderTopColor: theme.colors.outlineVariant }]}>
          <View style={styles.inputRow}>
            <TextInput
              mode="outlined"
              value={draft}
              onChangeText={setDraft}
              maxLength={MAX_LENGTH}
              multiline
              placeholder="Pregúntale a Gamarrito IA..."
              accessibilityLabel="Tu pregunta"
              editable={!isSending}
              style={styles.input}
            />
            <IconButton
              icon="send"
              mode="contained"
              accessibilityLabel="Enviar pregunta"
              disabled={isSending || !draft.trim()}
              onPress={sendQuestion}
            />
          </View>
          <View style={styles.meta}>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {remaining === null ? 'Consulta lo que necesites' : `Te quedan ${remaining} consultas hoy`}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {`${draft.length}/${MAX_LENGTH}`}
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  messages: { flexGrow: 1, gap: 12, padding: 16 },
  historyError: { textAlign: 'center' },
  welcome: { alignItems: 'center', gap: 16, paddingVertical: 16 },
  welcomeText: { textAlign: 'center' },
  suggestions: { alignItems: 'stretch', gap: 8 },
  thinking: { alignSelf: 'flex-start', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 8 },
  composer: { borderTopWidth: StyleSheet.hairlineWidth, gap: 4, paddingHorizontal: 12, paddingTop: 8 },
  inputRow: { alignItems: 'flex-end', flexDirection: 'row', gap: 4 },
  input: { flex: 1, maxHeight: 120 },
  meta: { flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 8, paddingHorizontal: 4 },
});

import { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Chip, HelperText, IconButton, Text, TextInput, useTheme } from 'react-native-paper';
import { ChartView } from '../components/ChartView';
import { ScreenContainer } from '../components/ScreenContainer';
import { Skeleton } from '../components/Skeleton';
import { useAuth } from '../hooks/useAuth';
import { useSnackbar } from '../hooks/useSnackbar';
import { chartService } from '../services/chartService';
import type { ChartResult, ChartSpec, SavedChart } from '../types/charts';
import { boardStorage } from '../utils/boardStorage';
import { getErrorMessage } from '../utils/errors';

const MAX_QUESTION = 500;
const MAX_BOARD = 12;

const SUGGESTIONS = [
  '¿Cómo van mis ventas de esta semana?',
  'Reparto de ventas por medio de pago este mes',
  '¿Qué productos me dejan más ganancia?',
  'Ventas por canal en torta',
  '¿A qué hora vendo más?',
];

/** Gráficos listos que no gastan consultas de IA: sirven de punto de partida y funcionan sin clave de IA. */
const PRESETS: { label: string; spec: ChartSpec; dias: number }[] = [
  { label: 'Ventas por día', dias: 30, spec: { titulo: 'Ventas por día', fuente: 'VENTAS_POR_DIA', tipo: 'LINEA', metrica: 'TOTAL' } },
  {
    label: 'Medios de pago',
    dias: 30,
    spec: { titulo: 'Ventas por medio de pago', fuente: 'VENTAS_AGRUPADAS', agrupacion: 'MEDIO_PAGO', tipo: 'TORTA', metrica: 'TOTAL' },
  },
  {
    label: 'Canales',
    dias: 30,
    spec: { titulo: 'Ventas por canal', fuente: 'VENTAS_AGRUPADAS', agrupacion: 'CANAL', tipo: 'TORTA', metrica: 'TOTAL' },
  },
  {
    label: 'Top por ganancia',
    dias: 30,
    spec: { titulo: 'Productos con más ganancia', fuente: 'TOP_PRODUCTOS', tipo: 'BARRAS', metrica: 'GANANCIA', limite: 8 },
  },
  {
    label: 'Stock parado',
    dias: 30,
    spec: { titulo: 'Capital en stock parado', fuente: 'STOCK_PARADO', tipo: 'BARRAS', limite: 8 },
  },
];

const pad = (value: number) => String(value).padStart(2, '0');
const toIsoDate = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

/** Un gráfico con `dias` siempre muestra los últimos N días contados desde hoy. */
function withRollingRange(spec: ChartSpec, dias: number | null): ChartSpec {
  if (!dias) return spec;
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - (dias - 1));
  return { ...spec, desde: toIsoDate(start), hasta: toIsoDate(today) };
}

/** Si el periodo del gráfico termina hoy, se guarda como "últimos N días" para que no se quede congelado. */
function rollingDays(spec: ChartSpec): number | null {
  if (!spec.desde || !spec.hasta || spec.hasta !== toIsoDate(new Date())) return null;
  const days = Math.round((Date.parse(spec.hasta) - Date.parse(spec.desde)) / 86400000) + 1;
  return days >= 1 && days <= 366 ? days : null;
}

const formatDay = (iso: string) => {
  const [year, month, day] = iso.split('-');
  return `${day}/${month}/${year}`;
};

function periodLabel(spec: ChartSpec): string | null {
  if (spec.fuente === 'STOCK_PARADO') return 'Sin ventas en los últimos 60 días';
  if (spec.fuente === 'REPOSICION') return 'Según las ventas de los últimos 30 días';
  if (!spec.desde || !spec.hasta) return null;
  return `${formatDay(spec.desde)} – ${formatDay(spec.hasta)}`;
}

interface BoardEntry {
  saved: SavedChart;
  result: ChartResult | null;
  error: string | null;
}

interface ChartCardProps {
  result: ChartResult | null;
  title: string;
  error?: string | null;
  action: { icon: string; label: string; onPress: () => void };
  onRetry?: () => void;
}

function ChartCard({ result, title, error, action, onRetry }: ChartCardProps) {
  const theme = useTheme();
  const period = result ? periodLabel(result.spec) : null;

  return (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitle}>
            <Text variant="titleMedium" style={styles.bold}>
              {title}
            </Text>
            {period ? (
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                {period}
              </Text>
            ) : null}
          </View>
          <IconButton icon={action.icon} accessibilityLabel={action.label} onPress={action.onPress} style={styles.cardAction} />
        </View>

        {error ? (
          <View style={styles.cardError} accessibilityRole="alert">
            <Text variant="bodyMedium" style={{ color: theme.colors.error, textAlign: 'center' }}>
              {error}
            </Text>
            {onRetry ? (
              <Button mode="outlined" onPress={onRetry}>
                Reintentar
              </Button>
            ) : null}
          </View>
        ) : result ? (
          <>
            <ChartView type={result.spec.tipo ?? 'BARRAS'} unit={result.unidad} points={result.puntos} />
            <Text variant="bodySmall" style={[styles.summary, { color: theme.colors.onSurfaceVariant }]}>
              {result.resumen}
            </Text>
          </>
        ) : (
          <View style={styles.skeletons}>
            <Skeleton width="100%" height={18} />
            <Skeleton width="80%" height={18} />
            <Skeleton width="60%" height={18} />
          </View>
        )}
      </Card.Content>
    </Card>
  );
}

export function AnalyticsScreen() {
  const theme = useTheme();
  const { user } = useAuth();
  const { showMessage } = useSnackbar();
  const userId = user?.id;

  const [question, setQuestion] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [askError, setAskError] = useState<string | null>(null);
  const [draft, setDraft] = useState<{ result: ChartResult; dias: number | null } | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [board, setBoard] = useState<BoardEntry[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadEntry = useCallback(async (saved: SavedChart): Promise<BoardEntry> => {
    try {
      const result = await chartService.run(withRollingRange(saved.spec, saved.dias));
      return { saved, result, error: null };
    } catch (error) {
      return { saved, result: null, error: getErrorMessage(error) ?? 'No se pudo cargar el gráfico' };
    }
  }, []);

  const loadBoard = useCallback(
    async (charts: SavedChart[]) => {
      setBoard(charts.map((saved) => ({ saved, result: null, error: null })));
      const entries = await Promise.all(charts.map(loadEntry));
      setBoard(entries);
    },
    [loadEntry],
  );

  useEffect(() => {
    if (userId === undefined) return;
    let isActive = true;
    boardStorage.get(userId).then((charts) => {
      if (isActive) void loadBoard(charts);
    });
    return () => {
      isActive = false;
    };
  }, [userId, loadBoard]);

  const persist = (entries: BoardEntry[]) => {
    setBoard(entries);
    if (userId !== undefined) void boardStorage.set(userId, entries.map((entry) => entry.saved));
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadBoard(board.map((entry) => entry.saved));
    setIsRefreshing(false);
  };

  const ask = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isAsking) return;
    setIsAsking(true);
    setAskError(null);
    try {
      const result = await chartService.ask(trimmed);
      setDraft({ result, dias: rollingDays(result.spec) });
      setRemaining(result.preguntasRestantes);
      setQuestion('');
    } catch (error) {
      setAskError(getErrorMessage(error) ?? 'No se pudo generar el gráfico');
    } finally {
      setIsAsking(false);
    }
  };

  const runPreset = async (preset: (typeof PRESETS)[number]) => {
    if (isAsking) return;
    setIsAsking(true);
    setAskError(null);
    try {
      const result = await chartService.run(withRollingRange(preset.spec, preset.dias));
      setDraft({ result, dias: preset.dias });
    } catch (error) {
      setAskError(getErrorMessage(error) ?? 'No se pudo generar el gráfico');
    } finally {
      setIsAsking(false);
    }
  };

  const pinDraft = () => {
    if (!draft) return;
    if (board.length >= MAX_BOARD) {
      showMessage(`Tu tablero admite hasta ${MAX_BOARD} gráficos. Quita uno para fijar otro.`, 'error');
      return;
    }
    const saved: SavedChart = { id: `${Date.now()}`, spec: draft.result.spec, dias: draft.dias };
    persist([{ saved, result: draft.result, error: null }, ...board]);
    setDraft(null);
    showMessage('Gráfico fijado en tu tablero', 'success');
  };

  const unpin = (id: string) => persist(board.filter((entry) => entry.saved.id !== id));

  const retry = async (saved: SavedChart) => {
    setBoard((entries) => entries.map((entry) => (entry.saved.id === saved.id ? { saved, result: null, error: null } : entry)));
    const loaded = await loadEntry(saved);
    setBoard((entries) => entries.map((entry) => (entry.saved.id === saved.id ? loaded : entry)));
  };

  return (
    <ScreenContainer>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
      >
        <Card style={[styles.card, { backgroundColor: theme.colors.primaryContainer }]}>
          <Card.Content>
            <Text variant="titleMedium" style={[styles.bold, { color: theme.colors.onPrimaryContainer }]}>
              Pide un gráfico con tus palabras
            </Text>
            <Text variant="bodySmall" style={[styles.hint, { color: theme.colors.onPrimaryContainer }]}>
              La IA elige el gráfico; las cifras salen siempre de tus ventas e inventario.
            </Text>
            <TextInput
              mode="outlined"
              value={question}
              onChangeText={(text) => setQuestion(text.slice(0, MAX_QUESTION))}
              placeholder="Ej.: ventas por canal de este mes"
              accessibilityLabel="Describe el gráfico que quieres ver"
              returnKeyType="send"
              onSubmitEditing={() => void ask(question)}
              disabled={isAsking}
              right={
                <TextInput.Icon
                  icon="creation"
                  accessibilityLabel="Generar gráfico"
                  onPress={() => void ask(question)}
                  disabled={isAsking || !question.trim()}
                />
              }
            />
            {remaining !== null ? (
              <HelperText type="info" visible>
                {`Te quedan ${remaining} consultas de IA por hoy.`}
              </HelperText>
            ) : null}
            <View style={styles.chips}>
              {SUGGESTIONS.map((suggestion) => (
                <Chip key={suggestion} compact icon="creation" disabled={isAsking} onPress={() => void ask(suggestion)}>
                  {suggestion}
                </Chip>
              ))}
            </View>
          </Card.Content>
        </Card>

        <View style={styles.section}>
          <Text variant="labelLarge" style={{ color: theme.colors.onSurfaceVariant }}>
            Gráficos rápidos (no gastan consultas)
          </Text>
          <View style={styles.chips}>
            {PRESETS.map((preset) => (
              <Chip key={preset.label} mode="outlined" disabled={isAsking} onPress={() => void runPreset(preset)}>
                {preset.label}
              </Chip>
            ))}
          </View>
        </View>

        {askError ? (
          <HelperText type="error" visible style={styles.error}>
            {askError}
          </HelperText>
        ) : null}

        {isAsking ? <ChartCard result={null} title="Generando gráfico…" action={{ icon: 'dots-horizontal', label: 'Generando', onPress: () => undefined }} /> : null}

        {draft && !isAsking ? (
          <View>
            <ChartCard
              result={draft.result}
              title={draft.result.spec.titulo ?? 'Gráfico'}
              action={{ icon: 'close', label: 'Descartar gráfico', onPress: () => setDraft(null) }}
            />
            <Button mode="contained" icon="pin-outline" onPress={pinDraft} style={styles.pin} contentStyle={styles.pinContent}>
              Fijar en mi tablero
            </Button>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.bold}>
            Mi tablero
          </Text>
          {board.length === 0 ? (
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              Aún no fijaste gráficos. Genera uno y toca «Fijar en mi tablero»: se actualizará solo con tus datos cada
              vez que entres.
            </Text>
          ) : null}
        </View>

        {board.map((entry) => (
          <ChartCard
            key={entry.saved.id}
            result={entry.result}
            error={entry.error}
            title={entry.result?.spec.titulo ?? entry.saved.spec.titulo ?? 'Gráfico'}
            action={{ icon: 'pin-off-outline', label: 'Quitar del tablero', onPress: () => unpin(entry.saved.id) }}
            onRetry={() => void retry(entry.saved)}
          />
        ))}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { gap: 16, paddingBottom: 32, paddingTop: 16 },
  card: { marginHorizontal: 16 },
  bold: { fontWeight: '700' },
  hint: { marginBottom: 12, marginTop: 2 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  section: { gap: 4, paddingHorizontal: 16 },
  error: { paddingHorizontal: 16 },
  cardHeader: { alignItems: 'flex-start', flexDirection: 'row', gap: 8, marginBottom: 12 },
  cardTitle: { flex: 1 },
  cardAction: { margin: 0 },
  cardError: { alignItems: 'center', gap: 12, paddingVertical: 16 },
  summary: { marginTop: 12 },
  skeletons: { gap: 12, paddingVertical: 8 },
  pin: { marginHorizontal: 16, marginTop: 12 },
  pinContent: { minHeight: 44 },
});

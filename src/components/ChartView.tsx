import { useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import Svg, { Circle, G, Line, Polyline, Text as SvgText } from 'react-native-svg';
import type { ChartPoint, ChartType, ChartUnit } from '../types/charts';
import { formatCompactAmount, formatCurrency } from '../utils/format';

interface ChartViewProps {
  type: ChartType;
  unit: ChartUnit;
  points: ChartPoint[];
}

// Paleta categórica con buen contraste en tema claro y oscuro.
const PALETTE = ['#3d6cb9', '#e9a95c', '#3a9d8f', '#c8553d', '#8e6bbf', '#5fa8d3', '#b5838d', '#7a8699'];
const MAX_SLICES = 6;

const formatValue = (value: number, unit: ChartUnit) => {
  if (unit === 'SOLES') return formatCurrency(value);
  const rounded = Math.round(value);
  if (unit === 'VENTAS') return `${rounded} ${rounded === 1 ? 'venta' : 'ventas'}`;
  return `${rounded} ${rounded === 1 ? 'unidad' : 'unidades'}`;
};

const formatAxis = (value: number, unit: ChartUnit) =>
  unit === 'SOLES' ? formatCompactAmount(value) : String(Math.round(value));

function Bars({ unit, points }: Omit<ChartViewProps, 'type'>) {
  const theme = useTheme();
  const max = Math.max(...points.map((point) => point.valor), 1);

  return (
    <View style={styles.bars}>
      {points.map((point, index) => (
        <View
          key={`${point.etiqueta}-${index}`}
          style={styles.barRow}
          accessibilityLabel={`${point.etiqueta}: ${formatValue(point.valor, unit)}`}
        >
          <View style={styles.barLabels}>
            <Text variant="bodyMedium" numberOfLines={1} style={styles.barLabel}>
              {point.etiqueta}
            </Text>
            <Text variant="labelLarge">{formatValue(point.valor, unit)}</Text>
          </View>
          <View style={[styles.track, { backgroundColor: theme.colors.surfaceVariant }]}>
            <View
              style={[
                styles.bar,
                { backgroundColor: theme.colors.primary, width: `${Math.max((point.valor / max) * 100, 0)}%` },
              ]}
            />
          </View>
        </View>
      ))}
    </View>
  );
}

const LINE_HEIGHT = 220;
const LINE_PADDING = { top: 12, right: 12, bottom: 28, left: 52 };
const GRID_LINES = 4;
const MAX_X_LABELS = 6;

function LineChart({ unit, points }: Omit<ChartViewProps, 'type'>) {
  const theme = useTheme();
  const [width, setWidth] = useState(0);
  const handleLayout = (event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width);

  const max = Math.max(...points.map((point) => point.valor), 1);
  const plotWidth = Math.max(width - LINE_PADDING.left - LINE_PADDING.right, 0);
  const plotHeight = LINE_HEIGHT - LINE_PADDING.top - LINE_PADDING.bottom;
  const stepX = points.length > 1 ? plotWidth / (points.length - 1) : 0;
  const labelEvery = Math.max(1, Math.ceil(points.length / MAX_X_LABELS));

  const coords = points.map((point, index) => ({
    x: LINE_PADDING.left + index * stepX,
    y: LINE_PADDING.top + plotHeight - (point.valor / max) * plotHeight,
  }));
  const total = points.reduce((sum, point) => sum + point.valor, 0);

  return (
    <View
      onLayout={handleLayout}
      accessibilityRole="image"
      accessibilityLabel={`Gráfico de línea con ${points.length} puntos, total ${formatValue(total, unit)}`}
    >
      {width > 0 ? (
        <Svg width={width} height={LINE_HEIGHT}>
          {Array.from({ length: GRID_LINES + 1 }, (_, index) => {
            const y = LINE_PADDING.top + (plotHeight / GRID_LINES) * index;
            const value = max - (max / GRID_LINES) * index;
            return (
              <G key={index}>
                <Line
                  x1={LINE_PADDING.left}
                  x2={width - LINE_PADDING.right}
                  y1={y}
                  y2={y}
                  stroke={theme.colors.outlineVariant}
                  strokeWidth={1}
                />
                <SvgText x={LINE_PADDING.left - 6} y={y + 4} fontSize={10} fill={theme.colors.onSurfaceVariant} textAnchor="end">
                  {formatAxis(value, unit)}
                </SvgText>
              </G>
            );
          })}
          {coords.length > 1 ? (
            <Polyline
              points={coords.map((coord) => `${coord.x},${coord.y}`).join(' ')}
              fill="none"
              stroke={theme.colors.primary}
              strokeWidth={2.5}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          ) : null}
          {coords.map((coord, index) => (
            <G key={index}>
              {points.length <= 31 ? <Circle cx={coord.x} cy={coord.y} r={3} fill={theme.colors.primary} /> : null}
              {index % labelEvery === 0 ? (
                <SvgText
                  x={coord.x}
                  y={LINE_HEIGHT - 8}
                  fontSize={10}
                  fill={theme.colors.onSurfaceVariant}
                  textAnchor="middle"
                >
                  {points[index].etiqueta}
                </SvgText>
              ) : null}
            </G>
          ))}
        </Svg>
      ) : (
        <View style={{ height: LINE_HEIGHT }} />
      )}
    </View>
  );
}

const DONUT_SIZE = 168;
const DONUT_STROKE = 30;

function Donut({ unit, points }: Omit<ChartViewProps, 'type'>) {
  const theme = useTheme();
  const positive = points.filter((point) => point.valor > 0).sort((a, b) => b.valor - a.valor);
  // Con muchas partes una torta no se lee: las más pequeñas se juntan en "Otros".
  const slices =
    positive.length > MAX_SLICES
      ? [
          ...positive.slice(0, MAX_SLICES - 1),
          { etiqueta: 'Otros', valor: positive.slice(MAX_SLICES - 1).reduce((sum, point) => sum + point.valor, 0) },
        ]
      : positive;
  const total = slices.reduce((sum, slice) => sum + slice.valor, 0);

  const radius = (DONUT_SIZE - DONUT_STROKE) / 2;
  const circumference = 2 * Math.PI * radius;
  // Longitud de arco de cada parte y dónde empieza (suma de las anteriores).
  const arcs = slices.map((slice, index) => ({
    length: (slice.valor / total) * circumference,
    start: slices.slice(0, index).reduce((sum, previous) => sum + (previous.valor / total) * circumference, 0),
  }));

  return (
    <View style={styles.donutWrap}>
      <View accessibilityRole="image" accessibilityLabel={`Gráfico circular, total ${formatValue(total, unit)}`}>
        <Svg width={DONUT_SIZE} height={DONUT_SIZE}>
          <G rotation={-90} origin={`${DONUT_SIZE / 2}, ${DONUT_SIZE / 2}`}>
            {slices.map((slice, index) => {
              const { length, start } = arcs[index];
              return (
                <Circle
                  key={`${slice.etiqueta}-${index}`}
                  cx={DONUT_SIZE / 2}
                  cy={DONUT_SIZE / 2}
                  r={radius}
                  fill="none"
                  stroke={PALETTE[index % PALETTE.length]}
                  strokeWidth={DONUT_STROKE}
                  strokeDasharray={`${length} ${circumference - length}`}
                  strokeDashoffset={-start}
                />
              );
            })}
          </G>
        </Svg>
      </View>
      <View style={styles.legend}>
        {slices.map((slice, index) => (
          <View key={`${slice.etiqueta}-${index}`} style={styles.legendRow}>
            <View style={[styles.swatch, { backgroundColor: PALETTE[index % PALETTE.length] }]} />
            <View style={styles.legendText}>
              <Text variant="bodyMedium" numberOfLines={1}>
                {slice.etiqueta}
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                {`${formatValue(slice.valor, unit)} · ${((slice.valor / total) * 100).toFixed(0)}%`}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

export function ChartView({ type, unit, points }: ChartViewProps) {
  const theme = useTheme();
  const hasData = points.some((point) => point.valor > 0);

  if (!hasData) {
    return (
      <Text variant="bodyMedium" style={[styles.empty, { color: theme.colors.onSurfaceVariant }]}>
        No hay datos para este gráfico en el periodo elegido.
      </Text>
    );
  }
  if (type === 'LINEA') return <LineChart unit={unit} points={points} />;
  if (type === 'TORTA') return <Donut unit={unit} points={points} />;
  return <Bars unit={unit} points={points} />;
}

const styles = StyleSheet.create({
  empty: { paddingVertical: 24, textAlign: 'center' },
  bars: { gap: 12 },
  barRow: { gap: 4 },
  barLabels: { alignItems: 'center', flexDirection: 'row', gap: 8, justifyContent: 'space-between' },
  barLabel: { flex: 1 },
  track: { borderRadius: 4, height: 8, overflow: 'hidden' },
  bar: { borderRadius: 4, height: 8 },
  donutWrap: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: 20, justifyContent: 'center' },
  legend: { flexGrow: 1, flexShrink: 1, gap: 8, minWidth: 160 },
  legendRow: { alignItems: 'center', flexDirection: 'row', gap: 10 },
  legendText: { flex: 1 },
  swatch: { borderRadius: 4, height: 14, width: 14 },
});

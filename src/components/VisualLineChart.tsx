import { useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import { useTheme } from 'react-native-paper';
import Svg, { Circle, G, Line, Polyline, Text as SvgText } from 'react-native-svg';
import { formatAxisValue, type VisualFormat, type VisualPoint } from '../utils/visuals';
import { VisualCard } from './VisualCard';

interface VisualLineChartProps {
  title?: string;
  points: VisualPoint[];
  format: VisualFormat;
}

const HEIGHT = 220;
const PADDING = { top: 12, right: 12, bottom: 28, left: 64 };
const GRID_LINES = 4;
const MIN_LABEL_SPACING = 48;

export function VisualLineChart({ title, points, format }: VisualLineChartProps) {
  const theme = useTheme();
  const [width, setWidth] = useState(0);

  const handleLayout = (event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width);

  const minValue = Math.min(...points.map((point) => point.value), 0);
  const maxValue = Math.max(...points.map((point) => point.value), 0);
  const range = maxValue - minValue || 1;
  const plotWidth = Math.max(width - PADDING.left - PADDING.right, 0);
  const plotHeight = HEIGHT - PADDING.top - PADDING.bottom;
  const stepX = points.length > 1 ? plotWidth / (points.length - 1) : 0;
  const labelEvery = stepX > 0 ? Math.max(Math.ceil(MIN_LABEL_SPACING / stepX), 1) : 1;

  const coordinates = points.map((point, index) => ({
    x: points.length > 1 ? PADDING.left + index * stepX : PADDING.left + plotWidth / 2,
    y: PADDING.top + plotHeight - ((point.value - minValue) / range) * plotHeight,
  }));

  return (
    <VisualCard title={title}>
      <View onLayout={handleLayout} accessibilityRole="image" accessibilityLabel={title || 'Gráfico de líneas'}>
        {width > 0 ? (
          <Svg width={width} height={HEIGHT}>
            {Array.from({ length: GRID_LINES + 1 }, (_, index) => {
              const ratio = index / GRID_LINES;
              const y = PADDING.top + plotHeight - ratio * plotHeight;
              return (
                <G key={index}>
                  <Line
                    x1={PADDING.left}
                    x2={width - PADDING.right}
                    y1={y}
                    y2={y}
                    stroke={theme.colors.outlineVariant}
                    strokeDasharray="4 4"
                    strokeWidth={1}
                  />
                  <SvgText
                    x={PADDING.left - 8}
                    y={y + 4}
                    fontSize={11}
                    textAnchor="end"
                    fill={theme.colors.onSurfaceVariant}
                  >
                    {formatAxisValue(minValue + range * ratio, format)}
                  </SvgText>
                </G>
              );
            })}
            <Polyline
              points={coordinates.map((coordinate) => `${coordinate.x},${coordinate.y}`).join(' ')}
              fill="none"
              stroke={theme.colors.primary}
              strokeWidth={2}
            />
            {coordinates.map((coordinate, index) => (
              <Circle key={`dot-${index}`} cx={coordinate.x} cy={coordinate.y} r={3.5} fill={theme.colors.primary} />
            ))}
            {coordinates.map((coordinate, index) =>
              index % labelEvery === 0 ? (
                <SvgText
                  key={`label-${index}`}
                  x={coordinate.x}
                  y={HEIGHT - 8}
                  fontSize={11}
                  textAnchor="middle"
                  fill={theme.colors.onSurfaceVariant}
                >
                  {points[index].label}
                </SvgText>
              ) : null,
            )}
          </Svg>
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>
    </VisualCard>
  );
}

const styles = StyleSheet.create({
  placeholder: { height: HEIGHT },
});

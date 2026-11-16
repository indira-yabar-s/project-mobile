import { useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import { useTheme } from 'react-native-paper';
import Svg, { Circle, G, Line, Polyline, Text as SvgText } from 'react-native-svg';
import type { DailySalesPoint } from '../types/reports';
import { formatCompactAmount, formatCurrency } from '../utils/format';

interface DailySalesChartProps {
  data: DailySalesPoint[];
}

const HEIGHT = 220;
const PADDING = { top: 12, right: 12, bottom: 28, left: 52 };
const GRID_LINES = 4;

export function DailySalesChart({ data }: DailySalesChartProps) {
  const theme = useTheme();
  const [width, setWidth] = useState(0);

  const handleLayout = (event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width);

  const maxValue = Math.max(...data.map((point) => point.total), 1);
  const plotWidth = Math.max(width - PADDING.left - PADDING.right, 0);
  const plotHeight = HEIGHT - PADDING.top - PADDING.bottom;
  const stepX = data.length > 1 ? plotWidth / (data.length - 1) : 0;

  const points = data.map((point, index) => ({
    x: PADDING.left + index * stepX,
    y: PADDING.top + plotHeight - (point.total / maxValue) * plotHeight,
  }));

  const total = data.reduce((sum, point) => sum + point.total, 0);

  return (
    <View
      onLayout={handleLayout}
      accessibilityRole="image"
      accessibilityLabel={`Ventas por día de los últimos 7 días, total ${formatCurrency(total)}`}
    >
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
                  {formatCompactAmount(maxValue * ratio)}
                </SvgText>
              </G>
            );
          })}
          <Polyline
            points={points.map((point) => `${point.x},${point.y}`).join(' ')}
            fill="none"
            stroke={theme.colors.primary}
            strokeWidth={2}
          />
          {points.map((point, index) => (
            <Circle key={data[index].label} cx={point.x} cy={point.y} r={3.5} fill={theme.colors.primary} />
          ))}
          {points.map((point, index) => (
            <SvgText
              key={`label-${data[index].label}`}
              x={point.x}
              y={HEIGHT - 8}
              fontSize={11}
              textAnchor="middle"
              fill={theme.colors.onSurfaceVariant}
            >
              {data[index].label}
            </SvgText>
          ))}
        </Svg>
      ) : (
        <View style={styles.placeholder} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: { height: HEIGHT },
});

import type { SalesGrouping } from './reports';

export type ChartType = 'BARRAS' | 'LINEA' | 'TORTA';
export type ChartSource = 'VENTAS_POR_DIA' | 'VENTAS_AGRUPADAS' | 'TOP_PRODUCTOS' | 'STOCK_PARADO' | 'REPOSICION';
export type ChartMetric = 'TOTAL' | 'UNIDADES' | 'VENTAS' | 'GANANCIA';
export type ChartUnit = 'SOLES' | 'UNIDADES' | 'VENTAS';

/** Receta de un gráfico: qué datos mostrar y cómo. No contiene cifras; el backend las calcula. */
export interface ChartSpec {
  titulo?: string | null;
  tipo?: ChartType | null;
  fuente: ChartSource;
  desde?: string | null;
  hasta?: string | null;
  agrupacion?: SalesGrouping | null;
  metrica?: ChartMetric | null;
  limite?: number | null;
}

export interface ChartPoint {
  etiqueta: string;
  valor: number;
}

export interface ChartResult {
  spec: ChartSpec;
  unidad: ChartUnit;
  puntos: ChartPoint[];
  resumen: string;
  preguntasRestantes: number | null;
}

/** Gráfico fijado en el tablero. `dias` hace que el periodo se mueva con la fecha (últimos N días). */
export interface SavedChart {
  id: string;
  spec: ChartSpec;
  dias: number | null;
}

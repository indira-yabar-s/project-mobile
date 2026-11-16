import { formatCurrency } from './format';

export const VISUAL_TYPES = {
  BAR: 'BARRAS',
  LINE: 'LINEAS',
  CARDS: 'TARJETAS',
  TABLE: 'TABLA',
} as const;

export type VisualFormat = 'moneda' | 'numero' | 'porcentaje';

export interface VisualPoint {
  label: string;
  value: number;
}

export interface VisualCardItem {
  label: string;
  value: number | string;
  note: string;
}

export interface VisualColumn {
  key: string;
  header: string;
}

export type VisualRow = Record<string, unknown>;

export type SafeVisual =
  | { type: typeof VISUAL_TYPES.BAR; title: string; format: VisualFormat; points: VisualPoint[] }
  | { type: typeof VISUAL_TYPES.LINE; title: string; format: VisualFormat; points: VisualPoint[] }
  | { type: typeof VISUAL_TYPES.CARDS; title: string; format: VisualFormat; cards: VisualCardItem[] }
  | { type: typeof VISUAL_TYPES.TABLE; title: string; columns: VisualColumn[]; rows: VisualRow[] };

const VALUE_FORMATS: VisualFormat[] = ['moneda', 'numero', 'porcentaje'];
const MAX_POINTS = 50;
const MAX_CARDS = 6;
const MAX_COLUMNS = 8;

function formatPlainNumber(value: number, maxDecimals: number): string {
  const sign = value < 0 ? '-' : '';
  const [integer, decimals] = Math.abs(value).toFixed(maxDecimals).split('.');
  const grouped = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const trimmed = decimals ? decimals.replace(/0+$/, '') : '';
  return `${sign}${grouped}${trimmed ? `.${trimmed}` : ''}`;
}

export function formatVisualValue(value: unknown, format: VisualFormat = 'numero'): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) return String(value ?? '');
  if (format === 'moneda') return formatCurrency(value);
  if (format === 'porcentaje') return `${formatPlainNumber(value, 2)} %`;
  return formatPlainNumber(value, 2);
}

export function formatAxisValue(value: number, format: VisualFormat = 'numero'): string {
  const text = formatPlainNumber(value, 0);
  if (format === 'moneda') return `S/ ${text}`;
  if (format === 'porcentaje') return `${text} %`;
  return text;
}

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const toText = (value: unknown): string => (typeof value === 'string' ? value.trim() : '');

function normalizePoints(data: unknown): VisualPoint[] | null {
  if (!Array.isArray(data) || data.length === 0 || data.length > MAX_POINTS) return null;
  const points = data.map((item: unknown) => {
    const record = isPlainObject(item) ? item : {};
    return { label: toText(record.etiqueta), value: Number(record.valor) };
  });
  return points.every((point) => point.label && Number.isFinite(point.value)) ? points : null;
}

function normalizeCards(data: unknown): VisualCardItem[] | null {
  if (!Array.isArray(data) || data.length === 0 || data.length > MAX_CARDS) return null;
  const cards = data.map((item: unknown) => {
    const record = isPlainObject(item) ? item : {};
    return {
      label: toText(record.etiqueta),
      value: typeof record.valor === 'number' ? record.valor : toText(String(record.valor ?? '')),
      note: toText(record.nota),
    };
  });
  const isValid = cards.every(
    (card) => card.label && (typeof card.value === 'number' || card.value !== ''),
  );
  return isValid ? cards : null;
}

function normalizeTable(
  columns: unknown,
  rows: unknown,
): { columns: VisualColumn[]; rows: VisualRow[] } | null {
  if (!Array.isArray(columns) || columns.length === 0 || columns.length > MAX_COLUMNS) return null;
  if (!Array.isArray(rows) || rows.length === 0 || rows.length > MAX_POINTS) return null;
  const normalizedColumns = columns.map((column: unknown) => {
    const record = isPlainObject(column) ? column : {};
    return { key: toText(record.clave), header: toText(record.titulo) };
  });
  if (!normalizedColumns.every((column) => column.key && column.header)) return null;
  if (!rows.every(isPlainObject)) return null;
  return { columns: normalizedColumns, rows: rows as VisualRow[] };
}

export function normalizeVisual(raw: unknown): SafeVisual | null {
  if (!isPlainObject(raw)) return null;

  const type = toText(raw.tipo).toUpperCase();
  const title = toText(raw.titulo);
  const format = VALUE_FORMATS.find((item) => item === raw.formato) ?? 'numero';

  if (type === VISUAL_TYPES.BAR || type === VISUAL_TYPES.LINE) {
    const points = normalizePoints(raw.datos);
    return points ? { type, title, format, points } : null;
  }

  if (type === VISUAL_TYPES.CARDS) {
    const cards = normalizeCards(raw.datos);
    return cards ? { type, title, format, cards } : null;
  }

  if (type === VISUAL_TYPES.TABLE) {
    const table = normalizeTable(raw.columnas, raw.filas);
    return table ? { type, title, ...table } : null;
  }

  return null;
}

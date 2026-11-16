export interface DateRange {
  desde: string;
  hasta: string;
}

const MS_PER_DAY = 86_400_000;
const WEEKDAYS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];

function parseISODate(isoDate: string): Date {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function fromISODate(isoDate: string): Date {
  return parseISODate(isoDate);
}

export function getLastDaysRange(days = 30): DateRange {
  const hasta = new Date();
  const desde = new Date();
  desde.setDate(hasta.getDate() - (days - 1));
  return { desde: toISODate(desde), hasta: toISODate(hasta) };
}

export function addDays(isoDate: string, amount: number): string {
  const date = parseISODate(isoDate);
  date.setDate(date.getDate() + amount);
  return toISODate(date);
}

export function countDays({ desde, hasta }: DateRange): number {
  const ms = parseISODate(hasta).getTime() - parseISODate(desde).getTime();
  return Math.round(ms / MS_PER_DAY) + 1;
}

export function getPreviousRange(range: DateRange): DateRange {
  const days = countDays(range);
  return { desde: addDays(range.desde, -days), hasta: addDays(range.desde, -1) };
}

export function getDaysList(hasta: string, days = 7): string[] {
  return Array.from({ length: days }, (_, index) => addDays(hasta, index - (days - 1)));
}

export function formatShortDay(isoDate: string): string {
  const date = parseISODate(isoDate);
  return `${WEEKDAYS[date.getDay()]} ${date.getDate()}`;
}

export function formatDisplayDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
}

export function percentChange(current: number | null | undefined, previous: number | null | undefined): number | null {
  const prev = Number(previous ?? 0);
  if (!prev) return null;
  return ((Number(current ?? 0) - prev) / Math.abs(prev)) * 100;
}

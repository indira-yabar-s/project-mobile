import type { SortDirection } from '../hooks/useSort';
import { FilterChips } from './FilterChips';

interface SortChipsProps<F extends string> {
  labels: Record<F, string>;
  field: F;
  direction: SortDirection;
  onChange: (field: F) => void;
}

export function SortChips<F extends string>({ labels, field, direction, onChange }: SortChipsProps<F>) {
  const options = (Object.keys(labels) as F[]).map((key) => ({
    value: key,
    label: key === field ? `${labels[key]} ${direction === 'asc' ? '↑' : '↓'}` : labels[key],
  }));

  return <FilterChips label="Ordenar por" options={options} value={field} onChange={(value) => onChange(value as F)} />;
}

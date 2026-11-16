import { useCallback, useState } from 'react';

export type SortDirection = 'asc' | 'desc';

export function useSort<F extends string>(defaultField: F, defaultDirection: SortDirection = 'asc') {
  const [field, setField] = useState<F>(defaultField);
  const [direction, setDirection] = useState<SortDirection>(defaultDirection);

  const toggle = useCallback(
    (next: F) => {
      if (next === field) {
        setDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
      } else {
        setField(next);
        setDirection('asc');
      }
    },
    [field],
  );

  return { field, direction, sort: `${field},${direction}`, toggle };
}

import { useCallback, useMemo, useReducer } from 'react';
import {
  createEmptyLine,
  getOrderTotal,
  hasErrors,
  validateLine,
  type OrderLine,
  type OrderMode,
} from '../utils/orderLines';

type LinePatch = Partial<Omit<OrderLine, 'key'>>;

type Action =
  | { type: 'add'; line: OrderLine }
  | { type: 'remove'; key: string }
  | { type: 'update'; key: string; patch: LinePatch };

function reducer(state: OrderLine[], action: Action): OrderLine[] {
  switch (action.type) {
    case 'add':
      return [...state, action.line];
    case 'remove':
      return state.length > 1 ? state.filter((line) => line.key !== action.key) : state;
    case 'update':
      return state.map((line) => (line.key === action.key ? { ...line, ...action.patch } : line));
  }
}

export function useOrderLines(mode: OrderMode, initialLines?: OrderLine[]) {
  const [lines, dispatch] = useReducer(reducer, undefined, () =>
    initialLines && initialLines.length > 0 ? initialLines : [createEmptyLine()],
  );

  const addLine = useCallback(() => dispatch({ type: 'add', line: createEmptyLine() }), []);
  const removeLine = useCallback((key: string) => dispatch({ type: 'remove', key }), []);
  const updateLine = useCallback((key: string, patch: LinePatch) => dispatch({ type: 'update', key, patch }), []);

  const total = useMemo(() => getOrderTotal(lines), [lines]);
  const isValid = useMemo(() => lines.every((line) => !hasErrors(validateLine(line, mode))), [lines, mode]);

  return { lines, addLine, removeLine, updateLine, total, isValid };
}

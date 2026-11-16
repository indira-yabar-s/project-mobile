import { createContext } from 'react';

export type SnackbarKind = 'success' | 'error' | 'info';

export interface SnackbarContextValue {
  showMessage: (message: string, kind?: SnackbarKind) => void;
}

export const SnackbarContext = createContext<SnackbarContextValue | null>(null);

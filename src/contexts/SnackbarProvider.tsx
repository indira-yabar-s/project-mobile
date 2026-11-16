import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { Snackbar, useTheme } from 'react-native-paper';
import { SnackbarContext, type SnackbarContextValue, type SnackbarKind } from './SnackbarContext';

interface SnackbarState {
  visible: boolean;
  message: string;
  kind: SnackbarKind;
}

interface SnackbarProviderProps {
  children: ReactNode;
}

export function SnackbarProvider({ children }: SnackbarProviderProps) {
  const theme = useTheme();
  const [state, setState] = useState<SnackbarState>({ visible: false, message: '', kind: 'info' });

  const showMessage = useCallback((message: string, kind: SnackbarKind = 'info') => {
    setState({ visible: true, message, kind });
  }, []);

  const dismiss = useCallback(() => {
    setState((previous) => ({ ...previous, visible: false }));
  }, []);

  const value = useMemo<SnackbarContextValue>(() => ({ showMessage }), [showMessage]);

  const backgroundColor =
    state.kind === 'error'
      ? theme.colors.error
      : state.kind === 'success'
        ? theme.colors.primary
        : theme.colors.inverseSurface;
  const textColor =
    state.kind === 'error'
      ? theme.colors.onError
      : state.kind === 'success'
        ? theme.colors.onPrimary
        : theme.colors.inverseOnSurface;

  return (
    <SnackbarContext.Provider value={value}>
      <View style={styles.root}>
        {children}
        <Snackbar
          visible={state.visible}
          onDismiss={dismiss}
          duration={4000}
          style={{ backgroundColor }}
          action={{ label: 'Cerrar', textColor, onPress: dismiss }}
        >
          {state.message}
        </Snackbar>
      </View>
    </SnackbarContext.Provider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});

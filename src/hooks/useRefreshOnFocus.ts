import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useRef } from 'react';

export function useRefreshOnFocus(refresh: () => void) {
  const refreshRef = useRef(refresh);
  const isFirstFocus = useRef(true);

  useEffect(() => {
    refreshRef.current = refresh;
  });

  useFocusEffect(
    useCallback(() => {
      if (isFirstFocus.current) {
        isFirstFocus.current = false;
        return;
      }
      refreshRef.current();
    }, []),
  );
}

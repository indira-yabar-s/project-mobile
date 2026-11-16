import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';

type Fetcher<T> = (signal: AbortSignal) => Promise<T>;

interface FetchResult<T> {
  data: T | null;
  error: unknown;
  fetcher: Fetcher<T> | null;
  reloadCount: number;
}

export function useFetch<T>(fetcher: Fetcher<T>) {
  const [reloadCount, setReloadCount] = useState(0);
  const [result, setResult] = useState<FetchResult<T>>({
    data: null,
    error: null,
    fetcher: null,
    reloadCount: -1,
  });

  useEffect(() => {
    const controller = new AbortController();

    fetcher(controller.signal)
      .then((data) => setResult({ data, error: null, fetcher, reloadCount }))
      .catch((error: unknown) => {
        if (axios.isCancel(error)) return;
        setResult((previous) => ({ ...previous, error, fetcher, reloadCount }));
      });

    return () => controller.abort();
  }, [fetcher, reloadCount]);

  const refetch = useCallback(() => setReloadCount((count) => count + 1), []);
  const isLoading = result.fetcher !== fetcher || result.reloadCount !== reloadCount;

  return {
    data: result.data,
    error: isLoading ? null : result.error,
    isLoading,
    refetch,
  };
}

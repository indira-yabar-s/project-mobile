import axios from 'axios';
import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import type { PageResponse } from '../types/api';
import { DEFAULT_PAGE_SIZE } from '../utils/pagination';

export interface FetchPageArgs {
  page: number;
  size: number;
  signal: AbortSignal;
}

export type FetchPage<T> = (args: FetchPageArgs) => Promise<PageResponse<T>>;

type PendingKind = 'refresh' | 'more' | null;

interface State<T> {
  items: T[];
  page: number;
  totalElements: number;
  hasMore: boolean;
  source: FetchPage<T> | null;
  reloadCount: number;
  pending: PendingKind;
  error: unknown;
}

type Action<T> =
  | { type: 'pending'; kind: Exclude<PendingKind, null> }
  | {
      type: 'loaded';
      source: FetchPage<T>;
      reloadCount: number;
      page: number;
      response: PageResponse<T>;
      replace: boolean;
    }
  | { type: 'failed'; source: FetchPage<T>; reloadCount: number; error: unknown; isFirstPage: boolean };

function createInitialState<T>(): State<T> {
  return {
    items: [],
    page: 0,
    totalElements: 0,
    hasMore: false,
    source: null,
    reloadCount: -1,
    pending: null,
    error: null,
  };
}

function reducer<T>(state: State<T>, action: Action<T>): State<T> {
  switch (action.type) {
    case 'pending':
      return { ...state, pending: action.kind, error: null };
    case 'loaded':
      return {
        items: action.replace ? action.response.content : [...state.items, ...action.response.content],
        page: action.page,
        totalElements: action.response.totalElements,
        hasMore: !action.response.last,
        source: action.source,
        reloadCount: action.reloadCount,
        pending: null,
        error: null,
      };
    case 'failed':
      return {
        ...state,
        items: action.isFirstPage && state.pending !== 'refresh' ? [] : state.items,
        source: action.source,
        reloadCount: action.reloadCount,
        pending: null,
        error: action.error,
      };
  }
}

export function usePagination<T>(fetchPage: FetchPage<T>, pageSize: number = DEFAULT_PAGE_SIZE) {
  const [state, dispatch] = useReducer(reducer<T>, undefined, createInitialState<T>);
  const [reloadCount, setReloadCount] = useState(0);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    fetchPage({ page: 1, size: pageSize, signal: controller.signal })
      .then((response) => {
        if (controller.signal.aborted) return;
        dispatch({ type: 'loaded', source: fetchPage, reloadCount, page: 1, response, replace: true });
      })
      .catch((error: unknown) => {
        if (axios.isCancel(error) || controller.signal.aborted) return;
        dispatch({ type: 'failed', source: fetchPage, reloadCount, error, isFirstPage: true });
      });

    return () => controller.abort();
  }, [fetchPage, pageSize, reloadCount]);

  const isStale = state.source !== fetchPage || state.reloadCount !== reloadCount;

  const run = useCallback(
    (page: number, kind: 'refresh' | 'more') => {
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;
      dispatch({ type: 'pending', kind });

      fetchPage({ page, size: pageSize, signal: controller.signal })
        .then((response) => {
          if (controller.signal.aborted) return;
          dispatch({ type: 'loaded', source: fetchPage, reloadCount, page, response, replace: page === 1 });
        })
        .catch((error: unknown) => {
          if (axios.isCancel(error) || controller.signal.aborted) return;
          dispatch({ type: 'failed', source: fetchPage, reloadCount, error, isFirstPage: page === 1 });
        });
    },
    [fetchPage, pageSize, reloadCount],
  );

  const loadMore = useCallback(() => {
    if (isStale || state.pending || !state.hasMore || state.error) return;
    run(state.page + 1, 'more');
  }, [isStale, state.pending, state.hasMore, state.error, state.page, run]);

  const retryLoadMore = useCallback(() => {
    if (isStale || state.pending || !state.hasMore) return;
    run(state.page + 1, 'more');
  }, [isStale, state.pending, state.hasMore, state.page, run]);

  const refresh = useCallback(() => {
    if (isStale || state.pending) return;
    run(1, 'refresh');
  }, [isStale, state.pending, run]);

  const reload = useCallback(() => setReloadCount((count) => count + 1), []);

  return {
    items: isStale ? [] : state.items,
    totalElements: isStale ? 0 : state.totalElements,
    hasMore: !isStale && state.hasMore,
    isLoading: isStale,
    isRefreshing: !isStale && state.pending === 'refresh',
    isLoadingMore: !isStale && state.pending === 'more',
    error: isStale ? null : state.error,
    loadMore,
    retryLoadMore,
    refresh,
    reload,
  };
}

export type PaginationResult<T> = ReturnType<typeof usePagination<T>>;

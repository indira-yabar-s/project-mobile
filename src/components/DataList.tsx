import type { ComponentProps, ReactElement, ReactNode } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';
import type { PaginationResult } from '../hooks/usePagination';
import { getErrorMessage } from '../utils/errors';
import { EmptyState } from './EmptyState';
import { ErrorState } from './ErrorState';
import { Skeleton } from './Skeleton';

type EmptyIcon = ComponentProps<typeof EmptyState>['icon'];

interface DataListProps<T> {
  pagination: PaginationResult<T>;
  renderItem: (item: T, index: number) => ReactElement;
  keyExtractor: (item: T) => string;
  emptyTitle: string;
  emptyDescription?: string;
  emptyIcon?: EmptyIcon;
  emptyAction?: ReactNode;
  header?: ReactNode;
}

const SKELETON_ROWS = [0, 1, 2, 3, 4];

export function DataList<T>({
  pagination,
  renderItem,
  keyExtractor,
  emptyTitle,
  emptyDescription,
  emptyIcon,
  emptyAction,
  header,
}: DataListProps<T>) {
  const theme = useTheme();
  const {
    items,
    totalElements,
    isLoading,
    isRefreshing,
    isLoadingMore,
    hasMore,
    error,
    loadMore,
    retryLoadMore,
    refresh,
    reload,
  } = pagination;

  const errorMessage = error ? (getErrorMessage(error) ?? 'Ocurrió un error inesperado') : null;

  let body: ReactNode;

  if (isLoading) {
    body = (
      <View style={styles.skeletons}>
        {SKELETON_ROWS.map((row) => (
          <View key={row} style={[styles.skeletonCard, { backgroundColor: theme.colors.surface }]}>
            <Skeleton width="60%" height={16} />
            <Skeleton width="40%" height={12} style={styles.skeletonLine} />
          </View>
        ))}
      </View>
    );
  } else if (errorMessage && items.length === 0) {
    body = <ErrorState message={errorMessage} onRetry={reload} />;
  } else if (items.length === 0) {
    body = (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        icon={emptyIcon}
        action={emptyAction}
      />
    );
  } else {
    body = (
      <FlatList
        data={items}
        keyExtractor={keyExtractor}
        renderItem={({ item, index }) => renderItem(item, index)}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refresh} />}
        contentContainerStyle={styles.listContent}
        ListFooterComponent={
          <View style={styles.footer}>
            {isLoadingMore ? <ActivityIndicator color={theme.colors.primary} /> : null}
            {errorMessage && hasMore ? (
              <View style={styles.footerError}>
                <Text variant="bodySmall" style={{ color: theme.colors.error }}>
                  {errorMessage}
                </Text>
                <Button mode="text" onPress={retryLoadMore}>
                  Reintentar
                </Button>
              </View>
            ) : null}
            {!isLoadingMore && !errorMessage ? (
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                {`Mostrando ${items.length} de ${totalElements} resultados`}
              </Text>
            ) : null}
          </View>
        }
      />
    );
  }

  return (
    <View style={styles.container}>
      {header}
      {body}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { flexGrow: 1, paddingBottom: 24 },
  footer: { alignItems: 'center', paddingVertical: 16 },
  footerError: { alignItems: 'center' },
  skeletons: { gap: 12, padding: 16 },
  skeletonCard: { borderRadius: 12, padding: 16 },
  skeletonLine: { marginTop: 10 },
});

/**
 * InfiniteList — generic infinite scroll wrapper.
 *
 * Usage:
 *
 *   <InfiniteList
 *     queryKey={['transactions']}
 *     fetcher={({ lastId }) => api.get('/transactions', { params: { lastId, limit: 20 } }).then(r => r.data.data)}
 *     renderItem={(tx) => <TransactionCard tx={tx} />}
 *     cursorKey="seqId"           // field on each item used as the next cursor
 *     emptyState={<p>No transactions</p>}
 *   />
 */

import { useRef, useEffect } from 'react';
import { useInfiniteQuery, QueryKey } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';

interface InfiniteListProps<T> {
  /** React Query key — include any filter params so re-fetches work correctly */
  queryKey: QueryKey;

  /**
   * Function that fetches one page.
   * Receives { lastId } where lastId is the cursor from the previous page
   * (null on first load).
   */
  fetcher: (params: { lastId: number | string | null }) => Promise<T[]>;

  /** Render a single item */
  renderItem: (item: T, index: number) => React.ReactNode;

  /**
   * Which field on T holds the cursor value for the next page.
   * Typically 'seq_id' or 'seqId'.
   */
  cursorKey: keyof T;

  /** Shown when there are no items at all */
  emptyState?: React.ReactNode;

  /** Shown while the first page loads */
  loadingState?: React.ReactNode;

  /** Extra className on the list wrapper */
  className?: string;
}

export function InfiniteList<T>({
  queryKey,
  fetcher,
  renderItem,
  cursorKey,
  emptyState,
  loadingState,
  className = 'space-y-2 sm:space-y-3',
}: InfiniteListProps<T>) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) => fetcher({ lastId: pageParam as any }),
    initialPageParam: null,
    getNextPageParam: (lastPage: T[]) => {
      if (!lastPage.length) return undefined;
      const last = lastPage[lastPage.length - 1];
      return last[cursorKey] ?? undefined;
    },
  });

  // Intersection observer — fetch next page when sentinel enters viewport
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: '100px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const items = data?.pages.flatMap((page) => page) ?? [];

  if (isLoading) {
    return loadingState ?? (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12 text-sm text-red-500">
        Failed to load. Please try again.
      </div>
    );
  }

  if (!items.length) {
    return <>{emptyState ?? null}</>;
  }

  return (
    <div className={className}>
      {items.map((item, i) => renderItem(item, i))}

      {/* Sentinel — observed to trigger next page load */}
      <div ref={sentinelRef} />

      {isFetchingNextPage && (
        <div className="flex justify-center py-4">
          <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
        </div>
      )}

      {!hasNextPage && items.length > 0 && (
        <p className="text-center text-xs text-slate-400 dark:text-slate-500 py-4">
          You've reached the end
        </p>
      )}
    </div>
  );
}
import { useEffect, useRef } from "react";

interface InfiniteScrollListProps<T> {
  items: T[];
  hasNextPage?: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
}

export function InfiniteScrollList<T>({
  items,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  renderItem,
  className,
}: InfiniteScrollListProps<T>) {
  const observerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!observerRef.current || !hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 1 }
    );

    observer.observe(observerRef.current);

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className={className}>
      {items.map(renderItem)}
      <div ref={observerRef} />
    </div>
  );
}

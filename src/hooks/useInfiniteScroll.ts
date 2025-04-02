import { useState, useEffect, useRef, useCallback } from "react";

interface UseInfiniteScrollOptions<T, C> {
  fetchData: (cursor: C | null) => Promise<{
    data: T[];
    nextCursor: C | null;
  }>;
  initialData?: T[];
  limit?: number;
  threshold?: number;
  rootMargin?: string;
  isItemEqual?: (a: T, b: T) => boolean;
}

interface UseInfiniteScrollResult<T, C> {
  data: T[];
  loading: boolean;
  hasMore: boolean;
  observerTarget: React.RefObject<HTMLDivElement>;
  resetData: () => void;
  refreshData: () => Promise<void>;
  loadingRef: React.MutableRefObject<boolean>;
  cursor: C | null;
}

function useInfiniteScroll<T, C = number>({
  fetchData,
  initialData = [],
  limit = 20,
  threshold = 0.1,
  rootMargin = "20px",
  isItemEqual = (a: any, b: any) => a === b,
}: UseInfiniteScrollOptions<T, C>): UseInfiniteScrollResult<T, C> {
  const [data, setData] = useState<T[]>(initialData);
  const [loading, setLoading] = useState<boolean>(false);
  const [cursor, setCursor] = useState<C | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [initialLoad, setInitialLoad] = useState<boolean>(true);

  const observerTarget = useRef<HTMLDivElement>(null);
  const loadingRef = useRef<boolean>(false);

  // 중복 아이템 제거 유틸리티 함수
  const removeDuplicates = useCallback(
    (items: T[]): T[] => {
      const uniqueItems: T[] = [];
      for (const item of items) {
        if (!uniqueItems.some((uniqueItem) => isItemEqual(uniqueItem, item))) {
          uniqueItems.push(item);
        }
      }
      return uniqueItems;
    },
    [isItemEqual]
  );

  // 데이터 가져오기 함수
  const loadData = useCallback(
    async (reset: boolean = false) => {
      // 이미 요청 중이거나 더 이상 데이터가 없는 경우 중단
      if (loadingRef.current || (!reset && !hasMore)) return;

      loadingRef.current = true;
      setLoading(true);

      try {
        // 리셋하는 경우 첫 페이지부터, 아니면 다음 커서부터
        const currentCursor = reset ? null : cursor;
        const response = await fetchData(currentCursor);

        setData((prevData) => {
          const newData = reset
            ? response.data
            : [...prevData, ...response.data];
          return removeDuplicates(newData);
        });

        setCursor(response.nextCursor);
        setHasMore(!!response.nextCursor);

        if (initialLoad) {
          setInitialLoad(false);
        }
      } catch (error) {
        console.error("데이터 로드 중 오류 발생:", error);
        setHasMore(false);
      } finally {
        // 약간의 지연을 두어 UI가 너무 빨리 깜빡이는 것 방지
        setTimeout(() => {
          setLoading(false);
          loadingRef.current = false;
        }, 300);
      }
    },
    [cursor, hasMore, fetchData, initialLoad, removeDuplicates]
  );

  // 초기 데이터 로드
  useEffect(() => {
    if (initialLoad) {
      loadData(true);
    }
  }, [loadData, initialLoad]);

  // 인터섹션 옵저버 설정
  useEffect(() => {
    if (loading || !hasMore || initialLoad) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingRef.current && hasMore) {
          // 디바운스 효과를 위해 약간의 지연 적용
          setTimeout(() => {
            loadData();
          }, 100);
        }
      },
      { root: null, rootMargin, threshold }
    );

    const target = observerTarget.current;
    if (target) observer.observe(target);

    return () => {
      if (target) observer.unobserve(target);
    };
  }, [loading, hasMore, initialLoad, loadData, rootMargin, threshold]);

  // 데이터 리셋 함수
  const resetData = useCallback(() => {
    setData([]);
    setCursor(null);
    setHasMore(true);
    setInitialLoad(true);
  }, []);

  // 데이터 새로고침 함수
  const refreshData = useCallback(async () => {
    setData([]);
    setCursor(null);
    setHasMore(true);
    return loadData(true);
  }, [loadData]);

  return {
    data,
    loading,
    hasMore,
    observerTarget,
    resetData,
    refreshData,
    loadingRef,
    cursor,
  };
}

export default useInfiniteScroll;

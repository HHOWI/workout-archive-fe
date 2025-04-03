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

/**
 * 무한 스크롤 기능을 위한 훅
 * @template T 데이터 아이템의 타입
 * @template C 커서의 타입 (기본값: number, date_seq 형식 문자열도 사용 가능)
 */
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

        console.log("무한 스크롤 데이터 로드:", {
          currentCursor,
          responseData: response.data,
          responseNextCursor: response.nextCursor,
          currentDataLength: data.length,
          newDataLength: response.data.length,
        });

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
        // 지연 시간을 짧게 조정하여 UX 개선
        setTimeout(() => {
          setLoading(false);
          loadingRef.current = false;
        }, 100);
      }
    },
    [cursor, hasMore, fetchData, initialLoad, removeDuplicates, data.length]
  );

  // 초기 데이터 로드
  useEffect(() => {
    if (initialLoad) {
      loadData(true);
    }
  }, [loadData, initialLoad]);

  // 인터섹션 옵저버 설정
  useEffect(() => {
    if (loading || initialLoad) return;

    // hasMore 체크 제거 - 이미 loadData 함수 내에서 처리됨
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingRef.current) {
          console.log("인터섹션 감지됨, 데이터 로드 시도:", {
            hasMore,
            loading: loadingRef.current,
          });
          // 지연 시간 축소
          setTimeout(() => {
            loadData();
          }, 50);
        }
      },
      {
        root: null,
        // rootMargin 값 증가하여 더 빨리 감지되도록 함
        rootMargin: "100px",
        // threshold 값 감소하여 부분적으로만 보여도 로드되도록 함
        threshold: 0.01,
      }
    );

    const target = observerTarget.current;
    if (target) observer.observe(target);

    return () => {
      if (target) observer.unobserve(target);
    };
  }, [loading, initialLoad, loadData, hasMore]);

  // 데이터 리셋 함수
  const resetData = useCallback(() => {
    setData([]);
    setCursor(null);
    setHasMore(true);
    setInitialLoad(true);
    loadingRef.current = false;
  }, []);

  // 데이터 새로고침 함수
  const refreshData = useCallback(async () => {
    setData([]);
    setCursor(null);
    setHasMore(true);
    loadingRef.current = false;
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

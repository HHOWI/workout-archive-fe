# 커스텀 훅(Custom Hooks)

이 디렉토리에는 여러 컴포넌트에서 재사용할 수 있는 커스텀 훅이 포함되어 있습니다.

## useInfiniteScroll

무한 스크롤 기능을 구현하기 위한 커스텀 훅입니다. 이 훅은 Intersection Observer API를 사용하여 스크롤 감지 및 데이터 로딩을 처리합니다.

### 사용법

```tsx
import useInfiniteScroll from "../hooks/useInfiniteScroll";

const MyComponent = () => {
  // 데이터를 가져오는 함수 정의
  const fetchData = useCallback(async (cursor) => {
    const response = await api.getData(cursor);
    return {
      data: response.items, // 아이템 배열
      nextCursor: response.nextCursor, // 다음 페이지 커서 (null이면 더 이상 데이터 없음)
    };
  }, []);

  // 훅 사용
  const {
    data, // 로드된 데이터 배열
    loading, // 로딩 상태
    hasMore, // 더 불러올 데이터가 있는지 여부
    observerTarget, // 스크롤 감지를 위한 ref 객체
    refreshData, // 데이터 새로고침 함수
    resetData, // 데이터 초기화 함수
  } = useInfiniteScroll({
    fetchData, // 데이터 가져오는 함수
    isItemEqual: (a, b) => a.id === b.id, // 중복 아이템 확인용 (선택적)
  });

  return (
    <div>
      {data.map((item) => (
        <ItemComponent key={item.id} data={item} />
      ))}

      {/* 스크롤 감지를 위한 요소 - 리스트 맨 아래에 위치 */}
      <div ref={observerTarget}>{loading && <LoadingIndicator />}</div>

      <button onClick={refreshData}>새로고침</button>
    </div>
  );
};
```

### 옵션

`useInfiniteScroll` 훅은 다음 옵션을 받습니다:

| 옵션          | 타입                                                                   | 설명                               | 기본값              |
| ------------- | ---------------------------------------------------------------------- | ---------------------------------- | ------------------- |
| `fetchData`   | `(cursor: C \| null) => Promise<{ data: T[], nextCursor: C \| null }>` | 데이터를 가져오는 함수             | 필수                |
| `initialData` | `T[]`                                                                  | 초기 데이터                        | `[]`                |
| `limit`       | `number`                                                               | 한 번에 가져올 아이템 수           | `20`                |
| `threshold`   | `number`                                                               | Intersection Observer의 threshold  | `0.1`               |
| `rootMargin`  | `string`                                                               | Intersection Observer의 rootMargin | `'20px'`            |
| `isItemEqual` | `(a: T, b: T) => boolean`                                              | 아이템 중복 체크 함수              | `(a, b) => a === b` |

### 반환값

| 속성             | 타입                              | 설명                           |
| ---------------- | --------------------------------- | ------------------------------ |
| `data`           | `T[]`                             | 로드된 데이터 배열             |
| `loading`        | `boolean`                         | 현재 데이터 로딩 중인지 여부   |
| `hasMore`        | `boolean`                         | 더 불러올 데이터가 있는지 여부 |
| `observerTarget` | `React.RefObject<HTMLDivElement>` | 스크롤 감지를 위한 ref 객체    |
| `resetData`      | `() => void`                      | 데이터 초기화 함수             |
| `refreshData`    | `() => Promise<void>`             | 데이터 새로고침 함수           |
| `loadingRef`     | `React.MutableRefObject<boolean>` | 내부 로딩 상태 ref             |
| `cursor`         | `C \| null`                       | 현재 커서                      |

### 타입 파라미터

- `T`: 데이터 아이템의 타입
- `C`: 커서의 타입 (기본값: `number`)

### 주의사항

- `observerTarget` ref 요소는 항상 렌더링되어야 합니다. 조건부 렌더링을 사용하는 경우 주의하세요.
- 컴포넌트가 마운트 될 때 자동으로 첫 페이지 데이터를 로드합니다.
- 중복 아이템을 방지하기 위해 `isItemEqual` 함수를 제공하는 것이 좋습니다.

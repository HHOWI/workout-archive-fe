# 공통 스타일 시스템

이 디렉토리는 애플리케이션 전체에서 사용되는 공통 스타일과 테마를 관리합니다.

## 구조

- `theme.ts`: 테마 변수와 애니메이션 정의
- `CommonStyles.ts`: 재사용 가능한 스타일 컴포넌트 정의

## 테마 (theme.ts)

`theme.ts`는 다음과 같은 요소를 포함합니다:

### 색상 테마

앱 전체에서 일관된 색상을 사용할 수 있도록 정의된 색상 변수:

```tsx
export const theme = {
  primary: "#4a90e2",
  primaryDark: "#3a7bc8",
  secondary: "#f5f7fa",
  accent: "#6c5ce7",
  // ... 기타 색상
};
```

### 애니메이션

자주 사용되는 애니메이션 효과:

```tsx
export const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

export const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;
```

### 미디어 쿼리 헬퍼

반응형 디자인을 쉽게 구현할 수 있도록 정의된 미디어 쿼리:

```tsx
export const media = {
  xs: `@media (max-width: ${breakpoints.xs})`,
  sm: `@media (max-width: ${breakpoints.sm})`,
  // ... 기타 미디어 쿼리
};
```

## 공통 스타일 컴포넌트 (CommonStyles.ts)

`CommonStyles.ts`는 다음과 같은 요소를 포함합니다:

### 레이아웃 컴포넌트

```tsx
export const Container = styled.div`
  max-width: 935px;
  margin: 0 auto;
  padding: 30px 20px;
  // ... 기타 스타일
`;

export const HeaderBox = styled.div`
  display: flex;
  margin-bottom: 44px;
  // ... 기타 스타일
`;
```

### 데이터 표시 컴포넌트

```tsx
export const WorkoutGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  // ... 기타 스타일
`;

export const NoDataMessage = styled.div`
  text-align: center;
  padding: 60px 20px;
  // ... 기타 스타일
`;
```

### 로딩 상태 컴포넌트

```tsx
export const LoaderContainer = styled.div`
  // ... 로딩 컨테이너 스타일
`;

export const SpinnerIcon = styled(FaSpinner)`
  // ... 스피너 아이콘 스타일
`;

export const LoadingIndicator = () => (
  <LoadingSpinner>
    <SpinnerIcon />
    <span>데이터를 불러오는 중입니다...</span>
  </LoadingSpinner>
);
```

## 사용 방법

1. 페이지나 컴포넌트에서 필요한 스타일을 임포트합니다:

```tsx
import { theme, fadeIn } from "../styles/theme";
import {
  Container,
  WorkoutGrid,
  LoadingIndicator,
} from "../styles/CommonStyles";
```

2. 공통 스타일 컴포넌트를 직접 사용하거나 확장할 수 있습니다:

```tsx
// 직접 사용
return (
  <Container>
    <WorkoutGrid>{/* 컨텐츠 */}</WorkoutGrid>
  </Container>
);

// 확장하여 사용
const CustomHeader = styled(HeaderBox)`
  flex-direction: column;
`;
```

## 이점

- **일관성**: 앱 전체에서 일관된 스타일 적용
- **유지보수성**: 스타일 변경 시 한 곳에서만 수정하면 됨
- **재사용성**: 반복되는 스타일 코드 최소화
- **개발 속도**: 공통 컴포넌트 활용으로 빠른 개발 가능

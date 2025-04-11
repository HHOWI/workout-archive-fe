import { keyframes } from "@emotion/react";

// ===== 애니메이션 효과 =====
export const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

export const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

export const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

export const slideIn = keyframes`
  from { transform: translateX(-20px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

// ===== 색상 테마 =====
export const theme = {
  primary: "#4a90e2",
  primaryDark: "#3a7bc8",
  secondary: "#f5f7fa",
  accent: "#6c5ce7",
  accentDark: "#5a4bd7",
  background: "#ffffff",
  text: "#333333",
  textDark: "#1a1a1a",
  textLight: "#666666",
  textMuted: "#8e8e8e",
  border: "#e6e6e6",
  shadow: "rgba(0, 0, 0, 0.08)",
  shadowHover: "rgba(0, 0, 0, 0.12)",
  success: "#27ae60",
  error: "#e74c3c",
};

// 폰트 설정
export const fonts = {
  primary:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  sizes: {
    small: "13px",
    normal: "15px",
    medium: "16px",
    large: "18px",
    xlarge: "20px",
    h3: "20px",
    h2: "24px",
    h1: "28px",
  },
  weights: {
    normal: 400,
    medium: 500,
    semiBold: 600,
    bold: 700,
  },
};

// 반응형 미디어 쿼리 브레이크포인트
export const breakpoints = {
  xs: "480px",
  sm: "768px",
  md: "992px",
  lg: "1200px",
};

// 미디어 쿼리 헬퍼 함수
export const media = {
  xs: `@media (max-width: ${breakpoints.xs})`,
  sm: `@media (max-width: ${breakpoints.sm})`,
  md: `@media (max-width: ${breakpoints.md})`,
  lg: `@media (max-width: ${breakpoints.lg})`,
};

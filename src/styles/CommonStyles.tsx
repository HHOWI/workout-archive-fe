import styled from "@emotion/styled";
import { FaSpinner } from "react-icons/fa";
import { theme, fadeIn, spin, media } from "./theme";
import { FC } from "react";

// ===== 레이아웃 공통 스타일 =====
export const Container = styled.div`
  max-width: 935px;
  margin: 0 auto;
  padding: 30px 20px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica,
    Arial, sans-serif;
  color: ${theme.text};
  animation: ${fadeIn} 0.5s ease-out;

  ${media.sm} {
    padding: 20px 16px;
  }
`;

// ===== 헤더 공통 스타일 =====
export const HeaderBox = styled.div`
  display: flex;
  margin-bottom: 44px;
  border-radius: 16px;
  padding: 28px;
  background-color: ${theme.background};
  box-shadow: 0 4px 20px ${theme.shadow};
  border: 1px solid ${theme.border};
  transition: box-shadow 0.3s ease;
  animation: ${fadeIn} 0.6s ease-out;

  &:hover {
    box-shadow: 0 6px 24px ${theme.shadowHover};
  }

  ${media.sm} {
    padding: 22px;
    margin-bottom: 32px;
  }
`;

// ===== 그리드 및 카드 레이아웃 =====
export const WorkoutGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  animation: ${fadeIn} 0.6s ease-out;

  ${media.sm} {
    grid-template-columns: repeat(2, 1fr);
    gap: 14px;
  }

  ${media.xs} {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

// ===== 로딩 및 상태 표시 스타일 =====
export const NoDataMessage = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: ${theme.textMuted};
  background-color: ${theme.secondary};
  border-radius: 12px;
  margin-top: 20px;
  font-size: 15px;
  box-shadow: 0 2px 4px ${theme.shadow};
  border: 1px solid ${theme.border};
  animation: ${fadeIn} 0.5s ease-out;
`;

export const LoaderContainer = styled.div`
  width: 100%;
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 20px 0;
  color: ${theme.textLight};
  font-size: 14px;
  gap: 10px;
`;

export const SpinnerIcon = styled(FaSpinner)`
  font-size: 24px;
  color: ${theme.primary};
  animation: ${spin} 1s linear infinite;
`;

export const LoadingSpinner = styled.div`
  text-align: center;
  padding: 60px;
  color: ${theme.textLight};
  font-size: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
`;

// ===== 버튼 스타일 =====
export const ActionButton = styled.button`
  background-color: ${theme.secondary};
  color: ${theme.primary};
  border: 1px solid ${theme.border};
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;

  &:hover {
    background-color: #e8f0fe;
    transform: translateY(-2px);
  }
`;

export const ActionButtonsContainer = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 20px;

  ${media.sm} {
    justify-content: center;
  }
`;

// ===== 통계 및 정보 표시 스타일 =====
export const StatsContainer = styled.div`
  display: flex;
  gap: 26px;
  margin-top: 5px;

  ${media.sm} {
    justify-content: center;
    margin-top: 16px;
  }
`;

export const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    opacity: 0.8;
    transform: translateY(-2px);
  }
`;

export const StatIcon = styled.div`
  color: ${theme.primary};
  margin-bottom: 8px;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const StatValue = styled.div`
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 4px;
  color: ${theme.primaryDark};
`;

export const StatLabel = styled.div`
  font-size: 13px;
  color: ${theme.textLight};
  font-weight: 500;
`;

// ===== 섹션 제목 스타일 =====
export const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  color: ${theme.text};

  &::after {
    content: "";
    flex: 1;
    height: 1px;
    background-color: ${theme.border};
    margin-left: 16px;
  }
`;

// ===== 공통 로딩 인디케이터 컴포넌트 =====
export const LoadingIndicator: FC = () => (
  <LoadingSpinner>
    <SpinnerIcon />
    <span>데이터를 불러오는 중입니다...</span>
  </LoadingSpinner>
);

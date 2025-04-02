import styled from "@emotion/styled";
import { HeaderBox } from "../../styles/CommonStyles";
import { fadeIn } from "../../styles/theme";

// 페이지 특화 스타일 컴포넌트
export const PlaceHeader = styled(HeaderBox)`
  flex-direction: column;
`;

export const PlaceInfoContainer = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 30px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
  }
`;

// 운동 기록 관련 스타일
export const WorkoutSection = styled.div`
  padding-top: 16px;
  animation: ${fadeIn} 0.7s ease-out;
`;

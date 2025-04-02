import React from "react";
import styled from "@emotion/styled";
import { WorkoutPlaceDTO } from "../../dtos/WorkoutDTO";
import { theme } from "../../styles/theme";
import {
  FaMapMarkerAlt,
  FaDirections,
  FaExpand,
  FaDumbbell,
  FaStar,
  FaRegStar,
} from "react-icons/fa";
import {
  ActionButton,
  StatItem,
  StatIcon,
  StatValue,
  StatLabel,
  SpinnerIcon,
} from "../../styles/CommonStyles";

// 장소 정보 관련 스타일
const PlaceDetailsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 220px;
  justify-content: space-between;
  gap: 0;

  @media (max-width: 768px) {
    width: 100%;
    height: auto;
    min-height: 220px;
  }
`;

const PlaceDetailsContainer = styled.div`
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
    align-items: center;
    text-align: center;
    margin-bottom: 20px;
  }
`;

const PlaceName = styled.h1`
  font-size: 26px;
  font-weight: 600;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  color: ${theme.text};
  letter-spacing: -0.5px;

  @media (max-width: 768px) {
    justify-content: center;
    font-size: 24px;
  }
`;

const PlaceIcon = styled.span`
  margin-right: 10px;
  color: ${theme.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
`;

const PlaceAddress = styled.div`
  color: ${theme.textLight};
  font-size: 15px;
  margin-bottom: 20px;
  line-height: 1.5;
`;

// 통계 관련 스타일
const StatsContainerPlace = styled.div`
  display: flex;
  gap: 20px;

  @media (max-width: 768px) {
    justify-content: center;
    margin-bottom: 20px;
  }
`;

// 하단 영역을 위한 새로운 컨테이너
const BottomContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  width: 100%;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 20px;
    align-items: center;
  }
`;

// 액션 버튼 컨테이너 스타일
const PlaceActionButtonsContainer = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;

  @media (max-width: 768px) {
    justify-content: center;
  }
`;

// 팔로우 버튼 스타일
const FollowButton = styled.button<{ isFollowing: boolean }>`
  background-color: ${(props) => (props.isFollowing ? "#f0f0f0" : "#4a90e2")};
  color: ${(props) => (props.isFollowing ? "#666" : "white")};
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${(props) => (props.isFollowing ? "#e0e0e0" : "#3a7bc8")};
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }
`;

// 컴포넌트 props 타입 정의
interface PlaceInfoProps {
  placeInfo: WorkoutPlaceDTO;
  totalWorkoutCount: number;
  followerCount: number;
  isFollowing: boolean;
  isFollowingLoading: boolean;
  onFollowToggle: () => Promise<void>;
  onDirectionsClick: () => void;
  onExpandMapClick: () => void;
  isLoggedIn: boolean;
}

/**
 * 장소 정보 컴포넌트
 */
const PlaceInfo: React.FC<PlaceInfoProps> = ({
  placeInfo,
  totalWorkoutCount,
  followerCount,
  isFollowing,
  isFollowingLoading,
  onFollowToggle,
  onDirectionsClick,
  onExpandMapClick,
  isLoggedIn,
}) => {
  return (
    <PlaceDetailsWrapper>
      <PlaceDetailsContainer>
        <PlaceName>
          <PlaceIcon>
            <FaMapMarkerAlt />
          </PlaceIcon>
          {placeInfo.placeName}
        </PlaceName>
        <PlaceAddress>
          {placeInfo.addressName || placeInfo.roadAddressName}
        </PlaceAddress>
      </PlaceDetailsContainer>

      <BottomContainer>
        <StatsContainerPlace>
          <StatItem>
            <StatIcon>
              <FaDumbbell />
            </StatIcon>
            <StatValue>{totalWorkoutCount}</StatValue>
            <StatLabel>오운완</StatLabel>
          </StatItem>
          <StatItem>
            <StatIcon>
              <FaStar />
            </StatIcon>
            <StatValue>{followerCount}</StatValue>
            <StatLabel>팔로워</StatLabel>
          </StatItem>
        </StatsContainerPlace>

        <PlaceActionButtonsContainer>
          <ActionButton onClick={onDirectionsClick}>
            <FaDirections /> 길찾기
          </ActionButton>
          <ActionButton onClick={onExpandMapClick}>
            <FaExpand /> 지도 확대
          </ActionButton>
          {isLoggedIn && (
            <FollowButton
              isFollowing={isFollowing}
              onClick={onFollowToggle}
              disabled={isFollowingLoading}
            >
              {isFollowingLoading ? (
                <SpinnerIcon className="spinner" />
              ) : isFollowing ? (
                <>
                  <FaStar /> 팔로잉
                </>
              ) : (
                <>
                  <FaRegStar /> 팔로우
                </>
              )}
            </FollowButton>
          )}
        </PlaceActionButtonsContainer>
      </BottomContainer>
    </PlaceDetailsWrapper>
  );
};

export default PlaceInfo;

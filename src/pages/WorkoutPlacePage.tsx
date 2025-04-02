import React, { useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";

// 공통 스타일 임포트
import {
  Container,
  SectionTitle,
  LoadingIndicator,
} from "../styles/CommonStyles";

// 커스텀 훅 임포트
import usePlaceData from "../hooks/usePlaceData";
import usePlaceWorkoutData from "../hooks/usePlaceWorkoutData";
import usePlaceFollow from "../hooks/usePlaceFollow";

// 컴포넌트 임포트
import WorkoutDetailModal from "../components/WorkoutDetailModal";
import KakaoMap from "../components/place/KakaoMap";
import PlaceInfo from "../components/place/PlaceInfo";
import WorkoutList from "../components/place/WorkoutList";
import {
  PlaceHeader,
  PlaceInfoContainer,
  WorkoutSection,
} from "../components/place/PlaceLayout";

/**
 * 장소 상세 페이지 컴포넌트
 * 장소 정보, 지도, 운동 기록 목록을 표시하고, 팔로우 기능을 제공합니다.
 */
const WorkoutPlacePage: React.FC = () => {
  const { placeSeq } = useParams<{ placeSeq: string }>();
  const userInfo = useSelector((state: RootState) => state.auth.userInfo);

  // 커스텀 훅 사용
  const { placeInfo, totalWorkoutCount, initialLoading } =
    usePlaceData(placeSeq);
  const { workoutOfTheDays, loading, hasMore, observerTarget } =
    usePlaceWorkoutData(placeSeq);
  const { isFollowing, isFollowingLoading, followerCount, toggleFollow } =
    usePlaceFollow(placeSeq, userInfo);

  // 모달 관련 상태
  const [selectedWorkoutOfTheDaySeq, setSelectedWorkoutOfTheDaySeq] = useState<
    number | null
  >(null);
  const [showModal, setShowModal] = useState(false);

  // 이벤트 핸들러
  const handleWorkoutCardClick = useCallback((seq: number) => {
    setSelectedWorkoutOfTheDaySeq(seq);
    setShowModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setSelectedWorkoutOfTheDaySeq(null);
  }, []);

  const handleDirectionsClick = useCallback(() => {
    if (placeInfo.kakaoPlaceId) {
      window.open(
        `https://map.kakao.com/link/to/${placeInfo.kakaoPlaceId}`,
        "_blank"
      );
    } else if (placeInfo.x && placeInfo.y) {
      window.open(
        `https://map.kakao.com/link/to/${placeInfo.placeName},${placeInfo.y},${placeInfo.x}`,
        "_blank"
      );
    } else {
      window.open(
        `https://map.kakao.com/link/search/${placeInfo.placeName}`,
        "_blank"
      );
    }
  }, [placeInfo]);

  const handleExpandMapClick = useCallback(() => {
    if (placeInfo.kakaoPlaceId) {
      window.open(
        `https://map.kakao.com/link/map/${placeInfo.kakaoPlaceId}`,
        "_blank"
      );
    } else if (placeInfo.x && placeInfo.y) {
      window.open(
        `https://map.kakao.com/link/map/${placeInfo.placeName},${placeInfo.y},${placeInfo.x}`,
        "_blank"
      );
    } else {
      window.open(
        `https://map.kakao.com/link/search/${placeInfo.placeName}`,
        "_blank"
      );
    }
  }, [placeInfo]);

  // 로딩 중 표시
  if (initialLoading) {
    return (
      <Container>
        <LoadingIndicator />
      </Container>
    );
  }

  // 렌더링
  return (
    <Container>
      <PlaceHeader>
        <PlaceInfoContainer>
          <KakaoMap placeInfo={placeInfo} />
          <PlaceInfo
            placeInfo={placeInfo}
            totalWorkoutCount={totalWorkoutCount}
            followerCount={followerCount}
            isFollowing={isFollowing}
            isFollowingLoading={isFollowingLoading}
            onFollowToggle={toggleFollow}
            onDirectionsClick={handleDirectionsClick}
            onExpandMapClick={handleExpandMapClick}
            isLoggedIn={!!userInfo?.userSeq}
          />
        </PlaceInfoContainer>
      </PlaceHeader>

      <WorkoutSection>
        <SectionTitle>운동 기록</SectionTitle>
        <WorkoutList
          workouts={workoutOfTheDays}
          hasMore={hasMore}
          loading={loading}
          observerRef={observerTarget}
          onWorkoutClick={handleWorkoutCardClick}
        />
      </WorkoutSection>

      {showModal && selectedWorkoutOfTheDaySeq && (
        <WorkoutDetailModal
          workoutOfTheDaySeq={selectedWorkoutOfTheDaySeq}
          onClose={handleCloseModal}
        />
      )}
    </Container>
  );
};

export default WorkoutPlacePage;

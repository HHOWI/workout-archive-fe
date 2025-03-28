import React, { useState, useRef, useEffect, useCallback } from "react";
import styled from "@emotion/styled";
import { keyframes } from "@emotion/react";
import {
  getWorkoutOfTheDayCountByPlaceIdAPI,
  getWorkoutsByPlaceAPI,
} from "../api/workout";
import { WorkoutOfTheDayDTO, WorkoutPlaceDTO } from "../dtos/WorkoutDTO";
import WorkoutDetailModal from "../components/WorkoutDetailModal";
import WorkoutCard from "../components/WorkoutCard";
import { useParams, useNavigate } from "react-router-dom";
import { debounce } from "lodash";
import {
  FaMapMarkerAlt,
  FaDirections,
  FaExpand,
  FaDumbbell,
  FaSpinner,
} from "react-icons/fa";

// 카카오맵 타입 선언
declare global {
  interface Window {
    kakao: any;
  }
}

// ===== 애니메이션 효과 =====
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

// ===== 색상 테마 =====
const theme = {
  primary: "#4a90e2",
  primaryDark: "#3a7bc8",
  secondary: "#f5f7fa",
  accent: "#6c5ce7",
  background: "#ffffff",
  text: "#333333",
  textLight: "#666666",
  border: "#eaeaea",
  shadow: "rgba(0, 0, 0, 0.08)",
  success: "#27ae60",
  error: "#e74c3c",
};

// ===== 스타일 컴포넌트 그룹화 =====

// 레이아웃 스타일
const Container = styled.div`
  max-width: 935px;
  margin: 0 auto;
  padding: 30px 20px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica,
    Arial, sans-serif;
  color: ${theme.text};
  animation: ${fadeIn} 0.5s ease-out;

  @media (max-width: 768px) {
    padding: 20px 16px;
  }
`;

const PlaceHeader = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 44px;
  border-radius: 16px;
  padding: 28px;
  background-color: ${theme.background};
  box-shadow: 0 4px 20px ${theme.shadow};
  border: 1px solid ${theme.border};
  position: relative;
  transition: box-shadow 0.3s ease;

  &:hover {
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.12);
  }

  @media (max-width: 768px) {
    padding: 22px;
    margin-bottom: 32px;
  }
`;

const PlaceInfoContainer = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 30px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
  }
`;

// 지도 관련 스타일
const MapContainer = styled.div`
  width: 330px;
  height: 220px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 10px ${theme.shadow};
  flex-shrink: 0;
  border: 1px solid ${theme.border};
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
  }

  @media (max-width: 768px) {
    width: 100%;
    max-width: 380px;
    margin-bottom: 24px;
  }
`;

// 장소 정보 관련 스타일
const PlaceDetailsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  position: relative;
  height: 220px;

  @media (max-width: 768px) {
    width: 100%;
    height: auto;
  }
`;

const PlaceDetailsContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-bottom: 60px;

  @media (max-width: 768px) {
    align-items: center;
    text-align: center;
    margin-bottom: 0;
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
const StatsContainer = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;

  @media (max-width: 768px) {
    position: static;
    margin-top: 20px;
    align-self: center;
  }
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: ${theme.secondary};
  border-radius: 12px;
  padding: 10px 16px;
  min-width: 90px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid ${theme.border};
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.08);
    animation: ${pulse} 0.6s ease-in-out;
  }
`;

const StatValue = styled.div`
  font-size: 22px;
  font-weight: 600;
  color: ${theme.primary};
`;

const StatLabel = styled.div`
  font-size: 13px;
  color: ${theme.textLight};
  font-weight: 500;
  margin-top: 2px;
`;

const StatIcon = styled.div`
  color: ${theme.primary};
  font-size: 20px;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

// 버튼 관련 스타일
const ButtonsContainer = styled.div`
  display: flex;
  gap: 12px;
  position: absolute;
  bottom: 0;
  left: 0;

  @media (max-width: 768px) {
    position: static;
    margin-top: 20px;
    justify-content: center;
  }
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background-color: ${theme.primary};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 18px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 6px rgba(74, 144, 226, 0.3);

  &:hover {
    background-color: ${theme.primaryDark};
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(74, 144, 226, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
`;

const SecondaryButton = styled(ActionButton)`
  background-color: ${theme.secondary};
  color: ${theme.textLight};
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);

  &:hover {
    background-color: #e9ecf2;
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }
`;

// 운동 기록 관련 스타일
const WorkoutSection = styled.div`
  padding-top: 16px;
  animation: ${fadeIn} 0.7s ease-out;
`;

const SectionTitle = styled.h2`
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

const WorkoutGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 14px;
  }
`;

// 로딩 및 메시지 관련 스타일
const NoDataMessage = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: ${theme.textLight};
  background-color: ${theme.secondary};
  border-radius: 12px;
  margin-top: 20px;
  font-size: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
  border: 1px solid ${theme.border};
  animation: ${fadeIn} 0.5s ease-out;
`;

const LoadingSpinner = styled.div`
  text-align: center;
  padding: 60px;
  color: ${theme.textLight};
  font-size: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
`;

const SpinnerIcon = styled(FaSpinner)`
  font-size: 32px;
  color: ${theme.primary};
  animation: ${spin} 1s linear infinite;
`;

const LoaderContainer = styled.div`
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

// ===== 컴포넌트 분리 =====

// 로딩 인디케이터 컴포넌트
const LoadingIndicator = () => (
  <LoadingSpinner>
    <SpinnerIcon />
    <span>데이터를 불러오는 중입니다...</span>
  </LoadingSpinner>
);

// 지도 컴포넌트
const KakaoMap = React.memo(({ placeInfo }: { placeInfo: WorkoutPlaceDTO }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // 카카오맵 초기화 함수
  const initializeMap = useCallback(() => {
    if (!mapContainerRef.current || !window.kakao) return;

    // 기본 지도 생성 (임시 좌표)
    const options = {
      center: new window.kakao.maps.LatLng(37.566826, 126.9786567), // 서울시청 기본값
      level: 3,
    };
    const map = new window.kakao.maps.Map(mapContainerRef.current, options);

    // Places API로 장소 검색
    const ps = new window.kakao.maps.services.Places();
    ps.keywordSearch(placeInfo.placeName, (data: any[], status: any) => {
      if (status === window.kakao.maps.services.Status.OK) {
        // kakaoPlaceId와 일치하는 장소 찾기 (있는 경우)
        let place = null;
        if (placeInfo.kakaoPlaceId) {
          place = data.find((item) => item.id === placeInfo.kakaoPlaceId);
        }

        // ID로 찾지 못했거나 ID가 없는 경우 첫 번째 결과 사용
        if (!place && data.length > 0) {
          place = data[0];
        }

        let lat, lng;

        if (place) {
          lat = parseFloat(place.y);
          lng = parseFloat(place.x);
        } else if (placeInfo.x && placeInfo.y) {
          // 검색 실패 시 서버 좌표 사용
          lat =
            typeof placeInfo.y === "string"
              ? parseFloat(placeInfo.y)
              : placeInfo.y;
          lng =
            typeof placeInfo.x === "string"
              ? parseFloat(placeInfo.x)
              : placeInfo.x;
        } else {
          console.error("유효한 좌표를 찾을 수 없음");
          return;
        }

        const placeLatLng = new window.kakao.maps.LatLng(lat, lng);
        map.setCenter(placeLatLng);

        // 마커 생성
        const marker = new window.kakao.maps.Marker({
          position: placeLatLng,
        });
        marker.setMap(map);
      } else if (placeInfo.x && placeInfo.y) {
        // Places API 실패 시 좌표로 대체
        const lat =
          typeof placeInfo.y === "string"
            ? parseFloat(placeInfo.y)
            : placeInfo.y;
        const lng =
          typeof placeInfo.x === "string"
            ? parseFloat(placeInfo.x)
            : placeInfo.x;
        const placeLatLng = new window.kakao.maps.LatLng(lat, lng);
        map.setCenter(placeLatLng);

        const marker = new window.kakao.maps.Marker({
          position: placeLatLng,
        });
        marker.setMap(map);
      } else {
        console.error("지도 생성 실패:", status);
      }
    });
  }, [placeInfo.kakaoPlaceId, placeInfo.placeName, placeInfo.x, placeInfo.y]);

  // 카카오맵 SDK 로드 및 지도 생성
  useEffect(() => {
    // 장소명과 좌표 중 하나라도 있으면 지도 로드
    if (placeInfo.placeName || (placeInfo.x && placeInfo.y)) {
      const loadKakaoMap = () => {
        if (window.kakao && window.kakao.maps) {
          initializeMap();
        } else {
          const script = document.createElement("script");
          script.async = true;
          script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.REACT_APP_KAKAO_MAP_API_KEY}&libraries=services&autoload=false`;
          script.onload = () => {
            window.kakao.maps.load(() => {
              initializeMap();
            });
          };
          script.onerror = () => console.error("카카오맵 SDK 로드 실패");
          document.head.appendChild(script);

          return () => {
            if (document.head.contains(script)) {
              document.head.removeChild(script);
            }
          };
        }
      };

      loadKakaoMap();
    }
  }, [placeInfo.placeName, placeInfo.x, placeInfo.y, initializeMap]);

  return <MapContainer ref={mapContainerRef} />;
});

// 장소 정보 컴포넌트
interface PlaceInfoProps {
  placeInfo: WorkoutPlaceDTO;
  totalWorkoutCount: number;
  onDirectionsClick: () => void;
  onExpandMapClick: () => void;
}

const PlaceInfo = React.memo(
  ({
    placeInfo,
    totalWorkoutCount,
    onDirectionsClick,
    onExpandMapClick,
  }: PlaceInfoProps) => {
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
            {placeInfo.roadAddressName || placeInfo.addressName}
          </PlaceAddress>
        </PlaceDetailsContainer>

        <ButtonsContainer>
          <ActionButton onClick={onDirectionsClick}>
            <FaDirections />
            길찾기
          </ActionButton>
          <SecondaryButton onClick={onExpandMapClick}>
            <FaExpand />
            지도 크게보기
          </SecondaryButton>
        </ButtonsContainer>

        <StatsContainer>
          <StatItem>
            <StatIcon>
              <FaDumbbell />
            </StatIcon>
            <StatValue>{totalWorkoutCount}</StatValue>
            <StatLabel>게시물</StatLabel>
          </StatItem>
        </StatsContainer>
      </PlaceDetailsWrapper>
    );
  }
);

// 운동 목록 컴포넌트
interface WorkoutListProps {
  workouts: WorkoutOfTheDayDTO[];
  hasMore: boolean;
  loading: boolean;
  observerRef: React.RefObject<HTMLDivElement>;
  onWorkoutClick: (seq: number) => void;
}

const WorkoutList = React.memo(
  ({
    workouts,
    hasMore,
    loading,
    observerRef,
    onWorkoutClick,
  }: WorkoutListProps) => {
    if (workouts.length === 0) {
      return (
        <NoDataMessage>이 장소에 저장된 운동 기록이 없습니다.</NoDataMessage>
      );
    }

    return (
      <>
        <WorkoutGrid>
          {workouts.map((workout) => (
            <WorkoutCard
              key={workout.workoutOfTheDaySeq}
              workout={workout}
              onClick={() => onWorkoutClick(workout.workoutOfTheDaySeq)}
            />
          ))}
        </WorkoutGrid>
        {hasMore && (
          <LoaderContainer ref={observerRef}>
            {loading && (
              <>
                <SpinnerIcon />
                <span>더 불러오는 중...</span>
              </>
            )}
          </LoaderContainer>
        )}
      </>
    );
  }
);

// ===== 커스텀 훅 =====

// 장소 데이터 관련 훅
const usePlaceData = (placeSeq: string | undefined) => {
  const [placeInfo, setPlaceInfo] = useState<WorkoutPlaceDTO>({
    workoutPlaceSeq: 0,
    placeName: "",
    addressName: "",
    roadAddressName: "",
    x: "",
    y: "",
    kakaoPlaceId: "",
  });
  const [totalWorkoutCount, setTotalWorkoutCount] = useState<number>(0);
  const [initialLoading, setInitialLoading] = useState(true);

  // 초기 데이터 로드 및 상태 초기화
  const initializeData = useCallback(async () => {
    if (!placeSeq) return;
    setInitialLoading(true);
    try {
      const response = await getWorkoutsByPlaceAPI(placeSeq, 12, null);

      if (response.placeInfo) {
        setPlaceInfo(response.placeInfo);
      }

      const countResponse = await getWorkoutOfTheDayCountByPlaceIdAPI(placeSeq);
      setTotalWorkoutCount(countResponse.count);
    } catch (error) {
      console.error("초기 데이터 로드 실패:", error);
    } finally {
      setInitialLoading(false);
    }
  }, [placeSeq]);

  // 초기 데이터 로드
  useEffect(() => {
    initializeData();
  }, [initializeData]);

  return { placeInfo, totalWorkoutCount, initialLoading };
};

// 운동 데이터 관련 훅
const useWorkoutData = (placeSeq: string | undefined) => {
  const [workoutOfTheDays, setWorkoutOfTheDays] = useState<
    WorkoutOfTheDayDTO[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef<HTMLDivElement>(null);

  // 무한 스크롤을 위한 데이터 로드 함수
  const fetchWorkouts = useCallback(
    debounce(async (cursor: number | null) => {
      if (loading || !hasMore || !placeSeq) return;

      setLoading(true);
      try {
        const response = await getWorkoutsByPlaceAPI(placeSeq, 12, cursor);
        const workouts = response.workouts || [];
        setWorkoutOfTheDays((prev) =>
          cursor ? [...prev, ...workouts] : workouts
        );
        setNextCursor(response.nextCursor);
        setHasMore(!!response.nextCursor);
      } catch (error) {
        console.error("운동 기록 로드 실패:", error);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    }, 300),
    [placeSeq, loading, hasMore]
  );

  // 초기 데이터 로드
  useEffect(() => {
    if (placeSeq) {
      fetchWorkouts(null);
    }
  }, [placeSeq, fetchWorkouts]);

  // 무한 스크롤 설정
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && hasMore && nextCursor) {
          fetchWorkouts(nextCursor);
        }
      },
      { root: null, rootMargin: "20px", threshold: 0.1 }
    );

    const target = observerTarget.current;
    if (target) observer.observe(target);

    return () => {
      if (target) observer.unobserve(target);
    };
  }, [fetchWorkouts, loading, hasMore, nextCursor]);

  return { workoutOfTheDays, loading, hasMore, observerTarget };
};

// ===== 메인 컴포넌트 =====
const WorkoutPlacePage: React.FC = () => {
  // 라우터 관련
  const { placeSeq } = useParams<{ placeSeq: string }>();
  const navigate = useNavigate();

  // 커스텀 훅 사용
  const { placeInfo, totalWorkoutCount, initialLoading } =
    usePlaceData(placeSeq);
  const { workoutOfTheDays, loading, hasMore, observerTarget } =
    useWorkoutData(placeSeq);

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
            onDirectionsClick={handleDirectionsClick}
            onExpandMapClick={handleExpandMapClick}
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

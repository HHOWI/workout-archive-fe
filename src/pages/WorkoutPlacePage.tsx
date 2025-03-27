import React, { useState, useRef, useEffect, useCallback } from "react";
import styled from "@emotion/styled";
import {
  getWorkoutOfTheDayCountByPlaceIdAPI,
  getWorkoutsByPlaceAPI,
} from "../api/workout";
import { WorkoutOfTheDayDTO } from "../dtos/WorkoutDTO";
import WorkoutDetailModal from "../components/WorkoutDetailModal";
import WorkoutCard from "../components/WorkoutCard";
import { useParams, useNavigate } from "react-router-dom";
import { debounce } from "lodash";
import {
  FaMapMarkerAlt,
  FaPhone,
  FaClock,
  FaTag,
  FaDumbbell,
  FaDirections,
  FaExpand,
  FaCalendarAlt,
  FaFire,
  FaMedal,
} from "react-icons/fa";

declare global {
  interface Window {
    kakao: any;
  }
}

// 장소 정보 인터페이스 정의
interface PlaceInfo {
  id: string; // 카카오플레이스ID
  placeName: string; // 장소명
  address: string; // 주소
  roadAddress: string; // 도로명 주소
  category: string; // 카테고리
  phone: string; // 전화번호
  url: string; // 상세 페이지 URL
  openingHours: string; // 영업시간
  x: number; // 경도
  y: number; // 위도
}

const Container = styled.div`
  max-width: 935px;
  margin: 0 auto;
  padding: 30px 20px;
`;

const PlaceHeader = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 44px;
  padding-bottom: 30px;
  border-bottom: 1px solid #eaeaea;

  @media (max-width: 768px) {
    text-align: center;
  }
`;

const PlaceInfoContainer = styled.div`
  display: flex;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
  }
`;

const MapContainer = styled.div`
  width: 350px;
  height: 250px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-right: 30px;
  flex-shrink: 0;
  position: relative;

  @media (max-width: 768px) {
    width: 100%;
    max-width: 350px;
    margin-right: 0;
    margin-bottom: 20px;
  }
`;

const MapPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
  color: #757575;
  font-size: 14px;
`;

const InfoContent = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const PlaceName = styled.h1`
  font-size: 32px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #292929;
`;

const PlaceAddress = styled.div`
  display: flex;
  align-items: center;
  color: #757575;
  font-size: 16px;
  margin-bottom: 16px;

  svg {
    margin-right: 8px;
    min-width: 16px;
  }
`;

const PlaceDetail = styled.div`
  display: flex;
  align-items: center;
  color: #757575;
  font-size: 15px;
  margin-bottom: 10px;

  svg {
    margin-right: 8px;
    min-width: 16px;
    color: #4a90e2;
  }
`;

const PlaceActions = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 16px;

  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const ActionButton = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 16px;
  background: #4a90e2;
  color: white;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(74, 144, 226, 0.2);

  svg {
    margin-right: 6px;
  }

  &:hover {
    background: #357bd8;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(74, 144, 226, 0.3);
  }
`;

const StatsContainer = styled.div`
  display: flex;
  gap: 24px;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 12px;
  margin-bottom: 30px;

  @media (max-width: 768px) {
    justify-content: center;
    padding: 16px;
    flex-wrap: wrap;
  }
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 12px;
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: bold;
  color: #292929;
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: #757575;
  text-align: center;
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  margin: 30px 0 16px;
  color: #292929;
  display: flex;
  align-items: center;

  svg {
    margin-right: 8px;
    color: #4a90e2;
  }
`;

// 인스타그램 스타일의 운동 기록 그리드
const WorkoutGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const NoDataMessage = styled.div`
  text-align: center;
  padding: 50px;
  color: #757575;
  background-color: #f8f9fa;
  border-radius: 12px;
  font-size: 16px;
`;

const LoadingSpinner = styled.div`
  text-align: center;
  padding: 50px;
  color: #757575;
`;

const LoaderContainer = styled.div`
  width: 100%;
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 20px 0;
  color: #757575;
  font-size: 15px;
`;

const WorkoutPlacePage: React.FC = () => {
  const [workoutOfTheDays, setWorkoutOfTheDays] = useState<
    WorkoutOfTheDayDTO[]
  >([]);
  const [totalWorkoutCount, setTotalWorkoutCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [selectedWorkoutOfTheDaySeq, setSelectedWorkoutOfTheDaySeq] = useState<
    number | null
  >(null);
  const [showModal, setShowModal] = useState(false);
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef<HTMLDivElement>(null);
  const mapContainer = useRef<HTMLDivElement>(null);

  // 장소 정보 상태를 하나의 객체로 관리
  const [placeInfo, setPlaceInfo] = useState<PlaceInfo>({
    id: "",
    placeName: "",
    address: "",
    roadAddress: "",
    category: "",
    phone: "",
    url: "",
    openingHours: "",
    x: 0,
    y: 0,
  });

  const [mapLoaded, setMapLoaded] = useState(false);
  const [popularExerciseTypes, setPopularExerciseTypes] = useState<string[]>(
    []
  );
  const [mostActiveTime, setMostActiveTime] = useState<string>("");

  const { placeSeq } = useParams<{ placeSeq: string }>();
  const navigate = useNavigate();

  // 카카오맵 API로 장소 정보 조회
  const fetchPlaceInfo = useCallback(async (placeId: string) => {
    if (!placeId || !window.kakao?.maps?.services) return;

    // 카카오맵 API services 생성
    const places = new window.kakao.maps.services.Places();

    // 장소 상세 정보 조회
    places.getDetails({ placeId }, (result: any, status: any) => {
      if (status === window.kakao.maps.services.Status.OK) {
        const place = result[0];

        // 장소 정보 업데이트
        setPlaceInfo({
          id: place.id,
          placeName: place.place_name,
          address: place.address_name,
          roadAddress: place.road_address_name,
          category: place.category_name,
          phone: place.phone || "",
          url: place.place_url,
          openingHours: "", // 상세 정보에서는 영업시간을 제공하지 않음
          x: parseFloat(place.x),
          y: parseFloat(place.y),
        });

        // 지도 로드 시작
        initializeMap(
          parseFloat(place.y),
          parseFloat(place.x),
          place.place_name
        );
      }
    });
  }, []);

  // 지도 생성 공통 함수 - 좌표를 매개변수로 받도록 수정
  const initializeMap = useCallback(
    (lat: number, lng: number, placeName: string) => {
      if (!mapContainer.current || !lat || !lng) return;

      if (!window.kakao || !window.kakao.maps) {
        // 카카오맵 스크립트 로드
        const script = document.createElement("script");
        script.async = true;
        script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.REACT_APP_KAKAO_MAP_API_KEY}&libraries=services&autoload=false`;

        script.onload = () => {
          window.kakao.maps.load(() => {
            // 지도 생성
            createMap(lat, lng, placeName);
            setMapLoaded(true);
          });
        };

        document.head.appendChild(script);
        return () => {
          document.head.removeChild(script);
        };
      } else {
        // 이미 로드된 경우
        createMap(lat, lng, placeName);
        setMapLoaded(true);
      }
    },
    []
  );

  // 지도 생성 함수 - 좌표를 직접 매개변수로 받음
  const createMap = useCallback(
    (lat: number, lng: number, placeName: string) => {
      if (!mapContainer.current) return;

      const options = {
        center: new window.kakao.maps.LatLng(lat, lng),
        level: 3,
      };

      const map = new window.kakao.maps.Map(mapContainer.current, options);

      // 마커 생성
      const markerPosition = new window.kakao.maps.LatLng(lat, lng);
      const marker = new window.kakao.maps.Marker({
        position: markerPosition,
      });

      // 마커 지도에 표시
      marker.setMap(map);

      // 장소 이름이 표시된 인포윈도우 생성
      const infowindow = new window.kakao.maps.InfoWindow({
        content: `<div style="padding:8px;font-size:14px;font-weight:bold;">${placeName}</div>`,
      });

      // 인포윈도우 표시
      infowindow.open(map, marker);
    },
    []
  );

  // 운동 데이터로부터 통계 계산
  const calculateStats = useCallback((workouts: WorkoutOfTheDayDTO[]) => {
    // 가장 많은 운동 유형 계산
    const exerciseTypeCounts: Record<string, number> = {};
    workouts.forEach((workout) => {
      const type = workout.mainExerciseType;
      if (type) {
        exerciseTypeCounts[type] = (exerciseTypeCounts[type] || 0) + 1;
      }
    });

    // 상위 3개 운동 유형 추출
    const sortedExerciseTypes = Object.entries(exerciseTypeCounts)
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, 3)
      .map(([type]) => type);

    setPopularExerciseTypes(sortedExerciseTypes);

    // 가장 활발한 시간대 계산 (예: 아침, 오후, 저녁)
    const hourCounts: Record<string, number> = {
      "아침 (6-10시)": 0,
      "오전 (10-12시)": 0,
      "오후 (12-18시)": 0,
      "저녁 (18-22시)": 0,
      "밤 (22-6시)": 0,
    };

    workouts.forEach((workout) => {
      if (workout.recordDate) {
        const date = new Date(workout.recordDate);
        const hour = date.getHours();

        if (hour >= 6 && hour < 10) hourCounts["아침 (6-10시)"]++;
        else if (hour >= 10 && hour < 12) hourCounts["오전 (10-12시)"]++;
        else if (hour >= 12 && hour < 18) hourCounts["오후 (12-18시)"]++;
        else if (hour >= 18 && hour < 22) hourCounts["저녁 (18-22시)"]++;
        else hourCounts["밤 (22-6시)"]++;
      }
    });

    // 가장 많은 시간대 찾기
    const mostActive = Object.entries(hourCounts).sort(
      ([, countA], [, countB]) => countB - countA
    )[0];

    if (mostActive) {
      setMostActiveTime(mostActive[0]);
    }
  }, []);

  // 초기 데이터 로드 및 상태 초기화
  const initializeData = useCallback(async () => {
    if (!placeSeq) return;
    setLoading(true);
    try {
      const [countResponse] = await Promise.all([
        getWorkoutOfTheDayCountByPlaceIdAPI(placeSeq),
      ]);
      setTotalWorkoutCount(countResponse.count);
    } catch (error) {
      console.error("초기 데이터 로드 실패:", error);
    } finally {
      setLoading(false);
    }
  }, [placeSeq]);

  // 무한 스크롤을 위한 데이터 로드 함수
  const fetchWorkouts = useCallback(
    debounce(async (cursor: number | null) => {
      if (loading || !hasMore || !placeSeq) return;

      setLoading(true);
      try {
        const response = await getWorkoutsByPlaceAPI(placeSeq, 12, cursor);
        const workouts = response.workouts || [];

        // 첫 데이터 로드 시에만 통계 계산 및 장소 ID 추출
        if (!cursor && workouts.length > 0) {
          calculateStats(workouts);

          // 장소 정보가 있고 placeInfo.id가 비어있으면 카카오맵 API로 조회
          if (response.placeInfo?.kakaoPlaceId && !placeInfo.id) {
            fetchPlaceInfo(response.placeInfo.kakaoPlaceId);
          } else {
            // 임시 장소 정보 설정 (API 응답에 기본 정보가 포함된 경우)
            setPlaceInfo((prev) => ({
              ...prev,
              placeName: response.placeInfo?.placeName || prev.placeName,
              address: response.placeInfo?.addressName || prev.address,
              roadAddress:
                response.placeInfo?.roadAddressName || prev.roadAddress,
            }));
          }
        }

        setWorkoutOfTheDays((prev) =>
          cursor ? [...prev, ...workouts] : workouts
        );
        setNextCursor(response.nextCursor);
        setHasMore(!!response.nextCursor);
      } catch (error) {
        console.error("운동 기록 로드 실패:", error);
        alert("운동 기록을 불러오지 못했습니다.");
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    }, 300),
    [placeSeq, loading, hasMore, calculateStats, fetchPlaceInfo, placeInfo.id]
  );

  // 초기 데이터 로드
  useEffect(() => {
    initializeData();
    fetchWorkouts(null);
  }, [initializeData, fetchWorkouts]);

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

  // 운동 카드 클릭 핸들러
  const handleWorkoutCardClick = (seq: number) => {
    setSelectedWorkoutOfTheDaySeq(seq);
    setShowModal(true);
  };

  // 모달 닫기 핸들러
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedWorkoutOfTheDaySeq(null);
  };

  // 길찾기 링크 생성
  const getDirectionsLink = () => {
    if (placeInfo.y && placeInfo.x) {
      return `https://map.kakao.com/link/to/${placeInfo.placeName},${placeInfo.y},${placeInfo.x}`;
    } else if (placeInfo.roadAddress || placeInfo.address) {
      // 좌표는 없지만 주소가 있으면 주소로 검색 링크 생성
      const address = encodeURIComponent(
        placeInfo.roadAddress || placeInfo.address
      );
      return `https://map.kakao.com/link/search/${address}`;
    }
    return "#";
  };

  // 지도 크게 보기 링크 생성
  const getMapViewLink = () => {
    if (placeInfo.y && placeInfo.x) {
      return `https://map.kakao.com/link/map/${placeInfo.placeName},${placeInfo.y},${placeInfo.x}`;
    } else if (placeInfo.id) {
      // 장소 ID가 있으면 카카오맵 장소 페이지로 이동
      return `https://map.kakao.com/link/place/${placeInfo.id}`;
    } else if (placeInfo.roadAddress || placeInfo.address) {
      // 좌표는 없지만 주소가 있으면 주소로 검색 링크 생성
      const address = encodeURIComponent(
        placeInfo.roadAddress || placeInfo.address
      );
      return `https://map.kakao.com/link/search/${address}`;
    }
    return "#";
  };

  if (loading && workoutOfTheDays.length === 0) {
    return (
      <Container>
        <LoadingSpinner>데이터를 불러오는 중입니다...</LoadingSpinner>
      </Container>
    );
  }

  return (
    <Container>
      <PlaceHeader>
        <PlaceInfoContainer>
          <MapContainer ref={mapContainer}>
            {(!placeInfo.x || !placeInfo.y) && (
              <MapPlaceholder>위치 정보가 없습니다</MapPlaceholder>
            )}
          </MapContainer>
          <InfoContent>
            <div>
              <PlaceName>{placeInfo.placeName}</PlaceName>
              <PlaceAddress>
                <FaMapMarkerAlt />
                {placeInfo.roadAddress || placeInfo.address}
              </PlaceAddress>
              {placeInfo.category && (
                <PlaceDetail>
                  <FaTag />
                  {placeInfo.category}
                </PlaceDetail>
              )}
              {placeInfo.phone && (
                <PlaceDetail>
                  <FaPhone />
                  {placeInfo.phone}
                </PlaceDetail>
              )}
              {placeInfo.openingHours && (
                <PlaceDetail>
                  <FaClock />
                  {placeInfo.openingHours}
                </PlaceDetail>
              )}
              {placeInfo.url && (
                <PlaceDetail>
                  <a
                    href={placeInfo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#4a90e2", textDecoration: "none" }}
                  >
                    상세 정보 보기
                  </a>
                </PlaceDetail>
              )}
            </div>
            <PlaceActions>
              <ActionButton
                href={getDirectionsLink()}
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaDirections />
                길찾기
              </ActionButton>
              <ActionButton
                href={getMapViewLink()}
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaExpand />
                지도 크게 보기
              </ActionButton>
            </PlaceActions>
          </InfoContent>
        </PlaceInfoContainer>

        <StatsContainer>
          <StatItem>
            <StatValue>{totalWorkoutCount}</StatValue>
            <StatLabel>운동 기록</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>
              {popularExerciseTypes.length > 0 ? popularExerciseTypes[0] : "-"}
            </StatValue>
            <StatLabel>인기 운동</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>{mostActiveTime || "-"}</StatValue>
            <StatLabel>인기 시간대</StatLabel>
          </StatItem>
        </StatsContainer>
      </PlaceHeader>

      <SectionTitle>
        <FaDumbbell />
        운동 기록
      </SectionTitle>

      {workoutOfTheDays.length > 0 ? (
        <>
          <WorkoutGrid>
            {workoutOfTheDays.map((workout) => (
              <WorkoutCard
                key={workout.workoutOfTheDaySeq}
                workout={workout}
                onClick={() =>
                  handleWorkoutCardClick(workout.workoutOfTheDaySeq)
                }
              />
            ))}
          </WorkoutGrid>
          {hasMore && (
            <LoaderContainer ref={observerTarget}>
              {loading ? "더 불러오는 중..." : ""}
            </LoaderContainer>
          )}
        </>
      ) : (
        <NoDataMessage>이 장소에 저장된 운동 기록이 없습니다.</NoDataMessage>
      )}

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

import React, { useRef, useCallback, useEffect } from "react";
import styled from "@emotion/styled";
import { WorkoutPlaceDTO } from "../../dtos/WorkoutDTO";
import { theme } from "../../styles/theme";

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

// 카카오맵 타입 선언
declare global {
  interface Window {
    kakao: any;
  }
}

/**
 * 카카오맵 컴포넌트
 * @param placeInfo 장소 정보
 */
const KakaoMap: React.FC<{ placeInfo: WorkoutPlaceDTO }> = React.memo(
  ({ placeInfo }) => {
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
  }
);

export default KakaoMap;

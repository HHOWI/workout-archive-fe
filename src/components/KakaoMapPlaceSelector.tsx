import React, { useState, useEffect } from "react";
import { Map, MapMarker } from "react-kakao-maps-sdk";
import styled from "@emotion/styled";
import initKakaoMap from "../utils/kakaoMapInit";
import { fetchRecentWorkoutPlacesAPI } from "../api/workoutPlace";
import { WorkoutPlaceDTO } from "../dtos/WorkoutDTO";

interface Place {
  id: string;
  place_name: string;
  category_name: string;
  address_name: string;
  road_address_name: string;
  phone: string;
  place_url: string;
  x: string;
  y: string;
}

interface KakaoMapPlaceSelectorProps {
  onPlaceSelect: (place: Place) => void;
}

// 스타일 정의
const Container = styled.div`
  width: 100%;
  height: 600px;
  display: grid;
  grid-template-columns: 1fr 2fr; /* 좌측: 검색+결과+최근, 우측: 지도 */
  gap: 15px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    height: auto;
  }
`;

const LeftPanel = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 10px;
`;

const RightPanel = styled.div`
  height: 100%;
`;

const SearchContainer = styled.div`
  display: flex;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px 0 0 4px;
  font-size: 14px;
`;

const SearchButton = styled.button`
  padding: 8px 16px;
  background: #4a90e2;
  color: white;
  border: none;
  border-radius: 0 4px 4px 0;
  cursor: pointer;
  font-weight: 600;

  &:hover {
    background: #357ac5;
  }
`;

const ResultsContainer = styled.div`
  height: 255px;
  overflow-y: auto;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 4px;
  }
`;

const RecentPlacesContainer = styled.div`
  height: 159px; /* 최대 3개에 맞춘 더 작은 높이 */
  overflow-y: auto;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 8px;
  background: #f9f9f9;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 4px;
  }
`;

const PlaceItem = styled.div`
  padding: 8px;
  border-bottom: 1px solid #eee;
  cursor: pointer;

  &:hover {
    background: #f5f5f5;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const PlaceName = styled.div`
  font-weight: 600;
  font-size: 13px;
  margin-bottom: 2px;
`;

const PlaceAddress = styled.div`
  font-size: 12px;
  color: #666;
`;

const MapContainer = styled.div`
  height: 100%;
  width: 100%;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid #ddd;
`;

const SelectButton = styled.button`
  padding: 10px;
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;

  &:hover {
    background-color: #357ac5;
  }

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const SectionTitle = styled.h3`
  font-size: 13px;
  margin: 5px 0;
  color: #555;
`;

const RecentPlaceItem = styled.div`
  padding: 6px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  background-color: #fff;

  &:hover {
    background-color: #f0f0f0;
  }
`;

const RecentPlaceIcon = styled.div`
  margin-right: 8px;
  color: #4a90e2;
`;

const KakaoMapPlaceSelector: React.FC<KakaoMapPlaceSelectorProps> = ({
  onPlaceSelect,
}) => {
  const [keyword, setKeyword] = useState("");
  const [places, setPlaces] = useState<Place[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [map, setMap] = useState<kakao.maps.Map | null>(null);
  const [markers, setMarkers] = useState<kakao.maps.Marker[]>([]);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentPlaces, setRecentPlaces] = useState<WorkoutPlaceDTO[]>([]);
  const [isLoadingRecentPlaces, setIsLoadingRecentPlaces] = useState(false);

  useEffect(() => {
    const loadKakaoMap = async () => {
      try {
        await initKakaoMap();
        setIsMapLoaded(true);
      } catch (err: any) {
        console.error("카카오맵 API 초기화 실패:", err);
        setError(
          `카카오맵 API 로드에 실패했습니다: ${
            err.message || "알 수 없는 오류"
          }`
        );
      }
    };

    const loadRecentPlaces = async () => {
      setIsLoadingRecentPlaces(true);
      try {
        const places = await fetchRecentWorkoutPlacesAPI();
        setRecentPlaces(places);
      } catch (err) {
        console.error("최근 운동 장소 로드 실패:", err);
      } finally {
        setIsLoadingRecentPlaces(false);
      }
    };

    loadKakaoMap();
    loadRecentPlaces();
  }, []);

  const searchPlaces = () => {
    if (!keyword.trim()) {
      alert("키워드를 입력해주세요!");
      return;
    }

    if (
      !isMapLoaded ||
      !window.kakao ||
      !window.kakao.maps ||
      !window.kakao.maps.services
    ) {
      alert(
        "카카오맵 API가 로드되지 않았습니다. 새로고침 후 다시 시도해주세요."
      );
      return;
    }

    const ps = new window.kakao.maps.services.Places();

    ps.keywordSearch(
      keyword,
      (data: Place[], status: kakao.maps.services.Status) => {
        if (status === window.kakao.maps.services.Status.OK) {
          setPlaces(data);

          if (data.length > 0) {
            setSelectedPlace(data[0]);

            if (map) {
              const bounds = new window.kakao.maps.LatLngBounds();
              data.forEach((place: Place) => {
                bounds.extend(new window.kakao.maps.LatLng(+place.y, +place.x));
              });
              map.setBounds(bounds);
            }
          }
        } else if (status === window.kakao.maps.services.Status.ZERO_RESULT) {
          alert("검색 결과가 존재하지 않습니다.");
          setPlaces([]);
        } else if (status === window.kakao.maps.services.Status.ERROR) {
          alert("검색 중 오류가 발생했습니다.");
          setPlaces([]);
        }
      }
    );
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      searchPlaces();
    }
  };

  const handlePlaceClick = (place: Place) => {
    setSelectedPlace(place);

    if (map) {
      const moveLatLng = new window.kakao.maps.LatLng(+place.y, +place.x);
      map.setCenter(moveLatLng);

      markers.forEach((marker) => marker.setMap(null));

      const marker = new window.kakao.maps.Marker({
        position: moveLatLng,
        map: map,
      });

      setMarkers([marker]);
    }
  };

  const handleRecentPlaceSelect = (place: WorkoutPlaceDTO) => {
    if (!window.kakao || !isMapLoaded) return;

    const kakaoPlace: Place = {
      id: place.kakaoPlaceId || String(place.workoutPlaceSeq),
      place_name: place.placeName,
      category_name: "",
      address_name: place.addressName || "",
      road_address_name: place.roadAddressName || "",
      phone: "",
      place_url: "",
      x: String(place.x || 0),
      y: String(place.y || 0),
    };

    setSelectedPlace(kakaoPlace);

    if (map) {
      const moveLatLng = new window.kakao.maps.LatLng(
        Number(kakaoPlace.y),
        Number(kakaoPlace.x)
      );
      map.setCenter(moveLatLng);

      markers.forEach((marker) => marker.setMap(null));

      const marker = new window.kakao.maps.Marker({
        position: moveLatLng,
        map: map,
      });

      setMarkers([marker]);
    }
  };

  const handleSelect = () => {
    if (selectedPlace) {
      onPlaceSelect(selectedPlace);
    }
  };

  if (error) {
    return <div style={{ padding: "20px", color: "red" }}>{error}</div>;
  }

  if (!isMapLoaded) {
    return (
      <div style={{ padding: "20px" }}>카카오맵을 불러오는 중입니다...</div>
    );
  }

  return (
    <Container>
      {/* 좌측: 검색 + 결과 + 최근 장소 */}
      <LeftPanel>
        <SearchContainer>
          <SearchInput
            type="text"
            placeholder="장소 검색 (예: 피트니스, 헬스장)"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <SearchButton onClick={searchPlaces}>검색</SearchButton>
        </SearchContainer>

        {places.length > 0 && (
          <>
            <SectionTitle>검색 결과</SectionTitle>
            <ResultsContainer>
              {places.map((place) => (
                <PlaceItem
                  key={place.id}
                  onClick={() => handlePlaceClick(place)}
                  style={{
                    backgroundColor:
                      selectedPlace?.id === place.id
                        ? "#e6f2ff"
                        : "transparent",
                  }}
                >
                  <PlaceName>{place.place_name}</PlaceName>
                  <PlaceAddress>
                    {place.road_address_name || place.address_name}
                  </PlaceAddress>
                </PlaceItem>
              ))}
            </ResultsContainer>
          </>
        )}

        {recentPlaces.length > 0 && (
          <>
            <SectionTitle>최근 운동 장소</SectionTitle>
            <RecentPlacesContainer>
              {isLoadingRecentPlaces ? (
                <div>로딩 중...</div>
              ) : (
                recentPlaces.map((place) => (
                  <RecentPlaceItem
                    key={place.workoutPlaceSeq}
                    onClick={() => handleRecentPlaceSelect(place)}
                  >
                    <RecentPlaceIcon>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        fill="currentColor"
                        viewBox="0 0 16 16"
                      >
                        <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z" />
                      </svg>
                    </RecentPlaceIcon>
                    <div>
                      <PlaceName>{place.placeName}</PlaceName>
                      <PlaceAddress>
                        {place.roadAddressName || place.addressName || ""}
                      </PlaceAddress>
                    </div>
                  </RecentPlaceItem>
                ))
              )}
            </RecentPlacesContainer>
          </>
        )}

        <SelectButton onClick={handleSelect} disabled={!selectedPlace}>
          이 장소 선택하기
        </SelectButton>
      </LeftPanel>

      {/* 우측: 지도 */}
      <RightPanel>
        <MapContainer>
          <Map
            center={{ lat: 37.566826, lng: 126.9786567 }}
            style={{ width: "100%", height: "100%" }}
            level={2}
            onCreate={setMap}
          >
            {selectedPlace && (
              <MapMarker
                position={{
                  lat: Number(selectedPlace.y),
                  lng: Number(selectedPlace.x),
                }}
              />
            )}
          </Map>
        </MapContainer>
      </RightPanel>
    </Container>
  );
};

export default KakaoMapPlaceSelector;

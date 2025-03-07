import React, { useState, useEffect } from "react";
import { Map, MapMarker } from "react-kakao-maps-sdk";
import styled from "@emotion/styled";
import initKakaoMap from "../utils/kakaoMapInit";

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

const Container = styled.div`
  width: 100%;
  height: 500px;
  display: flex;
  flex-direction: column;
`;

const SearchContainer = styled.div`
  display: flex;
  margin-bottom: 10px;
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
  flex: 1;
  overflow-y: auto;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 10px;
`;

const PlaceItem = styled.div`
  padding: 12px;
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
  margin-bottom: 4px;
`;

const PlaceAddress = styled.div`
  font-size: 13px;
  color: #666;
  margin-bottom: 2px;
`;

const PlaceCategory = styled.div`
  font-size: 12px;
  color: #888;
`;

const MapContainer = styled.div`
  height: 250px;
  width: 100%;
  border-radius: 4px;
  overflow: hidden;
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

  // 컴포넌트 마운트 시 카카오맵 API 초기화
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

    loadKakaoMap();
  }, []);

  // 키워드 검색 함수
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

            // 검색된 장소 위치로 지도 중심 이동
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

  // 엔터 키 입력 처리
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      searchPlaces();
    }
  };

  // 장소 선택 처리
  const handlePlaceClick = (place: Place) => {
    setSelectedPlace(place);

    if (map) {
      const moveLatLng = new window.kakao.maps.LatLng(+place.y, +place.x);
      map.setCenter(moveLatLng);

      // 선택한 위치에 마커 표시
      markers.forEach((marker) => marker.setMap(null));

      const marker = new window.kakao.maps.Marker({
        position: moveLatLng,
        map: map,
      });

      setMarkers([marker]);
    }
  };

  // 선택 완료 처리
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
      <SearchContainer>
        <SearchInput
          type="text"
          placeholder="장소명을 입력하세요"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <SearchButton onClick={searchPlaces}>검색</SearchButton>
      </SearchContainer>

      <ResultsContainer>
        {places.map((place) => (
          <PlaceItem key={place.id} onClick={() => handlePlaceClick(place)}>
            <PlaceName>{place.place_name}</PlaceName>
            <PlaceAddress>
              {place.road_address_name || place.address_name}
            </PlaceAddress>
            <PlaceCategory>{place.category_name}</PlaceCategory>
          </PlaceItem>
        ))}
      </ResultsContainer>

      <MapContainer>
        <Map
          center={{ lat: 37.566826, lng: 126.9786567 }}
          style={{ width: "100%", height: "100%" }}
          level={3}
          onCreate={setMap}
        >
          {selectedPlace && (
            <MapMarker
              position={{ lat: +selectedPlace.y, lng: +selectedPlace.x }}
            />
          )}
        </Map>
      </MapContainer>

      <button
        onClick={handleSelect}
        disabled={!selectedPlace}
        style={{
          padding: "10px",
          backgroundColor: "#4a90e2",
          color: "white",
          border: "none",
          borderRadius: "4px",
          marginTop: "10px",
          cursor: selectedPlace ? "pointer" : "not-allowed",
          opacity: selectedPlace ? 1 : 0.6,
        }}
      >
        이 장소 선택하기
      </button>
    </Container>
  );
};

export default KakaoMapPlaceSelector;

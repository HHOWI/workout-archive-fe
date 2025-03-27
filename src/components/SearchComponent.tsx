import React, { useState, useRef, useEffect, useCallback } from "react";
import styled from "@emotion/styled";
import { FaSearch, FaUser, FaMapMarkerAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import {
  searchUsersByNicknameAPI,
  searchWorkoutPlacesAPI,
} from "../api/search";
import { UserSearchResultDTO, PlaceSearchResultDTO } from "../dtos/SearchDTO";
import { getImageUrl } from "../utils/imageUtils";
import { debounce } from "lodash";

// 검색 컨테이너 스타일 개선
const SearchContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 280px;
  min-width: 200px;
`;

// 검색 입력 및 버튼 컨테이너
const SearchInputWrapper = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 16px;
  border-radius: 8px 0 0 8px;
  border: 1px solid #e0e0e0;
  border-right: none;
  background-color: white;
  font-size: 14px;
  transition: all 0.2s;

  &:focus {
    border-color: #4a90e2;
    outline: none;
    box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.1);
  }

  &::placeholder {
    color: #9e9e9e;
  }
`;

// 검색 버튼 UI 개선 - 아이콘만 표시
const SearchButton = styled.button`
  background: linear-gradient(135deg, #4a90e2 0%, #357bd8 100%);
  color: white;
  border: none;
  border-radius: 0 8px 8px 0;
  padding: 0;
  width: 44px;
  height: 42px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(53, 123, 216, 0.2);
  font-size: 16px;

  &:hover {
    background: linear-gradient(135deg, #357bd8 0%, #2a6cb7 100%);
    box-shadow: 0 4px 8px rgba(53, 123, 216, 0.3);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 1px 2px rgba(53, 123, 216, 0.2);
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #9e9e9e;
  z-index: 1;
`;

// 결과 컨테이너 스타일 개선
const ResultsContainer = styled.div<{ visible: boolean }>`
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 8px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  max-height: 400px;
  overflow-y: auto;
  display: ${(props) => (props.visible ? "block" : "none")};
  width: 400px;
`;

const ResultSection = styled.div`
  padding: 8px 0;
`;

const SectionTitle = styled.div`
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 600;
  color: #757575;
  background-color: #f9f9f9;
`;

// 결과 항목 스타일 개선
const ResultItem = styled.div`
  padding: 12px 16px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f5f5f5;
  }
`;

const UserAvatar = styled.div<{ url: string | null }>`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background-image: url(${(props) => props.url || "/default-avatar.png"});
  background-size: cover;
  background-position: center;
  margin-right: 16px;
  flex-shrink: 0;
  border: 1px solid #eeeeee;
`;

const PlaceIcon = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background-color: #f0f7ff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  flex-shrink: 0;
  font-size: 20px;
  color: #4a90e2;
`;

const ResultInfo = styled.div`
  flex: 1;
  overflow: hidden;
`;

// 결과 이름 스타일 개선
const ResultName = styled.div`
  font-weight: 500;
  font-size: 15px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

// 결과 상세 정보
const ResultDetail = styled.div`
  font-size: 13px;
  color: #757575;
  margin-top: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const NoResults = styled.div`
  padding: 24px 16px;
  text-align: center;
  color: #757575;
  font-size: 14px;
`;

// 로더 컴포넌트
const LoaderContainer = styled.div`
  width: 100%;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 8px 0;
  text-align: center;
  color: #757575;
  font-size: 14px;
`;

// 접두사 안내 메시지
const PrefixHint = styled.div`
  padding: 12px 16px;
  text-align: center;
  color: #757575;
  font-size: 14px;
  background-color: #f9f9f9;
  border-radius: 8px 8px 0 0;
`;

const SearchComponent: React.FC = () => {
  const [searchText, setSearchText] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [initialSearchDone, setInitialSearchDone] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [userResults, setUserResults] = useState<UserSearchResultDTO[]>([]);
  const [placeResults, setPlaceResults] = useState<PlaceSearchResultDTO[]>([]);
  const [userNextCursor, setUserNextCursor] = useState<number | null>(null);
  const [placeNextCursor, setPlaceNextCursor] = useState<number | null>(null);
  const [hasMoreUsers, setHasMoreUsers] = useState(true);
  const [hasMorePlaces, setHasMorePlaces] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showPrefixHint, setShowPrefixHint] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const userLoaderRef = useRef<HTMLDivElement>(null);
  const placeLoaderRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // 검색어가 올바른 접두사(@/#)를 가지고 있는지 확인
  const hasValidPrefix = (text: string) => {
    return text.startsWith("@") || text.startsWith("#");
  };

  // 검색 실행 함수 - 검색 버튼 클릭 시 호출됨
  const executeSearch = async () => {
    if (!searchText.trim()) {
      setUserResults([]);
      setPlaceResults([]);
      setShowResults(false);
      setShowPrefixHint(false);
      return;
    }

    // 접두사(@/#) 확인
    if (!hasValidPrefix(searchText)) {
      setUserResults([]);
      setPlaceResults([]);
      setShowResults(true);
      setShowPrefixHint(true);
      return;
    }

    setIsSearching(true);
    setShowResults(true);
    setShowPrefixHint(false);
    setUserNextCursor(null);
    setPlaceNextCursor(null);
    setHasMoreUsers(true);
    setHasMorePlaces(true);
    setUserResults([]);
    setPlaceResults([]);

    try {
      // @로 시작하면 사용자 검색
      if (searchText.startsWith("@")) {
        const response = await searchUsersByNicknameAPI(searchText);
        setUserResults(response.users);
        setUserNextCursor(response.nextCursor);
        setHasMoreUsers(!!response.nextCursor);
        setPlaceResults([]);
        setHasMorePlaces(false);
      }
      // #로 시작하면 장소 검색
      else if (searchText.startsWith("#")) {
        const response = await searchWorkoutPlacesAPI(searchText);
        setPlaceResults(response.places);
        setPlaceNextCursor(response.nextCursor);
        setHasMorePlaces(!!response.nextCursor);
        setUserResults([]);
        setHasMoreUsers(false);
      }
      setInitialSearchDone(true);
    } catch (error) {
      console.error("검색 중 오류 발생:", error);
    } finally {
      setIsSearching(false);
    }
  };

  // 더 많은 사용자 결과 로드
  const loadMoreUsers = useCallback(async () => {
    if (loadingMore || !hasMoreUsers || !userNextCursor || !searchText) return;

    setLoadingMore(true);
    try {
      const response = await searchUsersByNicknameAPI(
        searchText,
        userNextCursor
      );
      setUserResults((prev) => [...prev, ...response.users]);
      setUserNextCursor(response.nextCursor);
      setHasMoreUsers(!!response.nextCursor);
    } catch (error) {
      console.error("사용자 추가 로드 중 오류:", error);
    } finally {
      setLoadingMore(false);
    }
  }, [searchText, userNextCursor, hasMoreUsers, loadingMore]);

  // 더 많은 장소 결과 로드
  const loadMorePlaces = useCallback(async () => {
    if (loadingMore || !hasMorePlaces || !placeNextCursor || !searchText)
      return;

    setLoadingMore(true);
    try {
      const response = await searchWorkoutPlacesAPI(
        searchText,
        placeNextCursor
      );
      setPlaceResults((prev) => [...prev, ...response.places]);
      setPlaceNextCursor(response.nextCursor);
      setHasMorePlaces(!!response.nextCursor);
    } catch (error) {
      console.error("장소 추가 로드 중 오류:", error);
    } finally {
      setLoadingMore(false);
    }
  }, [searchText, placeNextCursor, hasMorePlaces, loadingMore]);

  // 사용자 결과 무한 스크롤 관찰자 설정
  useEffect(() => {
    if (!initialSearchDone || !hasMoreUsers || !userLoaderRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore && hasMoreUsers) {
          loadMoreUsers();
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(userLoaderRef.current);
    return () => observer.disconnect();
  }, [hasMoreUsers, loadMoreUsers, loadingMore, initialSearchDone]);

  // 장소 결과 무한 스크롤 관찰자 설정
  useEffect(() => {
    if (!initialSearchDone || !hasMorePlaces || !placeLoaderRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore && hasMorePlaces) {
          loadMorePlaces();
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(placeLoaderRef.current);
    return () => observer.disconnect();
  }, [hasMorePlaces, loadMorePlaces, loadingMore, initialSearchDone]);

  // 검색어 입력 핸들러
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
    // 검색어 변경 시 접두사 힌트 메시지 숨김
    setShowPrefixHint(false);
  };

  // 키보드 이벤트 핸들러 - Enter 키 누를 때 검색 실행
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      executeSearch();
    }
  };

  // 검색 버튼 클릭 핸들러
  const handleSearchClick = () => {
    executeSearch();
  };

  // 사용자 결과 클릭 핸들러
  const handleUserClick = (user: UserSearchResultDTO) => {
    navigate(`/profile/${user.userNickname}`);
    setShowResults(false);
    setSearchText("");
  };

  // 장소 결과 클릭 핸들러
  const handlePlaceClick = (place: PlaceSearchResultDTO) => {
    navigate(`/workoutplace/${place.workoutPlaceSeq}`);
    setShowResults(false);
    setSearchText("");
  };

  // 외부 클릭 시 결과창 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
        setShowPrefixHint(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <SearchContainer ref={searchContainerRef}>
      <SearchInputWrapper>
        <SearchInput
          placeholder="@유저 또는 #장소 검색"
          value={searchText}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
        />
        <SearchButton onClick={handleSearchClick}>
          <FaSearch />
        </SearchButton>
      </SearchInputWrapper>
      <ResultsContainer visible={showResults && searchText.trim() !== ""}>
        {showPrefixHint ? (
          <PrefixHint>
            검색을 하려면 '@닉네임' 또는 '#장소명' 형식으로 입력해주세요.
          </PrefixHint>
        ) : isSearching ? (
          <NoResults>검색 중...</NoResults>
        ) : (
          <>
            {userResults.length === 0 && placeResults.length === 0 ? (
              <NoResults>검색 결과가 없습니다.</NoResults>
            ) : (
              <>
                {userResults.length > 0 && (
                  <ResultSection>
                    <SectionTitle>사용자</SectionTitle>
                    {userResults.map((user) => (
                      <ResultItem
                        key={user.userSeq}
                        onClick={() => handleUserClick(user)}
                      >
                        <UserAvatar
                          url={getImageUrl(user.profileImageUrl) || null}
                        />
                        <ResultInfo>
                          <ResultName>{user.userNickname}</ResultName>
                        </ResultInfo>
                      </ResultItem>
                    ))}
                    {/* 사용자 무한 스크롤 로더 */}
                    {hasMoreUsers && (
                      <LoaderContainer ref={userLoaderRef}>
                        {loadingMore ? "더 불러오는 중..." : ""}
                      </LoaderContainer>
                    )}
                  </ResultSection>
                )}
                {placeResults.length > 0 && (
                  <ResultSection>
                    <SectionTitle>운동 장소</SectionTitle>
                    {placeResults.map((place) => (
                      <ResultItem
                        key={place.workoutPlaceSeq}
                        onClick={() => handlePlaceClick(place)}
                      >
                        <PlaceIcon>
                          <FaMapMarkerAlt />
                        </PlaceIcon>
                        <ResultInfo>
                          <ResultName>{place.placeName}</ResultName>
                          <ResultDetail>
                            {place.roadAddressName || place.addressName || ""}
                          </ResultDetail>
                        </ResultInfo>
                      </ResultItem>
                    ))}
                    {/* 장소 무한 스크롤 로더 */}
                    {hasMorePlaces && (
                      <LoaderContainer ref={placeLoaderRef}>
                        {loadingMore ? "더 불러오는 중..." : ""}
                      </LoaderContainer>
                    )}
                  </ResultSection>
                )}
              </>
            )}
          </>
        )}
      </ResultsContainer>
    </SearchContainer>
  );
};

export default SearchComponent;

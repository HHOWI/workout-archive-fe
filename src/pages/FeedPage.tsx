import React, { useState, useEffect, useCallback } from "react";
import styled from "@emotion/styled";
import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { FeedItemDTO } from "../dtos/FeedDTO";
import WorkoutDetailModal from "../components/WorkoutDetailModal";
import { getImageUrl } from "../utils/imageUtils";
import useInfiniteScroll from "../hooks/useInfiniteScroll";
import { getFeedAPI } from "../api/feed";
import { toggleWorkoutLikeAPI } from "../api/workout";
import { theme, fadeIn } from "../styles/theme";
import {
  Container,
  LoadingIndicator,
  NoDataMessage,
} from "../styles/CommonStyles";
import {
  FaHeart,
  FaRegHeart,
  FaMapMarkerAlt,
  FaUser,
  FaCalendarAlt,
  FaInfoCircle,
  FaCommentDots,
} from "react-icons/fa";

// 피드 아이템 스타일
const FeedList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 16px;
  max-width: 600px;
  margin: 0 auto;
  width: 100%;
`;

const FeedItem = styled.div`
  display: flex;
  flex-direction: column;
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  animation: ${fadeIn} 0.3s ease;
`;

const FeedHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 16px;
`;

const FeedAvatar = styled.div<{ url?: string | null }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-image: ${({ url }) => (url ? `url(${url})` : "none")};
  background-color: ${({ url }) => (url ? "transparent" : "#e0e0e0")};
  background-size: cover;
  background-position: center;
  margin-right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  svg {
    color: white;
    font-size: 18px;
  }

  &:hover {
    transform: scale(1.08);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }
`;

const FeedInfo = styled.div`
  flex: 1;
`;

const FeedUserName = styled.div`
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

const FeedPlaceName = styled.div`
  font-size: 12px;
  color: #666666;
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 2px;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

const FeedDate = styled.div`
  color: ${theme.textLight};
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const FeedPhoto = styled.div<{ url?: string | null }>`
  width: 100%;
  aspect-ratio: 1;
  background-image: ${({ url }) => (url ? `url(${url})` : "none")};
  background-color: ${({ url }) => (url ? "transparent" : "#f5f5f5")};
  background-size: cover;
  background-position: center;
  cursor: pointer;
`;

const FeedContent = styled.div`
  padding: 12px 16px;
`;

const FeedExerciseType = styled.div`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  background-color: rgba(0, 123, 255, 0.1);
  color: ${theme.primary};
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 8px;
`;

const FeedText = styled.div`
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 12px;
  color: ${theme.text};
`;

const FeedFooter = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 16px 12px;
  border-top: 1px solid #eee;
`;

const LikeButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  font-size: 14px;
  cursor: pointer;
  color: ${theme.textLight};
  padding: 8px 12px;
  border-radius: 20px;
  transition: all 0.2s ease;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }

  svg {
    font-size: 16px;
  }

  &.active {
    color: #e74c3c;
  }
`;

const CommentButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  font-size: 14px;
  cursor: pointer;
  color: ${theme.textLight};
  padding: 8px 12px;
  border-radius: 20px;
  transition: all 0.2s ease;
  margin-left: 8px;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }

  svg {
    font-size: 16px;
  }
`;

const SourceTag = styled.div<{ source: "user" | "place" }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 12px;
  background-color: ${({ source }) =>
    source === "user" ? "#e8f4fd" : "#e6f7ee"};
  color: ${({ source }) => (source === "user" ? "#2196f3" : "#4caf50")};
  font-size: 11px;
  margin-left: auto;

  svg {
    font-size: 10px;
  }
`;

const PageHeader = styled.div`
  padding: 16px;
  display: flex;
  align-items: center;
  max-width: 600px;
  margin: 0 auto;
  width: 100%;

  h1 {
    font-size: 24px;
    font-weight: 600;
    margin: 0;
  }
`;

// 날짜 포맷 유틸 함수
const formatDate = (dateString: string): string => {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return new Date(dateString).toLocaleDateString("ko-KR", options);
};

// 메인 피드 페이지 컴포넌트
const FeedPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userInfo = useSelector((state: any) => state.auth.userInfo);
  const [selectedWorkoutSeq, setSelectedWorkoutSeq] = useState<number | null>(
    null
  );
  const [localFeeds, setLocalFeeds] = useState<FeedItemDTO[]>([]);

  // 무한 스크롤 훅
  const fetchFeedsFunction = useCallback(async (cursor: number | null) => {
    try {
      const response = await getFeedAPI(10, cursor);
      return {
        data: response.feeds,
        nextCursor: response.nextCursor,
      };
    } catch (error) {
      console.error("피드 로드 실패:", error);
      throw error;
    }
  }, []);

  const {
    data: feedsFromHook,
    loading,
    hasMore,
    observerTarget,
  } = useInfiniteScroll<FeedItemDTO, number>({
    fetchData: fetchFeedsFunction,
    isItemEqual: (a, b) => a.workoutOfTheDaySeq === b.workoutOfTheDaySeq,
  });

  // 훅 데이터 변경 시 로컬 상태 동기화
  useEffect(() => {
    setLocalFeeds(feedsFromHook);
  }, [feedsFromHook]);

  // URL의 workout 쿼리 파라미터 확인
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const workoutId = searchParams.get("workout");

    if (workoutId) {
      setSelectedWorkoutSeq(parseInt(workoutId, 10));

      // URL에서 쿼리 파라미터 제거
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete("workout");
      navigate({ search: newSearchParams.toString() || "" }, { replace: true });
    }
  }, [location, navigate]);

  // 워크아웃 카드 클릭 핸들러
  const handleWorkoutClick = (seq: number) => {
    setSelectedWorkoutSeq(seq);
  };

  // 모달 닫기 핸들러
  const handleCloseModal = () => {
    setSelectedWorkoutSeq(null);
  };

  // 프로필 클릭 핸들러
  const handleProfileClick = (nickname: string) => {
    navigate(`/profile/${nickname}`);
  };

  // 장소 클릭 핸들러
  const handlePlaceClick = (placeSeq: number) => {
    navigate(`/workoutplace/${placeSeq}`);
  };

  // 좋아요 토글 핸들러
  const handleLikeToggle = async (index: number, workoutSeq: number) => {
    try {
      const response = await toggleWorkoutLikeAPI(workoutSeq);

      // 로컬 상태 업데이트
      setLocalFeeds((currentFeeds) => {
        const updatedFeeds = [...currentFeeds];
        if (updatedFeeds[index]) {
          updatedFeeds[index] = {
            ...updatedFeeds[index],
            isLiked: response.isLiked,
            workoutLikeCount: response.likeCount,
          };
        }
        return updatedFeeds;
      });
    } catch (error) {
      console.error("좋아요 업데이트 실패:", error);
      // 에러 처리 (예: 사용자에게 알림)
    }
  };

  // 로딩 중 표시
  if (localFeeds.length === 0 && loading) {
    return (
      <Container>
        <LoadingIndicator />
      </Container>
    );
  }

  return (
    <Container>
      <FeedList>
        {localFeeds.length === 0 && !loading ? (
          <NoDataMessage>
            <FaInfoCircle size={20} style={{ marginBottom: "10px" }} />
            <p>팔로우한 사용자나 장소의 피드가 없습니다.</p>
            <p>사용자나 운동 장소를 팔로우하여 피드를 받아보세요!</p>
          </NoDataMessage>
        ) : (
          localFeeds.map((feed, index) => (
            <FeedItem key={feed.workoutOfTheDaySeq}>
              <FeedHeader>
                <FeedAvatar
                  url={
                    feed.user.profileImageUrl
                      ? getImageUrl(feed.user.profileImageUrl)
                      : null
                  }
                  onClick={() => handleProfileClick(feed.user.userNickname)}
                >
                  {!feed.user.profileImageUrl && <FaUser />}
                </FeedAvatar>
                <FeedInfo>
                  <FeedUserName
                    onClick={() => handleProfileClick(feed.user.userNickname)}
                  >
                    {feed.user.userNickname}
                  </FeedUserName>
                  {feed.workoutPlace && (
                    <FeedPlaceName
                      onClick={() =>
                        handlePlaceClick(feed.workoutPlace!.workoutPlaceSeq)
                      }
                    >
                      <FaMapMarkerAlt size={10} />
                      {feed.workoutPlace.placeName}
                    </FeedPlaceName>
                  )}
                </FeedInfo>
                <FeedDate>
                  <FaCalendarAlt size={10} />
                  {formatDate(feed.recordDate)}
                </FeedDate>
              </FeedHeader>

              {feed.workoutPhoto && (
                <FeedPhoto
                  url={getImageUrl(feed.workoutPhoto)}
                  onClick={() => handleWorkoutClick(feed.workoutOfTheDaySeq)}
                />
              )}

              <FeedContent>
                {feed.mainExerciseType && (
                  <FeedExerciseType>{feed.mainExerciseType}</FeedExerciseType>
                )}

                {feed.workoutDiary && <FeedText>{feed.workoutDiary}</FeedText>}
              </FeedContent>

              <FeedFooter>
                <LikeButton
                  className={feed.isLiked ? "active" : ""}
                  onClick={() =>
                    handleLikeToggle(index, feed.workoutOfTheDaySeq)
                  }
                >
                  {feed.isLiked ? <FaHeart /> : <FaRegHeart />}
                  {feed.workoutLikeCount > 0 && feed.workoutLikeCount}
                </LikeButton>
                <CommentButton
                  onClick={() => handleWorkoutClick(feed.workoutOfTheDaySeq)}
                >
                  <FaCommentDots />
                  {feed.commentCount > 0 && feed.commentCount}
                </CommentButton>
                <SourceTag source={feed.source}>
                  {feed.source === "user" ? <FaUser /> : <FaMapMarkerAlt />}
                  {feed.source === "user"
                    ? "팔로우"
                    : feed.workoutPlace?.placeName ?? "팔로우 장소"}
                </SourceTag>
              </FeedFooter>
            </FeedItem>
          ))
        )}

        <div ref={observerTarget}>{loading && <LoadingIndicator />}</div>
      </FeedList>

      {selectedWorkoutSeq && (
        <WorkoutDetailModal
          workoutOfTheDaySeq={selectedWorkoutSeq}
          onClose={handleCloseModal}
        />
      )}
    </Container>
  );
};

export default FeedPage;

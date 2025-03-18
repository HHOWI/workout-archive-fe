import React, { useState, useRef, useEffect, useCallback } from "react";
import styled from "@emotion/styled";
import { useSelector } from "react-redux";
import { getProfileImageAPI, updateProfileImageAPI } from "../api/user";
import {
  getUserWorkoutOfTheDaysByNicknameAPI,
  getUserWorkoutTotalCountByNicknameAPI,
} from "../api/workout";
import { WorkoutOfTheDayDTO } from "../dtos/WorkoutDTO";
import WorkoutDetailModal from "../components/WorkoutDetailModal";
import WorkoutCard from "../components/WorkoutCard";
import { getImageUrl } from "../utils/imageUtils";
import { useParams, useNavigate } from "react-router-dom";
import { debounce } from "lodash";

const Container = styled.div`
  max-width: 935px;
  margin: 0 auto;
  padding: 30px 20px;
`;

const ProfileHeader = styled.div`
  display: flex;
  margin-bottom: 44px;
  gap: 30px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
`;

const ProfileImage = styled.div<{ url: string; isEditable: boolean }>`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background-image: url(${(props) => props.url});
  background-size: cover;
  background-position: center;
  cursor: ${(props) => (props.isEditable ? "pointer" : "default")};
  position: relative;

  &:hover::after {
    content: ${(props) => (props.isEditable ? '"수정하기"' : '""')};
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(0, 0, 0, 0.5);
    color: white;
    padding: 5px;
    text-align: center;
    border-bottom-left-radius: 50%;
    border-bottom-right-radius: 50%;
    display: ${(props) => (props.isEditable ? "block" : "none")};
  }
`;

const ProfileInfo = styled.div`
  flex: 1;
`;

const Username = styled.h2`
  font-size: 28px;
  font-weight: 300;
  margin-bottom: 20px;
`;

const StatsContainer = styled.div`
  display: flex;
  gap: 20px;

  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 18px;
  font-weight: bold;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: #8e8e8e;
`;

const TabContainer = styled.div`
  border-top: 1px solid #dbdbdb;
  margin-top: 20px;
`;

const TabList = styled.div`
  display: flex;
  justify-content: center;
  gap: 60px;
  margin-bottom: 20px;
`;

const Tab = styled.button<{ isActive: boolean }>`
  padding: 15px 0;
  background: none;
  border: none;
  border-top: 1px solid
    ${(props) => (props.isActive ? "#262626" : "transparent")};
  margin-top: -1px;
  color: ${(props) => (props.isActive ? "#262626" : "#8e8e8e")};
  font-weight: ${(props) => (props.isActive ? "600" : "400")};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    color: #262626;
  }
`;

// 인스타그램 스타일의 운동 기록 그리드
const WorkoutGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;

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
  color: #8e8e8e;
`;

const LoadingSpinner = styled.div`
  text-align: center;
  padding: 50px;
  color: #8e8e8e;
`;

const WorkoutMemoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 20px;
`;

const MemoCard = styled.div`
  background: white;
  border: 1px solid #dbdbdb;
  border-radius: 8px;
  padding: 20px;

  &:hover {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
`;

const MemoHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
`;

const MemoCategory = styled.span`
  background-color: #f0f7ff;
  color: #4a90e2;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.9rem;
`;

const MemoDate = styled.span`
  color: #8e8e8e;
  font-size: 0.9rem;
`;

const MemoContent = styled.p`
  color: #262626;
  line-height: 1.5;
`;

const HiddenInput = styled.input`
  display: none;
`;

// 타입 정의
type TabType = "workout" | "memo";

const ProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>("workout");
  const userInfo = useSelector((state: any) => state.auth.userInfo);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { nickname } = useParams<{ nickname: string }>();
  const isOwnProfile = userInfo?.nickname === nickname;
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
  const [profileImageUrl, setProfileImageUrl] = useState<string>("");

  // 초기 데이터 로드 및 상태 초기화
  const initializeData = useCallback(async () => {
    setWorkoutOfTheDays([]);
    setNextCursor(null);
    setHasMore(true);
    try {
      const [profileResponse, countResponse] = await Promise.all([
        getProfileImageAPI(nickname || ""),
        getUserWorkoutTotalCountByNicknameAPI(nickname || ""),
      ]);
      setProfileImageUrl(getImageUrl(profileResponse.imageUrl) || "");
      setTotalWorkoutCount(countResponse.count);
    } catch (error) {
      console.error("초기 데이터 로드 실패:", error);
    }
  }, [nickname]);

  // 운동 기록 가져오기
  const fetchWorkouts = useCallback(
    debounce(async (cursor: number | null) => {
      if (loading || !hasMore) return;

      setLoading(true);
      try {
        const response = await getUserWorkoutOfTheDaysByNicknameAPI(
          nickname || "",
          12,
          cursor
        );
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
    [nickname, loading, hasMore]
  );

  // 초기화 및 첫 데이터 로드
  useEffect(() => {
    initializeData();
    if (activeTab === "workout" && nickname) {
      fetchWorkouts(null);
    }
  }, [initializeData, activeTab, nickname]);

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

  // 프로필 이미지 업로드
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isOwnProfile || !e.target.files) return;

    const file = e.target.files[0];
    if (file.size > 5 * 1024 * 1024) {
      alert("파일 크기는 5MB 이하여야 합니다.");
      return;
    }
    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 업로드 가능합니다.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("image", file);
      const response = await updateProfileImageAPI(formData);
      setProfileImageUrl(
        `${process.env.REACT_APP_API_URL}/${response.data.imageUrl}`
      );
    } catch (error) {
      console.error("프로필 이미지 업로드 에러:", error);
      alert("프로필 이미지 업로드에 실패했습니다.");
    }
  };

  // 이벤트 핸들러
  const handleImageClick = () => isOwnProfile && fileInputRef.current?.click();
  const handleWorkoutCardClick = (seq: number) => {
    setSelectedWorkoutOfTheDaySeq(seq);
    setShowModal(true);
  };
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedWorkoutOfTheDaySeq(null);
  };

  const memoData = [
    {
      id: 1,
      category: "상체",
      date: "2024.03.21",
      content:
        "벤치프레스 자세 교정 필요. 어깨를 더 고정하고 팔꿈치 각도 주의.",
    },
    {
      id: 2,
      category: "하체",
      date: "2024.03.20",
      content: "스쿼트 깊이 개선됨. 무게 점진적 증량 시작해도 될 듯.",
    },
    // ... 더 많은 메모 데이터
  ];

  return (
    <Container>
      <ProfileHeader>
        <ProfileImage
          url={profileImageUrl}
          onClick={handleImageClick}
          isEditable={isOwnProfile}
        />
        {isOwnProfile && (
          <HiddenInput
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />
        )}
        <ProfileInfo>
          <Username>{nickname}</Username>
          <StatsContainer>
            <StatItem>
              <StatValue>{totalWorkoutCount}</StatValue>
              <StatLabel>운동 기록</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>23</StatValue>
              <StatLabel>연속 일수</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>89%</StatValue>
              <StatLabel>목표 달성률</StatLabel>
            </StatItem>
          </StatsContainer>
        </ProfileInfo>
      </ProfileHeader>

      <TabContainer>
        <TabList>
          <Tab
            isActive={activeTab === "workout"}
            onClick={() => setActiveTab("workout")}
          >
            {isOwnProfile ? "내 운동 기록" : "운동 기록"}
          </Tab>
          <Tab
            isActive={activeTab === "memo"}
            onClick={() => setActiveTab("memo")}
          >
            {isOwnProfile ? "내 운동 메모" : "운동 메모"}
          </Tab>
        </TabList>

        {activeTab === "workout" ? (
          workoutOfTheDays.length === 0 && !loading ? (
            <NoDataMessage>운동 기록이 없습니다.</NoDataMessage>
          ) : (
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
              {/* 무한 스크롤을 위한 관찰 대상 요소 */}
              <div
                ref={observerTarget}
                style={{ height: "20px", margin: "20px 0" }}
              >
                {loading && <LoadingSpinner>로딩 중...</LoadingSpinner>}
              </div>
            </>
          )
        ) : (
          <WorkoutMemoGrid>
            {memoData.map((memo) => (
              <MemoCard key={memo.id}>
                <MemoHeader>
                  <MemoCategory>{memo.category}</MemoCategory>
                  <MemoDate>{memo.date}</MemoDate>
                </MemoHeader>
                <MemoContent>{memo.content}</MemoContent>
              </MemoCard>
            ))}
          </WorkoutMemoGrid>
        )}
      </TabContainer>

      {/* 워크아웃 상세 모달 */}
      {showModal && selectedWorkoutOfTheDaySeq && (
        <WorkoutDetailModal
          workoutOfTheDaySeq={selectedWorkoutOfTheDaySeq}
          onClose={handleCloseModal}
        />
      )}
    </Container>
  );
};

export default ProfilePage;

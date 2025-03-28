import React, { useState, useRef, useEffect, useCallback } from "react";
import styled from "@emotion/styled";
import { keyframes } from "@emotion/react";
import { useSelector } from "react-redux";
import {
  getProfileImageAPI,
  updateProfileImageAPI,
  checkProfileOwnershipAPI,
} from "../api/user";
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
import { RootState } from "../store/store";
import {
  FaUserEdit,
  FaDumbbell,
  FaUsers,
  FaUserFriends,
  FaSpinner,
} from "react-icons/fa";

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

const slideIn = keyframes`
  from { transform: translateX(-20px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
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
  textMuted: "#8e8e8e",
  border: "#e6e6e6",
  shadow: "rgba(0, 0, 0, 0.08)",
  shadowHover: "rgba(0, 0, 0, 0.12)",
  success: "#27ae60",
  error: "#e74c3c",
};

// ===== 스타일 컴포넌트 =====
const Container = styled.div`
  max-width: 935px;
  margin: 0 auto;
  padding: 30px 20px;
  color: ${theme.text};
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica,
    Arial, sans-serif;
  animation: ${fadeIn} 0.5s ease-out;

  @media (max-width: 768px) {
    padding: 20px 16px;
  }
`;

const ProfileHeader = styled.div`
  display: flex;
  margin-bottom: 44px;
  gap: 30px;
  padding: 28px;
  background-color: ${theme.background};
  border-radius: 16px;
  box-shadow: 0 4px 20px ${theme.shadow};
  border: 1px solid ${theme.border};
  transition: box-shadow 0.3s ease;
  animation: ${fadeIn} 0.6s ease-out;

  &:hover {
    box-shadow: 0 6px 24px ${theme.shadowHover};
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 22px;
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
  box-shadow: 0 4px 12px ${theme.shadow};
  border: 3px solid ${theme.background};
  transition: all 0.3s ease;

  &:hover {
    transform: ${(props) => (props.isEditable ? "scale(1.03)" : "none")};
    box-shadow: 0 6px 16px ${theme.shadowHover};
  }

  &:hover::after {
    content: ${(props) => (props.isEditable ? '"프로필 사진 변경"' : '""')};
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 8px 5px;
    text-align: center;
    border-bottom-left-radius: 50%;
    border-bottom-right-radius: 50%;
    font-size: 14px;
    font-weight: 500;
    display: ${(props) => (props.isEditable ? "block" : "none")};
  }
`;

const ProfileInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const Username = styled.h2`
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  color: ${theme.text};

  @media (max-width: 768px) {
    justify-content: center;
    font-size: 24px;
  }
`;

const EditProfileButton = styled.button`
  background: transparent;
  border: 1px solid ${theme.border};
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  color: ${theme.textLight};
  transition: all 0.3s ease;

  &:hover {
    background: ${theme.secondary};
    transform: translateY(-2px);
    box-shadow: 0 4px 8px ${theme.shadow};
  }
`;

const StatsContainer = styled.div`
  display: flex;
  gap: 26px;
  margin-top: 5px;

  @media (max-width: 768px) {
    justify-content: center;
    margin-top: 16px;
  }
`;

const StatItem = styled.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  border-radius: 12px;
  transition: all 0.3s ease;

  &:hover {
    background-color: ${theme.secondary};
    transform: translateY(-2px);
  }
`;

const StatValue = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: ${theme.primary};
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: ${theme.textMuted};
  font-weight: 500;
`;

const StatIcon = styled.div`
  color: ${theme.primary};
  margin-bottom: 8px;
  font-size: 20px;
`;

const TabContainer = styled.div`
  border-top: 1px solid ${theme.border};
  margin-top: 20px;
  animation: ${fadeIn} 0.8s ease-out;
`;

const TabList = styled.div`
  display: flex;
  justify-content: center;
  gap: 60px;
  margin-bottom: 30px;
`;

const Tab = styled.button<{ isActive: boolean }>`
  padding: 15px 0;
  background: none;
  border: none;
  border-top: 2px solid
    ${(props) => (props.isActive ? theme.primary : "transparent")};
  margin-top: -1px;
  color: ${(props) => (props.isActive ? theme.text : theme.textMuted)};
  font-weight: ${(props) => (props.isActive ? "600" : "400")};
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  font-size: 15px;

  &::after {
    content: "";
    position: absolute;
    bottom: -2px;
    left: 0;
    width: ${(props) => (props.isActive ? "100%" : "0")};
    height: 2px;
    background-color: ${theme.primary};
    transition: width 0.3s ease;
  }

  &:hover {
    color: ${theme.text};

    &::after {
      width: 100%;
    }
  }
`;

// 운동 기록 그리드
const WorkoutGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  animation: ${fadeIn} 0.6s ease-out;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 14px;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

const NoDataMessage = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: ${theme.textMuted};
  background-color: ${theme.secondary};
  border-radius: 12px;
  margin-top: 20px;
  font-size: 15px;
  box-shadow: 0 2px 4px ${theme.shadow};
  border: 1px solid ${theme.border};
  animation: ${fadeIn} 0.5s ease-out;
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

const SpinnerIcon = styled(FaSpinner)`
  font-size: 24px;
  color: ${theme.primary};
  animation: ${spin} 1s linear infinite;
`;

// 메모 관련 스타일
const WorkoutMemoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 20px;
  animation: ${fadeIn} 0.6s ease-out;
`;

const MemoCard = styled.div`
  background: ${theme.background};
  border: 1px solid ${theme.border};
  border-radius: 12px;
  padding: 22px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 6px ${theme.shadow};

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px ${theme.shadowHover};
  }
`;

const MemoHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 14px;
`;

const MemoCategory = styled.span`
  background-color: #e8f4ff;
  color: ${theme.primary};
  padding: 6px 10px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(74, 144, 226, 0.1);
`;

const MemoDate = styled.span`
  color: ${theme.textMuted};
  font-size: 13px;
  display: flex;
  align-items: center;
`;

const MemoContent = styled.p`
  color: ${theme.text};
  line-height: 1.6;
  font-size: 15px;
`;

const HiddenInput = styled.input`
  display: none;
`;

// 로딩 인디케이터 컴포넌트
const LoadingIndicator = () => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: "50px",
    }}
  >
    <SpinnerIcon />
    <span style={{ marginLeft: "10px", color: theme.textLight }}>
      로딩 중...
    </span>
  </div>
);

// ===== 컴포넌트 분리 =====

// 프로필 이미지 및 이미지 업로드 컴포넌트
interface ProfileImageSectionProps {
  profileImageUrl: string;
  isOwnProfile: boolean;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
}

const ProfileImageSection = React.memo(
  ({
    profileImageUrl,
    isOwnProfile,
    onImageChange,
  }: ProfileImageSectionProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageClick = () => {
      if (isOwnProfile) {
        fileInputRef.current?.click();
      }
    };

    return (
      <>
        <ProfileImage
          url={profileImageUrl || ""}
          onClick={handleImageClick}
          isEditable={isOwnProfile}
        />
        {isOwnProfile && (
          <HiddenInput
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={onImageChange}
          />
        )}
      </>
    );
  }
);

// 프로필 정보 컴포넌트
interface ProfileInfoSectionProps {
  nickname: string | undefined;
  isOwnProfile: boolean;
  totalWorkoutCount: number;
  onEditProfile: () => void;
}

const ProfileInfoSection = React.memo(
  ({
    nickname,
    isOwnProfile,
    totalWorkoutCount,
    onEditProfile,
  }: ProfileInfoSectionProps) => {
    return (
      <ProfileInfo>
        <Username>
          {nickname}
          {isOwnProfile && (
            <EditProfileButton onClick={onEditProfile}>
              <FaUserEdit />
              프로필 편집
            </EditProfileButton>
          )}
        </Username>
        <StatsContainer>
          <StatItem>
            <StatIcon>
              <FaDumbbell />
            </StatIcon>
            <StatValue>{totalWorkoutCount}</StatValue>
            <StatLabel>운동 기록</StatLabel>
          </StatItem>
          <StatItem>
            <StatIcon>
              <FaUserFriends />
            </StatIcon>
            <StatValue>23</StatValue>
            <StatLabel>팔로우</StatLabel>
          </StatItem>
          <StatItem>
            <StatIcon>
              <FaUsers />
            </StatIcon>
            <StatValue>89%</StatValue>
            <StatLabel>팔로워</StatLabel>
          </StatItem>
        </StatsContainer>
      </ProfileInfo>
    );
  }
);

// 탭 컴포넌트
interface TabProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const ProfileTabs = React.memo(({ activeTab, onTabChange }: TabProps) => {
  return (
    <TabContainer>
      <TabList>
        <Tab
          isActive={activeTab === "workout"}
          onClick={() => onTabChange("workout")}
        >
          오운완
        </Tab>
        <Tab
          isActive={activeTab === "memo"}
          onClick={() => onTabChange("memo")}
        >
          레코드
        </Tab>
      </TabList>
    </TabContainer>
  );
});

// 운동 기록 컴포넌트
interface WorkoutListProps {
  workouts: WorkoutOfTheDayDTO[];
  loading: boolean;
  error: string | null;
  observerRef: React.RefObject<HTMLDivElement>;
  onWorkoutClick: (seq: number) => void;
}

const WorkoutList = React.memo(
  ({
    workouts,
    loading,
    error,
    observerRef,
    onWorkoutClick,
  }: WorkoutListProps) => {
    if (error) {
      return (
        <NoDataMessage>
          오류가 발생했습니다: {error}
          <br />
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: "15px",
              padding: "8px 16px",
              background: theme.primary,
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            새로고침
          </button>
        </NoDataMessage>
      );
    }

    if (workouts.length === 0 && !loading) {
      return <NoDataMessage>운동 기록이 없습니다.</NoDataMessage>;
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
        <LoaderContainer ref={observerRef}>
          {loading && (
            <>
              <SpinnerIcon />
              <span>더 불러오는 중...</span>
            </>
          )}
        </LoaderContainer>
      </>
    );
  }
);

// 메모 리스트 컴포넌트
interface MemoListProps {
  memos: {
    id: number;
    category: string;
    date: string;
    content: string;
  }[];
}

const MemoList = React.memo(({ memos }: MemoListProps) => {
  return (
    <WorkoutMemoGrid>
      {memos.map((memo) => (
        <MemoCard key={memo.id}>
          <MemoHeader>
            <MemoCategory>{memo.category}</MemoCategory>
            <MemoDate>{memo.date}</MemoDate>
          </MemoHeader>
          <MemoContent>{memo.content}</MemoContent>
        </MemoCard>
      ))}
    </WorkoutMemoGrid>
  );
});

// ===== 커스텀 훅 =====

// 프로필 데이터 관련 훅
const useProfileData = (nickname: string | undefined, userInfo: any) => {
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [totalWorkoutCount, setTotalWorkoutCount] = useState<number>(0);
  const [profileImageUrl, setProfileImageUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // 초기 데이터 로드 및 상태 초기화
  const initializeData = useCallback(async () => {
    if (!nickname) return;
    setLoading(true);
    try {
      const [profileResponse, countResponse] = await Promise.all([
        getProfileImageAPI(nickname),
        getUserWorkoutTotalCountByNicknameAPI(nickname),
      ]);
      setProfileImageUrl(getImageUrl(profileResponse.imageUrl) || "");
      setTotalWorkoutCount(countResponse.count);

      if (userInfo) {
        const ownershipResponse = await checkProfileOwnershipAPI(nickname);
        setIsOwnProfile(ownershipResponse.isOwner);
      } else {
        setIsOwnProfile(false);
      }
    } catch (error) {
      console.error("초기 데이터 로드 실패:", error);
    } finally {
      setLoading(false);
    }
  }, [nickname, userInfo]);

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  return {
    isOwnProfile,
    totalWorkoutCount,
    profileImageUrl,
    setProfileImageUrl,
    setTotalWorkoutCount,
    loading,
  };
};

// 운동 데이터 관련 훅
const useWorkoutData = (nickname: string | undefined, activeTab: TabType) => {
  const [workoutOfTheDays, setWorkoutOfTheDays] = useState<
    WorkoutOfTheDayDTO[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const observerTarget = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  // 운동 기록 가져오기
  const fetchWorkouts = useCallback(
    debounce(async (cursor: number | null) => {
      // loadingRef를 사용하여 동시에 여러 요청이 발생하는 것을 방지
      if (loadingRef.current || !hasMore || !nickname) return;

      loadingRef.current = true;
      setLoading(true);
      setError(null);

      console.log("운동 기록 가져오기 시작:", { nickname, cursor });

      try {
        const response = await getUserWorkoutOfTheDaysByNicknameAPI(
          nickname,
          12,
          cursor
        );

        console.log("API 응답:", response);

        if (!response || typeof response !== "object") {
          throw new Error("서버 응답이 올바르지 않습니다");
        }

        const workouts = response.workouts || [];
        setWorkoutOfTheDays((prev) =>
          cursor ? [...prev, ...workouts] : workouts
        );
        setNextCursor(response.nextCursor);
        setHasMore(!!response.nextCursor);

        if (workouts.length === 0 && !cursor) {
          console.log("운동 기록이 없습니다");
        }
      } catch (error) {
        console.error("운동 기록 로드 실패:", error);
        setError(
          error instanceof Error
            ? error.message
            : "운동 기록을 불러오지 못했습니다"
        );
        setHasMore(false);
      } finally {
        setLoading(false);
        loadingRef.current = false;
      }
    }, 300),
    [nickname] // loading, hasMore 의존성 제거
  );

  // 초기화 및 첫 데이터 로드
  useEffect(() => {
    if (activeTab === "workout" && nickname) {
      console.log("탭 변경 또는 초기 로드 - 운동 기록 초기화");
      setWorkoutOfTheDays([]); // 초기화
      setNextCursor(null);
      setHasMore(true);
      setError(null);

      // 약간의 지연을 주어 상태 업데이트가 반영된 후 데이터를 가져옴
      setTimeout(() => {
        fetchWorkouts(null);
      }, 0);
    }
  }, [activeTab, nickname, fetchWorkouts]);

  // 무한 스크롤 설정
  useEffect(() => {
    if (activeTab !== "workout" || loading || !hasMore || error) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          !loadingRef.current &&
          hasMore &&
          nextCursor
        ) {
          console.log("스크롤 감지 - 추가 데이터 로드 시작", { nextCursor });
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
  }, [activeTab, fetchWorkouts, nextCursor, hasMore, loading, error]);

  return {
    workoutOfTheDays,
    setWorkoutOfTheDays,
    loading,
    hasMore,
    error,
    observerTarget,
  };
};

// 타입 정의
type TabType = "workout" | "memo";

// ===== 메인 컴포넌트 =====
const ProfilePage: React.FC = () => {
  // 상태 및 라우터 관련
  const [activeTab, setActiveTab] = useState<TabType>("workout");
  const userInfo = useSelector((state: RootState) => state.auth.userInfo);
  const navigate = useNavigate();
  const { nickname } = useParams<{ nickname: string }>();

  // 모달 관련 상태
  const [selectedWorkoutOfTheDaySeq, setSelectedWorkoutOfTheDaySeq] = useState<
    number | null
  >(null);
  const [showModal, setShowModal] = useState(false);

  // 커스텀 훅 사용
  const {
    isOwnProfile,
    totalWorkoutCount,
    profileImageUrl,
    setProfileImageUrl,
    setTotalWorkoutCount,
    loading: profileLoading,
  } = useProfileData(nickname, userInfo);

  const {
    workoutOfTheDays,
    setWorkoutOfTheDays,
    loading: workoutLoading,
    error,
    observerTarget,
  } = useWorkoutData(nickname, activeTab);

  // 이벤트 핸들러
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  const handleWorkoutCardClick = useCallback((seq: number) => {
    setSelectedWorkoutOfTheDaySeq(seq);
    setShowModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setSelectedWorkoutOfTheDaySeq(null);
  }, []);

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

      if (response.data && response.data.imageUrl) {
        setProfileImageUrl(getImageUrl(response.data.imageUrl) || "");
      }
    } catch (error) {
      console.error("프로필 이미지 업로드 에러:", error);
      alert("프로필 이미지 업로드에 실패했습니다.");
    }
  };

  // 워크아웃 삭제 처리
  const handleWorkoutDelete = useCallback(() => {
    if (selectedWorkoutOfTheDaySeq) {
      // 목록에서 삭제된 워크아웃 제거
      setWorkoutOfTheDays((prev) =>
        prev.filter(
          (workout) => workout.workoutOfTheDaySeq !== selectedWorkoutOfTheDaySeq
        )
      );

      // 총 워크아웃 수 감소
      setTotalWorkoutCount((prev) => Math.max(0, prev - 1));

      // 모달 닫기
      setShowModal(false);
      setSelectedWorkoutOfTheDaySeq(null);
    }
  }, [selectedWorkoutOfTheDaySeq, setWorkoutOfTheDays, setTotalWorkoutCount]);

  // 프로필 편집 페이지로 이동
  const handleEditProfile = useCallback(() => {
    navigate("/edit-profile");
  }, [navigate]);

  // 메모 데이터
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

  // 로딩 중 표시
  if (profileLoading) {
    return (
      <Container>
        <LoadingIndicator />
      </Container>
    );
  }

  return (
    <Container>
      <ProfileHeader>
        <ProfileImageSection
          profileImageUrl={profileImageUrl}
          isOwnProfile={isOwnProfile}
          onImageChange={handleImageChange}
        />

        <ProfileInfoSection
          nickname={nickname}
          isOwnProfile={isOwnProfile}
          totalWorkoutCount={totalWorkoutCount}
          onEditProfile={handleEditProfile}
        />
      </ProfileHeader>

      <ProfileTabs activeTab={activeTab} onTabChange={handleTabChange} />

      {activeTab === "workout" ? (
        <WorkoutList
          workouts={workoutOfTheDays}
          loading={workoutLoading}
          error={error}
          observerRef={observerTarget}
          onWorkoutClick={handleWorkoutCardClick}
        />
      ) : (
        <MemoList memos={memoData} />
      )}

      {showModal && selectedWorkoutOfTheDaySeq && (
        <WorkoutDetailModal
          workoutOfTheDaySeq={selectedWorkoutOfTheDaySeq}
          onClose={handleCloseModal}
          onDelete={handleWorkoutDelete}
        />
      )}
    </Container>
  );
};

export default ProfilePage;

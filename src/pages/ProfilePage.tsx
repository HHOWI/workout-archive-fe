import React, { useState, useRef, useEffect, useCallback } from "react";
import styled from "@emotion/styled";
import { useSelector } from "react-redux";
import { updateProfileImageAPI, getProfileInfoAPI } from "../api/user";
import { WorkoutOfTheDayDTO } from "../dtos/WorkoutDTO";
import { FollowCountDTO } from "../dtos/FollowDTO";
import WorkoutDetailModal from "../components/workout-of-the-day-modal/WorkoutOfTheDayModal";
import WorkoutCard from "../components/WorkoutCard";
import FollowModal from "../components/FollowModal";
import CalendarView from "../components/CalendarView";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { RootState } from "../store/store";
import {
  FaUserEdit,
  FaDumbbell,
  FaUsers,
  FaUserFriends,
  FaUserPlus,
  FaUserMinus,
  FaCamera,
} from "react-icons/fa";
// 커스텀 훅
import useProfileData from "../hooks/useProfileData";
import useWorkoutDetail from "../hooks/useWorkoutDetail";
import useWorkoutData from "../hooks/useWorkoutData";
import useFollowActions from "../hooks/useFollowActions";
// 공통 스타일과 테마 임포트
import { theme, fadeIn } from "../styles/theme";
import {
  Container,
  HeaderBox,
  WorkoutGrid,
  NoDataMessage,
  LoaderContainer,
  SpinnerIcon,
  ActionButton,
  StatsContainer,
  StatItem,
  StatIcon,
  StatValue,
  StatLabel,
  LoadingIndicator,
} from "../styles/CommonStyles";

// ===== 페이지 특화 스타일 컴포넌트 =====
const ProfileHeader = styled(HeaderBox)`
  flex-direction: row;
  padding: 38px;
  border-radius: 20px;
  background: linear-gradient(
    to right bottom,
    rgba(255, 255, 255, 0.9),
    rgba(245, 247, 250, 0.85)
  );
  backdrop-filter: blur(10px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.07);
  border: 1px solid rgba(230, 230, 230, 0.7);
  gap: 50px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 32px 24px;
    gap: 35px;
  }
`;

const ProfileImageWrapper = styled.div`
  position: relative;
  width: 180px;
  height: 180px;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.03);
  }

  &:hover .overlay-content {
    opacity: 1;
  }

  @media (max-width: 768px) {
    width: 160px;
    height: 160px;
  }
`;

const ProfileImage = styled.div<{ url: string; isEditable: boolean }>`
  width: 100%;
  height: 100%;
  background-image: url(${(props) => props.url});
  background-size: cover;
  background-position: center;
  cursor: ${(props) => (props.isEditable ? "pointer" : "default")};
  transition: all 0.3s ease;

  &:hover {
    filter: ${(props) => (props.isEditable ? "brightness(0.9)" : "none")};
  }
`;

const ProfileImageOverlayContent = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  z-index: 2;
  pointer-events: none;

  svg {
    font-size: 28px;
    margin-bottom: 8px;
  }

  span {
    font-size: 14px;
    font-weight: 500;
    text-align: center;
  }
`;

const ProfileInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-left: 10px;

  @media (max-width: 768px) {
    margin-left: 0;
  }
`;

const Username = styled.h2`
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 28px;
  display: flex;
  align-items: center;
  gap: 20px;
  color: ${theme.text};
  letter-spacing: -0.5px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

  @media (max-width: 768px) {
    justify-content: center;
    font-size: 28px;
    margin-bottom: 20px;
    flex-wrap: wrap;
  }
`;

const EditProfileButton = styled(ActionButton)`
  background: transparent;
  border: 1px solid ${theme.border};
  color: ${theme.textLight};
  padding: 10px 18px;
  border-radius: 12px;
  font-weight: 600;
  letter-spacing: 0.2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;

  &:hover {
    background: ${theme.secondary};
    transform: translateY(-3px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
  }
`;

const StatsSection = styled(StatsContainer)`
  margin-top: 15px;
  gap: 35px;

  @media (max-width: 768px) {
    margin-top: 24px;
  }
`;

const EnhancedStatItem = styled(StatItem)`
  position: relative;
  padding: 8px 15px;
  border-radius: 16px;
  background-color: rgba(245, 247, 250, 0.6);
  transition: all 0.3s ease;

  &:hover {
    background-color: rgba(235, 240, 250, 0.8);
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
  }
`;

const EnhancedStatValue = styled(StatValue)`
  font-size: 24px;
  margin-bottom: 8px;
  background: linear-gradient(135deg, ${theme.primary}, ${theme.accent});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 800;
`;

const EnhancedStatLabel = styled(StatLabel)`
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
`;

const EnhancedStatIcon = styled(StatIcon)`
  margin-bottom: 0;
  color: ${theme.primary};
  font-size: 16px;
`;

const InteractiveStatItem = styled(EnhancedStatItem)`
  cursor: pointer;
  position: relative;

  &::after {
    content: "";
    position: absolute;
    bottom: -5px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 2px;
    background-color: ${theme.primary};
    transition: width 0.3s ease;
  }

  &:hover {
    background-color: rgba(220, 230, 250, 0.9);

    &::after {
      width: 70%;
    }
  }

  &:active {
    transform: translateY(-1px);
  }
`;

const TabContainer = styled.div`
  border-top: 1px solid ${theme.border};
  margin-top: 30px;
  animation: ${fadeIn} 0.8s ease-out;
  padding-top: 10px;
`;

const TabList = styled.div`
  display: flex;
  justify-content: center;
  gap: 80px;
  margin-bottom: 35px;

  @media (max-width: 768px) {
    gap: 40px;
  }
`;

const Tab = styled.button<{ isActive: boolean }>`
  padding: 15px 0;
  background: none;
  border: none;
  border-top: 2px solid
    ${(props) => (props.isActive ? theme.primary : "transparent")};
  margin-top: -1px;
  color: ${(props) => (props.isActive ? theme.text : theme.textMuted)};
  font-weight: ${(props) => (props.isActive ? "700" : "500")};
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  font-size: 16px;
  letter-spacing: 0.3px;

  &::after {
    content: "";
    position: absolute;
    bottom: -2px;
    left: 0;
    width: ${(props) => (props.isActive ? "100%" : "0")};
    height: 2px;
    background: linear-gradient(to right, ${theme.primary}, ${theme.accent});
    transition: width 0.3s ease;
  }

  &:hover {
    color: ${theme.text};

    &::after {
      width: 100%;
    }
  }
`;

const HiddenInput = styled.input`
  display: none;
`;

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
      <ProfileImageWrapper>
        <ProfileImage
          url={profileImageUrl || ""}
          onClick={handleImageClick}
          isEditable={isOwnProfile}
        />
        {isOwnProfile && (
          <>
            <ProfileImageOverlayContent className="overlay-content">
              <FaCamera />
              <span>프로필 사진 변경</span>
            </ProfileImageOverlayContent>
            <HiddenInput
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={onImageChange}
            />
          </>
        )}
      </ProfileImageWrapper>
    );
  }
);

// 프로필 정보 컴포넌트
interface ProfileInfoSectionProps {
  nickname: string | undefined;
  isOwnProfile: boolean;
  totalWorkoutCount: number;
  followCounts: FollowCountDTO | null;
  isFollowing: boolean;
  isFollowingLoading: boolean;
  onEditProfile: () => void;
  onFollowToggle: () => Promise<void>;
  onFollowersClick: () => void;
  onFollowingClick: () => void;
}

const ProfileInfoSection: React.FC<ProfileInfoSectionProps> = ({
  nickname,
  isOwnProfile,
  totalWorkoutCount,
  followCounts,
  isFollowing,
  isFollowingLoading,
  onEditProfile,
  onFollowToggle,
  onFollowersClick,
  onFollowingClick,
}) => {
  return (
    <ProfileInfo>
      <Username>
        {nickname}
        {isOwnProfile ? (
          <EditProfileButton onClick={onEditProfile}>
            <FaUserEdit /> 프로필 편집
          </EditProfileButton>
        ) : (
          <EditProfileButton
            onClick={onFollowToggle}
            disabled={isFollowingLoading}
            style={{
              backgroundColor: isFollowing ? "#f0f0f0" : "#4a90e2",
              color: isFollowing ? "#666" : "white",
            }}
          >
            {isFollowingLoading ? (
              <SpinnerIcon className="spinner" />
            ) : isFollowing ? (
              <>
                <FaUserMinus /> 팔로잉
              </>
            ) : (
              <>
                <FaUserPlus /> 팔로우
              </>
            )}
          </EditProfileButton>
        )}
      </Username>

      <StatsSection>
        <EnhancedStatItem>
          <EnhancedStatValue>{totalWorkoutCount || 0}</EnhancedStatValue>
          <EnhancedStatLabel>
            <EnhancedStatIcon>
              <FaDumbbell />
            </EnhancedStatIcon>
            오운완
          </EnhancedStatLabel>
        </EnhancedStatItem>
        <InteractiveStatItem
          onClick={onFollowersClick}
          title="팔로워 목록 보기"
        >
          <EnhancedStatValue>
            {followCounts?.followerCount || 0}
          </EnhancedStatValue>
          <EnhancedStatLabel>
            <EnhancedStatIcon>
              <FaUsers />
            </EnhancedStatIcon>
            팔로워
          </EnhancedStatLabel>
        </InteractiveStatItem>
        <InteractiveStatItem
          onClick={onFollowingClick}
          title="팔로잉 목록 보기"
        >
          <EnhancedStatValue>
            {followCounts?.followingCount || 0}
          </EnhancedStatValue>
          <EnhancedStatLabel>
            <EnhancedStatIcon>
              <FaUserFriends />
            </EnhancedStatIcon>
            팔로잉
          </EnhancedStatLabel>
        </InteractiveStatItem>
      </StatsSection>
    </ProfileInfo>
  );
};

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
          isActive={activeTab === "calendar"}
          onClick={() => onTabChange("calendar")}
        >
          캘린더
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

// 타입 정의
type TabType = "workout" | "calendar";

// ===== 메인 컴포넌트 =====
const ProfilePage: React.FC = () => {
  // 상태 및 라우터 관련
  const [activeTab, setActiveTab] = useState<TabType>("workout");
  const userInfo = useSelector((state: RootState) => state.auth.userInfo);
  const navigate = useNavigate();
  const { nickname } = useParams<{ nickname: string }>();
  const location = useLocation();

  // 모달 관련 상태
  const [followModalType, setFollowModalType] = useState<
    "followers" | "following" | null
  >(null);

  // 커스텀 훅 사용
  const {
    isOwnProfile,
    totalWorkoutCount,
    profileImageUrl,
    userSeq,
    followCounts,
    isFollowing: initialIsFollowing,
    setProfileImageUrl,
    loading: profileLoading,
    initializeData,
    setFollowCounts,
  } = useProfileData(nickname, userInfo);

  const {
    workoutOfTheDays,
    loading: workoutLoading,
    error,
    observerTarget,
    resetData,
  } = useWorkoutData("profile", nickname, activeTab);

  const {
    followCounts: followActionsFollowCounts,
    isFollowing,
    isFollowingLoading,
    toggleFollow,
  } = useFollowActions(
    userSeq,
    userInfo,
    nickname,
    followCounts,
    initialIsFollowing
  );

  const {
    selectedWorkoutSeq,
    selectedCommentId,
    handleWorkoutCardClick,
    handleCloseModal,
    setSelectedWorkoutSeq,
    setSelectedCommentId,
  } = useWorkoutDetail();

  // URL에서 workout 쿼리 파라미터 확인
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const workoutId = searchParams.get("workout");
    const commentId = searchParams.get("comment");

    // workout 쿼리 파라미터가 있으면 해당 오운완 모달 열기
    if (workoutId) {
      setSelectedWorkoutSeq(parseInt(workoutId, 10));

      // 댓글 ID가 있으면 상태에 저장
      if (commentId) {
        setSelectedCommentId(parseInt(commentId, 10));
      }

      // URL에서 쿼리 파라미터 제거 (모달 닫기 후 브라우저 뒤로가기 방지)
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete("workout");
      newSearchParams.delete("comment");
      if (newSearchParams.toString()) {
        navigate({ search: newSearchParams.toString() }, { replace: true });
      } else {
        navigate(location.pathname, { replace: true });
      }
    }
  }, [location, navigate, setSelectedWorkoutSeq, setSelectedCommentId]);

  // 이벤트 핸들러
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

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
      await updateProfileImageAPI(formData);

      // 통합 API를 사용하여 최신 프로필 정보 로드
      initializeData();
    } catch (error) {
      console.error("프로필 이미지 업로드 에러:", error);
      alert("프로필 이미지 업로드에 실패했습니다.");
    }
  };

  // 팔로워/팔로잉 카운트만 업데이트하는 함수
  const updateFollowCounts = useCallback(async () => {
    if (!nickname) return;
    // initializeData 함수를 호출하는 대신 followCounts만 업데이트
    try {
      const profileInfo = await getProfileInfoAPI(nickname);
      setFollowCounts(profileInfo.followCounts);
    } catch (error) {
      console.error("팔로우 카운트 업데이트 중 오류 발생:", error);
    }
  }, [nickname]);

  // 팔로워 목록 모달 열기
  const handleFollowersClick = () => {
    setFollowModalType("followers");
  };

  // 팔로잉 목록 모달 열기
  const handleFollowingClick = () => {
    setFollowModalType("following");
  };

  // 모달 닫기
  const closeFollowModal = () => {
    setFollowModalType(null);
  };

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
          followCounts={followActionsFollowCounts || followCounts}
          isFollowing={isFollowing}
          isFollowingLoading={isFollowingLoading}
          onEditProfile={() => {}}
          onFollowToggle={toggleFollow}
          onFollowersClick={handleFollowersClick}
          onFollowingClick={handleFollowingClick}
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
        <CalendarView nickname={nickname} />
      )}

      {selectedWorkoutSeq && (
        <WorkoutDetailModal
          workoutOfTheDaySeq={selectedWorkoutSeq}
          commentId={selectedCommentId || undefined}
          onClose={handleCloseModal}
          onDelete={() => {
            // 삭제 후 운동 기록 목록 새로고침
            if (activeTab === "workout") {
              // useWorkoutData의 resetData 함수 호출로 데이터 초기화
              resetData();

              // 프로필 정보도 새로고침 (운동 개수 업데이트를 위해)
              initializeData();
            }
          }}
        />
      )}

      {followModalType && (
        <FollowModal
          type={followModalType}
          userSeq={userSeq || 0}
          profileUserSeq={userSeq || 0}
          onClose={closeFollowModal}
          currentUserSeq={userInfo?.userSeq}
          onFollowStatusChange={updateFollowCounts}
        />
      )}
    </Container>
  );
};

export default ProfilePage;

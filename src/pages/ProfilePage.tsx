import React, { useState, useRef, useEffect, useCallback } from "react";
import styled from "@emotion/styled";
import { useSelector } from "react-redux";
import { updateProfileImageAPI, getProfileInfoAPI } from "../api/user";
import {
  getUserWorkoutOfTheDaysByNicknameAPI,
  getUserWorkoutTotalCountByNicknameAPI,
} from "../api/workout";
import {
  getFollowCountsAPI,
  followUserAPI,
  unfollowUserAPI,
  checkUserFollowStatusAPI,
} from "../api/follow";
import { WorkoutOfTheDayDTO } from "../dtos/WorkoutDTO";
import { FollowCountDTO } from "../dtos/FollowDTO";
import WorkoutDetailModal from "../components/WorkoutDetailModal";
import WorkoutCard from "../components/WorkoutCard";
import FollowModal from "../components/FollowModal";
import { getImageUrl } from "../utils/imageUtils";
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
import useInfiniteScroll from "../hooks/useInfiniteScroll";
// 공통 스타일과 테마 임포트
import { theme, fadeIn, pulse, spin, slideIn } from "../styles/theme";
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
  padding: 6px;
  border-radius: 50%;
  background: linear-gradient(120deg, ${theme.primary}, ${theme.accent});
  box-shadow: 0 8px 25px rgba(74, 144, 226, 0.25);

  &::before {
    content: "";
    position: absolute;
    top: -4px;
    left: -4px;
    right: -4px;
    bottom: -4px;
    border-radius: 50%;
    background: linear-gradient(
      120deg,
      rgba(255, 255, 255, 0.6),
      rgba(255, 255, 255, 0.1)
    );
    z-index: -1;
  }

  &:hover .overlay-content {
    opacity: 1;
  }
`;

const ProfileImage = styled.div<{ url: string; isEditable: boolean }>`
  width: 170px;
  height: 170px;
  border-radius: 50%;
  background-image: url(${(props) => props.url});
  background-size: cover;
  background-position: center;
  cursor: ${(props) => (props.isEditable ? "pointer" : "default")};
  position: relative;
  box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.1);
  border: 3px solid white;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);

  &:hover {
    transform: ${(props) => (props.isEditable ? "scale(1.04)" : "none")};
  }

  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0);
    transition: background 0.3s ease;
    display: ${(props) => (props.isEditable ? "block" : "none")};
  }

  &:hover::after {
    background: rgba(0, 0, 0, 0.5);
  }

  @media (max-width: 768px) {
    width: 150px;
    height: 150px;
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
  border-radius: 50%;
  color: white;
  z-index: 2;
  pointer-events: none;

  svg {
    font-size: 32px;
    margin-bottom: 10px;
  }

  span {
    font-size: 14px;
    font-weight: 500;
    text-align: center;
    padding: 0 10px;
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
  // 디버깅을 위한 로깅
  useEffect(() => {
    console.log("ProfileInfoSection에 전달된 followCounts:", followCounts);
  }, [followCounts]);

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
        <EnhancedStatItem onClick={onFollowersClick}>
          <EnhancedStatValue>
            {followCounts?.followerCount || 0}
          </EnhancedStatValue>
          <EnhancedStatLabel>
            <EnhancedStatIcon>
              <FaUsers />
            </EnhancedStatIcon>
            팔로워
          </EnhancedStatLabel>
        </EnhancedStatItem>
        <EnhancedStatItem onClick={onFollowingClick}>
          <EnhancedStatValue>
            {followCounts?.followingCount || 0}
          </EnhancedStatValue>
          <EnhancedStatLabel>
            <EnhancedStatIcon>
              <FaUserFriends />
            </EnhancedStatIcon>
            팔로잉
          </EnhancedStatLabel>
        </EnhancedStatItem>
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
  const [userSeq, setUserSeq] = useState<number | null>(null);
  const [followCounts, setFollowCounts] = useState<FollowCountDTO | null>(null);

  // 초기 데이터 로드 및 상태 초기화
  const initializeData = useCallback(async () => {
    if (!nickname) return;
    setLoading(true);
    try {
      // 통합 API를 사용하여 프로필 데이터 가져오기
      const profileInfo = await getProfileInfoAPI(nickname);

      setProfileImageUrl(getImageUrl(profileInfo.imageUrl) || "");
      setTotalWorkoutCount(profileInfo.workoutCount);
      setIsOwnProfile(profileInfo.isOwner);
      setUserSeq(profileInfo.userSeq);
      setFollowCounts(profileInfo.followCounts);

      console.log("프로필 정보 로드 완료:", profileInfo);
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
    userSeq,
    followCounts,
    setProfileImageUrl,
    setTotalWorkoutCount,
    setFollowCounts,
    loading,
    initializeData,
  };
};

// 운동 데이터 관련 훅
const useWorkoutData = (nickname: string | undefined, activeTab: TabType) => {
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number | null>(null);

  // 총 운동 개수 조회
  useEffect(() => {
    if (!nickname || activeTab !== "workout") return;

    const fetchTotalCount = async () => {
      try {
        const response = await getUserWorkoutTotalCountByNicknameAPI(nickname);
        setTotalCount(response.count);
        console.log("총 운동 기록 수:", response.count);
      } catch (err) {
        console.error("총 운동 기록 수 조회 중 오류:", err);
      }
    };

    fetchTotalCount();
  }, [nickname, activeTab]);

  // fetchData 함수 정의
  const fetchWorkoutsFunction = useCallback(
    async (cursor: string | null) => {
      if (!nickname) {
        return { data: [], nextCursor: null };
      }

      try {
        console.log("🔄 운동 기록 가져오기 시작:", { nickname, cursor });
        const response = await getUserWorkoutOfTheDaysByNicknameAPI(
          nickname,
          12,
          cursor
        );

        // 응답 구조 검증
        if (!response || typeof response !== "object") {
          console.error("서버 응답이 올바르지 않습니다:", response);
          throw new Error("서버 응답이 올바르지 않습니다");
        }

        console.log(`📊 API 응답 (${response.workouts?.length || 0}개 항목):`, {
          workouts: response.workouts,
          cursor: cursor,
          nextCursor: response.nextCursor,
          totalCount: totalCount,
        });

        return {
          data: response.workouts || [],
          nextCursor: response.nextCursor,
        };
      } catch (error) {
        console.error("❌ 운동 기록 로드 실패:", error);
        setError(
          error instanceof Error
            ? error.message
            : "운동 기록을 불러오지 못했습니다"
        );
        throw error;
      }
    },
    [nickname, totalCount]
  );

  // useInfiniteScroll 훅 사용
  const {
    data: workoutOfTheDays,
    loading,
    hasMore,
    observerTarget,
    resetData,
    loadingRef,
    cursor: nextCursor,
  } = useInfiniteScroll<WorkoutOfTheDayDTO, string>({
    fetchData: fetchWorkoutsFunction,
    isItemEqual: (a, b) => a.workoutOfTheDaySeq === b.workoutOfTheDaySeq,
  });

  // 로드된 데이터와 총 데이터를 비교하여 로그
  useEffect(() => {
    if (totalCount !== null && workoutOfTheDays.length > 0) {
      console.log(
        `📊 현재 로드된 데이터: ${workoutOfTheDays.length}/${totalCount} (${(
          (workoutOfTheDays.length / totalCount) *
          100
        ).toFixed(1)}%)`
      );
    }
  }, [workoutOfTheDays.length, totalCount]);

  // 탭 변경 시 데이터 초기화
  useEffect(() => {
    if (activeTab === "workout") {
      console.log("🔄 탭 변경으로 데이터 초기화");
      resetData();
    }
  }, [activeTab, nickname, resetData]);

  return {
    workoutOfTheDays,
    totalWorkoutCount: totalCount,
    setWorkoutOfTheDays: (workouts: WorkoutOfTheDayDTO[]) => {
      // 데이터 설정이 필요한 경우의 핸들러를 선택적으로 구현
    },
    loading,
    hasMore,
    error,
    observerTarget,
  };
};

// 팔로우 데이터 훅 추가
const useFollowData = (
  nickname: string | undefined,
  userInfo: any,
  profileUserSeq: number | null,
  initialFollowCounts: FollowCountDTO | null = null
) => {
  const [followCounts, setFollowCounts] = useState<FollowCountDTO | null>(
    initialFollowCounts
  );
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [isFollowingLoading, setIsFollowingLoading] = useState<boolean>(false);

  // 외부에서 전달된 팔로우 카운트 업데이트
  useEffect(() => {
    if (initialFollowCounts) {
      console.log("initialFollowCounts 업데이트:", initialFollowCounts);
      setFollowCounts(initialFollowCounts);
    }
  }, [initialFollowCounts]);

  useEffect(() => {
    if (!profileUserSeq || !nickname) return;

    // 팔로우 카운트가 없을 때만 조회
    if (!followCounts) {
      const fetchFollowCounts = async () => {
        try {
          // getFollowCountsAPI 대신 getProfileInfoAPI를 사용
          const profileInfo = await getProfileInfoAPI(nickname);
          console.log("getProfileInfoAPI 호출 결과:", profileInfo.followCounts);
          setFollowCounts(profileInfo.followCounts);
        } catch (error) {
          console.error("팔로우 카운트 조회 중 오류 발생:", error);
        }
      };
      fetchFollowCounts();
    }

    // 로그인한 사용자가 이 프로필 사용자를 팔로우하는지 확인
    const checkFollowStatus = async () => {
      if (!userInfo?.userSeq || userInfo.userSeq === profileUserSeq) {
        setIsFollowing(false);
        return;
      }

      setIsFollowingLoading(true);
      try {
        const isFollowing = await checkUserFollowStatusAPI(profileUserSeq);
        setIsFollowing(isFollowing);
      } catch (error) {
        console.error("팔로우 상태 확인 중 오류 발생:", error);
      } finally {
        setIsFollowingLoading(false);
      }
    };

    checkFollowStatus();
  }, [profileUserSeq, userInfo, followCounts, nickname]);

  // 팔로우 카운트만 업데이트하는 함수
  const updateFollowCounts = useCallback(async () => {
    if (!profileUserSeq || !nickname) return;

    try {
      const profileInfo = await getProfileInfoAPI(nickname);
      console.log("updateFollowCounts 호출 결과:", profileInfo.followCounts);
      setFollowCounts(profileInfo.followCounts);
    } catch (error) {
      console.error("팔로우 카운트 업데이트 중 오류 발생:", error);
    }
  }, [profileUserSeq, nickname]);

  // 디버깅을 위해 값을 로깅
  useEffect(() => {
    console.log("현재 followCounts 상태:", followCounts);
  }, [followCounts]);

  return {
    followCounts,
    isFollowing,
    isFollowingLoading,
    setFollowCounts,
    setIsFollowing,
    updateFollowCounts,
  };
};

// 팔로우 액션 훅 추가
const useFollowActions = (
  userInfo: any,
  profileUserSeq: number | null,
  followData: ReturnType<typeof useFollowData>
) => {
  const { setIsFollowing, updateFollowCounts } = followData;

  const toggleFollow = async () => {
    if (!userInfo?.userSeq || !profileUserSeq) return;

    try {
      if (followData.isFollowing) {
        await unfollowUserAPI(profileUserSeq);
        setIsFollowing(false);
      } else {
        await followUserAPI(profileUserSeq);
        setIsFollowing(true);
      }

      // 전체 프로필 데이터 대신 팔로우 카운트만 업데이트
      await updateFollowCounts();
    } catch (error) {
      console.error("팔로우/언팔로우 중 오류 발생:", error);
    }
  };

  return {
    toggleFollow,
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
  const location = useLocation();

  // 모달 관련 상태
  const [selectedWorkoutSeq, setSelectedWorkoutSeq] = useState<number | null>(
    null
  );
  const [selectedCommentId, setSelectedCommentId] = useState<number | null>(
    null
  );
  const [followModalType, setFollowModalType] = useState<
    "followers" | "following" | null
  >(null);

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
  }, [location, navigate]);

  // 커스텀 훅 사용
  const {
    isOwnProfile,
    totalWorkoutCount,
    profileImageUrl,
    userSeq,
    followCounts,
    setProfileImageUrl,
    setTotalWorkoutCount,
    setFollowCounts,
    loading: profileLoading,
    initializeData,
  } = useProfileData(nickname, userInfo);

  const {
    workoutOfTheDays,
    totalWorkoutCount: workoutTotalCount,
    loading: workoutLoading,
    error,
    observerTarget,
  } = useWorkoutData(nickname, activeTab);

  const followData = useFollowData(nickname, userInfo, userSeq, followCounts);

  const { toggleFollow } = useFollowActions(userInfo, userSeq, followData);

  // 이벤트 핸들러
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  const handleWorkoutCardClick = useCallback((seq: number) => {
    setSelectedWorkoutSeq(seq);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedWorkoutSeq(null);
    setSelectedCommentId(null);
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
      await updateProfileImageAPI(formData);

      // 통합 API를 사용하여 최신 프로필 정보 로드
      initializeData();
    } catch (error) {
      console.error("프로필 이미지 업로드 에러:", error);
      alert("프로필 이미지 업로드에 실패했습니다.");
    }
  };

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

  // 디버깅을 위한 로깅
  useEffect(() => {
    console.log("렌더링 시 followData.followCounts:", followData.followCounts);
    console.log("렌더링 시 followCounts:", followCounts);
  }, [followData.followCounts, followCounts]);

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
          followCounts={followData.followCounts || followCounts}
          isFollowing={followData.isFollowing}
          isFollowingLoading={followData.isFollowingLoading}
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
        <MemoList memos={[]} />
      )}

      {selectedWorkoutSeq && (
        <WorkoutDetailModal
          workoutOfTheDaySeq={selectedWorkoutSeq}
          commentId={selectedCommentId || undefined}
          onClose={handleCloseModal}
        />
      )}

      {followModalType && (
        <FollowModal
          type={followModalType}
          userSeq={userSeq || 0}
          onClose={closeFollowModal}
          currentUserSeq={userInfo?.userSeq}
          onFollowStatusChange={followData.updateFollowCounts}
        />
      )}
    </Container>
  );
};

export default ProfilePage;

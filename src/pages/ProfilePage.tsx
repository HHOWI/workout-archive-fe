import React, { useState, useRef, useEffect } from "react";
import styled from "@emotion/styled";
import { useDispatch, useSelector } from "react-redux";
import { updateProfileImage } from "../api/user";
import { updateProfileImg } from "../store/slices/authSlice";
import {
  getUserWorkoutRecords,
  getWorkoutRecordDetails,
  getUserWorkoutTotalCount,
} from "../api/workout";
import { WorkoutDetail, WorkoutRecord } from "../dtos/WorkoutDTO";
import WorkoutDetailModal from "../components/WorkoutDetailModal";
import WorkoutCard from "../components/WorkoutCard";
import { getImageUrl } from "../utils/imageUtils";

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

const ProfileImage = styled.div<{ url: string }>`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background-image: url(${(props) => props.url});
  background-size: cover;
  background-position: center;
  cursor: pointer;
  position: relative;

  &:hover::after {
    content: "수정하기";
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

const ProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"workout" | "memo">("workout");
  const userInfo = useSelector((state: any) => state.auth.userInfo);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profileImage, setProfileImage] = useState<string>(
    getImageUrl(userInfo?.userProfileImg) || ""
  );
  const dispatch = useDispatch();

  // 운동 기록 관련 상태
  const [workoutRecords, setWorkoutRecords] = useState<WorkoutRecord[]>([]);
  const [totalWorkoutCount, setTotalWorkoutCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutRecord | null>(
    null
  );
  const [showModal, setShowModal] = useState(false);
  // 무한 스크롤을 위한 상태 추가
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef<HTMLDivElement>(null);

  // 총 운동 기록 수 가져오기
  const fetchTotalWorkoutCount = async () => {
    const count = await getUserWorkoutTotalCount(userInfo.userSeq);
    setTotalWorkoutCount(count);
  };

  useEffect(() => {
    fetchTotalWorkoutCount();
  }, []);

  // 운동 기록 불러오기
  useEffect(() => {
    const fetchWorkoutRecords = async () => {
      if (activeTab === "workout" && hasMore && !loading) {
        setLoading(true);
        try {
          const response = await getUserWorkoutRecords(page, 12); // 한 번에 12개씩 로드
          // 백엔드 응답 구조에 따라 적절히 데이터 처리
          const records = Array.isArray(response)
            ? response
            : response.workouts || [];
          console.log(response);
          if (records.length === 0) {
            setHasMore(false);
          } else {
            // 중복 데이터 필터링하여 추가
            setWorkoutRecords((prev) => {
              // 기존 데이터의 ID 목록
              const existingIds = new Set(
                prev.map((item) => item.workoutOfTheDaySeq)
              );

              // 중복되지 않은 새 데이터만 필터링
              const newRecords = records.filter(
                (record: WorkoutRecord) =>
                  !existingIds.has(record.workoutOfTheDaySeq)
              );

              // 기존 데이터와 중복 제거된 새 데이터 합치기
              return [...prev, ...newRecords];
            });
          }
        } catch (error) {
          setHasMore(false);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchWorkoutRecords();
  }, [activeTab, page, hasMore]);

  // 탭이 변경될 때 상태 초기화
  useEffect(() => {
    setWorkoutRecords([]);
    setPage(1);
    setHasMore(true);
  }, [activeTab]);

  // Intersection Observer 설정
  useEffect(() => {
    const options = {
      root: null,
      rootMargin: "20px",
      threshold: 0.1,
    };

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !loading && hasMore) {
        setPage((prev) => prev + 1);
      }
    }, options);

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [loading, hasMore]);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  useEffect(() => {
    if (userInfo?.userProfileImg) {
      setProfileImage(getImageUrl(userInfo.userProfileImg) || "");
    }
  }, [userInfo]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 크기 체크 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("파일 크기는 5MB 이하여야 합니다.");
      return;
    }

    // 이미지 파일 타입 체크
    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 업로드 가능합니다.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await updateProfileImage(formData);
      const imageUrl = response.data.imageUrl;
      dispatch(updateProfileImg(imageUrl));
    } catch (error) {
      console.error("프로필 이미지 업로드 에러:", error);
      alert("프로필 이미지 업로드에 실패했습니다.");
    }
  };

  // 운동 카드 클릭 핸들러
  const handleWorkoutClick = async (workout: WorkoutRecord) => {
    try {
      // 필요한 경우 더 자세한 정보 가져오기
      const detailedWorkout = await getWorkoutRecordDetails(
        workout.workoutOfTheDaySeq
      );

      // 운동 세부 정보가 있을 경우 workoutDetailSeq 기준으로 정렬
      if (detailedWorkout && detailedWorkout.workoutDetails) {
        // workoutDetailSeq 필드로 정렬 (생성 순서)
        detailedWorkout.workoutDetails.sort(
          (a: WorkoutDetail, b: WorkoutDetail) =>
            (a.workoutDetailSeq || 0) - (b.workoutDetailSeq || 0)
        );
      }

      setSelectedWorkout(detailedWorkout || workout);
      setShowModal(true);
    } catch (error) {
      console.error("운동 상세 정보 가져오기 실패:", error);

      // 에러 발생 시 기존 데이터라도 보여주되, 정렬 시도
      if (workout && workout.workoutDetails) {
        // workoutDetailSeq 필드가 없을 수 있으므로 배열 순서 유지
        const sortedWorkout = { ...workout };
        setSelectedWorkout(sortedWorkout);
      } else {
        setSelectedWorkout(workout);
      }

      setShowModal(true);
    }
  };

  // 모달 닫기 핸들러
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedWorkout(null);
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
        <ProfileImage url={profileImage} onClick={handleImageClick} />
        <HiddenInput
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageChange}
        />
        <ProfileInfo>
          <Username>{userInfo?.userNickname || "사용자"}</Username>
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
            내 운동 기록
          </Tab>
          <Tab
            isActive={activeTab === "memo"}
            onClick={() => setActiveTab("memo")}
          >
            내 운동 메모
          </Tab>
        </TabList>

        {activeTab === "workout" ? (
          workoutRecords.length === 0 && !loading ? (
            <NoDataMessage>운동 기록이 없습니다.</NoDataMessage>
          ) : (
            <>
              <WorkoutGrid>
                {workoutRecords.map((workout) => (
                  <WorkoutCard
                    key={workout.workoutOfTheDaySeq}
                    workout={workout}
                    onClick={handleWorkoutClick}
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

      {/* 운동 상세 모달 - 외부 컴포넌트로 교체 */}
      {showModal && selectedWorkout && (
        <WorkoutDetailModal
          workout={selectedWorkout}
          onClose={handleCloseModal}
        />
      )}
    </Container>
  );
};

export default ProfilePage;

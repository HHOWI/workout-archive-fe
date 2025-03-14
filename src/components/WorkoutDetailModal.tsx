import React, { useState, useEffect } from "react";
import styled from "@emotion/styled";
import { WorkoutDetailDTO, WorkoutOfTheDayDTO } from "../dtos/WorkoutDTO";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { getWorkoutRecordDetailsAPI } from "../api/workout";
import { getImageUrl } from "../utils/imageUtils";

// 스타일 컴포넌트 정의
const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);

  @media (max-width: 768px) {
    width: 95%;
  }
`;

const ModalCloseButton = styled.button`
  position: absolute;
  right: 20px;
  top: 20px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #333;
`;

const ModalBody = styled.div`
  padding: 30px;
`;

const ModalHeader = styled.div`
  display: flex;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const ModalImage = styled.div<{ url?: string }>`
  width: 50%;
  aspect-ratio: 1/1;
  background-image: url(${(props) => props.url || ""});
  background-size: cover;
  background-position: center;
  background-color: #f0f0f0;
  border-radius: 8px;
  margin-right: 20px;

  @media (max-width: 768px) {
    width: 100%;
    margin-right: 0;
    margin-bottom: 20px;
  }
`;

const ModalInfo = styled.div`
  flex: 1;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const ModalTitle = styled.h3`
  font-size: 24px;
  margin: 0 0 10px;
`;

const ModalDate = styled.div`
  color: #8e8e8e;
  margin-bottom: 20px;
`;

const ModalExercises = styled.div`
  margin-top: 20px;
`;

const ExerciseItem = styled.div`
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #eee;

  &:last-child {
    border-bottom: none;
  }
`;

const ExerciseTitle = styled.div`
  font-weight: bold;
  margin-bottom: 5px;
`;

const ExerciseSets = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const SetItem = styled.div`
  background-color: #f9f9f9;
  border-radius: 4px;
  padding: 6px 10px;
  font-size: 14px;
`;

const WorkoutLocation = styled.div`
  margin-top: 10px;
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #666;
`;

const LocationIcon = styled.span`
  margin-right: 5px;
`;

const WorkoutDiary = styled.div`
  margin-top: 20px;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 8px;
  font-style: italic;
`;

const LoadingContainer = styled.div`
  padding: 50px;
  text-align: center;
  color: #666;
`;

// 운동 시간 포맷팅 함수
const formatTime = (seconds?: number): string => {
  if (!seconds) return "0초";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  let result = "";
  if (hours > 0) result += `${hours}시간 `;
  if (minutes > 0) result += `${minutes}분 `;
  if (remainingSeconds > 0) result += `${remainingSeconds}초`;

  return result.trim();
};

// 운동 그룹화 함수 - 같은 운동을 순서에 맞게 그룹화
const groupExerciseDetails = (
  details: WorkoutDetailDTO[]
): {
  exercise: string;
  type: string;
  sets: Array<{
    weight?: number;
    reps?: number;
    distance?: number;
    recordTime?: number;
  }>;
}[] => {
  const result: {
    exercise: string;
    type: string;
    sets: Array<{
      weight?: number;
      reps?: number;
      distance?: number;
      recordTime?: number;
    }>;
    originalIndex: number;
  }[] = [];

  // 현재 운동 이름
  let currentExercise = "";
  let currentExerciseType = "";
  let currentGroup: any = null;

  details.forEach((detail, index) => {
    const exerciseName = detail.exercise.exerciseName;
    const exerciseType = detail.exercise.exerciseType;

    // 새로운 운동이거나 다른 운동 후 같은 운동이 다시 나올 경우
    if (
      exerciseName !== currentExercise ||
      (result.length > 0 && result[result.length - 1].exercise !== exerciseName)
    ) {
      // 새 그룹 생성
      currentGroup = {
        exercise: exerciseName,
        type: exerciseType,
        sets: [],
        originalIndex: index,
      };
      result.push(currentGroup);
      currentExercise = exerciseName;
      currentExerciseType = exerciseType;
    }

    // 현재 그룹에 세트 추가
    currentGroup.sets.push({
      weight: detail.weight,
      reps: detail.reps,
      distance: detail.distance,
      recordTime: detail.recordTime,
    });
  });

  // 원래 순서대로 정렬
  return result.sort((a, b) => a.originalIndex - b.originalIndex);
};

// Props 타입 정의
interface WorkoutDetailModalProps {
  workoutOfTheDaySeq: number;
  onClose: () => void;
}

// 운동 상세 모달 컴포넌트
const WorkoutDetailModal: React.FC<WorkoutDetailModalProps> = ({
  workoutOfTheDaySeq,
  onClose,
}) => {
  const [workout, setWorkout] = useState<WorkoutOfTheDayDTO | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 운동 상세 정보 가져오기
  useEffect(() => {
    const fetchWorkoutDetail = async () => {
      setLoading(true);
      try {
        const response = await getWorkoutRecordDetailsAPI(workoutOfTheDaySeq);
        setWorkout(response);
      } catch (err) {
        console.error("운동 상세 정보를 가져오는 중 오류가 발생했습니다:", err);
        setError("운동 상세 정보를 불러올 수 없습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchWorkoutDetail();
  }, [workoutOfTheDaySeq]);

  // 로딩 중 표시
  if (loading) {
    return (
      <Modal onClick={onClose}>
        <ModalContent onClick={(e) => e.stopPropagation()}>
          <ModalCloseButton onClick={onClose}>×</ModalCloseButton>
          <LoadingContainer>데이터를 불러오는 중...</LoadingContainer>
        </ModalContent>
      </Modal>
    );
  }

  const isValidDate = (date: any) => date && !isNaN(new Date(date).getTime());
  return (
    <Modal onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalCloseButton onClick={onClose}>×</ModalCloseButton>
        <ModalBody>
          <ModalHeader>
            <ModalImage url={getImageUrl(workout?.workoutPhoto || null)} />
            <ModalInfo>
              <ModalTitle>{workout?.user?.userNickname}</ModalTitle>
              <ModalDate>
                {isValidDate(workout?.recordDate)
                  ? format(
                      new Date(workout?.recordDate || ""),
                      "yyyy년 MM월 dd일 EEEE",
                      {
                        locale: ko,
                      }
                    )
                  : "날짜 정보 없음"}
              </ModalDate>

              <WorkoutLocation>
                <LocationIcon>📍</LocationIcon>
                {workout?.workoutPlace?.placeName}
              </WorkoutLocation>

              {workout?.workoutDiary && (
                <WorkoutDiary>{workout?.workoutDiary}</WorkoutDiary>
              )}
            </ModalInfo>
          </ModalHeader>

          <ModalExercises>
            {workout?.workoutDetails && workout?.workoutDetails.length > 0 ? (
              groupExerciseDetails(workout?.workoutDetails).map(
                (group, groupIndex) => (
                  <ExerciseItem key={groupIndex}>
                    <ExerciseTitle>
                      {group.exercise} ({group.type})
                    </ExerciseTitle>
                    <ExerciseSets>
                      {group.type === "유산소" ? (
                        <>
                          {group.sets.map((set, setIndex) => (
                            <SetItem key={setIndex}>
                              {set.distance && (
                                <span>
                                  {set.distance}m
                                  {set.distance >= 1000 &&
                                    ` (${(set.distance / 1000).toFixed(2)}km)`}
                                </span>
                              )}
                              {set.recordTime && (
                                <span>{formatTime(set.recordTime)}</span>
                              )}
                            </SetItem>
                          ))}
                        </>
                      ) : (
                        <>
                          {group.sets.map((set, setIndex) => (
                            <SetItem key={setIndex}>
                              {set.weight && set.reps && (
                                <span>
                                  {set.weight}kg × {set.reps}회
                                </span>
                              )}
                            </SetItem>
                          ))}
                        </>
                      )}
                    </ExerciseSets>
                  </ExerciseItem>
                )
              )
            ) : (
              <p>운동 세부 정보가 없습니다.</p>
            )}
          </ModalExercises>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default WorkoutDetailModal;

import React, { useState, useEffect, useMemo } from "react";
import styled from "@emotion/styled";
import { WorkoutDetailDTO, WorkoutOfTheDayDTO } from "../dtos/WorkoutDTO";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import {
  getWorkoutRecordDetailsAPI,
  deleteWorkoutRecordAPI,
  updateWorkoutRecordAPI,
} from "../api/workout";
import { getImageUrl } from "../utils/imageUtils";
import { useSelector } from "react-redux";
import ActionMenu from "./common/ActionMenu";

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

const ModalHeader = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  position: absolute;
  right: 20px;
  top: 20px;
  z-index: 10;
  background-color: transparent;
`;

const ModalBody = styled.div`
  padding: 30px;
`;

const ModalHeaderContent = styled.div`
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

const WorkoutLocation = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  color: #555;
`;

const LocationIcon = styled.span`
  margin-right: 5px;
`;

const WorkoutDiary = styled.div`
  margin-top: 15px;
  line-height: 1.6;
  white-space: pre-wrap;
  color: #333;
`;

const ExerciseList = styled.div`
  margin-top: 30px;
`;

const ExerciseItem = styled.div`
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
  &:last-child {
    border-bottom: none;
  }
`;

const ExerciseTitle = styled.h4`
  font-size: 18px;
  margin: 0 0 10px;
  color: #333;
`;

const ExerciseSets = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const SetItem = styled.div`
  background-color: #f8f8f8;
  padding: 8px 15px;
  border-radius: 4px;
  font-size: 14px;
  color: #333;
`;

const LoadingContainer = styled.div`
  padding: 40px;
  text-align: center;
  color: #666;
`;

// 공통 모달 스타일
const ActionModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
`;

const ActionModalContent = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  width: 90%;
  max-width: 400px;
  text-align: center;
`;

const ActionModalTitle = styled.h3`
  margin-bottom: 20px;
`;

const ActionModalButtons = styled.div`
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 20px;
`;

const CancelButton = styled.button`
  background-color: #e0e0e0;
  color: #333;
  border: none;
  border-radius: 4px;
  padding: 8px 15px;
  cursor: pointer;
  font-weight: 500;

  &:hover {
    background-color: #d0d0d0;
  }
`;

const DeleteButton = styled.button`
  background-color: #ff3b30;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 15px;
  cursor: pointer;
  font-weight: 500;

  &:hover {
    background-color: #e0352b;
  }
`;

const ConfirmButton = styled.button`
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 15px;
  cursor: pointer;
  font-weight: 500;

  &:hover {
    background-color: #357ac5;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 150px;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 10px;
  resize: vertical;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.6;

  &:focus {
    outline: none;
    border-color: #4a90e2;
  }
`;

// 날짜 포맷 함수
const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "날짜 정보 없음";
    }
    return format(date, "yyyy년 MM월 dd일 EEEE", { locale: ko });
  } catch (error) {
    return "날짜 정보 없음";
  }
};

// 초를 분:초 형식으로 변환하는 함수
const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? "0" + secs : secs}`;
};

// 운동 세부 정보를 운동 종류별로 그룹화하는 함수
const groupExerciseDetails = (
  details: WorkoutDetailDTO[]
): {
  exercise: string;
  type: string;
  sets: {
    weight: number | null;
    reps: number | null;
    distance: number | null;
    recordTime: number | null;
  }[];
}[] => {
  const exerciseGroups = details.reduce((acc, detail) => {
    const key = `${detail.exercise.exerciseName}`;
    if (!acc[key]) {
      acc[key] = {
        exercise: detail.exercise.exerciseName,
        type: detail.exercise.exerciseType,
        sets: [],
      };
    }
    acc[key].sets.push({
      weight: detail.weight,
      reps: detail.reps,
      distance: detail.distance,
      recordTime: detail.recordTime,
    });
    return acc;
  }, {} as Record<string, { exercise: string; type: string; sets: any[] }>);

  return Object.values(exerciseGroups);
};

// Props 타입 정의
interface WorkoutDetailModalProps {
  workoutOfTheDaySeq: number;
  onClose: () => void;
  onDelete?: () => void;
}

// 운동 상세 모달 컴포넌트
const WorkoutDetailModal: React.FC<WorkoutDetailModalProps> = ({
  workoutOfTheDaySeq,
  onClose,
  onDelete,
}) => {
  const userInfo = useSelector((state: any) => state.auth.userInfo);
  const [workout, setWorkout] = useState<WorkoutOfTheDayDTO | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [editDiary, setEditDiary] = useState<string>("");

  // 운동 상세 정보 가져오기
  useEffect(() => {
    const fetchWorkoutDetail = async () => {
      setLoading(true);
      try {
        const response = await getWorkoutRecordDetailsAPI(workoutOfTheDaySeq);
        console.log("운동 상세 정보:", response);
        setWorkout(response);
        setEditDiary(response.workoutDiary || "");
      } catch (err) {
        console.error("운동 상세 정보를 가져오는 중 오류가 발생했습니다:", err);
        setError("운동 상세 정보를 불러올 수 없습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchWorkoutDetail();
  }, [workoutOfTheDaySeq]);

  // 이 게시물의 소유자인지 확인
  const isOwner = useMemo(() => {
    if (!userInfo || !workout || !workout.user) return false;

    // 닉네임을 기준으로 소유권 확인 - 보안상 userSeq는 사용하지 않음
    return workout.user.userNickname === userInfo.userNickname;
  }, [userInfo, workout]);

  // 삭제 핸들러
  const handleDelete = async () => {
    if (!workout) return;

    setIsProcessing(true);
    try {
      await deleteWorkoutRecordAPI(workout.workoutOfTheDaySeq);
      setShowDeleteConfirm(false);
      onClose();
      if (onDelete) {
        onDelete();
      }
    } catch (error) {
      console.error("운동 기록 삭제 중 오류 발생:", error);
      alert("운동 기록 삭제에 실패했습니다.");
    } finally {
      setIsProcessing(false);
    }
  };

  // 수정 핸들러
  const handleEdit = async () => {
    if (!workout) return;

    setIsProcessing(true);
    try {
      const response = await updateWorkoutRecordAPI(
        workout.workoutOfTheDaySeq,
        { workoutDiary: editDiary }
      );

      // 성공적으로 수정되면 데이터 업데이트
      if (response && response.workout) {
        setWorkout({
          ...workout,
          workoutDiary: editDiary,
        });
      }

      setShowEditModal(false);
    } catch (error) {
      console.error("운동 기록 수정 중 오류 발생:", error);
      alert("운동 기록 수정에 실패했습니다.");
    } finally {
      setIsProcessing(false);
    }
  };

  // 액션 메뉴 아이템
  const actionMenuItems = useMemo(() => {
    if (!isOwner) return [];

    return [
      {
        label: "수정",
        onClick: () => {
          setEditDiary(workout?.workoutDiary || "");
          setShowEditModal(true);
        },
        color: "#4a90e2",
      },
      {
        label: "삭제",
        onClick: () => setShowDeleteConfirm(true),
        color: "#ff3b30",
      },
    ];
  }, [isOwner, workout]);

  // 로딩 중 표시
  if (loading) {
    return (
      <Modal onClick={onClose}>
        <ModalContent onClick={(e) => e.stopPropagation()}>
          <LoadingContainer>데이터를 불러오는 중...</LoadingContainer>
        </ModalContent>
      </Modal>
    );
  }

  const isValidDate = (date: any) => date && !isNaN(new Date(date).getTime());

  return (
    <Modal onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          {isOwner && <ActionMenu items={actionMenuItems} />}
        </ModalHeader>

        <ModalBody>
          <ModalHeaderContent>
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
          </ModalHeaderContent>

          <ExerciseList>
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
          </ExerciseList>
        </ModalBody>
      </ModalContent>

      {/* 삭제 확인 모달 */}
      {showDeleteConfirm && (
        <ActionModal onClick={(e) => e.stopPropagation()}>
          <ActionModalContent>
            <ActionModalTitle>
              이 운동 기록을 정말 삭제하시겠습니까?
            </ActionModalTitle>
            <p>삭제된 운동 기록은 복구할 수 없습니다.</p>
            <ActionModalButtons>
              <CancelButton
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isProcessing}
              >
                취소
              </CancelButton>
              <DeleteButton onClick={handleDelete} disabled={isProcessing}>
                {isProcessing ? "삭제 중..." : "삭제"}
              </DeleteButton>
            </ActionModalButtons>
          </ActionModalContent>
        </ActionModal>
      )}

      {/* 수정 모달 */}
      {showEditModal && (
        <ActionModal onClick={(e) => e.stopPropagation()}>
          <ActionModalContent>
            <ActionModalTitle>운동 일지 수정</ActionModalTitle>
            <TextArea
              value={editDiary}
              onChange={(e) => setEditDiary(e.target.value)}
              placeholder="운동 일지를 작성해주세요."
            />
            <ActionModalButtons>
              <CancelButton
                onClick={() => setShowEditModal(false)}
                disabled={isProcessing}
              >
                취소
              </CancelButton>
              <ConfirmButton onClick={handleEdit} disabled={isProcessing}>
                {isProcessing ? "저장 중..." : "저장"}
              </ConfirmButton>
            </ActionModalButtons>
          </ActionModalContent>
        </ActionModal>
      )}
    </Modal>
  );
};

export default WorkoutDetailModal;

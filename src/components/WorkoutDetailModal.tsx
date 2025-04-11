import React, { useState, useEffect, useMemo, useRef } from "react";
import styled from "@emotion/styled";
import { WorkoutDetailDTO, WorkoutOfTheDayDTO } from "../dtos/WorkoutDTO";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import {
  getWorkoutRecordDetailsAPI,
  deleteWorkoutRecordAPI,
  updateWorkoutRecordAPI,
  toggleWorkoutLikeAPI,
} from "../api/workout";
import { getImageUrl } from "../utils/imageUtils";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import ActionMenu from "./common/ActionMenu";
import {
  Avatar,
  TextField,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  Typography,
  Collapse,
  Paper,
  Box,
} from "@mui/material";
import {
  KeyboardArrowDown,
  KeyboardArrowUp,
  FavoriteBorder,
  Favorite,
  LocationOn,
  CalendarToday,
} from "@mui/icons-material";
import CommentSection from "./workout/CommentSection";
import ExerciseList from "./workout/ExerciseList";

// =============== 스타일 컴포넌트 ===============

// 모달 기본 스타일
const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.75);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  padding: 20px;
  backdrop-filter: blur(5px);
`;

const ActionModal = styled(Modal)`
  z-index: 10000;
  background-color: rgba(0, 0, 0, 0.6);
  animation: fadeIn 0.2s ease;
`;

// 스크롤 관련 스타일
const ScrollableContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  max-height: 90vh;
  border-radius: 20px;
  overflow: hidden;
`;

const ScrollableContent = styled.div`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;
  scrollbar-color: #d0d0d0 #f5f5f5;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #f5f5f5;
    margin: 10px 0;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #d0d0d0;
    border-radius: 10px;
    border: 2px solid #f5f5f5;
  }
`;

// 모달 컨텐츠 스타일
const ModalContent = styled(Paper)`
  width: 90%;
  max-width: 850px;
  position: relative;
  border-radius: 20px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25);
  animation: fadeIn 0.3s ease;
  overflow: hidden;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: 768px) {
    width: 95%;
  }
`;

const ActionModalContent = styled(Paper)`
  padding: 32px;
  width: 90%;
  max-width: 450px;
  text-align: center;
  border-radius: 20px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
  animation: modalIn 0.3s ease;

  @keyframes modalIn {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
`;

// 레이아웃 컴포넌트
const ActionMenuContainer = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 20;
`;

const ModalBody = styled.div`
  padding: 36px;
  padding-right: 40px;

  @media (max-width: 768px) {
    padding: 24px 16px;
    padding-right: 24px;
  }
`;

const ModalHeaderContent = styled.div`
  display: flex;
  margin-bottom: 20px;
  gap: 32px;
  position: relative;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 24px;
    margin-bottom: 24px;
  }
`;

// 이미지 관련 스타일
const ModalImageContainer = styled.div`
  width: 50%;
  aspect-ratio: 1/1;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
  position: relative;
  background-color: #222;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const ModalImage = styled.div<{ url?: string }>`
  width: 100%;
  height: 100%;
  background-image: url(${(props) => props.url || ""});
  background-size: cover;
  background-position: center;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.03);
  }
`;

// 정보 영역 스타일
const ModalInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const HeaderDivider = styled(Divider)`
  margin: 16px 0;
  background-color: rgba(0, 0, 0, 0.08);
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  gap: 10px;
  color: #555;
  font-size: 15px;
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 24px;
  margin-bottom: 16px;
`;

const ClickableInfoItem = styled(InfoItem)`
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: #4a90e2;
  }
`;

const InfoIcon = styled.span`
  display: flex;
  align-items: center;
  color: #4a90e2;
`;

const WorkoutDiary = styled(Typography)`
  margin-top: 10px;
  margin-bottom: 10px;
  line-height: 1.5;
  white-space: pre-wrap;
  color: #262626;
  font-size: 14px;
  font-weight: 400;
  letter-spacing: 0.1px;
`;

// 타이틀 스타일
const SectionTitle = styled(Typography)`
  font-size: 20px;
  font-weight: 600;
  margin: 28px 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #333;
  padding-bottom: 8px;
  border-bottom: 2px solid #f0f0f0;

  &:first-of-type {
    margin-top: 0;
  }
`;

const ActionModalTitle = styled(Typography)`
  margin-bottom: 16px;
  font-weight: 600;
  font-size: 20px;
  color: #333;
`;

// 로딩 표시
const LoadingContainer = styled.div`
  padding: 60px 40px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
`;

// 버튼 스타일
const ActionModalButtons = styled.div`
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 28px;
`;

const TextArea = styled(TextField)`
  .MuiInputBase-root {
    border-radius: 12px;
    background-color: #f9f9f9;
  }
`;

// 좋아요 버튼 스타일
const LikeContainer = styled.div`
  position: absolute;
  right: 0;
  bottom: -10px;
  display: flex;
  align-items: center;
  gap: 12px;

  @media (max-width: 768px) {
    position: relative;
    bottom: 0;
    justify-content: flex-end;
    margin-top: 10px;
  }
`;

const LikeButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px 14px;
  border-radius: 20px;
  transition: all 0.2s;
  font-weight: 500;
  color: #333;
  font-size: 14px;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }

  &.active {
    color: #e53935;
  }
`;

// 사용자 정보 스타일
const UserInfoContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  cursor: pointer;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }
`;

const UserAvatar = styled(Avatar)`
  width: 42px;
  height: 42px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

// =============== 유틸리티 함수 ===============

// 운동 세부 정보 그룹화
const groupExerciseDetails = (details: WorkoutDetailDTO[]) => {
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

const isValidDate = (date: any) => date && !isNaN(new Date(date).getTime());

// =============== Props 타입 ===============
interface WorkoutDetailModalProps {
  workoutOfTheDaySeq: number;
  onClose: () => void;
  onDelete?: () => void;
  commentId?: number;
  isReplyNotification?: boolean;
  parentCommentId?: number;
  replyCommentId?: number;
}

// =============== 메인 컴포넌트 ===============
const WorkoutDetailModal: React.FC<WorkoutDetailModalProps> = ({
  workoutOfTheDaySeq,
  onClose,
  onDelete,
  commentId,
  isReplyNotification,
  parentCommentId,
  replyCommentId,
}) => {
  // 상태 관리
  const userInfo = useSelector((state: any) => state.auth.userInfo);
  const navigate = useNavigate();
  const [workout, setWorkout] = useState<WorkoutOfTheDayDTO | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [editDiary, setEditDiary] = useState<string>("");
  const [exercisesExpanded, setExercisesExpanded] = useState(true);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [likeCount, setLikeCount] = useState<number>(0);
  const [likesLoading, setLikesLoading] = useState<boolean>(false);
  const commentSectionRef = useRef<HTMLDivElement>(null);

  // 운동 상세 정보 가져오기
  useEffect(() => {
    const fetchWorkoutDetail = async () => {
      setLoading(true);
      try {
        const response = await getWorkoutRecordDetailsAPI(workoutOfTheDaySeq);
        setWorkout(response);
        setEditDiary(response.workoutDiary || "");

        // 좋아요 정보 설정
        setIsLiked(response.isLiked || false);
        setLikeCount(response.workoutLikeCount);
      } catch (err) {
        console.error("운동 상세 정보를 가져오는 중 오류가 발생했습니다:", err);
        setError("운동 상세 정보를 불러올 수 없습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchWorkoutDetail();
  }, [workoutOfTheDaySeq]);

  // 댓글 섹션으로 스크롤 (commentId가 있는 경우)
  useEffect(() => {
    if (commentId && commentSectionRef.current) {
      // 워크아웃 정보 로드 후 약간의 지연시간을 두고 스크롤
      const timer = setTimeout(() => {
        commentSectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [commentId, workout]);

  // 소유자 확인
  const isOwner = useMemo(() => {
    if (!userInfo || !workout || !workout.user) return false;
    return workout.user.userNickname === userInfo.userNickname;
  }, [userInfo, workout]);

  // 핸들러 함수
  const handleUserProfileClick = () => {
    if (workout?.user?.userNickname) {
      onClose();
      navigate(`/profile/${workout.user.userNickname}`);
    }
  };

  const handlePlaceClick = () => {
    if (workout?.workoutPlace) {
      const placeId =
        (workout.workoutPlace as any).workoutPlaceSeq ||
        (workout.workoutPlace as any).placeSeq;

      if (placeId) {
        onClose();
        navigate(`/workoutplace/${placeId}`);
      }
    }
  };

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

  const handleEdit = async () => {
    if (!workout) return;

    setIsProcessing(true);
    try {
      const response = await updateWorkoutRecordAPI(
        workout.workoutOfTheDaySeq,
        { workoutDiary: editDiary }
      );

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

  const handleToggleLike = async () => {
    if (!userInfo || !workout) return;

    try {
      setLikesLoading(true);
      const response = await toggleWorkoutLikeAPI(workoutOfTheDaySeq);
      setIsLiked(response.isLiked);
      setLikeCount(response.likeCount);
    } catch (error) {
      console.error("좋아요 처리 중 오류가 발생했습니다:", error);
    } finally {
      setLikesLoading(false);
    }
  };

  // ActionMenu 항목 정의
  const actionMenuItems = useMemo(() => {
    const baseItems = [{ label: "닫기", onClick: onClose }];

    if (isOwner) {
      return [
        {
          label: "수정하기",
          onClick: () => {
            setEditDiary(workout?.workoutDiary || "");
            setShowEditModal(true);
          },
        },
        {
          label: "삭제하기",
          onClick: () => setShowDeleteConfirm(true),
          color: "#e53935",
        },
        ...baseItems,
      ];
    }

    return baseItems;
  }, [isOwner, onClose, workout?.workoutDiary]);

  // 로딩 중 표시
  if (loading) {
    return (
      <Modal onClick={onClose}>
        <ModalContent onClick={(e) => e.stopPropagation()}>
          <LoadingContainer>
            <CircularProgress size={48} color="primary" />
            <Typography variant="h6" color="textSecondary">
              운동 정보를 불러오는 중...
            </Typography>
          </LoadingContainer>
        </ModalContent>
      </Modal>
    );
  }

  // 운동 세부 정보
  const exerciseGroups = workout?.workoutDetails
    ? groupExerciseDetails(workout.workoutDetails)
    : [];

  return (
    <Modal onClick={onClose}>
      <ModalContent elevation={6} onClick={(e) => e.stopPropagation()}>
        <ActionMenuContainer>
          <ActionMenu items={actionMenuItems} />
        </ActionMenuContainer>

        <ScrollableContainer>
          <ScrollableContent>
            <ModalBody>
              <ModalHeaderContent>
                {workout?.workoutPhoto && (
                  <ModalImageContainer>
                    <ModalImage
                      url={getImageUrl(workout.workoutPhoto, "workout")}
                    />
                  </ModalImageContainer>
                )}

                <ModalInfo>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <UserInfoContainer onClick={handleUserProfileClick}>
                      <UserAvatar
                        src={getImageUrl(
                          workout?.user?.profileImageUrl || null,
                          "profile"
                        )}
                        alt={workout?.user?.userNickname || "프로필"}
                      />
                      <Typography variant="h5" fontWeight={600} color="#333">
                        {workout?.user?.userNickname}
                      </Typography>
                    </UserInfoContainer>
                  </Box>

                  <HeaderDivider />

                  {workout?.workoutPhoto ? (
                    // 사진이 있을 때는 세로 정렬
                    <>
                      <InfoItem>
                        <InfoIcon>
                          <CalendarToday fontSize="small" />
                        </InfoIcon>
                        {isValidDate(workout?.recordDate)
                          ? format(
                              new Date(workout?.recordDate || ""),
                              "yyyy년 MM월 dd일 EEEE",
                              { locale: ko }
                            )
                          : "날짜 정보 없음"}
                      </InfoItem>

                      {workout?.workoutPlace?.placeName && (
                        <ClickableInfoItem onClick={handlePlaceClick}>
                          <InfoIcon>
                            <LocationOn fontSize="small" />
                          </InfoIcon>
                          {workout.workoutPlace.placeName}
                        </ClickableInfoItem>
                      )}
                    </>
                  ) : (
                    // 사진이 없을 때는 가로 정렬
                    <InfoRow>
                      <InfoItem style={{ marginBottom: 0 }}>
                        <InfoIcon>
                          <CalendarToday fontSize="small" />
                        </InfoIcon>
                        {isValidDate(workout?.recordDate)
                          ? format(
                              new Date(workout?.recordDate || ""),
                              "yyyy년 MM월 dd일 EEEE",
                              { locale: ko }
                            )
                          : "날짜 정보 없음"}
                      </InfoItem>

                      {workout?.workoutPlace?.placeName && (
                        <ClickableInfoItem
                          onClick={handlePlaceClick}
                          style={{ marginBottom: 0 }}
                        >
                          <InfoIcon>
                            <LocationOn fontSize="small" />
                          </InfoIcon>
                          {workout.workoutPlace.placeName}
                        </ClickableInfoItem>
                      )}
                    </InfoRow>
                  )}

                  {workout?.workoutDiary && (
                    <WorkoutDiary variant="body2">
                      {workout.workoutDiary}
                    </WorkoutDiary>
                  )}
                </ModalInfo>

                {/* 좋아요 버튼 */}
                <LikeContainer>
                  <LikeButton
                    onClick={handleToggleLike}
                    disabled={!userInfo || likesLoading}
                    className={isLiked ? "active" : ""}
                  >
                    {isLiked ? (
                      <Favorite fontSize="small" color="error" />
                    ) : (
                      <FavoriteBorder fontSize="small" />
                    )}
                    {likeCount > 0 ? `좋아요 ${likeCount}` : "좋아요"}
                  </LikeButton>
                  {!userInfo && (
                    <Typography variant="caption" color="textSecondary">
                      로그인 후 좋아요를 남길 수 있습니다.
                    </Typography>
                  )}
                </LikeContainer>
              </ModalHeaderContent>

              <SectionTitle>
                운동 정보
                <IconButton
                  size="small"
                  onClick={() => setExercisesExpanded(!exercisesExpanded)}
                >
                  {exercisesExpanded ? (
                    <KeyboardArrowUp />
                  ) : (
                    <KeyboardArrowDown />
                  )}
                </IconButton>
              </SectionTitle>

              <Collapse in={exercisesExpanded}>
                {exerciseGroups.length > 0 ? (
                  <ExerciseList exercises={exerciseGroups} />
                ) : (
                  <Typography
                    color="textSecondary"
                    sx={{ textAlign: "center", py: 3 }}
                  >
                    운동 세부 정보가 없습니다.
                  </Typography>
                )}
              </Collapse>

              <Divider sx={{ my: 4 }} />

              <div ref={commentSectionRef}>
                <CommentSection
                  workoutId={workoutOfTheDaySeq}
                  targetCommentId={commentId}
                  isReplyNotification={isReplyNotification}
                  parentCommentId={parentCommentId}
                  replyCommentId={replyCommentId}
                />
              </div>
            </ModalBody>
          </ScrollableContent>
        </ScrollableContainer>
      </ModalContent>

      {/* 삭제 확인 모달 */}
      {showDeleteConfirm && (
        <ActionModal onClick={(e) => e.stopPropagation()}>
          <ActionModalContent>
            <ActionModalTitle>
              이 운동 기록을 정말 삭제하시겠습니까?
            </ActionModalTitle>
            <Typography color="text.secondary">
              삭제된 운동 기록은 복구할 수 없습니다.
            </Typography>
            <ActionModalButtons>
              <Button
                variant="outlined"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isProcessing}
                size="large"
              >
                취소
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={handleDelete}
                disabled={isProcessing}
                size="large"
              >
                {isProcessing ? "삭제 중..." : "삭제"}
              </Button>
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
              multiline
              rows={5}
              fullWidth
              variant="outlined"
              value={editDiary}
              onChange={(e) => setEditDiary(e.target.value)}
              placeholder="운동 일지를 작성해주세요."
            />
            <ActionModalButtons>
              <Button
                variant="outlined"
                onClick={() => setShowEditModal(false)}
                disabled={isProcessing}
                size="large"
              >
                취소
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleEdit}
                disabled={isProcessing}
                size="large"
              >
                {isProcessing ? "저장 중..." : "저장"}
              </Button>
            </ActionModalButtons>
          </ActionModalContent>
        </ActionModal>
      )}
    </Modal>
  );
};

export default WorkoutDetailModal;

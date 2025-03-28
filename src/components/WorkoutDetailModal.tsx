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
  Send,
  FavoriteBorder,
  Favorite,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocationOn,
  CalendarToday,
  FitnessCenter,
} from "@mui/icons-material";
import {
  getCommentsAPI,
  createCommentAPI,
  deleteCommentAPI,
  toggleCommentLikeAPI,
  CommentListResponse,
  Comment,
} from "../api/comment";
import { formatDistanceToNow } from "date-fns";

// 모달 스타일
const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  padding: 20px;
  backdrop-filter: blur(5px);
`;

const ModalContent = styled(Paper)`
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  scrollbar-width: thin;
  scrollbar-color: #d0d0d0 #f5f5f5;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #f5f5f5;
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #d0d0d0;
    border-radius: 10px;
  }

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
`;

const CloseButton = styled(IconButton)`
  position: absolute;
  top: 12px;
  right: 12px;
  background-color: rgba(255, 255, 255, 0.9);
  z-index: 20;

  &:hover {
    background-color: rgba(255, 255, 255, 1);
  }
`;

const ModalBody = styled.div`
  padding: 30px;

  @media (max-width: 768px) {
    padding: 20px 16px;
  }
`;

const ModalHeaderContent = styled.div`
  display: flex;
  margin-bottom: 24px;
  gap: 24px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
  }
`;

const ModalImage = styled.div<{ url?: string }>`
  width: 50%;
  aspect-ratio: 1/1;
  background-image: url(${(props) => props.url || ""});
  background-size: cover;
  background-position: center;
  background-color: #f0f0f0;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const ModalInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const HeaderDivider = styled(Divider)`
  margin: 16px 0;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  gap: 8px;
  color: #555;
`;

const InfoIcon = styled.span`
  display: flex;
  align-items: center;
  color: #4a90e2;
`;

const WorkoutDiary = styled(Typography)`
  margin-top: 16px;
  line-height: 1.7;
  white-space: pre-wrap;
  color: #333;
  font-size: 15px;
  padding: 12px 16px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #4a90e2;
`;

const SectionTitle = styled(Typography)`
  font-size: 18px;
  font-weight: 600;
  margin: 24px 0 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #333;

  &:first-of-type {
    margin-top: 0;
  }
`;

const ExerciseContainer = styled(Paper)`
  padding: 16px;
  margin-bottom: 16px;
  border-radius: 12px;
  border: 1px solid #eee;
`;

const ExerciseHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  user-select: none;
`;

const ExerciseTitle = styled(Typography)`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ExerciseTypeChip = styled.span`
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 12px;
  background-color: #e8f2ff;
  color: #4a90e2;
  font-weight: 500;
  white-space: nowrap;
`;

const ExerciseSets = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
`;

const SetItem = styled.div`
  background-color: #f8f8f8;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 14px;
  color: #555;
  border: 1px solid #eee;
`;

const LoadingContainer = styled.div`
  padding: 40px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
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
  z-index: 10000;
  backdrop-filter: blur(3px);
`;

const ActionModalContent = styled(Paper)`
  padding: 24px;
  width: 90%;
  max-width: 400px;
  text-align: center;
  border-radius: 16px;
`;

const ActionModalTitle = styled(Typography)`
  margin-bottom: 16px;
  font-weight: 600;
  font-size: 18px;
`;

const ActionModalButtons = styled.div`
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 20px;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;
`;

const TextArea = styled(TextField)`
  .MuiInputBase-root {
    border-radius: 12px;
  }
`;

// 댓글 섹션 스타일
const CommentSection = styled.div`
  margin-top: 32px;
`;

const CommentCount = styled(Typography)`
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
  span {
    color: #4a90e2;
    margin-left: 4px;
  }
`;

const CommentList = styled.div`
  margin-top: 20px;
`;

const CommentItem = styled.div`
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
`;

const CommentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const UserName = styled(Typography)`
  font-weight: 600;
  font-size: 15px;
`;

const CommentDate = styled(Typography)`
  color: #777;
  font-size: 13px;
`;

const CommentText = styled(Typography)`
  font-size: 15px;
  line-height: 1.5;
  margin: 8px 0;
  color: #333;
  word-break: break-word;
`;

const CommentActions = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 8px;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  font-size: 13px;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 0;

  &:hover {
    color: #333;
  }
`;

const CommentFormContainer = styled.div`
  display: flex;
  gap: 12px;
  align-items: flex-start;
  margin-top: 24px;
`;

const CommentField = styled(TextField)`
  flex: 1;
  .MuiOutlinedInput-root {
    border-radius: 20px;
    background-color: #f9f9f9;

    &:hover {
      background-color: #f5f5f5;
    }

    &.Mui-focused {
      background-color: #fff;
    }
  }
`;

const NoCommentsMessage = styled(Typography)`
  text-align: center;
  color: #777;
  padding: 24px 0;
`;

const AvatarStyled = styled(Avatar)`
  width: 38px;
  height: 38px;
  background-color: #4a90e2;
`;

// 유틸리티 함수
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

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? "0" + secs : secs}`;
};

const formatCommentDate = (dateString: string) => {
  const date = new Date(dateString);
  return formatDistanceToNow(date, { addSuffix: true, locale: ko });
};

// 운동 세부 정보 그룹화
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

// 댓글 컴포넌트
const CommentComponent: React.FC<{
  workoutId: number;
}> = ({ workoutId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [commentText, setCommentText] = useState("");
  const userInfo = useSelector((state: any) => state.auth.userInfo);

  // 댓글 불러오기
  const fetchComments = async () => {
    try {
      setLoading(true);
      const response: CommentListResponse = await getCommentsAPI(workoutId);
      setComments(response.comments);
      setTotalCount(response.totalCount);
    } catch (error) {
      console.error("댓글을 불러오는 중 오류가 발생했습니다:", error);
    } finally {
      setLoading(false);
    }
  };

  // 초기 로딩
  useEffect(() => {
    if (workoutId) {
      fetchComments();
    }
  }, [workoutId]);

  // 댓글 작성
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !userInfo) return;

    try {
      await createCommentAPI(workoutId, commentText);
      setCommentText("");
      fetchComments();
    } catch (error) {
      console.error("댓글 작성 중 오류가 발생했습니다:", error);
    }
  };

  // 댓글 삭제
  const handleDeleteComment = async (commentId: number) => {
    if (!window.confirm("이 댓글을 삭제하시겠습니까?")) return;

    try {
      await deleteCommentAPI(commentId);
      fetchComments();
    } catch (error) {
      console.error("댓글 삭제 중 오류가 발생했습니다:", error);
    }
  };

  // 좋아요 토글
  const handleToggleLike = async (commentId: number) => {
    if (!userInfo) return;

    try {
      const response = await toggleCommentLikeAPI(commentId);

      // 상태 업데이트
      setComments((prev) =>
        prev.map((comment) =>
          comment.workoutCommentSeq === commentId
            ? {
                ...comment,
                isLiked: response.isLiked,
                commentLikes: response.likeCount,
              }
            : comment
        )
      );
    } catch (error) {
      console.error("좋아요 처리 중 오류가 발생했습니다:", error);
    }
  };

  return (
    <CommentSection>
      <CommentCount variant="h6">
        댓글<span>{totalCount}</span>
      </CommentCount>

      {userInfo && (
        <CommentFormContainer>
          <AvatarStyled src={userInfo.profileImageUrl}>
            {!userInfo.profileImageUrl &&
              userInfo.userNickname?.substring(0, 1)}
          </AvatarStyled>
          <form
            onSubmit={handleSubmitComment}
            style={{ flex: 1, display: "flex", gap: "8px" }}
          >
            <CommentField
              fullWidth
              placeholder="댓글을 작성해보세요..."
              variant="outlined"
              size="small"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <Button
              variant="contained"
              color="primary"
              disabled={!commentText.trim()}
              type="submit"
              sx={{ borderRadius: "20px" }}
            >
              <Send fontSize="small" />
            </Button>
          </form>
        </CommentFormContainer>
      )}

      <CommentList>
        {loading ? (
          <LoadingContainer>
            <CircularProgress size={30} />
          </LoadingContainer>
        ) : comments.length === 0 ? (
          <NoCommentsMessage>
            아직 댓글이 없습니다. 첫 댓글을 남겨보세요!
          </NoCommentsMessage>
        ) : (
          comments.map((comment) => (
            <CommentItem key={comment.workoutCommentSeq}>
              <CommentHeader>
                <UserInfo>
                  <AvatarStyled src={comment.user.profileImageUrl || ""}>
                    {!comment.user.profileImageUrl &&
                      comment.user.userNickname?.substring(0, 1)}
                  </AvatarStyled>
                  <div>
                    <UserName>{comment.user.userNickname}</UserName>
                    <CommentDate>
                      {formatCommentDate(comment.commentCreatedAt)}
                    </CommentDate>
                  </div>
                </UserInfo>
                {userInfo && userInfo.userSeq === comment.user.userSeq && (
                  <IconButton
                    size="small"
                    onClick={() =>
                      handleDeleteComment(comment.workoutCommentSeq)
                    }
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                )}
              </CommentHeader>

              <CommentText>{comment.commentContent}</CommentText>

              <CommentActions>
                <ActionButton
                  onClick={() => handleToggleLike(comment.workoutCommentSeq)}
                >
                  {comment.isLiked ? (
                    <Favorite fontSize="small" color="error" />
                  ) : (
                    <FavoriteBorder fontSize="small" />
                  )}
                  {comment.commentLikes > 0 && comment.commentLikes}
                </ActionButton>
              </CommentActions>
            </CommentItem>
          ))
        )}
      </CommentList>
    </CommentSection>
  );
};

// 운동 접기/펼치기 컴포넌트
const ExerciseAccordion: React.FC<{
  exercise: string;
  type: string;
  sets: any[];
}> = ({ exercise, type, sets }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <ExerciseContainer elevation={0}>
      <ExerciseHeader onClick={() => setExpanded(!expanded)}>
        <ExerciseTitle>
          <FitnessCenter fontSize="small" color="primary" />
          {exercise}
          <ExerciseTypeChip>{type}</ExerciseTypeChip>
        </ExerciseTitle>
        <IconButton size="small">
          {expanded ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
        </IconButton>
      </ExerciseHeader>

      <Collapse in={expanded}>
        <ExerciseSets>
          {type === "유산소" ? (
            <>
              {sets.map((set, index) => (
                <SetItem key={index}>
                  {set.distance && (
                    <span>
                      {set.distance}m
                      {set.distance >= 1000 &&
                        ` (${(set.distance / 1000).toFixed(2)}km)`}
                    </span>
                  )}
                  {set.recordTime && <span>{formatTime(set.recordTime)}</span>}
                </SetItem>
              ))}
            </>
          ) : (
            <>
              {sets.map((set, index) => (
                <SetItem key={index}>
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
      </Collapse>
    </ExerciseContainer>
  );
};

// Props 타입 정의
interface WorkoutDetailModalProps {
  workoutOfTheDaySeq: number;
  onClose: () => void;
  onDelete?: () => void;
}

// 메인 컴포넌트
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
  const [exercisesExpanded, setExercisesExpanded] = useState(false);

  // 운동 상세 정보 가져오기
  useEffect(() => {
    const fetchWorkoutDetail = async () => {
      setLoading(true);
      try {
        const response = await getWorkoutRecordDetailsAPI(workoutOfTheDaySeq);
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

  // 소유자 확인
  const isOwner = useMemo(() => {
    if (!userInfo || !workout || !workout.user) return false;
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

  // 로딩 중 표시
  if (loading) {
    return (
      <Modal onClick={onClose}>
        <ModalContent onClick={(e) => e.stopPropagation()}>
          <LoadingContainer>
            <CircularProgress size={40} />
            <Typography>운동 정보를 불러오는 중...</Typography>
          </LoadingContainer>
        </ModalContent>
      </Modal>
    );
  }

  const isValidDate = (date: any) => date && !isNaN(new Date(date).getTime());
  const exerciseGroups = workout?.workoutDetails
    ? groupExerciseDetails(workout.workoutDetails)
    : [];

  return (
    <Modal onClick={onClose}>
      <ModalContent elevation={6} onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={onClose} size="small">
          ×
        </CloseButton>

        <ModalBody>
          <ModalHeaderContent>
            <ModalImage url={getImageUrl(workout?.workoutPhoto || null)} />
            <ModalInfo>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="h5" fontWeight={600}>
                  {workout?.user?.userNickname}
                </Typography>
                {isOwner && (
                  <ButtonContainer>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setEditDiary(workout?.workoutDiary || "");
                        setShowEditModal(true);
                      }}
                      color="primary"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => setShowDeleteConfirm(true)}
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </ButtonContainer>
                )}
              </Box>

              <HeaderDivider />

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

              <InfoItem>
                <InfoIcon>
                  <LocationOn fontSize="small" />
                </InfoIcon>
                {workout?.workoutPlace?.placeName || "장소 정보 없음"}
              </InfoItem>

              {workout?.workoutDiary && (
                <WorkoutDiary variant="body2">
                  {workout.workoutDiary}
                </WorkoutDiary>
              )}
            </ModalInfo>
          </ModalHeaderContent>

          <SectionTitle>
            운동 정보
            <IconButton
              size="small"
              onClick={() => setExercisesExpanded(!exercisesExpanded)}
            >
              {exercisesExpanded ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
            </IconButton>
          </SectionTitle>

          <Collapse in={exercisesExpanded}>
            {exerciseGroups.length > 0 ? (
              exerciseGroups.map((group, index) => (
                <ExerciseAccordion
                  key={index}
                  exercise={group.exercise}
                  type={group.type}
                  sets={group.sets}
                />
              ))
            ) : (
              <Typography
                color="textSecondary"
                sx={{ textAlign: "center", py: 2 }}
              >
                운동 세부 정보가 없습니다.
              </Typography>
            )}
          </Collapse>

          <Divider sx={{ my: 3 }} />

          <CommentComponent workoutId={workoutOfTheDaySeq} />
        </ModalBody>
      </ModalContent>

      {/* 삭제 확인 모달 */}
      {showDeleteConfirm && (
        <ActionModal onClick={(e) => e.stopPropagation()}>
          <ActionModalContent>
            <ActionModalTitle>
              이 운동 기록을 정말 삭제하시겠습니까?
            </ActionModalTitle>
            <Typography>삭제된 운동 기록은 복구할 수 없습니다.</Typography>
            <ActionModalButtons>
              <Button
                variant="outlined"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isProcessing}
              >
                취소
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={handleDelete}
                disabled={isProcessing}
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
              rows={4}
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
              >
                취소
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleEdit}
                disabled={isProcessing}
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

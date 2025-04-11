import { useState } from "react";
import { updateCommentAPI, deleteCommentAPI } from "../api/comment";

interface UseCommentActionsProps {
  commentId: number;
  initialContent?: string; // 수정 시 초기 내용을 받을 수 있도록 추가 (옵셔널)
  onUpdateSuccess?: () => void;
  onDeleteSuccess?: () => void;
}

/**
 * 댓글 수정 및 삭제 관련 로직을 처리하는 커스텀 훅
 * @param commentId - 대상 댓글 ID
 * @param initialContent - 수정 시 초기 내용
 * @param onUpdateSuccess - 수정 성공 콜백
 * @param onDeleteSuccess - 삭제 성공 콜백
 */
export const useCommentActions = ({
  commentId,
  initialContent = "",
  onUpdateSuccess,
  onDeleteSuccess,
}: UseCommentActionsProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(initialContent);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  /** 댓글 수정을 시작합니다. */
  const startEditing = (currentContent: string) => {
    setEditText(currentContent); // 수정 시작 시 현재 내용으로 설정
    setIsEditing(true);
  };

  /** 댓글 수정을 취소합니다. */
  const cancelEditing = () => {
    setIsEditing(false);
    // 수정 취소 시 editText 초기화는 선택 사항 (현재는 유지)
    // setEditText(initialContent);
  };

  /** 댓글 내용을 업데이트합니다. */
  const handleUpdateComment = async () => {
    if (!editText.trim() || isUpdating) return;

    setIsUpdating(true);
    try {
      await updateCommentAPI(commentId, editText);
      setIsEditing(false); // 수정 완료 후 편집 모드 종료
      onUpdateSuccess?.();
    } catch (error) {
      console.error(`댓글(ID: ${commentId}) 수정 중 오류 발생:`, error);
      // 사용자에게 오류 피드백 추가 고려
      alert("댓글 수정에 실패했습니다.");
    } finally {
      setIsUpdating(false);
    }
  };

  /** 댓글을 삭제합니다. */
  const handleDeleteComment = async () => {
    if (isDeleting) return;

    // 삭제 확인 로직은 컴포넌트 레벨에서 처리하는 것이 더 적합할 수 있음
    // if (!window.confirm("정말 이 댓글을 삭제하시겠습니까?")) return;

    setIsDeleting(true);
    try {
      await deleteCommentAPI(commentId);
      onDeleteSuccess?.();
      // 편집 상태 등은 여기서 변경할 필요 없음
    } catch (error) {
      console.error(`댓글(ID: ${commentId}) 삭제 중 오류 발생:`, error);
      // 사용자에게 오류 피드백 추가 고려
      alert("댓글 삭제에 실패했습니다.");
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    isEditing,
    editText,
    setEditText,
    isDeleting,
    isUpdating,
    startEditing,
    cancelEditing,
    handleUpdateComment,
    handleDeleteComment,
  };
};

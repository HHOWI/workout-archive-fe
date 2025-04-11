import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  toggleCommentLikeAPI,
  toggleReplyLikeAPI,
  CommentLikeResponse,
} from "../api/comment";
import { Comment } from "../api/comment"; // Comment 타입 임포트 추가

interface UseCommentLikeProps {
  comment: Comment;
  isReply?: boolean;
  parentCommentId?: number; // 대댓글인 경우 부모 댓글 ID 필요
}

/**
 * 댓글 또는 대댓글 좋아요 토글 로직을 처리하는 커스텀 훅 (낙관적 업데이트 포함)
 * @param comment - 대상 댓글/대댓글 객체
 * @param isReply - 대댓글 여부 (기본값: false)
 * @param parentCommentId - 대댓글인 경우 부모 댓글 ID
 */
export const useCommentLike = ({
  comment,
  isReply = false,
  parentCommentId,
}: UseCommentLikeProps) => {
  const userInfo = useSelector((state: any) => state.auth.userInfo);
  const [localComment, setLocalComment] = useState<Comment>(comment);
  const [isLiking, setIsLiking] = useState(false); // API 호출 중 상태

  // 외부 comment prop이 변경되면 로컬 상태 동기화
  useEffect(() => {
    setLocalComment(comment);
  }, [comment]);

  const handleToggleLike = async () => {
    if (!userInfo || isLiking) return;

    const originalComment = { ...localComment }; // 롤백을 위한 원본 상태 저장
    const commentId = localComment.workoutCommentSeq;

    // 낙관적 UI 업데이트
    setLocalComment((prev) => ({
      ...prev,
      isLiked: !prev.isLiked,
      commentLikes: prev.isLiked
        ? (prev.commentLikes || 1) - 1
        : (prev.commentLikes || 0) + 1,
    }));
    setIsLiking(true);

    try {
      let response: CommentLikeResponse;
      if (isReply) {
        if (!parentCommentId) {
          throw new Error("대댓글 좋아요 토글 시 부모 댓글 ID가 필요합니다.");
        }
        response = await toggleReplyLikeAPI(commentId, parentCommentId);
      } else {
        response = await toggleCommentLikeAPI(commentId);
      }

      // API 응답으로 정확한 상태 반영 (이미 낙관적으로 업데이트되었으므로 확인만)
      if (
        response.isLiked !== localComment.isLiked ||
        response.likeCount !== localComment.commentLikes
      ) {
        setLocalComment((prev) => ({
          ...prev,
          isLiked: response.isLiked,
          commentLikes: response.likeCount,
        }));
      }
    } catch (error) {
      console.error(`좋아요 처리(ID: ${commentId}) 중 오류 발생:`, error);
      // 오류 발생 시 원래 상태로 롤백
      setLocalComment(originalComment);
      alert("좋아요 처리에 실패했습니다.");
    } finally {
      setIsLiking(false);
    }
  };

  return {
    likedComment: localComment, // 좋아요 상태가 반영된 댓글 객체
    isLiking,
    handleToggleLike,
  };
};

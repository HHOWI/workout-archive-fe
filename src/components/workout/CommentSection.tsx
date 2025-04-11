import React, { useState, useEffect, useRef } from "react";
import { Box, CircularProgress, Divider, Typography } from "@mui/material";
import { Comment as CommentIcon } from "@mui/icons-material";
import {
  getCommentsAPI,
  createCommentAPI,
  getCommentByIdAPI,
  getParentCommentWithAllRepliesAPI,
  getRepliesAPI,
  Comment,
  CommentListResponse,
  CommentCreateResponse,
  RepliesResponse,
} from "../../api/comment";
import { useSelector } from "react-redux";
import CommentItem from "./comment/CommentItem";
import CommentForm from "./comment/CommentForm";
import {
  CommentContainer,
  CommentHeader,
  CommentTitle,
  CommentCount,
  CommentList,
  LoadingContainer,
  NoComments,
  LoadMoreButton,
} from "./comment/CommentSectionStyles";

// 인터페이스 정의
interface CommentSectionProps {
  workoutId: number;
  targetCommentId?: number;
  isReplyNotification?: boolean;
  parentCommentId?: number;
  replyCommentId?: number;
}

// 대댓글 상태 인터페이스
interface ReplyState {
  isExpanded: boolean;
  isLoading: boolean;
  replies: Comment[];
  nextCursor: number | null;
  hasMore: boolean;
}

// 임시 댓글/대댓글 ID
const TEMP_COMMENT_ID = -1;

const CommentSection: React.FC<CommentSectionProps> = ({
  workoutId,
  targetCommentId,
  isReplyNotification,
  parentCommentId,
  replyCommentId,
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [replyStates, setReplyStates] = useState<Record<number, ReplyState>>(
    {}
  );

  const userInfo = useSelector((state: any) => state.auth.userInfo);
  const targetCommentRef = useRef<HTMLDivElement>(null);
  const targetReplyRef = useRef<HTMLDivElement>(null);

  // 초기 댓글 로드
  useEffect(() => {
    const loadInitialComments = async () => {
      if (isReplyNotification && parentCommentId && replyCommentId) {
        await fetchParentWithAllReplies(parentCommentId, replyCommentId);
      } else if (targetCommentId) {
        await fetchTargetComment(targetCommentId);
      } else {
        await fetchComments(true);
      }
      setInitialLoadComplete(true);
    };

    loadInitialComments();
  }, [
    workoutId,
    targetCommentId,
    isReplyNotification,
    parentCommentId,
    replyCommentId,
  ]);

  // 특정 댓글/대댓글이 로드된 후 스크롤 처리
  useEffect(() => {
    if (initialLoadComplete) {
      let targetElementRef: React.RefObject<HTMLDivElement> | null = null;

      if (isReplyNotification && replyCommentId && targetReplyRef.current) {
        targetElementRef = targetReplyRef;
      } else if (targetCommentId && targetCommentRef.current) {
        targetElementRef = targetCommentRef;
      }

      if (targetElementRef?.current) {
        const timer = setTimeout(() => {
          targetElementRef!.current?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [
    initialLoadComplete,
    targetCommentId,
    replyCommentId,
    isReplyNotification,
  ]);

  // 부모 댓글과 모든 대댓글을 한 번에 조회 (대댓글 알림용)
  const fetchParentWithAllReplies = async (
    parentCommentId: number,
    targetReplyId: number
  ) => {
    try {
      setLoading(true);

      const parentWithReplies = await getParentCommentWithAllRepliesAPI(
        parentCommentId,
        targetReplyId
      );

      const commentsResponse = await getCommentsAPI(workoutId, 1);

      const filteredComments = commentsResponse.comments.filter(
        (c) => c.workoutCommentSeq !== parentCommentId
      );
      setComments([parentWithReplies, ...filteredComments]);

      if (
        parentWithReplies.childComments &&
        parentWithReplies.childComments.length > 0
      ) {
        setReplyStates((prev) => ({
          ...prev,
          [parentCommentId]: {
            isExpanded: true,
            isLoading: false,
            replies: parentWithReplies.childComments || [],
            nextCursor: null,
            hasMore: false,
          },
        }));
      }

      setTotalCount(commentsResponse.totalCount);
      setPage(1);
      setHasMore(
        commentsResponse.comments.length < commentsResponse.totalCount
      );
    } catch (error) {
      await fetchComments(true);
    } finally {
      setLoading(false);
    }
  };

  // 특정 댓글 ID로 댓글 조회 및 댓글 목록에 추가
  const fetchTargetComment = async (commentId: number) => {
    try {
      setLoading(true);

      const comment = await getCommentByIdAPI(commentId);

      const commentsResponse = await getCommentsAPI(workoutId, 1);

      const existsInComments = commentsResponse.comments.some(
        (c) => c.workoutCommentSeq === commentId
      );

      if (!existsInComments) {
        setComments([comment, ...commentsResponse.comments]);
      } else {
        setComments(commentsResponse.comments);
      }

      setTotalCount(commentsResponse.totalCount);
      setPage(1);
      setHasMore(
        commentsResponse.comments.length < commentsResponse.totalCount
      );
    } catch (error) {
      await fetchComments(true);
    } finally {
      setLoading(false);
    }
  };

  // 댓글 목록 조회
  const fetchComments = async (
    reset: boolean = false,
    nextPage: number = 1
  ) => {
    try {
      if (reset) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response: CommentListResponse = await getCommentsAPI(
        workoutId,
        nextPage
      );

      if (reset) {
        setComments(response.comments);
      } else {
        const existingIds = new Set(comments.map((c) => c.workoutCommentSeq));
        const newComments = response.comments.filter(
          (c) => !existingIds.has(c.workoutCommentSeq)
        );
        setComments([...comments, ...newComments]);
      }

      setTotalCount(response.totalCount);
      setPage(nextPage);

      setHasMore(nextPage * 10 < response.totalCount);
    } catch (error) {
      console.error("댓글 로드 중 오류 발생:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // 댓글 작성 핸들러
  const handleSubmitComment = async (text: string) => {
    if (!text.trim() || !userInfo) return;

    try {
      // 낙관적 UI 업데이트를 위한 임시 댓글 생성
      const tempComment: Comment = {
        workoutCommentSeq: TEMP_COMMENT_ID,
        commentContent: text,
        commentLikes: 0,
        commentCreatedAt: new Date().toISOString(),
        isLiked: false,
        user: {
          userSeq: userInfo.userSeq,
          userNickname: userInfo.userNickname,
          profileImageUrl: userInfo.profileImageUrl || null,
        },
        childCommentsCount: 0,
      };

      // 임시 댓글을 UI에 먼저 추가 (낙관적 업데이트)
      setComments([tempComment, ...comments]);
      setTotalCount((prev) => prev + 1);
      setCommentText("");

      // API 호출로 실제 저장
      const response: CommentCreateResponse = await createCommentAPI(
        workoutId,
        text
      );

      // 임시 댓글을 실제 댓글로 대체
      setComments((currentComments) =>
        currentComments.map((comment) =>
          comment.workoutCommentSeq === TEMP_COMMENT_ID
            ? response.comment
            : comment
        )
      );
    } catch (error) {
      console.error("댓글 작성 중 오류가 발생했습니다:", error);
      // 에러 발생 시 임시 댓글 제거
      setComments((prevComments) =>
        prevComments.filter(
          (comment) => comment.workoutCommentSeq !== TEMP_COMMENT_ID
        )
      );
      setTotalCount((prev) => prev - 1);
      alert("댓글 작성에 실패했습니다."); // 사용자 알림 추가
    }
  };

  // 대댓글 토글 핸들러
  const handleToggleReplies = async (commentId: number) => {
    if (replyStates[commentId]) {
      setReplyStates((prev) => ({
        ...prev,
        [commentId]: {
          ...prev[commentId],
          isExpanded: !prev[commentId].isExpanded,
        },
      }));
      return;
    }

    setReplyStates((prev) => ({
      ...prev,
      [commentId]: {
        isExpanded: true,
        isLoading: true,
        replies: [],
        nextCursor: null,
        hasMore: false,
      },
    }));

    try {
      const response: RepliesResponse = await getRepliesAPI(commentId);

      setReplyStates((prev) => ({
        ...prev,
        [commentId]: {
          isExpanded: true,
          isLoading: false,
          replies: response.replies,
          nextCursor: response.nextCursor,
          hasMore: response.hasMore,
        },
      }));
    } catch (error) {
      setReplyStates((prev) => ({
        ...prev,
        [commentId]: {
          isExpanded: false,
          isLoading: false,
          replies: [],
          nextCursor: null,
          hasMore: false,
        },
      }));
    }
  };

  // 대댓글 더 불러오기 핸들러
  const handleLoadMoreReplies = async (commentId: number) => {
    const currentState = replyStates[commentId];
    if (!currentState || currentState.isLoading || !currentState.hasMore)
      return;

    setReplyStates((prev) => ({
      ...prev,
      [commentId]: {
        ...prev[commentId],
        isLoading: true,
      },
    }));

    try {
      let cursor: number | undefined = undefined;
      if (currentState.nextCursor !== null) {
        cursor = currentState.nextCursor;
      }

      const response: RepliesResponse = await getRepliesAPI(commentId, cursor);

      // === 수정: 중복 제거 로직 추가 ===
      // 기존 대댓글 ID Set 생성 (임시 ID 제외)
      const existingReplyIds = new Set(
        currentState.replies
          .filter((reply) => reply.workoutCommentSeq !== TEMP_COMMENT_ID) // 임시 댓글은 비교에서 제외
          .map((reply) => reply.workoutCommentSeq)
      );

      // 새로 불러온 대댓글 중 중복되지 않은 것만 필터링
      const newReplies = response.replies.filter(
        (reply) => !existingReplyIds.has(reply.workoutCommentSeq)
      );

      // 기존 대댓글과 새로 필터링된 대댓글 병합
      const updatedReplies = [...currentState.replies, ...newReplies];
      // ===============================

      setReplyStates((prev) => ({
        ...prev,
        [commentId]: {
          ...prev[commentId],
          isLoading: false,
          replies: updatedReplies,
          nextCursor: response.nextCursor,
          hasMore: response.hasMore,
        },
      }));
    } catch (error) {
      console.error("대댓글 추가 로드 중 오류 발생:", error);
      setReplyStates((prev) => ({
        ...prev,
        [commentId]: {
          ...prev[commentId],
          isLoading: false,
        },
      }));
    }
  };

  // 댓글 더 불러오기
  const loadMoreComments = () => {
    if (loading || loadingMore || !hasMore) return;

    const nextPage = page + 1;
    fetchComments(false, nextPage);
  };

  // 댓글 상태 업데이트 - 자식 컴포넌트에서 상태 변경 후 호출
  const updateComments = () => {
    fetchComments(true);
    setReplyStates({}); // 댓글 목록 전체 업데이트 시 대댓글 상태 초기화
  };

  // ===== 대댓글 낙관적 업데이트 관련 함수 =====
  const handleAddReplyOptimistic = (parentId: number, tempReply: Comment) => {
    setReplyStates((prev) => {
      const currentReplies = prev[parentId]?.replies || [];
      // 임시 댓글을 맨 앞에 추가하고, 펼침 상태로 변경
      return {
        ...prev,
        [parentId]: {
          ...(prev[parentId] || {
            isLoading: false,
            nextCursor: null,
            hasMore: false,
          }), // 기존 상태 유지 또는 기본값 설정
          replies: [tempReply, ...currentReplies],
          isExpanded: true, // 대댓글 작성 시 자동으로 펼침
        },
      };
    });
    // 부모 댓글의 대댓글 수 업데이트 (선택적: 즉시 반영)
    setComments((prev) =>
      prev.map((c) =>
        c.workoutCommentSeq === parentId
          ? { ...c, childCommentsCount: (c.childCommentsCount || 0) + 1 }
          : c
      )
    );
  };

  const handleReplaceTempReply = (parentId: number, realReply: Comment) => {
    setReplyStates((prev) => {
      const currentReplies = prev[parentId]?.replies || [];
      return {
        ...prev,
        [parentId]: {
          ...prev[parentId],
          replies: currentReplies.map((reply) =>
            reply.workoutCommentSeq === TEMP_COMMENT_ID ? realReply : reply
          ),
        },
      };
    });
  };

  const handleRemoveTempReply = (parentId: number) => {
    setReplyStates((prev) => {
      const currentReplies = prev[parentId]?.replies || [];
      return {
        ...prev,
        [parentId]: {
          ...prev[parentId],
          replies: currentReplies.filter(
            (reply) => reply.workoutCommentSeq !== TEMP_COMMENT_ID
          ),
        },
      };
    });
    // 부모 댓글의 대댓글 수 롤백 (선택적)
    setComments((prev) =>
      prev.map((c) =>
        c.workoutCommentSeq === parentId
          ? {
              ...c,
              childCommentsCount: Math.max(0, (c.childCommentsCount || 1) - 1),
            } // 0 미만 방지
          : c
      )
    );
  };
  // =========================================

  return (
    <CommentContainer elevation={0}>
      <CommentHeader>
        <CommentTitle variant="h6">
          댓글
          <CommentCount
            label={totalCount}
            color="default"
            variant="outlined"
            size="small"
          />
        </CommentTitle>
      </CommentHeader>

      {userInfo && (
        <CommentForm
          onSubmit={handleSubmitComment}
          initialText={commentText}
          onTextChange={setCommentText}
        />
      )}

      <Divider sx={{ my: 2 }} />

      <CommentList>
        {loading ? (
          <LoadingContainer>
            <CircularProgress size={32} color="primary" />
          </LoadingContainer>
        ) : comments.length === 0 ? (
          <NoComments>
            <CommentIcon color="disabled" sx={{ fontSize: 36, opacity: 0.5 }} />
            <Typography sx={{ fontWeight: 400 }}>
              아직 댓글이 없습니다. 첫 댓글을 남겨보세요!
            </Typography>
          </NoComments>
        ) : (
          <>
            {comments.map((comment) => (
              <CommentItem
                key={comment.workoutCommentSeq}
                comment={comment}
                workoutId={workoutId}
                targetCommentId={targetCommentId}
                onUpdateComments={updateComments}
                ref={
                  !isReplyNotification &&
                  targetCommentId === comment.workoutCommentSeq
                    ? targetCommentRef
                    : undefined
                }
                replyState={
                  replyStates[comment.workoutCommentSeq] || {
                    isExpanded: false,
                    isLoading: false,
                    replies: [],
                    nextCursor: null,
                    hasMore: true,
                  }
                }
                onToggleReplies={handleToggleReplies}
                onLoadMoreReplies={handleLoadMoreReplies}
                // ===== 낙관적 업데이트 콜백 추가 =====
                onAddReplyOptimistic={handleAddReplyOptimistic}
                onReplaceTempReply={handleReplaceTempReply}
                onRemoveTempReply={handleRemoveTempReply}
                // ===================================
                targetReplyId={replyCommentId}
                targetReplyRef={
                  isReplyNotification &&
                  comment.workoutCommentSeq === parentCommentId
                    ? targetReplyRef
                    : undefined
                }
              />
            ))}

            {hasMore && (
              <LoadMoreButton
                variant="outlined"
                onClick={loadMoreComments}
                disabled={loadingMore}
                color="inherit"
                sx={{ mt: 2 }}
              >
                {loadingMore ? <CircularProgress size={20} /> : "댓글 더 보기"}
              </LoadMoreButton>
            )}
          </>
        )}
      </CommentList>
    </CommentContainer>
  );
};

export default CommentSection;

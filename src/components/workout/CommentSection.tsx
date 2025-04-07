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

const CommentSection: React.FC<CommentSectionProps> = ({
  workoutId,
  targetCommentId,
  isReplyNotification,
  parentCommentId,
  replyCommentId,
}) => {
  // Props 확인 로그 추가
  console.log("CommentSection received props:", {
    workoutId,
    targetCommentId,
    isReplyNotification,
    parentCommentId,
    replyCommentId,
  });

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
    // useEffect 내부에서 props 값 확인 로그 추가
    console.log("Initial load useEffect - Props check:", {
      isReplyNotification,
      parentCommentId,
      replyCommentId,
    });

    const loadInitialComments = async () => {
      if (isReplyNotification && parentCommentId && replyCommentId) {
        // 대댓글 알림의 경우, 부모 댓글과 모든 대댓글을 로드
        await fetchParentWithAllReplies(parentCommentId, replyCommentId);
      } else if (targetCommentId) {
        // 특정 댓글 ID가 있는 경우, 해당 댓글을 먼저 로드
        await fetchTargetComment(targetCommentId);
      } else {
        // 일반적인 댓글 목록 로드
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
        // 대댓글 알림인 경우 타겟 대댓글로 스크롤
        targetElementRef = targetReplyRef;
        console.log(
          `Scrolling to reply ref: ${replyCommentId}`,
          targetReplyRef.current
        );
      } else if (targetCommentId && targetCommentRef.current) {
        // 일반 댓글 알림인 경우 타겟 부모 댓글로 스크롤
        targetElementRef = targetCommentRef;
        console.log(
          `Scrolling to comment ref: ${targetCommentId}`,
          targetCommentRef.current
        );
      }

      if (targetElementRef?.current) {
        // 워크아웃 정보 로드 후 약간의 지연시간을 두고 스크롤
        const timer = setTimeout(() => {
          targetElementRef!.current?.scrollIntoView({
            behavior: "smooth",
            block: "center", // 중앙으로 오도록 수정
          });
          console.log("Scroll executed to:", targetElementRef!.current);
        }, 500); // 지연 시간 늘리기
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
    console.log(
      `fetchParentWithAllReplies called for parent: ${parentCommentId}, target: ${targetReplyId}`
    );
    try {
      setLoading(true);

      // 부모 댓글과 모든 대댓글 가져오기
      const parentWithReplies = await getParentCommentWithAllRepliesAPI(
        parentCommentId,
        targetReplyId
      );
      console.log("API response (parentWithReplies):", parentWithReplies);

      // 일반 댓글 목록 로드
      const commentsResponse = await getCommentsAPI(workoutId, 1);

      // 댓글 목록 설정: API로 가져온 부모 댓글을 항상 최상단에 위치시킴
      const filteredComments = commentsResponse.comments.filter(
        (c) => c.workoutCommentSeq !== parentCommentId
      );
      setComments([parentWithReplies, ...filteredComments]);

      // 대댓글이 로드된 부모 댓글의 댓글 창 자동으로 펼치기 설정
      console.log(
        "Checking condition for setting reply state:",
        parentWithReplies.childComments &&
          parentWithReplies.childComments.length > 0
      );
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
        console.log(`Reply state set for parent comment ${parentCommentId}:`, {
          isExpanded: true,
          isLoading: false,
          replies: parentWithReplies.childComments || [],
          nextCursor: null,
          hasMore: false,
        });
      }

      setTotalCount(commentsResponse.totalCount);
      setPage(1);
      setHasMore(
        commentsResponse.comments.length < commentsResponse.totalCount
      );
    } catch (error) {
      console.error("댓글 로드 중 오류 발생:", error);
      // 오류 발생 시 일반 댓글 목록만 로드
      await fetchComments(true);
    } finally {
      setLoading(false);
    }
  };

  // 특정 댓글 ID로 댓글 조회 및 댓글 목록에 추가
  const fetchTargetComment = async (commentId: number) => {
    try {
      setLoading(true);

      // 특정 댓글 정보 가져오기
      const comment = await getCommentByIdAPI(commentId);

      // 일반 댓글 목록 로드 (타겟 댓글도 포함될 수 있음)
      const commentsResponse = await getCommentsAPI(workoutId, 1);

      // 타겟 댓글이 목록에 없는지 확인
      const existsInComments = commentsResponse.comments.some(
        (c) => c.workoutCommentSeq === commentId
      );

      // 댓글 목록 설정 (타겟 댓글이 없으면 맨 위에 추가)
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
      console.error("댓글 로드 중 오류 발생:", error);
      // 오류 발생 시 일반 댓글 목록만 로드
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

      // 목록 업데이트
      if (reset) {
        setComments(response.comments);
      } else {
        // 기존 댓글과 새로 로드된 댓글 병합 (중복 제거)
        const existingIds = new Set(comments.map((c) => c.workoutCommentSeq));
        const newComments = response.comments.filter(
          (c) => !existingIds.has(c.workoutCommentSeq)
        );
        setComments([...comments, ...newComments]);
      }

      // 총 개수 설정
      setTotalCount(response.totalCount);
      setPage(nextPage);

      // 아직 더 불러올 댓글이 있는지 확인
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
        workoutCommentSeq: -1, // 임시 ID (API 응답 후 실제 ID로 대체됨)
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
          comment.workoutCommentSeq === -1 ? response.comment : comment
        )
      );
    } catch (error) {
      console.error("댓글 작성 중 오류가 발생했습니다:", error);
      // 에러 발생 시 임시 댓글 제거
      setComments(
        comments.filter((comment) => comment.workoutCommentSeq !== -1)
      );
      setTotalCount((prev) => prev - 1);
    }
  };

  // 대댓글 토글 핸들러
  const handleToggleReplies = async (commentId: number) => {
    // 이미 replyStates에 있는 경우, 펼침/접힘 상태만 토글
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

    // 초기 상태 설정
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
      // 대댓글 가져오기
      const response: RepliesResponse = await getRepliesAPI(commentId);

      // 상태 업데이트
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
      console.error("대댓글 로드 중 오류 발생:", error);
      // 오류 발생 시 상태 초기화
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

    // 로딩 상태로 변경
    setReplyStates((prev) => ({
      ...prev,
      [commentId]: {
        ...prev[commentId],
        isLoading: true,
      },
    }));

    try {
      // 추가 대댓글 가져오기
      let cursor: number | undefined = undefined;
      if (currentState.nextCursor !== null) {
        cursor = currentState.nextCursor;
      }

      const response: RepliesResponse = await getRepliesAPI(commentId, cursor);

      // 기존 댓글과 새로 로드된 댓글 병합
      const updatedReplies = [...currentState.replies, ...response.replies];

      // 상태 업데이트
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
      // 오류 발생 시 로딩 상태만 초기화
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
    // 댓글 업데이트 시 대댓글 상태도 초기화될 수 있으므로 필요시 로직 추가
  };

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
                targetReplyId={replyCommentId}
                targetReplyRef={
                  isReplyNotification &&
                  comment.workoutCommentSeq === parentCommentId
                    ? targetReplyRef
                    : undefined
                }
              />
            ))}

            {/* 댓글 더 불러오기 버튼 */}
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

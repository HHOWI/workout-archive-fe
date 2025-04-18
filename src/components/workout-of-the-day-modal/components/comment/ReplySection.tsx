import React, { useRef, useCallback, useEffect } from "react";
import { Box, CircularProgress } from "@mui/material";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import { Comment } from "../../../../api/comment";
import ReplyItem from "./ReplyItem";
import {
  RepliesToggleButton,
  ReplyLoaderContainer,
  LoadMoreRepliesButton,
} from "./CommentSectionStyles";

interface ReplyState {
  isExpanded: boolean;
  isLoading: boolean;
  replies: Comment[];
  nextCursor: number | null;
  hasMore: boolean;
}

interface ReplySectionProps {
  commentId: number;
  childCommentsCount?: number;
  replyState: ReplyState;
  workoutId: number;
  onToggleReplies: (commentId: number) => void;
  onLoadMoreReplies: (commentId: number) => void;
  onUpdateComments: () => void;
  targetReplyId?: number;
  targetReplyRef?: React.RefObject<HTMLDivElement>;
}

const ReplySection: React.FC<ReplySectionProps> = ({
  commentId,
  childCommentsCount = 0,
  replyState,
  workoutId,
  onToggleReplies,
  onLoadMoreReplies,
  onUpdateComments,
  targetReplyId,
  targetReplyRef,
}) => {
  const observer = useRef<IntersectionObserver | null>(null);
  const lastReplyElementRef = useRef<Record<number, HTMLDivElement | null>>({});

  // 무한 스크롤 핸들러
  const lastReplyRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (replyState?.isLoading) return;

      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && replyState?.hasMore) {
          onLoadMoreReplies(commentId);
        }
      });

      if (node) {
        observer.current.observe(node);
        lastReplyElementRef.current[commentId] = node;
      }
    },
    [replyState?.isLoading, replyState?.hasMore, commentId, onLoadMoreReplies]
  );

  // 컴포넌트 언마운트 시 observer 정리
  useEffect(() => {
    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, []);

  // 댓글 수가 0이면 아무것도 렌더링하지 않음
  if (!childCommentsCount || childCommentsCount <= 0) {
    return null;
  }

  return (
    <>
      {/* 대댓글 펼치기/접기 버튼 */}
      <RepliesToggleButton onClick={() => onToggleReplies(commentId)}>
        {replyState?.isExpanded ? (
          <>
            <KeyboardArrowUp fontSize="small" /> 답글 접기 ({childCommentsCount}
            )
          </>
        ) : (
          <>
            <KeyboardArrowDown fontSize="small" /> 답글 {childCommentsCount}개
            보기
          </>
        )}
      </RepliesToggleButton>

      {/* 대댓글 목록 */}
      {replyState?.isExpanded && (
        <>
          {/* 로딩 중일 때 표시 */}
          {replyState.isLoading && replyState.replies.length === 0 ? (
            <ReplyLoaderContainer>
              <CircularProgress size={24} color="primary" />
            </ReplyLoaderContainer>
          ) : (
            <>
              {/* 대댓글 목록 렌더링 */}
              {replyState.replies.map((reply, index) => {
                const isLastReply = index === replyState.replies.length - 1;
                const isTargetReply = targetReplyId === reply.workoutCommentSeq;

                // ref 설정 로직
                let itemRef: React.Ref<HTMLDivElement> | undefined = undefined;
                if (isTargetReply) {
                  itemRef = targetReplyRef;
                } else if (isLastReply && replyState.hasMore) {
                  itemRef = lastReplyRef;
                }

                return (
                  <ReplyItem
                    key={reply.workoutCommentSeq}
                    reply={reply}
                    workoutId={workoutId}
                    ref={itemRef} // 계산된 ref 사용
                    onUpdateComments={onUpdateComments}
                    isTarget={isTargetReply}
                    parentCommentId={commentId}
                  />
                );
              })}

              {/* 더 보기 버튼 */}
              {replyState.hasMore && !observer.current && (
                <LoadMoreRepliesButton
                  onClick={() => onLoadMoreReplies(commentId)}
                  disabled={replyState.isLoading}
                >
                  {replyState.isLoading ? (
                    <CircularProgress size={16} />
                  ) : (
                    "답글 더 보기"
                  )}
                </LoadMoreRepliesButton>
              )}
            </>
          )}
        </>
      )}
    </>
  );
};

export default ReplySection;

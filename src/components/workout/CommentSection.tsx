import React, { useState, useEffect, useRef } from "react";
import { Box, CircularProgress, Divider, Typography } from "@mui/material";
import { Comment as CommentIcon } from "@mui/icons-material";
import {
  getCommentsAPI,
  createCommentAPI,
  Comment,
  CommentListResponse,
} from "../../api/comment";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
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
}

// 메인 컴포넌트
const CommentSection: React.FC<CommentSectionProps> = ({
  workoutId,
  targetCommentId,
}) => {
  const navigate = useNavigate();
  const [comments, setComments] = useState<Comment[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const targetCommentRef = useRef<HTMLDivElement>(null);
  const userInfo = useSelector((state: any) => state.auth.userInfo);

  // 댓글 불러오기
  const fetchComments = async (reset = false, pageNumber?: number) => {
    try {
      // 이미 로딩 중이면 중복 요청 방지
      if (loading || loadingMore) return;

      // 첫 페이지를 로드하는 경우 로딩 상태 표시
      if (reset) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      // pageNumber가 전달되면 그 값을 사용, 아니면 reset 여부에 따라 결정
      const fetchPage = pageNumber ? pageNumber : reset ? 1 : page;

      const response: CommentListResponse = await getCommentsAPI(
        workoutId,
        fetchPage
      );

      if (reset) {
        setComments(response.comments);
        setPage(1);
      } else {
        // 새로운 댓글만 추가 (중복 방지)
        setComments((prev) => {
          // 이미 불러온 댓글 ID 목록
          const existingIds = new Set(prev.map((c) => c.workoutCommentSeq));

          // 중복되지 않는 새 댓글만 필터링
          const newComments = response.comments.filter(
            (comment) => !existingIds.has(comment.workoutCommentSeq)
          );

          return [...prev, ...newComments];
        });

        // 페이지 번호를 명시적으로 업데이트
        setPage(fetchPage);
      }

      setTotalCount(response.totalCount);

      // 서버에서 받은 댓글 수가 요청한 limit(10)보다 적으면 더 이상 로드할 댓글이 없음
      setHasMore(response.comments.length === 10);

      if (reset) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (error) {
      console.error("댓글을 불러오는 중 오류가 발생했습니다:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // 초기 로딩
  useEffect(() => {
    if (workoutId) {
      fetchComments(true);
    }
  }, [workoutId]);

  // 특정 댓글로 스크롤
  useEffect(() => {
    if (targetCommentId && !loading && comments.length > 0) {
      // 모든 댓글 찾기 (일반 댓글 + 답글)
      const allComments = comments.reduce((acc: number[], comment) => {
        acc.push(comment.workoutCommentSeq);
        return acc;
      }, []);

      // 대상 댓글이 현재 로드된 댓글 목록에 있는지 확인
      if (allComments.includes(targetCommentId)) {
        // 약간의 지연 후 스크롤 (DOM이 완전히 렌더링되도록)
        setTimeout(() => {
          const element = document.getElementById(`comment-${targetCommentId}`);
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
            // 하이라이트 효과
            element.classList.add("highlight-comment");
            setTimeout(() => {
              element.classList.remove("highlight-comment");
            }, 2000);
          }
        }, 500);
      }
    }
  }, [targetCommentId, loading, comments]);

  // 댓글 작성 핸들러
  const handleSubmitComment = async (text: string) => {
    if (!text.trim() || !userInfo) return;

    try {
      await createCommentAPI(workoutId, text);
      fetchComments(true);
      setCommentText("");
    } catch (error) {
      console.error("댓글 작성 중 오류가 발생했습니다:", error);
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
  };

  return (
    <CommentContainer elevation={0}>
      <CommentHeader>
        <CommentTitle variant="h6">
          <CommentIcon sx={{ fontSize: 18, color: "#666" }} />
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
                  targetCommentId === comment.workoutCommentSeq
                    ? targetCommentRef
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

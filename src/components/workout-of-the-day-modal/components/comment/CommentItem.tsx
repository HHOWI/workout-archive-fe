import React, { forwardRef, useState, useEffect } from "react";
import {
  Box,
  Button,
  IconButton,
  Typography,
  useTheme,
  alpha,
} from "@mui/material";
import { ThumbUp, ThumbUpOutlined, MoreVert, Reply } from "@mui/icons-material";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Comment,
  getRepliesAPI,
  createCommentAPI,
  RepliesResponse,
} from "../../../../api/comment";
import { getImageUrl } from "../../../../utils/imageUtils";
import { formatDisplayDate } from "../../../../utils/dateUtils";
import { useCommentActions } from "../../../../hooks/useCommentActions";
import { useCommentLike } from "../../../../hooks/useCommentLike";
import CommentForm from "./CommentForm";
import ReplySection from "./ReplySection";
import {
  CommentItemContainer,
  CommentContent,
  CommentText,
  CommentMeta,
  AuthorAvatar,
  CommentAuthor,
  CommentTime,
  UserInfoContainer,
  LikeButton,
  ActionButton,
  CommentMenu,
  MenuOptions,
  MenuItem,
  CommentInput,
  ReplyForm,
  ReplyIcon,
  CommentHeaderActions,
} from "./CommentSectionStyles";

interface ReplyState {
  isExpanded: boolean;
  isLoading: boolean;
  replies: Comment[];
  nextCursor: number | null;
  hasMore: boolean;
}

interface CommentItemProps {
  comment: Comment;
  workoutId: number;
  targetCommentId?: number;
  onUpdateComments: () => void;
  isTarget?: boolean; // 알림 대상 대댓글인지 여부
  replyState?: ReplyState; // 대댓글 상태
  onToggleReplies?: (commentId: number) => void; // 대댓글 토글 함수
  onLoadMoreReplies?: (commentId: number) => void; // 대댓글 더 불러오기 함수
  targetReplyId?: number; // 알림 대상 대댓글 ID
  targetReplyRef?: React.RefObject<HTMLDivElement>; // 타겟 대댓글 ref

  // ===== 낙관적 업데이트 콜백 타입 추가 =====
  onAddReplyOptimistic: (parentId: number, tempReply: Comment) => void;
  onReplaceTempReply: (parentId: number, realReply: Comment) => void;
  onRemoveTempReply: (parentId: number) => void;
  // ===================================
}

const CommentItem = forwardRef<HTMLDivElement, CommentItemProps>(
  (
    {
      comment,
      workoutId,
      targetCommentId,
      onUpdateComments,
      isTarget,
      replyState,
      onToggleReplies,
      onLoadMoreReplies,
      targetReplyId,
      targetReplyRef,
      onAddReplyOptimistic,
      onReplaceTempReply,
      onRemoveTempReply,
    },
    ref
  ) => {
    const navigate = useNavigate();
    const [activeReplyForm, setActiveReplyForm] = useState<number | null>(null);
    const [replyText, setReplyText] = useState("");
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);
    const [localReplyState, setLocalReplyState] = useState<ReplyState>({
      isExpanded: false,
      isLoading: false,
      replies: [],
      nextCursor: null,
      hasMore: true,
    });
    const [isHighlighted, setIsHighlighted] = useState(false);

    // 실제 사용할 replyState (props에서 받은 것 또는 로컬 상태)
    const effectiveReplyState = replyState || localReplyState;

    // 초기 렌더링 시 하이라이트 효과 적용
    useEffect(() => {
      // 알림으로 직접 타겟팅된 댓글이거나, 기존 방식대로 targetCommentId가 일치하는 경우
      if (isTarget || targetCommentId === comment.workoutCommentSeq) {
        setIsHighlighted(true);
      }
    }, [targetCommentId, comment.workoutCommentSeq, isTarget]);

    const theme = useTheme();
    const userInfo = useSelector((state: any) => state.auth.userInfo);

    // 커스텀 훅 사용
    const { likedComment, handleToggleLike, isLiking } = useCommentLike({
      comment,
      isReply: false,
    });

    const {
      isEditing,
      editText,
      setEditText,
      isDeleting,
      isUpdating,
      startEditing,
      cancelEditing,
      handleUpdateComment: updateCommentHandler,
      handleDeleteComment: deleteCommentHandler,
    } = useCommentActions({
      commentId: comment.workoutCommentSeq,
      onUpdateSuccess: onUpdateComments,
      onDeleteSuccess: onUpdateComments,
    });

    // 메뉴 토글
    const toggleMenu = (commentId: number) => {
      setOpenMenuId(openMenuId === commentId ? null : commentId);
    };

    // 대댓글 작성
    const handleSubmitReply = async (text: string) => {
      if (!text.trim() || !userInfo) return;

      const parentId = comment.workoutCommentSeq; // 부모 ID 저장
      // 임시 ID를 사용하도록 수정
      const TEMP_COMMENT_ID = -1;

      // 낙관적 업데이트를 위한 임시 대댓글
      const tempReply: Comment = {
        workoutCommentSeq: TEMP_COMMENT_ID, // 수정: 임시 ID 사용
        commentContent: text,
        commentLikes: 0,
        commentCreatedAt: new Date().toISOString(),
        isLiked: false,
        user: {
          userSeq: userInfo.userSeq,
          userNickname: userInfo.userNickname,
          profileImageUrl: userInfo.profileImageUrl || null,
        },
        // childCommentsCount는 대댓글이므로 0 또는 undefined
      };

      // === 수정: 부모 컴포넌트에 임시 댓글 추가 요청 ===
      onAddReplyOptimistic(parentId, tempReply);
      // =============================================

      setActiveReplyForm(null);
      setReplyText("");

      // === 수정: try 블록 복원 ===
      try {
        // API 호출로 실제 저장
        const response = await createCommentAPI(
          workoutId,
          text,
          comment.workoutCommentSeq
        );

        // === 수정: 부모 컴포넌트에 실제 댓글로 교체 요청 ===
        onReplaceTempReply(parentId, response.comment);
        // ==============================================
      } catch (error) {
        console.error("대댓글 작성 중 오류가 발생했습니다:", error);

        // === 수정: 부모 컴포넌트에 임시 댓글 제거 요청 ===
        onRemoveTempReply(parentId);
        // ============================================

        alert("대댓글 작성에 실패했습니다.");
      }
      // === 수정: try 블록 복원 끝 ===
    };

    // 대댓글 불러오기
    const fetchReplies = async (cursor?: number) => {
      if (effectiveReplyState.isLoading) return;

      setLocalReplyState({ ...effectiveReplyState, isLoading: true });

      try {
        const response: RepliesResponse = await getRepliesAPI(
          comment.workoutCommentSeq,
          cursor
        );
        const existingReplies = effectiveReplyState.replies || [];
        setLocalReplyState({
          isExpanded: true,
          isLoading: false,
          replies: cursor
            ? [...existingReplies, ...response.replies]
            : response.replies,
          nextCursor: response.nextCursor,
          hasMore: response.hasMore,
        });
      } catch (error) {
        console.error("대댓글을 불러오는 중 오류가 발생했습니다:", error);
        setLocalReplyState({ ...effectiveReplyState, isLoading: false });
        alert("대댓글 로딩에 실패했습니다.");
      }
    };

    // 댓글 토글 핸들러
    const handleToggleReplies = (commentId: number) => {
      if (onToggleReplies) {
        onToggleReplies(commentId);
      } else {
        // 로컬 상태 토글 (props에서 onToggleReplies가 없는 경우)
        setLocalReplyState((prev) => ({
          ...prev,
          isExpanded: !prev.isExpanded,
        }));
      }
    };

    // 대댓글 더 불러오기 핸들러
    const handleLoadMoreReplies = (commentId: number) => {
      if (onLoadMoreReplies) {
        onLoadMoreReplies(commentId);
      }
    };

    // 사용자 프로필로 이동
    const handleUserProfileClick = (userNickname: string) => {
      if (userNickname) {
        navigate(`/profile/${userNickname}`);
      }
    };

    return (
      <CommentItemContainer
        isReply={false}
        elevation={0}
        id={`comment-${comment.workoutCommentSeq}`}
        ref={ref}
        sx={
          isHighlighted
            ? {
                transition: "all 0.8s ease",
                backgroundColor: alpha(theme.palette.primary.light, 0.12),
                borderLeft: `4px solid ${theme.palette.primary.main}`,
                paddingLeft: "12px",
                marginLeft: "-16px",
                borderRadius: "4px",
                boxShadow: `0 2px 8px ${alpha(
                  theme.palette.primary.main,
                  0.15
                )}`,
              }
            : undefined
        }
      >
        <CommentContent>
          {isHighlighted && (
            <Typography
              variant="subtitle2"
              color="primary"
              sx={{
                mb: 1,
                fontWeight: 500,
                display: "flex",
                alignItems: "center",
                fontSize: "0.8rem",
                "&:before": {
                  content: '""',
                  display: "inline-block",
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  backgroundColor: theme.palette.primary.main,
                  marginRight: "6px",
                },
              }}
            >
              알림
            </Typography>
          )}
          <Box display="flex" justifyContent="space-between">
            <CommentMeta>
              <AuthorAvatar
                src={getImageUrl(likedComment.user.profileImageUrl, "profile", {
                  width: 50,
                  height: 50,
                  quality: 75,
                  format: "webp",
                })}
                alt={likedComment.user.userNickname}
                onClick={() =>
                  handleUserProfileClick(likedComment.user.userNickname)
                }
                sx={{ cursor: "pointer" }}
              />
              <UserInfoContainer>
                <CommentAuthor
                  variant="subtitle2"
                  onClick={() =>
                    handleUserProfileClick(likedComment.user.userNickname)
                  }
                  sx={{
                    cursor: "pointer",
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  {likedComment.user.userNickname}
                </CommentAuthor>
                <CommentTime variant="caption">
                  {formatDisplayDate(likedComment.commentCreatedAt)}
                </CommentTime>
              </UserInfoContainer>
            </CommentMeta>

            <Box display="flex" alignItems="center">
              {!isEditing && (
                <CommentHeaderActions>
                  <LikeButton
                    liked={!!likedComment.isLiked}
                    onClick={handleToggleLike}
                    disabled={isLiking || !userInfo}
                    startIcon={
                      likedComment.isLiked ? (
                        <ThumbUp fontSize="small" />
                      ) : (
                        <ThumbUpOutlined fontSize="small" />
                      )
                    }
                    size="small"
                    sx={{ minWidth: 0, padding: "4px 6px" }}
                  >
                    {likedComment.commentLikes > 0 && likedComment.commentLikes}
                  </LikeButton>

                  {userInfo && (
                    <ActionButton
                      onClick={() =>
                        setActiveReplyForm(comment.workoutCommentSeq)
                      }
                      startIcon={<ReplyIcon />}
                      size="small"
                      sx={{ minWidth: 0, padding: "4px 6px" }}
                    >
                      답글
                    </ActionButton>
                  )}
                </CommentHeaderActions>
              )}

              {userInfo && userInfo.userSeq === comment.user.userSeq && (
                <CommentMenu>
                  <IconButton
                    size="small"
                    onClick={() => toggleMenu(comment.workoutCommentSeq)}
                    sx={{ color: "#aaa", padding: "4px" }}
                    disabled={isEditing || isDeleting || isUpdating}
                  >
                    <MoreVert fontSize="small" />
                  </IconButton>

                  <MenuOptions
                    isOpen={openMenuId === comment.workoutCommentSeq}
                    elevation={1}
                  >
                    <MenuItem
                      onClick={() => {
                        startEditing(likedComment.commentContent);
                        setOpenMenuId(null);
                      }}
                      disabled={isEditing}
                    >
                      수정하기
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        if (
                          window.confirm("정말 이 댓글을 삭제하시겠습니까?")
                        ) {
                          deleteCommentHandler();
                        }
                        setOpenMenuId(null);
                      }}
                      sx={{ color: theme.palette.error.main }}
                      disabled={isDeleting || isEditing}
                    >
                      삭제하기
                    </MenuItem>
                  </MenuOptions>
                </CommentMenu>
              )}
            </Box>
          </Box>

          {isEditing ? (
            <Box mt={1.5}>
              <CommentInput
                fullWidth
                multiline
                variant="outlined"
                size="small"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                autoFocus
                minRows={2}
                disabled={isUpdating}
              />
              <Box display="flex" gap={1} mt={1}>
                <Button
                  size="small"
                  variant="contained"
                  onClick={updateCommentHandler}
                  disabled={isUpdating || !editText.trim()}
                  sx={{
                    borderRadius: "4px",
                    textTransform: "none",
                    boxShadow: "none",
                    fontSize: "12px",
                  }}
                >
                  {isUpdating ? "수정 중..." : "수정완료"}
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={cancelEditing}
                  disabled={isUpdating}
                  sx={{
                    borderRadius: "4px",
                    textTransform: "none",
                    fontSize: "12px",
                  }}
                >
                  취소
                </Button>
              </Box>
            </Box>
          ) : (
            <CommentText>{likedComment.commentContent}</CommentText>
          )}

          {activeReplyForm === comment.workoutCommentSeq && (
            <ReplyForm>
              <CommentForm
                onSubmit={handleSubmitReply}
                placeholder="답글을 작성하세요..."
                initialText={replyText}
                onTextChange={setReplyText}
                showSendIcon={true}
              />
            </ReplyForm>
          )}

          {/* 대댓글 섹션 */}
          {likedComment.childCommentsCount !== undefined &&
            likedComment.childCommentsCount > 0 && (
              <ReplySection
                commentId={comment.workoutCommentSeq}
                childCommentsCount={likedComment.childCommentsCount}
                replyState={effectiveReplyState}
                workoutId={workoutId}
                onToggleReplies={handleToggleReplies}
                onLoadMoreReplies={handleLoadMoreReplies}
                onUpdateComments={onUpdateComments}
                targetReplyId={targetReplyId}
                targetReplyRef={targetReplyRef}
              />
            )}
        </CommentContent>
      </CommentItemContainer>
    );
  }
);

export default CommentItem;

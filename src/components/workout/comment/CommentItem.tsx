import React, { forwardRef, useState, useRef, useEffect } from "react";
import {
  Box,
  Button,
  IconButton,
  Typography,
  useTheme,
  alpha,
} from "@mui/material";
import { ThumbUp, ThumbUpOutlined, MoreVert, Reply } from "@mui/icons-material";
import { format, formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Comment,
  updateCommentAPI,
  deleteCommentAPI,
  toggleCommentLikeAPI,
  getRepliesAPI,
  createCommentAPI,
  RepliesResponse,
  CommentLikeResponse,
} from "../../../api/comment";
import { getImageUrl } from "../../../utils/imageUtils";
import CommentForm from "./CommentForm";
import ReplySection from "./ReplySection";
import {
  CommentItemContainer,
  CommentContent,
  CommentText,
  CommentActions,
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
    },
    ref
  ) => {
    const navigate = useNavigate();
    const [editingCommentId, setEditingCommentId] = useState<number | null>(
      null
    );
    const [activeReplyForm, setActiveReplyForm] = useState<number | null>(null);
    const [replyText, setReplyText] = useState("");
    const [editText, setEditText] = useState("");
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);
    const [localReplyState, setLocalReplyState] = useState<ReplyState>({
      isExpanded: false,
      isLoading: false,
      replies: [],
      nextCursor: null,
      hasMore: true,
    });
    // 로컬 댓글 상태 추가
    const [localComment, setLocalComment] = useState<Comment>(comment);
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState(comment.commentContent);
    const [isHighlighted, setIsHighlighted] = useState(false);

    // 실제 사용할 replyState (props에서 받은 것 또는 로컬 상태)
    const effectiveReplyState = replyState || localReplyState;

    // props의 comment가 업데이트될 때 로컬 상태 동기화
    useEffect(() => {
      setLocalComment(comment);
    }, [comment]);

    // 초기 렌더링 시 하이라이트 효과 적용
    useEffect(() => {
      // 알림으로 직접 타겟팅된 댓글이거나, 기존 방식대로 targetCommentId가 일치하는 경우
      if (isTarget || targetCommentId === localComment.workoutCommentSeq) {
        setIsHighlighted(true);
        // 5초 후 하이라이트 효과 점진적으로 제거하는 로직 제거
        // const timer = setTimeout(() => {
        //   setIsHighlighted(false);
        // }, 5000);
        // return () => clearTimeout(timer);
      }
    }, [targetCommentId, localComment.workoutCommentSeq, isTarget]);

    const theme = useTheme();
    const userInfo = useSelector((state: any) => state.auth.userInfo);

    // 날짜 포맷팅
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = Math.abs(now.getTime() - date.getTime()) / 36e5;

      if (diffInHours < 24) {
        return formatDistanceToNow(date, { addSuffix: true, locale: ko });
      }
      return format(date, "yyyy.MM.dd HH:mm", { locale: ko });
    };

    // 메뉴 토글
    const toggleMenu = (commentId: number) => {
      setOpenMenuId(openMenuId === commentId ? null : commentId);
    };

    // 댓글 수정
    const handleUpdateComment = async (commentId: number) => {
      if (!editText.trim()) return;

      try {
        await updateCommentAPI(commentId, editText);
        onUpdateComments();
        setEditingCommentId(null);
        setEditText("");
      } catch (error) {
        console.error("댓글 수정 중 오류가 발생했습니다:", error);
      }
    };

    // 댓글 삭제
    const handleDeleteComment = async (commentId: number) => {
      if (!window.confirm("정말 이 댓글을 삭제하시겠습니까?")) return;

      try {
        await deleteCommentAPI(commentId);
        onUpdateComments();
      } catch (error) {
        console.error("댓글 삭제 중 오류가 발생했습니다:", error);
      }
    };

    // 좋아요 토글 - 로컬 상태만 업데이트하도록 수정
    const handleToggleLike = async (commentId: number) => {
      if (!userInfo) return;

      try {
        // 낙관적 UI 업데이트 (즉시 UI 반영)
        const currentIsLiked = localComment.isLiked || false;
        const currentLikes = localComment.commentLikes || 0;

        // 낙관적으로 UI 먼저 업데이트
        setLocalComment({
          ...localComment,
          isLiked: !currentIsLiked,
          commentLikes: currentIsLiked ? currentLikes - 1 : currentLikes + 1,
        });

        // API 호출
        const response: CommentLikeResponse = await toggleCommentLikeAPI(
          commentId
        );

        // API 응답으로 정확한 상태 반영
        setLocalComment({
          ...localComment,
          isLiked: response.isLiked,
          commentLikes: response.likeCount,
        });
      } catch (error) {
        console.error("좋아요 처리 중 오류가 발생했습니다:", error);
        // 오류 발생 시 원래 상태로 되돌림
        setLocalComment(comment);
      }
    };

    // 대댓글 작성
    const handleSubmitReply = async (text: string) => {
      if (!text.trim() || !userInfo) return;

      try {
        // 낙관적 UI 업데이트를 위한 임시 대댓글
        const tempReply: Comment = {
          workoutCommentSeq: -1, // 임시 ID
          commentContent: text,
          commentLikes: 0,
          commentCreatedAt: new Date().toISOString(),
          isLiked: false,
          user: {
            userSeq: userInfo.userSeq,
            userNickname: userInfo.userNickname,
            profileImageUrl: userInfo.profileImageUrl || null,
          },
        };

        // 낙관적으로 UI 업데이트 (childCommentsCount 증가 및 UI에 임시 대댓글 추가)
        setLocalComment((prev) => ({
          ...prev,
          childCommentsCount: (prev.childCommentsCount || 0) + 1,
        }));

        // 대댓글 목록이 이미 로드되어 있으면 UI에 임시 대댓글 추가
        if (
          effectiveReplyState.isExpanded &&
          effectiveReplyState.replies.length > 0
        ) {
          setLocalReplyState((prev) => ({
            ...prev,
            replies: [tempReply, ...prev.replies],
          }));
        }

        // 대댓글 입력 폼 닫기
        setActiveReplyForm(null);
        setReplyText("");

        // API 호출로 실제 저장
        const response = await createCommentAPI(
          workoutId,
          text,
          localComment.workoutCommentSeq
        );

        // 대댓글 목록이 이미 로드되어 있으면 임시 대댓글을 실제 대댓글로 대체
        if (
          effectiveReplyState.isExpanded &&
          effectiveReplyState.replies.length > 0
        ) {
          setLocalReplyState((prev) => ({
            ...prev,
            replies: prev.replies.map((reply) =>
              reply.workoutCommentSeq === -1 ? response.comment : reply
            ),
          }));
        } else {
          // 대댓글 목록을 아직 로드하지 않았다면, 대댓글 목록 로드
          fetchReplies();
        }
      } catch (error) {
        console.error("대댓글 작성 중 오류가 발생했습니다:", error);
        // 에러 발생 시 롤백
        setLocalComment(comment);

        // 대댓글 목록이 이미 로드되어 있으면 임시 대댓글 제거
        if (
          effectiveReplyState.isExpanded &&
          effectiveReplyState.replies.length > 0
        ) {
          setLocalReplyState((prev) => ({
            ...prev,
            replies: prev.replies.filter(
              (reply) => reply.workoutCommentSeq !== -1
            ),
          }));
        }
      }
    };

    // 대댓글 불러오기
    const fetchReplies = async (cursor?: number) => {
      // 이미 로딩 중인 경우 중복 요청 방지
      if (effectiveReplyState.isLoading) return;

      try {
        // 상태 업데이트: 로딩 중 표시
        setLocalReplyState({
          ...effectiveReplyState,
          isLoading: true,
        });

        const response: RepliesResponse = await getRepliesAPI(
          localComment.workoutCommentSeq,
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
        setLocalReplyState({
          ...effectiveReplyState,
          isLoading: false,
        });
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
        id={`comment-${localComment.workoutCommentSeq}`}
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
              알림에서 이동한 댓글
            </Typography>
          )}
          <Box display="flex" justifyContent="space-between">
            <CommentMeta>
              <AuthorAvatar
                src={getImageUrl(localComment.user.profileImageUrl)}
                alt={localComment.user.userNickname}
                onClick={() =>
                  handleUserProfileClick(localComment.user.userNickname)
                }
                sx={{ cursor: "pointer" }}
              >
                {!localComment.user.profileImageUrl &&
                  localComment.user.userNickname?.substring(0, 1)}
              </AuthorAvatar>
              <UserInfoContainer>
                <CommentAuthor
                  variant="subtitle2"
                  onClick={() =>
                    handleUserProfileClick(localComment.user.userNickname)
                  }
                  sx={{
                    cursor: "pointer",
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  {localComment.user.userNickname}
                </CommentAuthor>
                <CommentTime variant="caption">
                  {formatDate(localComment.commentCreatedAt)}
                </CommentTime>
              </UserInfoContainer>
            </CommentMeta>

            <Box display="flex" alignItems="center">
              {!editingCommentId && (
                <CommentHeaderActions>
                  <LikeButton
                    liked={!!localComment.isLiked}
                    onClick={() =>
                      handleToggleLike(localComment.workoutCommentSeq)
                    }
                    startIcon={
                      localComment.isLiked ? (
                        <ThumbUp fontSize="small" />
                      ) : (
                        <ThumbUpOutlined fontSize="small" />
                      )
                    }
                    size="small"
                    sx={{ minWidth: 0, padding: "4px 6px" }}
                  >
                    {localComment.commentLikes > 0 && localComment.commentLikes}
                  </LikeButton>

                  {userInfo && (
                    <ActionButton
                      onClick={() =>
                        setActiveReplyForm(localComment.workoutCommentSeq)
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

              {userInfo && userInfo.userSeq === localComment.user.userSeq && (
                <CommentMenu>
                  <IconButton
                    size="small"
                    onClick={() => toggleMenu(localComment.workoutCommentSeq)}
                    sx={{ color: "#aaa", padding: "4px" }}
                  >
                    <MoreVert fontSize="small" />
                  </IconButton>

                  <MenuOptions
                    isOpen={openMenuId === localComment.workoutCommentSeq}
                    elevation={1}
                  >
                    <MenuItem
                      onClick={() => {
                        setEditingCommentId(localComment.workoutCommentSeq);
                        setEditText(localComment.commentContent);
                        setOpenMenuId(null);
                      }}
                    >
                      수정하기
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        handleDeleteComment(localComment.workoutCommentSeq);
                        setOpenMenuId(null);
                      }}
                      sx={{ color: theme.palette.error.main }}
                    >
                      삭제하기
                    </MenuItem>
                  </MenuOptions>
                </CommentMenu>
              )}
            </Box>
          </Box>

          {editingCommentId === localComment.workoutCommentSeq ? (
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
              />
              <Box display="flex" gap={1} mt={1}>
                <Button
                  size="small"
                  variant="contained"
                  onClick={() =>
                    handleUpdateComment(localComment.workoutCommentSeq)
                  }
                  sx={{
                    borderRadius: "4px",
                    textTransform: "none",
                    boxShadow: "none",
                    fontSize: "12px",
                  }}
                >
                  수정완료
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => setEditingCommentId(null)}
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
            <CommentText>{localComment.commentContent}</CommentText>
          )}

          {activeReplyForm === localComment.workoutCommentSeq && (
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
          {localComment.childCommentsCount !== undefined &&
            localComment.childCommentsCount > 0 && (
              <ReplySection
                commentId={localComment.workoutCommentSeq}
                childCommentsCount={localComment.childCommentsCount}
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

import React, { forwardRef, useState, useRef } from "react";
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

interface CommentItemProps {
  comment: Comment;
  workoutId: number;
  targetCommentId?: number;
  onUpdateComments: () => void;
}

// 대댓글 상태 관리를 위한 인터페이스
interface ReplyState {
  isExpanded: boolean;
  isLoading: boolean;
  replies: Comment[];
  nextCursor: number | null;
  hasMore: boolean;
}

const CommentItem = forwardRef<HTMLDivElement, CommentItemProps>(
  ({ comment, workoutId, targetCommentId, onUpdateComments }, ref) => {
    const navigate = useNavigate();
    const [editingCommentId, setEditingCommentId] = useState<number | null>(
      null
    );
    const [activeReplyForm, setActiveReplyForm] = useState<number | null>(null);
    const [replyText, setReplyText] = useState("");
    const [editText, setEditText] = useState("");
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);
    const [replyState, setReplyState] = useState<ReplyState>({
      isExpanded: false,
      isLoading: false,
      replies: [],
      nextCursor: null,
      hasMore: true,
    });

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

    // 좋아요 토글
    const handleToggleLike = async (commentId: number) => {
      if (!userInfo) return;

      try {
        await toggleCommentLikeAPI(commentId);
        onUpdateComments();
      } catch (error) {
        console.error("좋아요 처리 중 오류가 발생했습니다:", error);
      }
    };

    // 대댓글 작성
    const handleSubmitReply = async (text: string) => {
      if (!text.trim() || !userInfo) return;

      try {
        await createCommentAPI(workoutId, text, comment.workoutCommentSeq);
        onUpdateComments();
        setActiveReplyForm(null);

        // 대댓글 상태 초기화 (새로 불러올 수 있도록)
        setReplyState({
          ...replyState,
          replies: [],
          nextCursor: null,
          hasMore: true,
        });

        // 새 대댓글을 보여주기 위해 대댓글 목록 다시 로드
        fetchReplies();
      } catch (error) {
        console.error("대댓글 작성 중 오류가 발생했습니다:", error);
      }
    };

    // 대댓글 불러오기
    const fetchReplies = async (cursor?: number) => {
      // 이미 로딩 중인 경우 중복 요청 방지
      if (replyState.isLoading) return;

      try {
        // 상태 업데이트: 로딩 중 표시
        setReplyState({
          ...replyState,
          isLoading: true,
        });

        const response: RepliesResponse = await getRepliesAPI(
          comment.workoutCommentSeq,
          cursor
        );

        const existingReplies = replyState.replies || [];
        setReplyState({
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
        setReplyState({
          ...replyState,
          isLoading: false,
        });
      }
    };

    // 댓글 토글 핸들러
    const handleToggleReplies = () => {
      if (replyState.isExpanded) {
        // 접기: 상태는 유지하고 UI만 숨김
        setReplyState({
          ...replyState,
          isExpanded: false,
        });
      } else {
        // 이미 대댓글을 불러왔는지 확인
        if (replyState.replies?.length > 0) {
          // 이미 불러온 대댓글이 있으면 UI만 펼침
          setReplyState({
            ...replyState,
            isExpanded: true,
          });
        } else {
          // 대댓글을 아직 불러오지 않았으면 API 호출
          fetchReplies();
        }
      }
    };

    // 대댓글 추가 로드 핸들러
    const handleLoadMoreReplies = () => {
      if (replyState.nextCursor) {
        fetchReplies(replyState.nextCursor);
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
          targetCommentId === comment.workoutCommentSeq
            ? {
                transition: "background-color 0.3s ease",
                "&.highlight-comment": {
                  backgroundColor: alpha(theme.palette.primary.light, 0.08),
                },
              }
            : undefined
        }
      >
        <CommentContent>
          <Box display="flex" justifyContent="space-between">
            <CommentMeta>
              <AuthorAvatar
                src={getImageUrl(comment.user.profileImageUrl)}
                alt={comment.user.userNickname}
                onClick={() =>
                  handleUserProfileClick(comment.user.userNickname)
                }
                sx={{ cursor: "pointer" }}
              >
                {!comment.user.profileImageUrl &&
                  comment.user.userNickname?.substring(0, 1)}
              </AuthorAvatar>
              <UserInfoContainer>
                <CommentAuthor
                  variant="subtitle2"
                  onClick={() =>
                    handleUserProfileClick(comment.user.userNickname)
                  }
                  sx={{
                    cursor: "pointer",
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  {comment.user.userNickname}
                </CommentAuthor>
                <CommentTime variant="caption">
                  {formatDate(comment.commentCreatedAt)}
                </CommentTime>
              </UserInfoContainer>
            </CommentMeta>

            <Box display="flex" alignItems="center">
              {!editingCommentId && (
                <CommentHeaderActions>
                  <LikeButton
                    liked={!!comment.isLiked}
                    onClick={() => handleToggleLike(comment.workoutCommentSeq)}
                    startIcon={
                      comment.isLiked ? (
                        <ThumbUp fontSize="small" />
                      ) : (
                        <ThumbUpOutlined fontSize="small" />
                      )
                    }
                    size="small"
                    sx={{ minWidth: 0, padding: "4px 6px" }}
                  >
                    {comment.commentLikes > 0 && comment.commentLikes}
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
                  >
                    <MoreVert fontSize="small" />
                  </IconButton>

                  <MenuOptions
                    isOpen={openMenuId === comment.workoutCommentSeq}
                    elevation={1}
                  >
                    <MenuItem
                      onClick={() => {
                        setEditingCommentId(comment.workoutCommentSeq);
                        setEditText(comment.commentContent);
                        setOpenMenuId(null);
                      }}
                    >
                      수정하기
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        handleDeleteComment(comment.workoutCommentSeq);
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

          {editingCommentId === comment.workoutCommentSeq ? (
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
                  onClick={() => handleUpdateComment(comment.workoutCommentSeq)}
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
            <CommentText>{comment.commentContent}</CommentText>
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
          {comment.childCommentsCount !== undefined &&
            comment.childCommentsCount > 0 && (
              <ReplySection
                commentId={comment.workoutCommentSeq}
                childCommentsCount={comment.childCommentsCount}
                replyState={replyState}
                workoutId={workoutId}
                onToggleReplies={handleToggleReplies}
                onLoadMoreReplies={handleLoadMoreReplies}
                onUpdateComments={onUpdateComments}
              />
            )}
        </CommentContent>
      </CommentItemContainer>
    );
  }
);

export default CommentItem;

import React, { forwardRef, useState, useEffect } from "react";
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Typography,
  useTheme,
  alpha,
} from "@mui/material";
import { ThumbUp, ThumbUpOutlined, MoreVert } from "@mui/icons-material";
import { format, formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Comment,
  updateCommentAPI,
  deleteCommentAPI,
  toggleCommentLikeAPI,
  CommentLikeResponse,
} from "../../../api/comment";
import { getImageUrl } from "../../../utils/imageUtils";
import {
  CommentItemContainer,
  CommentContent,
  CommentText,
  CommentActions,
  CommentMeta,
  ReplyAuthorAvatar,
  CommentAuthor,
  CommentTime,
  UserInfoContainer,
  LikeButton,
  CommentMenu,
  MenuOptions,
  MenuItem,
  CommentInput,
  ReplyIndicator,
  CommentHeaderActions,
} from "./CommentSectionStyles";

interface ReplyItemProps {
  reply: Comment;
  workoutId: number;
  onUpdateComments: () => void;
  isTarget?: boolean;
}

const ReplyItem = forwardRef<HTMLDivElement, ReplyItemProps>(
  ({ reply, workoutId, onUpdateComments, isTarget }, ref) => {
    console.log(`ReplyItem (${reply.workoutCommentSeq}) received props:`, {
      isTarget,
    });

    const navigate = useNavigate();
    const [editingCommentId, setEditingCommentId] = useState<number | null>(
      null
    );
    const [editText, setEditText] = useState("");
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);
    const [localReply, setLocalReply] = useState<Comment>(reply);
    const [isHighlighted, setIsHighlighted] = useState(false);
    const theme = useTheme();

    useEffect(() => {
      setLocalReply(reply);
    }, [reply]);

    useEffect(() => {
      console.log(
        `ReplyItem (${reply.workoutCommentSeq}) Highlight effect check: isTarget=${isTarget}`
      );
      if (isTarget) {
        console.log(
          `ReplyItem (${reply.workoutCommentSeq}): Applying highlight`
        );
        setIsHighlighted(true);
      }
    }, [isTarget, reply.workoutCommentSeq]);

    const userInfo = useSelector((state: any) => state.auth.userInfo);

    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = Math.abs(now.getTime() - date.getTime()) / 36e5;

      if (diffInHours < 24) {
        return formatDistanceToNow(date, { addSuffix: true, locale: ko });
      }
      return format(date, "yyyy.MM.dd HH:mm", { locale: ko });
    };

    const toggleMenu = (commentId: number) => {
      setOpenMenuId(openMenuId === commentId ? null : commentId);
    };

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

    const handleDeleteComment = async (commentId: number) => {
      if (!window.confirm("정말 이 답글을 삭제하시겠습니까?")) return;

      try {
        await deleteCommentAPI(commentId);
        onUpdateComments();
      } catch (error) {
        console.error("댓글 삭제 중 오류가 발생했습니다:", error);
      }
    };

    const handleToggleLike = async (commentId: number) => {
      if (!userInfo) return;

      try {
        const currentIsLiked = localReply.isLiked || false;
        const currentLikes = localReply.commentLikes || 0;

        setLocalReply({
          ...localReply,
          isLiked: !currentIsLiked,
          commentLikes: currentIsLiked ? currentLikes - 1 : currentLikes + 1,
        });

        const response: CommentLikeResponse = await toggleCommentLikeAPI(
          commentId
        );

        setLocalReply({
          ...localReply,
          isLiked: response.isLiked,
          commentLikes: response.likeCount,
        });
      } catch (error) {
        console.error("좋아요 처리 중 오류가 발생했습니다:", error);
        setLocalReply(reply);
      }
    };

    const handleUserProfileClick = (userNickname: string) => {
      if (userNickname) {
        navigate(`/profile/${userNickname}`);
      }
    };

    return (
      <CommentItemContainer
        isReply={true}
        elevation={0}
        ref={ref}
        id={`comment-${localReply.workoutCommentSeq}`}
        sx={
          isHighlighted
            ? {
                transition: "all 0.8s ease",
                backgroundColor: alpha(theme.palette.primary.light, 0.12),
                borderLeft: `4px solid ${theme.palette.primary.main}`,
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
              알림에서 이동한 답글
            </Typography>
          )}
          <Box display="flex" justifyContent="space-between">
            <CommentMeta>
              <ReplyAuthorAvatar
                src={getImageUrl(localReply.user.profileImageUrl)}
                alt={localReply.user.userNickname}
                onClick={() =>
                  handleUserProfileClick(localReply.user.userNickname)
                }
                sx={{ cursor: "pointer" }}
              >
                {!localReply.user.profileImageUrl &&
                  localReply.user.userNickname?.substring(0, 1)}
              </ReplyAuthorAvatar>
              <UserInfoContainer>
                <CommentAuthor
                  variant="subtitle2"
                  onClick={() =>
                    handleUserProfileClick(localReply.user.userNickname)
                  }
                  sx={{
                    cursor: "pointer",
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  {localReply.user.userNickname}
                </CommentAuthor>
                <CommentTime variant="caption">
                  {formatDate(localReply.commentCreatedAt)}
                </CommentTime>
              </UserInfoContainer>
            </CommentMeta>

            <Box display="flex" alignItems="center">
              {!editingCommentId && (
                <CommentHeaderActions>
                  <LikeButton
                    liked={!!localReply.isLiked}
                    onClick={() =>
                      handleToggleLike(localReply.workoutCommentSeq)
                    }
                    startIcon={
                      localReply.isLiked ? (
                        <ThumbUp fontSize="small" />
                      ) : (
                        <ThumbUpOutlined fontSize="small" />
                      )
                    }
                    size="small"
                    sx={{ minWidth: 0, padding: "4px 6px" }}
                  >
                    {localReply.commentLikes > 0 && localReply.commentLikes}
                  </LikeButton>
                </CommentHeaderActions>
              )}

              {userInfo && userInfo.userSeq === localReply.user.userSeq && (
                <CommentMenu>
                  <IconButton
                    size="small"
                    onClick={() => toggleMenu(localReply.workoutCommentSeq)}
                    sx={{ color: "#aaa", padding: "4px" }}
                  >
                    <MoreVert fontSize="small" />
                  </IconButton>

                  <MenuOptions
                    isOpen={openMenuId === localReply.workoutCommentSeq}
                    elevation={1}
                  >
                    <MenuItem
                      onClick={() => {
                        setEditingCommentId(localReply.workoutCommentSeq);
                        setEditText(localReply.commentContent);
                        setOpenMenuId(null);
                      }}
                    >
                      수정하기
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        handleDeleteComment(localReply.workoutCommentSeq);
                        setOpenMenuId(null);
                      }}
                      sx={{ color: "error.main" }}
                    >
                      삭제하기
                    </MenuItem>
                  </MenuOptions>
                </CommentMenu>
              )}
            </Box>
          </Box>

          {editingCommentId === localReply.workoutCommentSeq ? (
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
                    handleUpdateComment(localReply.workoutCommentSeq)
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
            <CommentText>{localReply.commentContent}</CommentText>
          )}
        </CommentContent>
      </CommentItemContainer>
    );
  }
);

export default ReplyItem;

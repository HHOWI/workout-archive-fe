import React, { forwardRef, useState, useEffect } from "react";
import {
  Box,
  Button,
  IconButton,
  Typography,
  useTheme,
  alpha,
} from "@mui/material";
import { ThumbUp, ThumbUpOutlined, MoreVert } from "@mui/icons-material";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Comment,
  updateCommentAPI,
  deleteCommentAPI,
  toggleReplyLikeAPI,
  CommentLikeResponse,
} from "../../../../api/comment";
import { getImageUrl } from "../../../../utils/imageUtils";
import { formatDisplayDate } from "../../../../utils/dateUtils";
import { useCommentActions } from "../../../../hooks/useCommentActions";
import { useCommentLike } from "../../../../hooks/useCommentLike";
import {
  CommentItemContainer,
  CommentContent,
  CommentText,
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
  CommentHeaderActions,
} from "./CommentSectionStyles";

interface ReplyItemProps {
  reply: Comment;
  workoutId: number;
  onUpdateComments: () => void;
  isTarget?: boolean;
  parentCommentId: number;
}

const ReplyItem = forwardRef<HTMLDivElement, ReplyItemProps>(
  ({ reply, workoutId, onUpdateComments, isTarget, parentCommentId }, ref) => {
    const navigate = useNavigate();
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);
    const [isHighlighted, setIsHighlighted] = useState(false);
    const theme = useTheme();

    useEffect(() => {
      if (isTarget) {
        setIsHighlighted(true);
      }
    }, [isTarget, reply.workoutCommentSeq]);

    const userInfo = useSelector((state: any) => state.auth.userInfo);

    const { likedComment, handleToggleLike, isLiking } = useCommentLike({
      comment: reply,
      isReply: true,
      parentCommentId: parentCommentId,
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
      commentId: reply.workoutCommentSeq,
      onUpdateSuccess: onUpdateComments,
      onDeleteSuccess: onUpdateComments,
    });

    const toggleMenu = (commentId: number) => {
      setOpenMenuId(openMenuId === commentId ? null : commentId);
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
        id={`comment-${likedComment.workoutCommentSeq}`}
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
              알림
            </Typography>
          )}
          <Box display="flex" justifyContent="space-between">
            <CommentMeta>
              <ReplyAuthorAvatar
                src={getImageUrl(likedComment.user.profileImageUrl)}
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
                </CommentHeaderActions>
              )}

              {userInfo && userInfo.userSeq === likedComment.user.userSeq && (
                <CommentMenu>
                  <IconButton
                    size="small"
                    onClick={() => toggleMenu(likedComment.workoutCommentSeq)}
                    sx={{ color: "#aaa", padding: "4px" }}
                    disabled={isEditing || isDeleting || isUpdating}
                  >
                    <MoreVert fontSize="small" />
                  </IconButton>

                  <MenuOptions
                    isOpen={openMenuId === likedComment.workoutCommentSeq}
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
                          window.confirm("정말 이 답글을 삭제하시겠습니까?")
                        ) {
                          deleteCommentHandler();
                        }
                        setOpenMenuId(null);
                      }}
                      sx={{ color: "error.main" }}
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
        </CommentContent>
      </CommentItemContainer>
    );
  }
);

export default ReplyItem;

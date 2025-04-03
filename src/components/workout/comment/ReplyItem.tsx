import React, { forwardRef, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Typography,
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
}

const ReplyItem = forwardRef<HTMLDivElement, ReplyItemProps>(
  ({ reply, workoutId, onUpdateComments }, ref) => {
    const navigate = useNavigate();
    const [editingCommentId, setEditingCommentId] = useState<number | null>(
      null
    );
    const [editText, setEditText] = useState("");
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);
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
      if (!window.confirm("정말 이 답글을 삭제하시겠습니까?")) return;

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

    // 사용자 프로필로 이동
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
        id={`comment-${reply.workoutCommentSeq}`}
      >
        <CommentContent>
          <Box display="flex" justifyContent="space-between">
            <CommentMeta>
              <ReplyAuthorAvatar
                src={getImageUrl(reply.user.profileImageUrl)}
                alt={reply.user.userNickname}
                onClick={() => handleUserProfileClick(reply.user.userNickname)}
                sx={{ cursor: "pointer" }}
              >
                {!reply.user.profileImageUrl &&
                  reply.user.userNickname?.substring(0, 1)}
              </ReplyAuthorAvatar>
              <UserInfoContainer>
                <CommentAuthor
                  variant="subtitle2"
                  onClick={() =>
                    handleUserProfileClick(reply.user.userNickname)
                  }
                  sx={{
                    cursor: "pointer",
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  {reply.user.userNickname}
                </CommentAuthor>
                <CommentTime variant="caption">
                  {formatDate(reply.commentCreatedAt)}
                </CommentTime>
              </UserInfoContainer>
            </CommentMeta>

            <Box display="flex" alignItems="center">
              {!editingCommentId && (
                <CommentHeaderActions>
                  <LikeButton
                    liked={!!reply.isLiked}
                    onClick={() => handleToggleLike(reply.workoutCommentSeq)}
                    startIcon={
                      reply.isLiked ? (
                        <ThumbUp fontSize="small" />
                      ) : (
                        <ThumbUpOutlined fontSize="small" />
                      )
                    }
                    size="small"
                    sx={{ minWidth: 0, padding: "4px 6px" }}
                  >
                    {reply.commentLikes > 0 && reply.commentLikes}
                  </LikeButton>
                </CommentHeaderActions>
              )}

              {userInfo && userInfo.userSeq === reply.user.userSeq && (
                <CommentMenu>
                  <IconButton
                    size="small"
                    onClick={() => toggleMenu(reply.workoutCommentSeq)}
                    sx={{ color: "#aaa", padding: "4px" }}
                  >
                    <MoreVert fontSize="small" />
                  </IconButton>

                  <MenuOptions
                    isOpen={openMenuId === reply.workoutCommentSeq}
                    elevation={1}
                  >
                    <MenuItem
                      onClick={() => {
                        setEditingCommentId(reply.workoutCommentSeq);
                        setEditText(reply.commentContent);
                        setOpenMenuId(null);
                      }}
                    >
                      수정하기
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        handleDeleteComment(reply.workoutCommentSeq);
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

          {editingCommentId === reply.workoutCommentSeq ? (
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
                  onClick={() => handleUpdateComment(reply.workoutCommentSeq)}
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
            <CommentText>{reply.commentContent}</CommentText>
          )}
        </CommentContent>
      </CommentItemContainer>
    );
  }
);

export default ReplyItem;

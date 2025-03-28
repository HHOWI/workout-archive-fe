import React, { useState, useEffect } from "react";
import styled from "@emotion/styled";
import {
  TextField,
  Button,
  Avatar,
  CircularProgress,
  Divider,
  IconButton,
  Typography,
  Badge,
} from "@mui/material";
import {
  ThumbUpOutlined,
  ThumbUp,
  MoreVert,
  Send,
  Reply,
} from "@mui/icons-material";
import {
  getCommentsAPI,
  createCommentAPI,
  updateCommentAPI,
  deleteCommentAPI,
  toggleCommentLikeAPI,
  Comment,
  CommentListResponse,
} from "../api/comment";
import { useSelector } from "react-redux";
import { format, formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

interface CommentSectionProps {
  workoutId: number;
}

// 스타일 컴포넌트
const CommentContainer = styled.div`
  padding: 16px;
  border-radius: 8px;
  background-color: #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-top: 20px;
`;

const CommentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const CommentTitle = styled(Typography)`
  font-weight: 600;
  font-size: 18px;
  color: #333;
`;

const CommentCount = styled.span`
  color: #4a90e2;
  font-weight: 600;
  margin-left: 8px;
`;

const CommentInputContainer = styled.div`
  display: flex;
  margin-bottom: 24px;
  gap: 12px;
`;

const CommentForm = styled.form`
  flex: 1;
  display: flex;
  gap: 12px;
`;

const CommentList = styled.div`
  margin-top: 20px;
`;

const CommentItem = styled.div<{ isReply: boolean }>`
  padding: ${(props) => (props.isReply ? "12px 0 12px 48px" : "16px 0")};
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
`;

const CommentContent = styled.div`
  margin-left: 52px;
`;

const CommentText = styled.p`
  margin: 6px 0 10px;
  font-size: 14px;
  line-height: 1.6;
  color: #333;
  word-break: break-word;
`;

const CommentActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  font-size: 12px;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 4px;

  &:hover {
    background-color: #f5f5f5;
  }
`;

const CommentMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: -4px;
`;

const CommentAuthor = styled.span`
  font-weight: 600;
  font-size: 14px;
  color: #333;
`;

const CommentTime = styled.span`
  font-size: 12px;
  color: #777;
`;

const NoComments = styled.div`
  text-align: center;
  padding: 30px 0;
  color: #666;
  font-size: 14px;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  padding: 30px 0;
`;

const ReplyForm = styled.div`
  margin-top: 12px;
  margin-left: 52px;
  display: flex;
  gap: 12px;
`;

const CommentMenu = styled.div`
  position: relative;
`;

const MenuOptions = styled.div<{ isOpen: boolean }>`
  position: absolute;
  right: 0;
  top: 24px;
  width: 120px;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 10;
  display: ${(props) => (props.isOpen ? "block" : "none")};
  overflow: hidden;
`;

const MenuItem = styled.button`
  display: block;
  width: 100%;
  text-align: left;
  padding: 8px 16px;
  border: none;
  background: none;
  font-size: 14px;
  cursor: pointer;

  &:hover {
    background-color: #f5f5f5;
  }
`;

const UserAvatar = styled(Avatar)`
  width: 40px;
  height: 40px;
  position: absolute;
`;

const ReplyToggle = styled.div`
  margin-top: 8px;
  font-size: 13px;
  color: #4a90e2;
  font-weight: 500;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

const LoadMoreButton = styled(Button)`
  margin-top: 16px;
  width: 100%;
  text-transform: none;
`;

// 메인 컴포넌트
const CommentSection: React.FC<CommentSectionProps> = ({ workoutId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [activeReplyForm, setActiveReplyForm] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const userInfo = useSelector((state: any) => state.auth.userInfo);

  // 댓글 불러오기
  const fetchComments = async (reset = false) => {
    try {
      setLoading(true);
      const fetchPage = reset ? 1 : page;
      const response: CommentListResponse = await getCommentsAPI(
        workoutId,
        fetchPage
      );

      if (reset) {
        setComments(response.comments);
        setPage(1);
      } else {
        setComments((prev) => [...prev, ...response.comments]);
      }

      setTotalCount(response.totalCount);
      setHasMore(response.comments.length === 10);

      if (reset) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (error) {
      console.error("댓글을 불러오는 중 오류가 발생했습니다:", error);
    } finally {
      setLoading(false);
    }
  };

  // 초기 로딩
  useEffect(() => {
    if (workoutId) {
      fetchComments(true);
    }
  }, [workoutId]);

  // 댓글 작성
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !userInfo) return;

    try {
      const response = await createCommentAPI(workoutId, commentText);
      fetchComments(true);
      setCommentText("");
    } catch (error) {
      console.error("댓글 작성 중 오류가 발생했습니다:", error);
    }
  };

  // 대댓글 작성
  const handleSubmitReply = async (parentCommentId: number) => {
    if (!replyText.trim() || !userInfo) return;

    try {
      await createCommentAPI(workoutId, replyText, parentCommentId);
      fetchComments(true);
      setReplyText("");
      setActiveReplyForm(null);
    } catch (error) {
      console.error("대댓글 작성 중 오류가 발생했습니다:", error);
    }
  };

  // 댓글 수정
  const handleUpdateComment = async (commentId: number) => {
    if (!editText.trim()) return;

    try {
      await updateCommentAPI(commentId, editText);
      fetchComments(true);
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
      fetchComments(true);
    } catch (error) {
      console.error("댓글 삭제 중 오류가 발생했습니다:", error);
    }
  };

  // 좋아요 토글
  const handleToggleLike = async (commentId: number) => {
    if (!userInfo) return;

    try {
      const response = await toggleCommentLikeAPI(commentId);

      // 상태 업데이트
      setComments((prev) =>
        prev.map((comment) => {
          if (comment.workoutCommentSeq === commentId) {
            return {
              ...comment,
              isLiked: response.isLiked,
              commentLikes: response.likeCount,
            };
          }

          // 대댓글도 확인
          if (comment.childComments) {
            return {
              ...comment,
              childComments: comment.childComments.map((childComment) =>
                childComment.workoutCommentSeq === commentId
                  ? {
                      ...childComment,
                      isLiked: response.isLiked,
                      commentLikes: response.likeCount,
                    }
                  : childComment
              ),
            };
          }

          return comment;
        })
      );
    } catch (error) {
      console.error("좋아요 처리 중 오류가 발생했습니다:", error);
    }
  };

  // 메뉴 토글
  const toggleMenu = (commentId: number) => {
    setOpenMenuId(openMenuId === commentId ? null : commentId);
  };

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / 36e5;

    if (diffInHours < 24) {
      return formatDistanceToNow(date, { addSuffix: true, locale: ko });
    }
    return format(date, "yyyy년 MM월 dd일 HH:mm", { locale: ko });
  };

  // 더 불러오기
  const loadMore = () => {
    setPage((prev) => prev + 1);
    fetchComments();
  };

  return (
    <CommentContainer>
      <CommentHeader>
        <CommentTitle variant="h6">
          댓글<CommentCount>{totalCount}</CommentCount>
        </CommentTitle>
      </CommentHeader>

      {userInfo && (
        <CommentInputContainer>
          <UserAvatar
            src={userInfo.profileImageUrl || undefined}
            alt={userInfo.userNickname}
          >
            {!userInfo.profileImageUrl &&
              userInfo.userNickname?.substring(0, 1)}
          </UserAvatar>

          <CommentForm onSubmit={handleSubmitComment}>
            <TextField
              fullWidth
              placeholder="댓글을 작성해주세요..."
              variant="outlined"
              size="small"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              sx={{ marginLeft: "40px" }}
            />
            <Button
              variant="contained"
              color="primary"
              disabled={!commentText.trim()}
              type="submit"
              endIcon={<Send />}
            >
              작성
            </Button>
          </CommentForm>
        </CommentInputContainer>
      )}

      <Divider />

      <CommentList>
        {loading && comments.length === 0 ? (
          <LoadingContainer>
            <CircularProgress size={30} />
          </LoadingContainer>
        ) : comments.length === 0 ? (
          <NoComments>아직 댓글이 없습니다. 첫 댓글을 남겨보세요!</NoComments>
        ) : (
          <>
            {comments.map((comment) => (
              <React.Fragment key={comment.workoutCommentSeq}>
                <CommentItem isReply={false}>
                  <UserAvatar
                    src={comment.user.profileImageUrl || undefined}
                    alt={comment.user.userNickname}
                  >
                    {!comment.user.profileImageUrl &&
                      comment.user.userNickname?.substring(0, 1)}
                  </UserAvatar>

                  <CommentContent>
                    <CommentMeta>
                      <CommentAuthor>{comment.user.userNickname}</CommentAuthor>
                      <CommentTime>
                        {formatDate(comment.commentCreatedAt)}
                      </CommentTime>
                    </CommentMeta>

                    {editingCommentId === comment.workoutCommentSeq ? (
                      <div style={{ marginTop: "8px" }}>
                        <TextField
                          fullWidth
                          multiline
                          variant="outlined"
                          size="small"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          autoFocus
                        />
                        <div
                          style={{
                            display: "flex",
                            gap: "8px",
                            marginTop: "8px",
                          }}
                        >
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() =>
                              handleUpdateComment(comment.workoutCommentSeq)
                            }
                          >
                            수정완료
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => setEditingCommentId(null)}
                          >
                            취소
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <CommentText>{comment.commentContent}</CommentText>
                    )}

                    <CommentActions>
                      <ActionButton
                        onClick={() =>
                          handleToggleLike(comment.workoutCommentSeq)
                        }
                      >
                        {comment.isLiked ? (
                          <ThumbUp fontSize="small" color="primary" />
                        ) : (
                          <ThumbUpOutlined fontSize="small" />
                        )}
                        {comment.commentLikes > 0 && comment.commentLikes}
                      </ActionButton>

                      {userInfo && (
                        <ActionButton
                          onClick={() =>
                            setActiveReplyForm(comment.workoutCommentSeq)
                          }
                        >
                          <Reply fontSize="small" />
                          답글
                        </ActionButton>
                      )}

                      {userInfo &&
                        userInfo.userSeq === comment.user.userSeq && (
                          <CommentMenu>
                            <IconButton
                              size="small"
                              onClick={() =>
                                toggleMenu(comment.workoutCommentSeq)
                              }
                            >
                              <MoreVert fontSize="small" />
                            </IconButton>

                            <MenuOptions
                              isOpen={openMenuId === comment.workoutCommentSeq}
                            >
                              <MenuItem
                                onClick={() => {
                                  setEditingCommentId(
                                    comment.workoutCommentSeq
                                  );
                                  setEditText(comment.commentContent);
                                  setOpenMenuId(null);
                                }}
                              >
                                수정하기
                              </MenuItem>
                              <MenuItem
                                onClick={() => {
                                  handleDeleteComment(
                                    comment.workoutCommentSeq
                                  );
                                  setOpenMenuId(null);
                                }}
                              >
                                삭제하기
                              </MenuItem>
                            </MenuOptions>
                          </CommentMenu>
                        )}
                    </CommentActions>

                    {activeReplyForm === comment.workoutCommentSeq && (
                      <ReplyForm>
                        <TextField
                          fullWidth
                          size="small"
                          placeholder="답글을 작성하세요..."
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          variant="outlined"
                        />
                        <Button
                          variant="contained"
                          size="small"
                          disabled={!replyText.trim()}
                          onClick={() =>
                            handleSubmitReply(comment.workoutCommentSeq)
                          }
                        >
                          답글
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => setActiveReplyForm(null)}
                        >
                          취소
                        </Button>
                      </ReplyForm>
                    )}
                  </CommentContent>
                </CommentItem>

                {comment.childComments && comment.childComments.length > 0 && (
                  <>
                    {comment.childComments.map((reply) => (
                      <CommentItem key={reply.workoutCommentSeq} isReply={true}>
                        <UserAvatar
                          src={reply.user.profileImageUrl || undefined}
                          alt={reply.user.userNickname}
                          style={{ width: "32px", height: "32px" }}
                        >
                          {!reply.user.profileImageUrl &&
                            reply.user.userNickname?.substring(0, 1)}
                        </UserAvatar>

                        <CommentContent>
                          <CommentMeta>
                            <CommentAuthor>
                              {reply.user.userNickname}
                            </CommentAuthor>
                            <CommentTime>
                              {formatDate(reply.commentCreatedAt)}
                            </CommentTime>
                          </CommentMeta>

                          {editingCommentId === reply.workoutCommentSeq ? (
                            <div style={{ marginTop: "8px" }}>
                              <TextField
                                fullWidth
                                multiline
                                variant="outlined"
                                size="small"
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                autoFocus
                              />
                              <div
                                style={{
                                  display: "flex",
                                  gap: "8px",
                                  marginTop: "8px",
                                }}
                              >
                                <Button
                                  size="small"
                                  variant="contained"
                                  onClick={() =>
                                    handleUpdateComment(reply.workoutCommentSeq)
                                  }
                                >
                                  수정완료
                                </Button>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={() => setEditingCommentId(null)}
                                >
                                  취소
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <CommentText>{reply.commentContent}</CommentText>
                          )}

                          <CommentActions>
                            <ActionButton
                              onClick={() =>
                                handleToggleLike(reply.workoutCommentSeq)
                              }
                            >
                              {reply.isLiked ? (
                                <ThumbUp fontSize="small" color="primary" />
                              ) : (
                                <ThumbUpOutlined fontSize="small" />
                              )}
                              {reply.commentLikes > 0 && reply.commentLikes}
                            </ActionButton>

                            {userInfo &&
                              userInfo.userSeq === reply.user.userSeq && (
                                <CommentMenu>
                                  <IconButton
                                    size="small"
                                    onClick={() =>
                                      toggleMenu(reply.workoutCommentSeq)
                                    }
                                  >
                                    <MoreVert fontSize="small" />
                                  </IconButton>

                                  <MenuOptions
                                    isOpen={
                                      openMenuId === reply.workoutCommentSeq
                                    }
                                  >
                                    <MenuItem
                                      onClick={() => {
                                        setEditingCommentId(
                                          reply.workoutCommentSeq
                                        );
                                        setEditText(reply.commentContent);
                                        setOpenMenuId(null);
                                      }}
                                    >
                                      수정하기
                                    </MenuItem>
                                    <MenuItem
                                      onClick={() => {
                                        handleDeleteComment(
                                          reply.workoutCommentSeq
                                        );
                                        setOpenMenuId(null);
                                      }}
                                    >
                                      삭제하기
                                    </MenuItem>
                                  </MenuOptions>
                                </CommentMenu>
                              )}
                          </CommentActions>
                        </CommentContent>
                      </CommentItem>
                    ))}
                  </>
                )}
              </React.Fragment>
            ))}

            {hasMore && (
              <LoadMoreButton
                variant="outlined"
                onClick={loadMore}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : "댓글 더 보기"}
              </LoadMoreButton>
            )}
          </>
        )}
      </CommentList>
    </CommentContainer>
  );
};

export default CommentSection;

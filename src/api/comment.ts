import { publicAPI, authAPI } from "./axiosConfig";
import { isLoggedIn } from "../utils/authUtils";

// 댓글 목록 조회 API
export const getCommentsAPI = async (
  workoutId: number,
  page: number = 1,
  limit: number = 10
): Promise<CommentListResponse> => {
  // 로그인 상태에 따라 적절한 API 사용
  const api = isLoggedIn() ? authAPI : publicAPI;
  const response = await api.get(`/workouts/${workoutId}/comments`, {
    params: { page, limit },
  });
  return response.data;
};

// 대댓글 목록 조회 API (커서 기반 페이징)
export const getRepliesAPI = async (
  commentId: number,
  cursor?: number,
  limit: number = 10
): Promise<any> => {
  // 로그인 상태에 따라 적절한 API 사용
  const api = isLoggedIn() ? authAPI : publicAPI;
  const response = await api.get(`/workouts/comments/${commentId}/replies`, {
    params: { cursor, limit },
  });
  return response.data;
};

// 댓글 작성 API (인증 필요)
export const createCommentAPI = async (
  workoutId: number,
  content: string,
  parentCommentSeq?: number
): Promise<any> => {
  const response = await authAPI.post(`/workouts/${workoutId}/comments`, {
    content,
    parentCommentSeq,
  });
  return response.data;
};

// 댓글 수정 API (인증 필요)
export const updateCommentAPI = async (
  commentId: number,
  content: string
): Promise<any> => {
  const response = await authAPI.put(`/workouts/comments/${commentId}`, {
    content,
  });
  return response.data;
};

// 댓글 삭제 API (인증 필요)
export const deleteCommentAPI = async (commentId: number): Promise<any> => {
  const response = await authAPI.delete(`/workouts/comments/${commentId}`);
  return response.data;
};

// 댓글 좋아요 토글 API (인증 필요)
export const toggleCommentLikeAPI = async (commentId: number): Promise<any> => {
  const response = await authAPI.post(`/workouts/comments/${commentId}/like`);
  return response.data;
};

// 대댓글 좋아요 토글 API (인증 필요)
export const toggleReplyLikeAPI = async (
  replyId: number,
  parentCommentId: number
): Promise<any> => {
  const response = await authAPI.post(`/workouts/comments/${replyId}/like`, {
    parentCommentSeq: parentCommentId,
  });
  return response.data;
};

// 댓글 관련 타입
export interface CommentUser {
  userSeq: number;
  userNickname: string;
  profileImageUrl: string | null;
}

export interface Comment {
  workoutCommentSeq: number;
  commentContent: string;
  commentLikes: number;
  commentCreatedAt: string;
  isLiked?: boolean;
  isTarget?: boolean;
  user: CommentUser;
  childComments?: Comment[];
  childCommentsCount?: number;
  targetReplySeq?: number;
}

export interface CommentListResponse {
  comments: Comment[];
  totalCount: number;
}

export interface CommentCreateResponse {
  message: string;
  comment: Comment;
}

export interface CommentUpdateResponse {
  message: string;
  comment: Comment;
}

export interface CommentDeleteResponse {
  message: string;
}

export interface CommentLikeResponse {
  message: string;
  isLiked: boolean;
  likeCount: number;
}

// 대댓글 목록 응답 인터페이스
export interface RepliesResponse {
  replies: Comment[];
  nextCursor: number | null;
  hasMore: boolean;
}

// 단일 댓글 조회 API (대댓글 포함)
export const getCommentByIdAPI = async (
  commentId: number
): Promise<Comment> => {
  // 로그인 상태에 따라 적절한 API 사용
  const api = isLoggedIn() ? authAPI : publicAPI;
  const response = await api.get(`/workouts/comments/${commentId}`);
  return response.data;
};

// 부모 댓글과 모든 대댓글 조회 API (알림용)
export const getParentCommentWithAllRepliesAPI = async (
  parentCommentId: number,
  targetReplyId: number
): Promise<Comment> => {
  // 로그인 상태에 따라 적절한 API 사용
  const api = isLoggedIn() ? authAPI : publicAPI;
  const response = await api.get(
    `/workouts/parent-comments/${parentCommentId}/all-replies`,
    {
      params: { targetReplySeq: targetReplyId },
    }
  );
  return response.data;
};

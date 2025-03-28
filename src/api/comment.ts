import { publicAPI, authAPI } from "./axiosConfig";

// 댓글 목록 조회 API
export const getCommentsAPI = async (
  workoutId: number,
  page: number = 1,
  limit: number = 10
): Promise<any> => {
  const response = await publicAPI.get(`/workouts/${workoutId}/comments`, {
    params: { page, limit },
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
  user: CommentUser;
  childComments?: Comment[];
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

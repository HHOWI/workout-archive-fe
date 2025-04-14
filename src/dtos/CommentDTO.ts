import { z } from "zod";

/**
 * 댓글 기본 정보 DTO 인터페이스 (좋아요 정보 제외)
 */
export interface CommentBaseDTO {
  workoutCommentSeq: number;
  commentContent: string;
  commentLikes: number;
  commentCreatedAt: string;
  user: {
    userSeq: number;
    userNickname: string;
    profileImageUrl: string | null;
  };
  childComments?: CommentBaseDTO[];
  childCommentsCount?: number;
}

/**
 * 댓글 조회 응답 DTO 인터페이스 (좋아요 정보 포함)
 */
export interface CommentResponseDTO extends CommentBaseDTO {
  isLiked?: boolean;
  workoutOfTheDaySeq?: number;
  hasMoreReplies?: boolean;
  isTarget?: boolean;
  targetReplySeq?: number;
}

/**
 * 댓글 목록 페이징 응답 DTO 인터페이스
 */
export interface CommentListResponseDTO {
  comments: CommentResponseDTO[];
  totalCount: number;
}

/**
 * 대댓글 목록 조회 응답 DTO 인터페이스
 */
export interface RepliesResponseDTO {
  replies: CommentResponseDTO[];
  nextCursor: number | null;
  hasMore: boolean;
}

/**
 * 댓글 작성 스키마
 */
export const CreateCommentSchema = z.object({
  content: z
    .string()
    .min(1, "댓글 내용은 1자 이상이어야 합니다.")
    .max(500, "댓글 내용은 500자 이하여야 합니다."),
  parentCommentSeq: z.number().optional(),
});

/**
 * 댓글 수정 스키마
 */
export const UpdateCommentSchema = z.object({
  content: z
    .string()
    .min(1, "댓글 내용은 1자 이상이어야 합니다.")
    .max(500, "댓글 내용은 500자 이하여야 합니다."),
});

/**
 * 댓글 작성 DTO 타입
 */
export type CreateCommentDTO = z.infer<typeof CreateCommentSchema>;

/**
 * 댓글 수정 DTO 타입
 */
export type UpdateCommentDTO = z.infer<typeof UpdateCommentSchema>;

/**
 * 댓글 목록 쿼리 파라미터 스키마
 */
export const CommentListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10),
});

/**
 * 대댓글 조회 쿼리 파라미터 스키마
 */
export const RepliesQuerySchema = z.object({
  cursor: z.coerce.number().optional(),
  limit: z.coerce.number().int().positive().max(50).default(10),
});

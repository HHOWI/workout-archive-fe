/**
 * 댓글 좋아요 응답 DTO
 */
export interface CommentLikeResponseDTO {
  isLiked: boolean;
  likeCount: number;
}

/**
 * 댓글 좋아요 상태 DTO
 */
export interface CommentLikeStatusDTO {
  isLiked: boolean;
}

/**
 * 댓글 좋아요 개수 DTO
 */
export interface CommentLikeCountDTO {
  likeCount: number;
}

/**
 * 여러 댓글 좋아요 상태 DTO
 */
export interface BulkCommentLikeStatusDTO {
  [commentSeq: number]: boolean;
}

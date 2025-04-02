export enum NotificationType {
  COMMENT = "COMMENT", // 내 오운완에 댓글이 달림
  REPLY = "REPLY", // 내 댓글에 대댓글이 달림
  WORKOUT_LIKE = "WORKOUT_LIKE", // 내 오운완에 좋아요가 달림
  COMMENT_LIKE = "COMMENT_LIKE", // 내 댓글에 좋아요가 달림
  FOLLOW = "FOLLOW", // 새로운 팔로워가 생김
}

export interface NotificationDTO {
  notificationSeq: number;
  notificationType: NotificationType | string;
  notificationContent: string;
  senderSeq: number;
  senderNickname: string;
  senderProfileImageUrl?: string;
  isRead: number;
  notificationCreatedAt: Date;
  workoutOfTheDaySeq?: number;
  workoutCommentSeq?: number;
  notificationSeqs?: number[]; // 웹소켓 이벤트용 필드
}

export interface NotificationCountDTO {
  totalCount: number;
  unreadCount: number;
}

export interface MarkAsReadDTO {
  notificationSeqs: number[];
}

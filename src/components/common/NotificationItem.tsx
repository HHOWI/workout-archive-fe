import React from "react";
import {
  Box,
  Typography,
  ListItem,
  IconButton,
  ListItemText,
  ListItemSecondaryAction,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { NotificationDTO, NotificationType } from "../../dtos/NotificationDTO";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import ChatIcon from "@mui/icons-material/Chat";
import PeopleIcon from "@mui/icons-material/People";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ClearIcon from "@mui/icons-material/Clear";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { getParentCommentWithAllRepliesAPI } from "../../api/comment";

// 전역 모달 상태 관리를 위한 인터페이스
export interface WorkoutModalData {
  workoutId: number;
  commentId?: number;
  isReplyNotification?: boolean;
  parentCommentId?: number;
  replyCommentId?: number;
}

// 모달 열기 함수 타입
export type OpenWorkoutModalFunction = (data: WorkoutModalData) => void;

interface NotificationItemProps {
  notification: NotificationDTO;
  onDelete: (notificationSeq: number) => void;
  onRead?: (notificationSeq: number) => void;
  onClick?: (notification: NotificationDTO) => void;
  openWorkoutModal?: OpenWorkoutModalFunction;
}

// 읽지 않은 알림 스타일
const UnreadNotificationItem = styled(ListItem)(({ theme }) => ({
  backgroundColor: theme.palette.primary.light + "20", // 연한 배경색
  borderLeft: `3px solid ${theme.palette.primary.main}`,
  transition: "background-color 0.3s",
  "&:hover": {
    backgroundColor: theme.palette.primary.light + "30",
  },
}));

// 읽은 알림 스타일
const ReadNotificationItem = styled(ListItem)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  transition: "background-color 0.3s",
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
}));

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onDelete,
  onRead,
  onClick,
  openWorkoutModal,
}) => {
  const navigate = useNavigate();
  const userInfo = useSelector((state: any) => state.auth.userInfo);

  // 알림 타입에 따른 아이콘 및 경로 지정
  const getNotificationIcon = (type: NotificationType | string) => {
    switch (type) {
      case NotificationType.WORKOUT_LIKE:
        return <ThumbUpIcon color="primary" />;
      case NotificationType.COMMENT:
      case NotificationType.REPLY:
        return <ChatIcon color="primary" />;
      case NotificationType.COMMENT_LIKE:
      case NotificationType.REPLY_LIKE:
        return <ThumbUpIcon color="primary" />;
      case NotificationType.FOLLOW:
        return <PeopleIcon color="primary" />;
      default:
        return <FitnessCenterIcon color="primary" />;
    }
  };

  // 알림 클릭 핸들러
  const handleItemClick = async () => {
    // 먼저 읽음 상태로 변경
    if (notification.isRead === 0 && onRead) {
      onRead(notification.notificationSeq);
    }

    // 외부에서 제공된 onClick 핸들러가 있으면 사용
    if (onClick) {
      onClick(notification);
      return;
    }

    const {
      notificationType,
      workoutOfTheDaySeq,
      workoutCommentSeq,
      replyCommentSeq,
      senderNickname,
    } = notification;

    // 대댓글 관련 알림 처리 (대댓글, 대댓글 좋아요)
    if (
      (notificationType === NotificationType.REPLY ||
        notificationType === NotificationType.REPLY_LIKE) &&
      workoutOfTheDaySeq &&
      workoutCommentSeq &&
      replyCommentSeq
    ) {
      // 오운완 모달 열기 함수가 있으면 부모 댓글 ID와 대댓글 ID를 함께 전달
      if (openWorkoutModal) {
        openWorkoutModal({
          workoutId: workoutOfTheDaySeq,
          isReplyNotification: true,
          parentCommentId: workoutCommentSeq, // 부모 댓글 ID
          replyCommentId: replyCommentSeq, // 대댓글 ID
        });
        return;
      }
    }

    // 일반 댓글 관련 알림 처리 (댓글, 댓글 좋아요)
    if (
      (notificationType === NotificationType.COMMENT ||
        notificationType === NotificationType.COMMENT_LIKE) &&
      workoutOfTheDaySeq &&
      workoutCommentSeq
    ) {
      // 오운완 모달 열기 함수가 있으면 워크아웃 ID와 댓글 ID를 함께 전달
      if (openWorkoutModal) {
        openWorkoutModal({
          workoutId: workoutOfTheDaySeq,
          commentId: workoutCommentSeq,
        });
        return;
      }
    }

    // 오운완 관련 알림인 경우 (기존 로직)
    if (workoutOfTheDaySeq) {
      // 오운완 모달 열기 함수가 있으면 모달로 열기
      if (openWorkoutModal) {
        if (
          notificationType === NotificationType.REPLY ||
          notificationType === NotificationType.REPLY_LIKE
        ) {
          openWorkoutModal({
            workoutId: workoutOfTheDaySeq,
            isReplyNotification: true,
            parentCommentId: workoutCommentSeq,
            replyCommentId: replyCommentSeq,
          });
        } else {
          openWorkoutModal({
            workoutId: workoutOfTheDaySeq,
            commentId: workoutCommentSeq,
          });
        }
        return;
      }

      // 오운완 모달 열기 함수가 없으면 기존 방식대로 URL로 처리
      switch (notificationType) {
        case NotificationType.WORKOUT_LIKE:
        case NotificationType.COMMENT:
        case NotificationType.COMMENT_LIKE:
          if (userInfo && userInfo.userNickname === senderNickname) {
            navigate(
              `/profile/${userInfo.userNickname}?workout=${workoutOfTheDaySeq}${
                workoutCommentSeq ? `&comment=${workoutCommentSeq}` : ""
              }`
            );
          } else {
            navigate(
              `/profile/${senderNickname}?workout=${workoutOfTheDaySeq}${
                workoutCommentSeq ? `&comment=${workoutCommentSeq}` : ""
              }`
            );
          }
          break;
        case NotificationType.REPLY:
        case NotificationType.REPLY_LIKE:
          // 대댓글 관련 알림은 부모 댓글 ID와 대댓글 ID를 함께 전달
          const parentAndReplyParam =
            workoutCommentSeq && replyCommentSeq
              ? `&parentComment=${workoutCommentSeq}&replyComment=${replyCommentSeq}`
              : "";

          if (userInfo && userInfo.userNickname === senderNickname) {
            navigate(
              `/profile/${userInfo.userNickname}?workout=${workoutOfTheDaySeq}${parentAndReplyParam}`
            );
          } else {
            navigate(
              `/profile/${senderNickname}?workout=${workoutOfTheDaySeq}${parentAndReplyParam}`
            );
          }
          break;
        case NotificationType.FOLLOW:
          navigate(`/profile/${senderNickname}`);
          break;
        default:
          break;
      }
    } else if (notificationType === NotificationType.FOLLOW) {
      navigate(`/profile/${senderNickname}`);
    }
  };

  // 알림 삭제 핸들러
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(notification.notificationSeq);
  };

  // 시간 포맷팅
  const formatTime = (date: Date) => {
    try {
      const notificationDate = new Date(date);
      return formatDistanceToNow(notificationDate, {
        addSuffix: true,
        locale: ko,
      });
    } catch (error) {
      return "알 수 없음";
    }
  };

  // 읽음 상태에 따라 컴포넌트 선택
  const NotificationContainer =
    notification.isRead === 0 ? UnreadNotificationItem : ReadNotificationItem;

  return (
    <NotificationContainer
      alignItems="flex-start"
      onClick={handleItemClick}
      sx={{ py: 1.5, px: 2, cursor: "pointer" }}
    >
      <ListItemText
        primary={
          <Box
            component="div"
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            {getNotificationIcon(notification.notificationType)}
            <Typography
              variant="body1"
              component="span"
              fontWeight={notification.isRead === 0 ? "bold" : "normal"}
            >
              {notification.notificationContent}
            </Typography>
          </Box>
        }
        secondary={
          <Typography variant="caption" color="text.secondary" component="span">
            {formatTime(notification.notificationCreatedAt)}
          </Typography>
        }
      />

      <ListItemSecondaryAction>
        <IconButton
          edge="end"
          aria-label="delete"
          size="small"
          onClick={handleDelete}
        >
          <ClearIcon fontSize="small" />
        </IconButton>
      </ListItemSecondaryAction>
    </NotificationContainer>
  );
};

export default NotificationItem;

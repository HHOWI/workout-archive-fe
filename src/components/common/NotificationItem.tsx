import React from "react";
import {
  Box,
  Typography,
  ListItem,
  ListItemAvatar,
  Avatar,
  IconButton,
  ListItemText,
  ListItemSecondaryAction,
  Badge,
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
import { getImageUrl } from "../../utils/imageUtils";

interface NotificationItemProps {
  notification: NotificationDTO;
  onDelete: (notificationSeq: number) => void;
  onRead?: (notificationSeq: number) => void;
  onClick?: (notification: NotificationDTO) => void;
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
        return <ThumbUpIcon color="primary" />;
      case NotificationType.FOLLOW:
        return <PeopleIcon color="primary" />;
      default:
        return <FitnessCenterIcon color="primary" />;
    }
  };

  // 알림 경로 생성
  const getNotificationPath = (notification: NotificationDTO) => {
    const {
      notificationType,
      workoutOfTheDaySeq,
      workoutCommentSeq,
      senderNickname,
    } = notification;

    // 알림 대상이 오운완 관련인 경우
    if (workoutOfTheDaySeq) {
      // 알림 타입에 따라 처리
      switch (notificationType) {
        case NotificationType.WORKOUT_LIKE:
        case NotificationType.COMMENT:
        case NotificationType.REPLY:
        case NotificationType.COMMENT_LIKE:
          // 해당 오운완 작성자의 프로필 페이지로 이동하면서 모달 표시
          // 사용자 본인 오운완인지 확인하여 경로 설정
          if (userInfo && userInfo.userNickname === senderNickname) {
            // 본인 오운완에 대한 알림이면 프로필 페이지로 이동
            return `/profile/${
              userInfo.userNickname
            }?workout=${workoutOfTheDaySeq}${
              workoutCommentSeq ? `&comment=${workoutCommentSeq}` : ""
            }`;
          } else {
            // 다른 사람의 오운완이면 메인 피드로 이동
            return `/?workout=${workoutOfTheDaySeq}${
              workoutCommentSeq ? `&comment=${workoutCommentSeq}` : ""
            }`;
          }
        default:
          return "/";
      }
    }

    // 팔로우 알림인 경우 팔로우한 사용자의 프로필로 이동
    if (notificationType === NotificationType.FOLLOW) {
      return `/profile/${senderNickname}`;
    }

    // 기본 페이지는 메인
    return "/";
  };

  // 알림 클릭 핸들러
  const handleItemClick = () => {
    if (notification.isRead === 0 && onRead) {
      onRead(notification.notificationSeq);
    }

    if (onClick) {
      onClick(notification);
    } else {
      navigate(getNotificationPath(notification));
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

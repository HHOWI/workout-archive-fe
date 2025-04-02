import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Container,
  Box,
  Typography,
  List,
  Divider,
  Button,
  CircularProgress,
  Paper,
  IconButton,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import NotificationItem from "../components/common/NotificationItem";
import {
  getNotificationsAPI,
  markAllNotificationsAsReadAPI,
  deleteNotificationAPI,
  markNotificationsAsReadAPI,
  getNotificationCountAPI,
  deleteAllNotificationsAPI,
} from "../api/notification";
import { NotificationDTO } from "../dtos/NotificationDTO";
import SocketService from "../services/socketService";
import NotificationsIcon from "@mui/icons-material/Notifications";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import DeleteIcon from "@mui/icons-material/Delete";
import useInfiniteScroll from "../hooks/useInfiniteScroll";

// 스타일 컴포넌트
const PageHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: theme.spacing(2),
  [theme.breakpoints.down("sm")]: {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: theme.spacing(1),
  },
}));

const ActionButtons = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(1),
  [theme.breakpoints.down("sm")]: {
    width: "100%",
    justifyContent: "flex-end",
  },
}));

const EmptyNotifications = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: theme.spacing(6),
  color: theme.palette.text.secondary,
  gap: theme.spacing(2),
}));

const LoaderContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: theme.spacing(3),
  color: theme.palette.text.secondary,
  gap: theme.spacing(1),
}));

/**
 * 알림 페이지 컴포넌트
 */
const NotificationsPage: React.FC = () => {
  // 상태 관리
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [initializing, setInitializing] = useState(true);

  // 소켓 서비스 인스턴스
  const socketService = SocketService.getInstance();

  /**
   * 중복 알림을 제거하는 유틸리티 함수
   */
  const removeDuplicateNotifications = useCallback(
    (notificationList: NotificationDTO[]) => {
      return Array.from(
        new Map(
          notificationList.map((item) => [item.notificationSeq, item])
        ).values()
      );
    },
    []
  );

  /**
   * 알림 목록에서 읽지 않은 알림 수 계산하는 함수
   */
  const calculateUnreadCount = useCallback(
    (notificationList: NotificationDTO[]) => {
      return notificationList.filter((n) => n.isRead === 0).length;
    },
    []
  );

  /**
   * 알림 데이터 가져오기 함수 (useInfiniteScroll에서 사용)
   */
  const fetchNotificationsFunction = useCallback(
    async (cursor: number | null) => {
      try {
        const response = await getNotificationsAPI(20, cursor);
        return {
          data: response.notifications || [],
          nextCursor: response.nextCursor,
        };
      } catch (error) {
        console.error("알림 목록 조회 중 오류 발생:", error);
        throw error;
      }
    },
    []
  );

  /**
   * useInfiniteScroll 훅 사용
   */
  const {
    data: notifications,
    loading,
    hasMore,
    observerTarget,
    refreshData,
    resetData,
  } = useInfiniteScroll<NotificationDTO, number>({
    fetchData: fetchNotificationsFunction,
    isItemEqual: (a, b) => a.notificationSeq === b.notificationSeq,
  });

  /**
   * 알림 카운트 가져오기
   */
  const fetchNotificationCount = useCallback(async () => {
    try {
      const countResponse = await getNotificationCountAPI();
      setUnreadCount(countResponse.unreadCount);
    } catch (error) {
      console.error("알림 카운트 조회 중 오류 발생:", error);
    }
  }, []);

  /**
   * 웹소켓 알림 핸들러
   */
  const handleNewNotification = useCallback(
    (notification: NotificationDTO) => {
      // 특수 알림 타입 처리 (UPDATE, DELETE 등)
      switch (notification.notificationType) {
        case "UPDATE":
        case "UPDATE_ALL":
          // 알림 목록 새로고침
          refreshData();
          // 알림 카운트 다시 가져오기
          fetchNotificationCount();
          break;

        case "DELETE":
          // 알림 카운트 다시 가져오기
          fetchNotificationCount();
          break;

        default:
          // 알림 카운트 증가
          setUnreadCount((prev) => prev + 1);
          break;
      }
    },
    [refreshData, fetchNotificationCount]
  );

  /**
   * 초기 데이터 로드 및 소켓 이벤트 설정
   */
  useEffect(() => {
    fetchNotificationCount(); // 초기 알림 카운트 로드
    setInitializing(false);

    // 웹소켓 알림 핸들러 등록
    socketService.addNotificationHandler(handleNewNotification);

    // 클린업 함수
    return () => {
      socketService.removeNotificationHandler(handleNewNotification);
    };
  }, [handleNewNotification, fetchNotificationCount]);

  /**
   * 단일 알림 읽음 처리
   */
  const handleReadNotification = useCallback(
    async (notificationSeq: number) => {
      try {
        await markNotificationsAsReadAPI([notificationSeq]);

        // 알림 카운트 다시 가져오기
        fetchNotificationCount();
      } catch (error) {
        console.error("알림 읽음 처리 중 오류 발생:", error);
      }
    },
    [fetchNotificationCount]
  );

  /**
   * 모든 알림 읽음 처리
   */
  const handleReadAllNotifications = useCallback(async () => {
    try {
      await markAllNotificationsAsReadAPI();

      // 읽지 않은 알림 카운트 초기화
      setUnreadCount(0);

      // 데이터 새로고침
      refreshData();
    } catch (error) {
      console.error("모든 알림 읽음 처리 중 오류 발생:", error);
    }
  }, [refreshData]);

  /**
   * 모든 알림 삭제 처리
   */
  const handleDeleteAllNotifications = useCallback(async () => {
    try {
      await deleteAllNotificationsAPI();

      // 알림 카운트 초기화
      setUnreadCount(0);

      // 데이터 초기화 (목록 비우기)
      resetData();
    } catch (error) {
      console.error("모든 알림 삭제 중 오류 발생:", error);
    }
  }, [resetData]);

  /**
   * 알림 삭제 처리
   */
  const handleDeleteNotification = useCallback(
    async (notificationSeq: number) => {
      try {
        await deleteNotificationAPI(notificationSeq);

        // 읽지 않은 알림이었는지 확인
        const deletedNotification = notifications.find(
          (n) => n.notificationSeq === notificationSeq
        );

        // 읽지 않은 알림이었다면 알림 카운트 다시 가져오기
        if (deletedNotification?.isRead === 0) {
          fetchNotificationCount();
        }

        // 데이터 새로고침
        refreshData();
      } catch (error) {
        console.error("알림 삭제 중 오류 발생:", error);
      }
    },
    [notifications, fetchNotificationCount, refreshData]
  );

  /**
   * 알림 렌더링 헬퍼 함수
   */
  const renderNotificationsList = () => {
    if (initializing) {
      return (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (notifications.length === 0) {
      return (
        <EmptyNotifications>
          <NotificationsIcon sx={{ fontSize: 60 }} />
          <Typography variant="h6">알림이 없습니다</Typography>
          <Typography variant="body2" color="text.secondary" align="center">
            댓글, 좋아요, 팔로우 등의 활동이 있으면 여기에 표시됩니다.
          </Typography>
        </EmptyNotifications>
      );
    }

    return (
      <>
        <List sx={{ p: 0 }}>
          {notifications.map((notification, index) => (
            <React.Fragment key={notification.notificationSeq}>
              <NotificationItem
                notification={notification}
                onDelete={handleDeleteNotification}
                onRead={handleReadNotification}
              />
              {index < notifications.length - 1 && (
                <Divider variant="inset" component="li" />
              )}
            </React.Fragment>
          ))}
        </List>
      </>
    );
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <PageHeader>
        <Typography
          variant="h5"
          component="h1"
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          <NotificationsIcon fontSize="large" />
          알림
          {unreadCount > 0 && (
            <Typography
              component="span"
              sx={{
                backgroundColor: "error.main",
                color: "white",
                borderRadius: "50%",
                width: 24,
                height: 24,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.8rem",
                fontWeight: "bold",
              }}
            >
              {unreadCount}
            </Typography>
          )}
        </Typography>

        <ActionButtons>
          {unreadCount > 0 && (
            <Button
              variant="outlined"
              startIcon={<DoneAllIcon />}
              onClick={handleReadAllNotifications}
              size="small"
            >
              모두 읽음 처리
            </Button>
          )}
          {notifications.length > 0 && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDeleteAllNotifications}
              size="small"
            >
              모두 삭제
            </Button>
          )}
        </ActionButtons>
      </PageHeader>

      <Paper elevation={2}>
        {renderNotificationsList()}

        {/* 무한 스크롤 관찰 대상 - 항상 렌더링 */}
        <div ref={observerTarget} style={{ minHeight: "10px" }}>
          {hasMore && (
            <LoaderContainer>
              {loading && <CircularProgress size={24} />}
              {loading && <span>더 불러오는 중...</span>}
            </LoaderContainer>
          )}
        </div>
      </Paper>
    </Container>
  );
};

export default NotificationsPage;

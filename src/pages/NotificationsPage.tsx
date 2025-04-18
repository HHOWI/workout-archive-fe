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
import NotificationItem, {
  WorkoutModalData,
} from "../components/notificatrion/NotificationItem";
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
import WorkoutDetailModal from "../components/workout-of-the-day-modal/WorkoutOfTheDayModal";

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

  // 오운완 모달 관련 상태
  const [workoutModalData, setWorkoutModalData] =
    useState<WorkoutModalData | null>(null);

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
   * 개별 알림 읽음 처리
   */
  const handleMarkAsRead = useCallback(
    async (notificationSeq: number) => {
      try {
        await markNotificationsAsReadAPI([notificationSeq]);
        // 로컬 상태 업데이트 대신 전체 데이터 새로고침으로 변경
        refreshData();
        setUnreadCount((prev) => (prev > 0 ? prev - 1 : 0));
      } catch (error) {
        console.error("알림 읽음 처리 중 오류 발생:", error);
      }
    },
    [refreshData]
  );

  /**
   * 알림 삭제 처리
   */
  const handleDeleteNotification = useCallback(
    async (notificationSeq: number) => {
      try {
        await deleteNotificationAPI(notificationSeq);
        // 로컬 상태 업데이트 대신 전체 데이터 새로고침
        refreshData();
        fetchNotificationCount(); // 삭제 후 카운트 재조회
      } catch (error) {
        console.error("알림 삭제 중 오류 발생:", error);
      }
    },
    [refreshData, fetchNotificationCount]
  );

  /**
   * 모든 알림 읽음 처리
   */
  const handleMarkAllAsRead = useCallback(async () => {
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
   * 오운완 모달 열기
   */
  const openWorkoutModal = useCallback((data: WorkoutModalData) => {
    setWorkoutModalData(data);
  }, []);

  /**
   * 오운완 모달 닫기
   */
  const closeWorkoutModal = useCallback(() => {
    setWorkoutModalData(null);
  }, []);

  /**
   * 알림 렌더링 헬퍼 함수
   */
  const renderNotificationsList = () => {
    if (initializing || (loading && notifications.length === 0)) {
      return (
        <LoaderContainer>
          <CircularProgress size={24} />
          <Typography>알림 목록을 불러오는 중...</Typography>
        </LoaderContainer>
      );
    }

    if (notifications.length === 0) {
      return (
        <EmptyNotifications>
          <NotificationsIcon sx={{ fontSize: 48, color: "#bdbdbd" }} />
          <Typography>알림이 없습니다.</Typography>
        </EmptyNotifications>
      );
    }

    return (
      <List disablePadding>
        {removeDuplicateNotifications(notifications).map((notification) => (
          <React.Fragment key={notification.notificationSeq}>
            <NotificationItem
              notification={notification}
              onRead={handleMarkAsRead}
              onDelete={handleDeleteNotification}
              openWorkoutModal={openWorkoutModal}
            />
            <Divider component="li" sx={{ mx: 2 }} />
          </React.Fragment>
        ))}
      </List>
    );
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <PageHeader>
        <Typography variant="h5" component="h1" gutterBottom>
          알림
          {unreadCount > 0 && (
            <Typography
              component="span"
              sx={{ ml: 1, color: "primary.main", fontWeight: "bold" }}
            >
              ({unreadCount})
            </Typography>
          )}
        </Typography>
        <ActionButtons>
          <Button
            startIcon={<DoneAllIcon />}
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0 || loading}
            size="small"
          >
            모두 읽음
          </Button>
          <Button
            startIcon={<DeleteIcon />}
            onClick={handleDeleteAllNotifications}
            disabled={notifications.length === 0 || loading}
            size="small"
            color="error"
          >
            모두 삭제
          </Button>
        </ActionButtons>
      </PageHeader>

      <Paper elevation={0} variant="outlined" sx={{ mb: 2 }}>
        {renderNotificationsList()}
      </Paper>

      {/* 로딩 인디케이터 및 옵저버 타겟 */}
      {(loading || hasMore) && (
        <LoaderContainer ref={observerTarget}>
          {loading && (
            <>
              <CircularProgress size={16} />
              <span>로딩 중...</span>
            </>
          )}
          {!loading && hasMore && <span>더 많은 알림을 불러옵니다...</span>}
        </LoaderContainer>
      )}

      {/* 워크아웃 상세 모달 */}
      {workoutModalData && (
        <WorkoutDetailModal
          workoutOfTheDaySeq={workoutModalData.workoutId}
          commentId={workoutModalData.commentId}
          isReplyNotification={workoutModalData.isReplyNotification}
          parentCommentId={workoutModalData.parentCommentId}
          replyCommentId={workoutModalData.replyCommentId}
          onClose={closeWorkoutModal}
        />
      )}
    </Container>
  );
};

export default NotificationsPage;

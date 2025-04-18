import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Popover,
  Box,
  Typography,
  IconButton,
  List,
  Divider,
  Button,
  CircularProgress,
  Badge,
  Tooltip,
  keyframes,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import NotificationsIcon from "@mui/icons-material/Notifications";

import { useNavigate } from "react-router-dom";
import {
  getUnreadNotificationsAPI,
  getNotificationCountAPI,
  markNotificationsAsReadAPI,
  markAllNotificationsAsReadAPI,
  deleteNotificationAPI,
} from "../../api/notification";
import { NotificationDTO } from "../../dtos/NotificationDTO";
import SocketService from "../../services/socketService";
import WorkoutDetailModal from "../workout-of-the-day-modal/WorkoutOfTheDayModal";
import NotificationItem, { WorkoutModalData } from "./NotificationItem";

// 상수
const NOTIFICATION_LIMIT = 10;
const ANIMATION_DURATION = 1500;
const LOADING_DELAY = 300;
const SCROLL_SETUP_DELAY = 200;
const ELEMENTS = {
  notificationListId: "notification-list-container",
  loaderElementId: "notification-loader",
};

// 타입
type LastResponse = {
  cursor: number | null;
  count: number;
};

// 애니메이션 키프레임 정의
const notificationAnimation = keyframes`
  0% { transform: rotate(0deg); color: #f44336; }
  10% { transform: rotate(10deg); }
  20% { transform: rotate(-8deg); }
  30% { transform: rotate(6deg); }
  40% { transform: rotate(-4deg); }
  50% { transform: rotate(2deg); color: #f44336; }
  60% { transform: rotate(0deg); }
  100% { color: inherit; }
`;

// 스타일드 컴포넌트
const StyledBadge = styled(Badge)(({ theme }) => ({
  "& .MuiBadge-badge": {
    right: 3,
    top: 3,
    border: `2px solid ${theme.palette.background.paper}`,
    padding: "0 4px",
  },
}));

const AnimatedNotificationIcon = styled(NotificationsIcon, {
  shouldForwardProp: (prop) => prop !== "animate",
})<{ animate: boolean }>(({ theme, animate }) => ({
  animation: animate ? `${notificationAnimation} 1s ease-in-out` : "none",
  color: animate ? theme.palette.error.main : "inherit",
}));

const NotificationPopover = styled(Popover)(({ theme }) => ({
  "& .MuiPopover-paper": {
    width: 360,
    maxHeight: 500,
    borderRadius: "8px",
    boxShadow: theme.shadows[5],
    [theme.breakpoints.down("sm")]: {
      width: "95%",
      maxWidth: 360,
    },
  },
}));

const EmptyNotification = styled(Box)(({ theme }) => ({
  padding: theme.spacing(4),
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  color: theme.palette.text.secondary,
  gap: theme.spacing(2),
}));

const LoaderContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  padding: theme.spacing(1),
  width: "100%",
}));

const NotificationHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1, 2),
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const NotificationListContainer = styled("div")({
  maxHeight: 350,
  overflowY: "auto",
  padding: 0,
});

const LoaderElement = styled("div")({
  minHeight: 20,
  width: "100%",
});

const NotificationDropdown: React.FC = () => {
  // 상태
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [notifications, setNotifications] = useState<NotificationDTO[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [animate, setAnimate] = useState<boolean>(false);

  // 오운완 모달 관련 상태
  const [workoutModalData, setWorkoutModalData] =
    useState<WorkoutModalData | null>(null);

  // 훅
  const navigate = useNavigate();

  // refs
  const isFirstFetch = useRef<boolean>(true);
  const loadingRef = useRef<boolean>(false);
  const lastResponseRef = useRef<LastResponse | null>(null);

  // 서비스
  const socketService = SocketService.getInstance();

  // 파생값
  const open = Boolean(anchorEl);
  const popoverId = open ? "notification-popover" : undefined;
  const { notificationListId, loaderElementId } = ELEMENTS;

  /**
   * 중복 알림 제거
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
   * 알림 목록 가져오기
   */
  const fetchNotifications = useCallback(
    async (reset = false) => {
      // 로딩 중이거나 더 이상 데이터가 없으면 요청하지 않음
      if (loadingRef.current || (!reset && !hasMore)) return;

      loadingRef.current = true;
      setLoading(true);

      try {
        const cursor = reset ? null : nextCursor;
        const response = await getUnreadNotificationsAPI(
          NOTIFICATION_LIMIT,
          cursor
        );
        const newNotifications = removeDuplicateNotifications(
          response.notifications
        );

        // 빈 응답이면 더 이상 데이터 없음
        if (newNotifications.length === 0) {
          setHasMore(false);
          return;
        }

        // 상태 업데이트
        setNotifications((prev) => {
          const result = reset
            ? newNotifications
            : [...prev, ...newNotifications];
          return removeDuplicateNotifications(result);
        });

        // 다음 페이지 상태 업데이트
        setNextCursor(response.nextCursor);
        setHasMore(!!response.nextCursor);

        // 마지막 응답 저장
        lastResponseRef.current = {
          cursor,
          count: newNotifications.length,
        };
      } catch (error) {
        console.error("알림 목록 조회 중 오류 발생:", error);
        setHasMore(false);
      } finally {
        // 로딩 상태 해제 (지연 적용)
        setTimeout(() => {
          setLoading(false);
          loadingRef.current = false;
        }, LOADING_DELAY);
      }
    },
    [nextCursor, hasMore, removeDuplicateNotifications]
  );

  /**
   * 알림 카운트 가져오기
   */
  const fetchNotificationCount = useCallback(async () => {
    try {
      const count = await getNotificationCountAPI();
      setUnreadCount(count.unreadCount);
    } catch (error) {
      console.error("알림 카운트 조회 중 오류 발생:", error);
    }
  }, []);

  /**
   * 웹소켓 알림 처리
   */
  const handleNewNotification = useCallback(
    (notification: NotificationDTO) => {
      const { notificationType } = notification;

      // 특수 알림 타입 처리
      switch (notificationType) {
        case "UPDATE":
        case "UPDATE_ALL":
          // 알림 목록과 카운트 새로고침
          fetchNotifications(true);
          fetchNotificationCount();
          break;

        case "DELETE":
          // 삭제된 알림 제거
          setNotifications((prev) =>
            prev.filter(
              (n) => n.notificationSeq !== notification.notificationSeq
            )
          );
          fetchNotificationCount();
          break;

        default:
          // 새 알림 추가 (중복 확인)
          setNotifications((prev) => {
            // 이미 존재하는 알림인지 확인
            const exists = prev.some(
              (n) => n.notificationSeq === notification.notificationSeq
            );
            if (exists) return prev;
            return [notification, ...prev];
          });

          // 카운트 증가 및 애니메이션 활성화
          setUnreadCount((prev) => prev + 1);
          setAnimate(true);
          setTimeout(() => setAnimate(false), ANIMATION_DURATION);
          break;
      }
    },
    [fetchNotifications, fetchNotificationCount]
  );

  /**
   * 초기 데이터 로드 및 소켓 이벤트 설정
   */
  useEffect(() => {
    fetchNotificationCount();
    socketService.addNotificationHandler(handleNewNotification);

    return () => {
      socketService.removeNotificationHandler(handleNewNotification);
    };
  }, [fetchNotificationCount, handleNewNotification]);

  /**
   * 스크롤 이벤트 처리기
   */
  const checkForMoreNotifications = useCallback(() => {
    // 조건 체크
    if (loadingRef.current || !hasMore || !nextCursor) return;

    const listElement = document.getElementById(notificationListId);
    const loaderElement = document.getElementById(loaderElementId);
    if (!listElement || !loaderElement) return;

    const listRect = listElement.getBoundingClientRect();
    const loaderRect = loaderElement.getBoundingClientRect();

    // 로더가 뷰포트 내에 있는지 확인
    const isLoaderVisible =
      loaderRect.top >= listRect.top &&
      loaderRect.bottom <= listRect.bottom + 50;

    if (isLoaderVisible) {
      // 마지막 응답 확인
      const isLastResponseComplete =
        lastResponseRef.current &&
        lastResponseRef.current.cursor === nextCursor &&
        lastResponseRef.current.count < NOTIFICATION_LIMIT;

      if (isLastResponseComplete) {
        setHasMore(false);
        return;
      }

      fetchNotifications();
    }
  }, [fetchNotifications, hasMore, nextCursor]);

  /**
   * 스크롤 이벤트 설정
   */
  const setupScrollHandler = useCallback(() => {
    const listElement = document.getElementById(notificationListId);
    if (listElement) {
      listElement.addEventListener("scroll", checkForMoreNotifications);
    }
  }, [checkForMoreNotifications]);

  /**
   * 드롭다운 열기/닫기
   */
  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      setAnchorEl(event.currentTarget);

      // 첫 열기 시에만 알림 로드
      if (isFirstFetch.current) {
        fetchNotifications(true);
        isFirstFetch.current = false;
      }

      // 스크롤 이벤트 설정
      setTimeout(setupScrollHandler, SCROLL_SETUP_DELAY);
    },
    [fetchNotifications, setupScrollHandler]
  );

  const handleClose = useCallback(() => {
    setAnchorEl(null);

    // 스크롤 이벤트 제거
    const listElement = document.getElementById(notificationListId);
    if (listElement) {
      listElement.removeEventListener("scroll", checkForMoreNotifications);
    }
  }, [checkForMoreNotifications]);

  /**
   * 드롭다운 상태 변경시 스크롤 이벤트 관리
   */
  useEffect(() => {
    if (open) {
      setupScrollHandler();
    } else {
      const listElement = document.getElementById(notificationListId);
      if (listElement) {
        listElement.removeEventListener("scroll", checkForMoreNotifications);
      }
    }

    return () => {
      const listElement = document.getElementById(notificationListId);
      if (listElement) {
        listElement.removeEventListener("scroll", checkForMoreNotifications);
      }
    };
  }, [open, setupScrollHandler, checkForMoreNotifications]);

  /**
   * 알림 읽음 처리
   */
  const handleReadNotification = useCallback(
    async (notificationSeq: number) => {
      try {
        await markNotificationsAsReadAPI([notificationSeq]);

        // 읽은 알림 목록에서 제거
        setNotifications((prev) =>
          prev.filter((n) => n.notificationSeq !== notificationSeq)
        );

        // 읽지 않은 알림 카운트 감소
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (error) {
        console.error("알림 읽음 처리 중 오류 발생:", error);
      }
    },
    []
  );

  /**
   * 모든 알림 읽음 처리
   */
  const handleReadAllNotifications = useCallback(async () => {
    try {
      await markAllNotificationsAsReadAPI();
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error("모든 알림 읽음 처리 중 오류 발생:", error);
    }
  }, []);

  /**
   * 알림 삭제
   */
  const handleDeleteNotification = useCallback(
    async (notificationSeq: number) => {
      try {
        // 삭제 전 알림 찾기
        const deletedNotification = notifications.find(
          (n) => n.notificationSeq === notificationSeq
        );

        await deleteNotificationAPI(notificationSeq);

        // 삭제된 알림 목록에서 제거
        setNotifications((prev) =>
          prev.filter((n) => n.notificationSeq !== notificationSeq)
        );

        // 읽지 않은 알림이었다면 카운트 감소
        if (deletedNotification?.isRead === 0) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      } catch (error) {
        console.error("알림 삭제 중 오류 발생:", error);
      }
    },
    [notifications]
  );

  /**
   * 모든 알림 보기 페이지 이동
   */
  const navigateToAllNotifications = useCallback(() => {
    handleClose();
    navigate("/notifications");
  }, [navigate, handleClose]);

  /**
   * 오운완 모달 열기
   */
  const openWorkoutModal = useCallback((data: WorkoutModalData) => {
    setWorkoutModalData(data);
    setAnchorEl(null); // 드롭다운 닫기
  }, []);

  /**
   * 오운완 모달 닫기
   */
  const closeWorkoutModal = useCallback(() => {
    setWorkoutModalData(null);
  }, []);

  /**
   * 알림 목록 렌더링
   */
  const renderNotificationList = () => {
    // 로딩 중이고 알림이 없는 경우
    if (loading && notifications.length === 0) {
      return (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress size={30} />
        </Box>
      );
    }

    // 알림이 없는 경우
    if (notifications.length === 0) {
      return (
        <EmptyNotification>
          <NotificationsIcon fontSize="large" />
          <Typography variant="body1">미확인 알림이 없습니다</Typography>
        </EmptyNotification>
      );
    }

    // 알림 목록 렌더링
    return (
      <NotificationListContainer id={notificationListId}>
        <List sx={{ p: 0 }}>
          {notifications.map((notification, index) => (
            <React.Fragment key={notification.notificationSeq}>
              <NotificationItem
                notification={notification}
                onDelete={handleDeleteNotification}
                onRead={handleReadNotification}
                openWorkoutModal={openWorkoutModal}
              />
              {index < notifications.length - 1 && (
                <Divider variant="inset" component="li" />
              )}
            </React.Fragment>
          ))}

          {/* 무한 스크롤 감지 요소 */}
          <LoaderElement id={loaderElementId}>
            {hasMore && loading && (
              <LoaderContainer>
                <CircularProgress size={20} />
              </LoaderContainer>
            )}
          </LoaderElement>
        </List>
      </NotificationListContainer>
    );
  };

  return (
    <>
      <Tooltip title="알림">
        <IconButton
          aria-label="notifications"
          aria-controls={popoverId}
          aria-haspopup="true"
          onClick={handleClick}
          color="inherit"
        >
          <StyledBadge badgeContent={unreadCount} color="error">
            <AnimatedNotificationIcon animate={animate} />
          </StyledBadge>
        </IconButton>
      </Tooltip>

      <NotificationPopover
        id={popoverId}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <NotificationHeader>
          <Typography variant="subtitle1">미확인 알림</Typography>
          {notifications.length > 0 && (
            <Button
              color="primary"
              size="small"
              onClick={handleReadAllNotifications}
            >
              모두 읽음 처리
            </Button>
          )}
        </NotificationHeader>

        {renderNotificationList()}

        <Divider />
        <Box sx={{ p: 1, display: "flex", justifyContent: "center" }}>
          <Button fullWidth onClick={navigateToAllNotifications}>
            모든 알림 보기
          </Button>
        </Box>
      </NotificationPopover>

      {/* 오운완 모달 */}
      {workoutModalData && (
        <WorkoutDetailModal
          workoutOfTheDaySeq={workoutModalData.workoutId}
          commentId={workoutModalData.commentId}
          onClose={closeWorkoutModal}
        />
      )}
    </>
  );
};

export default NotificationDropdown;

import { authAPI } from "./axiosConfig";
import { NotificationDTO, NotificationCountDTO } from "../dtos/NotificationDTO";

// 알림 목록 조회 (커서 기반 페이징)
export const getNotificationsAPI = async (
  limit: number = 20,
  cursor: number | null = null
): Promise<{
  notifications: NotificationDTO[];
  totalCount: number;
  nextCursor: number | null;
}> => {
  try {
    let url = `/notifications?limit=${limit}`;
    if (cursor) {
      url += `&cursor=${cursor}`;
    }

    const response = await authAPI.get(url);
    return response.data;
  } catch (error) {
    console.error("알림 목록 조회 중 오류 발생:", error);
    throw error;
  }
};

// 알림 카운트 조회
export const getNotificationCountAPI =
  async (): Promise<NotificationCountDTO> => {
    try {
      const response = await authAPI.get("/notifications/count");
      return response.data;
    } catch (error) {
      console.error("알림 카운트 조회 중 오류 발생:", error);
      throw error;
    }
  };

// 알림 읽음 처리
export const markNotificationsAsReadAPI = async (
  notificationSeqs: number[]
): Promise<void> => {
  try {
    await authAPI.patch("/notifications/read", { notificationSeqs });
  } catch (error) {
    console.error("알림 읽음 처리 중 오류 발생:", error);
    throw error;
  }
};

// 모든 알림 읽음 처리
export const markAllNotificationsAsReadAPI = async (): Promise<void> => {
  try {
    await authAPI.patch("/notifications/read/all");
  } catch (error) {
    console.error("모든 알림 읽음 처리 중 오류 발생:", error);
    throw error;
  }
};

// 알림 삭제
export const deleteNotificationAPI = async (
  notificationSeq: number
): Promise<void> => {
  try {
    await authAPI.delete(`/notifications/${notificationSeq}`);
  } catch (error) {
    console.error("알림 삭제 중 오류 발생:", error);
    throw error;
  }
};

// 모든 알림 삭제
export const deleteAllNotificationsAPI = async (): Promise<void> => {
  try {
    await authAPI.delete("/notifications/all");
  } catch (error) {
    console.error("모든 알림 삭제 중 오류 발생:", error);
    throw error;
  }
};

// 특정 알림 조회
export const getNotificationByIdAPI = async (
  notificationSeq: number
): Promise<NotificationDTO> => {
  try {
    const response = await authAPI.get(`/notifications/${notificationSeq}`);
    return response.data;
  } catch (error) {
    console.error("알림 상세 조회 중 오류 발생:", error);
    throw error;
  }
};

// 읽지 않은 알림 목록 조회 (커서 기반 페이징)
export const getUnreadNotificationsAPI = async (
  limit: number = 20,
  cursor: number | null = null
): Promise<{
  notifications: NotificationDTO[];
  totalCount: number;
  nextCursor: number | null;
}> => {
  try {
    let url = `/notifications/unread?limit=${limit}`;
    if (cursor) {
      url += `&cursor=${cursor}`;
    }

    const response = await authAPI.get(url);
    return response.data;
  } catch (error) {
    console.error("읽지 않은 알림 목록 조회 중 오류 발생:", error);
    throw error;
  }
};

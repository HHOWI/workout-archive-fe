import { authAPI } from "./axiosConfig";
import { getBodyLogStatsAPI } from "./statistics";

// 바디로그 저장
export const saveBodyLogAPI = async (data: {
  height?: number | null;
  bodyWeight?: number | null;
  muscleMass?: number | null;
  bodyFat?: number | null;
  recordDate?: string;
}): Promise<any> => {
  try {
    const response = await authAPI.post("/users/body-logs", data);
    return response.data;
  } catch (error: any) {
    console.error("API 오류:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    throw error;
  }
};

// 바디로그 목록 조회
export const getBodyLogsAPI = async (params?: {
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}): Promise<any> => {
  try {
    const response = await authAPI.get("/users/body-logs", { params });
    return response.data;
  } catch (error: any) {
    console.error("API 오류:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    throw error;
  }
};

// 바디로그 통계 데이터 조회 - statistics.ts로 이동
export { getBodyLogStatsAPI };

// 최신 바디로그 조회
export const getLatestBodyLogAPI = async (): Promise<any> => {
  try {
    const response = await authAPI.get("/users/body-logs/latest");
    return response.data;
  } catch (error: any) {
    console.error("API 오류:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    throw error;
  }
};

// 바디로그 삭제
export const deleteBodyLogAPI = async (
  userInfoRecordSeq: number
): Promise<any> => {
  try {
    const response = await authAPI.delete(
      `/users/body-logs/${userInfoRecordSeq}`
    );
    return response.data;
  } catch (error: any) {
    console.error("API 오류:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    throw error;
  }
};

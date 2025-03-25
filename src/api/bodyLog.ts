import { BodyLogStatsDTO } from "../dtos/BodyLogDTO";
import { userAPI } from "./axiosConfig";

// 바디로그 저장
export const saveBodyLogAPI = async (data: {
  height?: number | null;
  bodyWeight?: number | null;
  muscleMass?: number | null;
  bodyFat?: number | null;
  recordDate?: string;
}): Promise<any> => {
  try {
    const response = await userAPI.post("/users/body-logs", data);
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
    const response = await userAPI.get("/users/body-logs", { params });
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

// 바디로그 통계 데이터 조회
export const getBodyLogStatsAPI = async (params?: {
  period?: "3months" | "6months" | "1year" | "2years" | "all";
  interval?: "1week" | "2weeks" | "4weeks" | "3months";
}): Promise<BodyLogStatsDTO> => {
  try {
    const response = await userAPI.get("/users/body-logs/stats", { params });
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

// 최신 바디로그 조회
export const getLatestBodyLogAPI = async (): Promise<any> => {
  try {
    const response = await userAPI.get("/users/body-logs/latest");
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
    const response = await userAPI.delete(
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

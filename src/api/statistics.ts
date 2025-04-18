import { authAPI } from "./axiosConfig";
import { BodyLogStatsDTO } from "../dtos/BodyLogDTO";

// 운동 무게 통계 데이터 타입 정의
export interface ExerciseWeightDataPoint {
  date: string;
  value: number | null;
  isEstimated: boolean;
}

export interface ExerciseWeightStats {
  exerciseSeq: number;
  exerciseName: string;
  exerciseType: string;
  data: ExerciseWeightDataPoint[];
}

export interface ExerciseWeightStatsDTO {
  exercises: ExerciseWeightStats[];
}

// 유산소 운동 통계 데이터 타입 정의
export interface CardioDataPoint {
  date: string;
  value: number | null;
}

export interface CardioStatsDTO {
  exerciseName: string;
  exerciseSeq: number;
  exerciseType: string;
  distance: CardioDataPoint[];
  duration: CardioDataPoint[];
  avgSpeed: CardioDataPoint[];
}

// 운동 볼륨 통계 데이터 타입 정의
export interface VolumeDataPoint {
  date: string;
  value: number;
}

export interface BodyPartVolumeStatsDTO {
  bodyPart: string;
  volumeData: VolumeDataPoint[];
}

/**
 * 바디로그 통계 데이터 조회
 */
export const getBodyLogStatsAPI = async (params?: {
  period?: "3months" | "6months" | "1year" | "2years" | "all";
  interval?: "1week" | "2weeks" | "4weeks" | "3months" | "all";
}): Promise<BodyLogStatsDTO> => {
  try {
    const response = await authAPI.get("/statistics/body-log-stats", {
      params,
    });
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

/**
 * 운동 무게 통계 데이터 조회
 */
export const getExerciseWeightStatsAPI = async (params?: {
  period?: "1months" | "3months" | "6months" | "1year" | "2years" | "all";
  interval?: "1week" | "2weeks" | "4weeks" | "3months" | "all";
  rm?: "1RM" | "5RM" | "over8RM";
  exerciseSeqs?: number[];
}): Promise<ExerciseWeightStatsDTO> => {
  try {
    const response = await authAPI.get("/statistics/exercise-weight-stats", {
      params: {
        ...params,
        exerciseSeqs: params?.exerciseSeqs,
      },
    });
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

/**
 * 유산소 운동 통계 데이터 조회
 */
export const getCardioStatsAPI = async (params?: {
  period?: "1months" | "3months" | "6months" | "1year" | "2years" | "all";
  exerciseSeqs?: number[];
}): Promise<CardioStatsDTO[]> => {
  try {
    const response = await authAPI.get("/statistics/cardio-stats", {
      params: {
        ...params,
        exerciseSeqs: params?.exerciseSeqs,
      },
    });
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

/**
 * 운동 볼륨 통계 데이터 조회
 */
export const getBodyPartVolumeStatsAPI = async (params?: {
  period?: "3months" | "6months" | "1year" | "2years" | "all";
  interval?: "1week" | "2weeks" | "1month" | "3months" | "all";
  bodyPart?:
    | "chest"
    | "back"
    | "legs"
    | "shoulders"
    | "triceps"
    | "biceps"
    | "all";
}): Promise<BodyPartVolumeStatsDTO> => {
  try {
    const response = await authAPI.get("/statistics/body-part-volume-stats", {
      params,
    });
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

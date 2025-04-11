import { authAPI, publicAPI } from "./axiosConfig";
import { getExerciseWeightStatsAPI } from "./statistics";
import type {
  ExerciseWeightDataPoint,
  ExerciseWeightStats,
  ExerciseWeightStatsDTO,
} from "./statistics";
import { WorkoutOfTheDayDTO, WorkoutPlaceDTO } from "../dtos/WorkoutDTO";
import { isLoggedIn } from "../utils/authUtils";

// 운동 기록 저장하기 (FormData 또는 JSON 지원)
export const saveWorkoutRecordAPI = async (data: FormData): Promise<any> => {
  try {
    console.log("API 요청 데이터:", {
      workoutData: data.get("workoutData"),
      placeInfo: data.get("placeInfo"),
      image: data.get("image"),
    });

    const response = await authAPI.post("/workouts/workout-records", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    console.log("API 응답:", response.data);
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

// 커서 기반 페이징을 사용한 닉네임으로 운동 기록 가져오기
export const getUserWorkoutOfTheDaysByNicknameAPI = async (
  nickname: string,
  limit: number = 12,
  cursor: string | null = null
): Promise<{
  workouts: WorkoutOfTheDayDTO[];
  nextCursor: string | null;
  limit: number;
}> => {
  const params: any = { limit };
  if (cursor) {
    params.cursor = cursor;
  }

  const response = await publicAPI.get(
    `/workouts/profiles/${nickname}/workout-records`,
    { params }
  );

  return response.data;
};

// 닉네임으로 총 운동 기록 수 가져오기
export const getUserWorkoutTotalCountByNicknameAPI = async (
  nickname: string
): Promise<any> => {
  const response = await publicAPI.get(
    `/workouts/profiles/${nickname}/workout-records-count`
  );
  return response.data;
};

// 운동 기록 상세 정보 가져오기
export const getWorkoutRecordDetailsAPI = async (
  workoutId: number
): Promise<any> => {
  // 로그인 상태에 따라 적절한 API 사용
  const api = isLoggedIn() ? authAPI : publicAPI;
  const response = await api.get(
    `/workouts/profiles/workout-records/${workoutId}`
  );
  return response.data;
};

// 사용자의 최근 운동목록 조회
export const getRecentWorkoutRecordsAPI = async (): Promise<any> => {
  const response = await authAPI.get("/workouts/workout-records/recent");
  return response.data;
};

// 운동 기록 소프트 삭제
export const deleteWorkoutRecordAPI = async (
  workoutId: number
): Promise<any> => {
  try {
    const response = await authAPI.delete(
      `/workouts/workout-records/${workoutId}`
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

// 운동 기록 수정
export const updateWorkoutRecordAPI = async (
  workoutId: number,
  updateData: { workoutDiary?: string | null }
): Promise<any> => {
  try {
    const response = await authAPI.put(
      `/workouts/workout-records/${workoutId}`,
      updateData
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

// 운동 무게 통계 데이터 조회 - statistics.ts로 이동
export { getExerciseWeightStatsAPI };
export type {
  ExerciseWeightDataPoint,
  ExerciseWeightStats,
  ExerciseWeightStatsDTO,
};

// 장소별 운동 기록 조회 API
export const getWorkoutsByPlaceAPI = async (
  placeSeq: string,
  limit: number = 12,
  cursor: string | null = null
): Promise<{
  workouts: WorkoutOfTheDayDTO[];
  nextCursor: string | null;
  placeInfo: WorkoutPlaceDTO;
}> => {
  const params: any = { limit };
  if (cursor) {
    params.cursor = cursor;
  }

  const response = await publicAPI.get(
    `/workouts/places/${placeSeq}/workout-records`,
    {
      params,
    }
  );

  return response.data;
};

// 장소 ID로 운동 기록 총 개수 조회 API
export const getWorkoutOfTheDayCountByPlaceIdAPI = async (
  placeSeq: string
): Promise<any> => {
  const response = await publicAPI.get(
    `/workouts/places/${placeSeq}/workout-records-count`
  );
  return response.data;
};

// 워크아웃 좋아요 토글 API
export const toggleWorkoutLikeAPI = async (
  workoutId: number
): Promise<{ isLiked: boolean; likeCount: number }> => {
  const response = await authAPI.post(
    `/workouts/workout-records/${workoutId}/like`
  );
  return response.data;
};

// 워크아웃 좋아요 상태 조회 API
export const getWorkoutLikeStatusAPI = async (
  workoutId: number
): Promise<{ isLiked: boolean }> => {
  const response = await publicAPI.get(
    `/workouts/workout-records/${workoutId}/like`
  );
  return response.data;
};

// 워크아웃 좋아요 수 조회 API
export const getWorkoutLikeCountAPI = async (
  workoutId: number
): Promise<{ likeCount: number }> => {
  const response = await publicAPI.get(
    `/workouts/workout-records/${workoutId}/like-count`
  );
  return response.data;
};

/**
 * 특정 사용자의 월별 운동 기록 및 통계 조회
 * @param nickname 사용자 닉네임
 * @param year 조회할 연도
 * @param month 조회할 월
 * @returns 해당 월의 운동 기록과 통계 정보
 */
export const getUserMonthlyWorkoutDataAPI = async (
  nickname: string,
  year: number,
  month: number
): Promise<{
  workoutData: { date: Date; workoutSeq: number }[];
  stats: {
    totalWorkouts: number;
    completionRate: number;
    currentStreak: number;
    longestStreak: number;
    daysInMonth: number;
  };
}> => {
  try {
    const response = await publicAPI.get(
      `/workouts/profiles/${nickname}/workout-records/monthly`,
      { params: { year, month } }
    );

    // 응답 구조 디버깅
    console.log("월별 운동 데이터 응답:", response.data);

    // 응답이 배열인 경우(이전 API 버전) 호환성 처리
    if (Array.isArray(response.data)) {
      console.log("이전 API 버전 응답 형식 감지됨 (배열)");
      const workoutData = response.data.map((item: any) => ({
        date: new Date(item.date),
        workoutSeq: item.workoutSeq,
      }));

      // 이전 버전 응답에서는 통계 정보가 없으므로 기본값 제공
      const daysInMonth = new Date(year, month, 0).getDate();
      return {
        workoutData,
        stats: {
          totalWorkouts: workoutData.length,
          completionRate: (workoutData.length / daysInMonth) * 100,
          currentStreak: 0,
          longestStreak: 0,
          daysInMonth,
        },
      };
    }

    // 응답 객체의 구조를 안전하게 처리
    const workoutData = Array.isArray(response.data.workoutData)
      ? response.data.workoutData.map((item: any) => ({
          date: new Date(item.date),
          workoutSeq: item.workoutSeq,
        }))
      : [];

    // 통계 정보가 없거나 구조가 다른 경우 기본값 제공
    const daysInMonth = new Date(year, month, 0).getDate();
    const stats = response.data.stats || {
      totalWorkouts: workoutData.length,
      completionRate: (workoutData.length / daysInMonth) * 100,
      currentStreak: 0,
      longestStreak: 0,
      daysInMonth,
    };

    return {
      workoutData,
      stats,
    };
  } catch (error: any) {
    console.error("API 오류:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    throw error;
  }
};

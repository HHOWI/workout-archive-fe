import { workoutAPI, publicWorkoutAPI } from "./axiosConfig";
import { WorkoutOfTheDay } from "../dtos/WorkoutDTO";

// 운동 기록 저장하기 (FormData 또는 JSON 지원)
export const saveWorkoutRecord = async (
  data: FormData | WorkoutOfTheDay,
  placeInfo?: {
    kakaoPlaceId: string;
    placeName: string;
    addressName: string;
    roadAddressName: string;
    x: string;
    y: string;
  }
): Promise<any> => {
  // FormData 타입 확인
  if (data instanceof FormData) {
    // FormData로 전송 (사진 업로드 포함)
    const response = await workoutAPI.post("/workout-records", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } else {
    // JSON으로 전송 (기존 방식)
    const response = await workoutAPI.post("/workout-records", {
      ...data,
      placeInfo,
    });
    return response.data;
  }
};

// 사용자의 모든 운동 기록 가져오기
export const getUserWorkoutRecords = async (
  page: number,
  limit: number,
  userSeq?: number
): Promise<any> => {
  // 특정 사용자의 기록 조회 (로그인 불필요)
  if (userSeq) {
    const response = await publicWorkoutAPI.get(
      `/users/${userSeq}/workout-records`,
      {
        params: { page, limit },
      }
    );
    return response.data;
  }

  // 로그인한 사용자 본인의 기록 조회 (토큰 필요)
  const response = await workoutAPI.get("/workout-records", {
    params: { page, limit },
  });
  return response.data;
};

// 다른 사용자의 운동 기록 조회 (로그인 불필요)
export const getOtherUserWorkoutRecords = async (
  userSeq: number,
  page: number,
  limit: number
): Promise<any> => {
  const response = await publicWorkoutAPI.get(
    `/users/${userSeq}/workout-records`,
    {
      params: { page, limit },
    }
  );
  return response.data;
};

// 사용자의 총 운동 기록 수 가져오기
export const getUserWorkoutTotalCount = async (
  userSeq: number
): Promise<number> => {
  const response = await publicWorkoutAPI.get(
    `/users/${userSeq}/workout-records-count`
  );
  return response.data.count;
};

// 운동 기록 상세 정보 가져오기
export const getWorkoutRecordDetails = async (
  workoutId: number,
  userSeq?: number
): Promise<any> => {
  // 특정 사용자의 기록 상세 조회 (로그인 불필요)
  if (userSeq) {
    const response = await publicWorkoutAPI.get(
      `/users/${userSeq}/workout-records/${workoutId}`
    );
    return response.data;
  }

  // 로그인한 사용자 본인의 기록 상세 조회 (토큰 필요)
  const response = await workoutAPI.get(`/workout-records/${workoutId}`);
  return response.data;
};

import { workoutAPI } from "./axiosConfig";
import { WorkoutOfTheDay, WorkoutPlace } from "../types/WorkoutTypes";

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

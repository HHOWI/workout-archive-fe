import { workoutAPI, publicWorkoutAPI } from "./axiosConfig";
import { WorkoutOfTheDayDTO } from "../dtos/WorkoutDTO";

// 운동 기록 저장하기 (FormData 또는 JSON 지원)
export const saveWorkoutRecordAPI = async (
  data: FormData | WorkoutOfTheDayDTO,
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

// 커서 기반 페이징을 사용한 닉네임으로 운동 기록 가져오기
export const getUserWorkoutOfTheDaysByNicknameAPI = async (
  nickname: string,
  limit: number = 12,
  cursor: number | null = null
): Promise<any> => {
  console.log(`API 호출: 닉네임=${nickname}, 한계=${limit}, 커서=${cursor}`);

  const params: any = { limit };
  if (cursor) {
    params.cursor = cursor;
    console.log("다음 데이터 요청 커서:", cursor);
  }

  const response = await publicWorkoutAPI.get(
    `/profiles/${nickname}/workout-records`,
    { params }
  );

  console.log("API 응답:", response.data);
  console.log(`총 데이터 개수: ${response.data.workouts?.length || 0}`);
  console.log(`다음 커서: ${response.data.nextCursor}`);

  return response.data;
};

// 닉네임으로 총 운동 기록 수 가져오기
export const getUserWorkoutTotalCountByNicknameAPI = async (
  nickname: string
): Promise<any> => {
  const response = await publicWorkoutAPI.get(
    `/profiles/${nickname}/workout-records-count`
  );
  return response.data;
};

// 운동 기록 상세 정보 가져오기
export const getWorkoutRecordDetailsAPI = async (
  workoutId: number
): Promise<any> => {
  const response = await publicWorkoutAPI.get(
    `/profiles/workout-records/${workoutId}`
  );
  return response.data;
};

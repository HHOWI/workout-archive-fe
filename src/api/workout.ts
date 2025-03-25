import { workoutAPI, publicWorkoutAPI } from "./axiosConfig";

// 운동 기록 저장하기 (FormData 또는 JSON 지원)
export const saveWorkoutRecordAPI = async (data: FormData): Promise<any> => {
  try {
    console.log("API 요청 데이터:", {
      workoutData: data.get("workoutData"),
      placeInfo: data.get("placeInfo"),
      image: data.get("image"),
    });

    const response = await workoutAPI.post("/workouts/workout-records", data, {
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
  cursor: number | null = null
): Promise<any> => {
  const params: any = { limit };
  if (cursor) {
    params.cursor = cursor;
  }

  const response = await publicWorkoutAPI.get(
    `/workouts/profiles/${nickname}/workout-records`,
    { params }
  );

  return response.data;
};

// 닉네임으로 총 운동 기록 수 가져오기
export const getUserWorkoutTotalCountByNicknameAPI = async (
  nickname: string
): Promise<any> => {
  const response = await publicWorkoutAPI.get(
    `/workouts/profiles/${nickname}/workout-records-count`
  );
  return response.data;
};

// 운동 기록 상세 정보 가져오기
export const getWorkoutRecordDetailsAPI = async (
  workoutId: number
): Promise<any> => {
  const response = await publicWorkoutAPI.get(
    `/workouts/profiles/workout-records/${workoutId}`
  );
  return response.data;
};

// 사용자의 최근 운동목록 조회
export const getRecentWorkoutRecordsAPI = async (): Promise<any> => {
  const response = await workoutAPI.get("/workouts/workout-records/recent");
  return response.data;
};

// 운동 기록 소프트 삭제
export const deleteWorkoutRecordAPI = async (
  workoutId: number
): Promise<any> => {
  try {
    const response = await workoutAPI.delete(
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
    const response = await workoutAPI.put(
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

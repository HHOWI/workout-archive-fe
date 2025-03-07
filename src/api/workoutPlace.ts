import axios from "axios";
import { WorkoutPlace } from "../types/WorkoutTypes";

// 공개 접근 가능한 API는 withCredentials가 필요 없음
const publicInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL + "/workout-places",
});

// 인증이 필요한 API용 인스턴스
const authInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL + "/workout-places",
  withCredentials: true,
});

// 최근 사용한 운동 장소 가져오기 (인증 필요)
export const fetchRecentWorkoutPlaces = async (): Promise<WorkoutPlace[]> => {
  const response = await authInstance.get("/recent");
  return response.data;
};

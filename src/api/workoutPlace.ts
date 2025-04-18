import { WorkoutPlaceDTO } from "../dtos/WorkoutDTO";
import { authAPI } from "./axiosConfig";

// 최근 사용한 운동 장소 가져오기 (인증 필요)
export const fetchRecentWorkoutPlacesAPI = async (): Promise<
  WorkoutPlaceDTO[]
> => {
  const response = await authAPI.get("/workout-places/recent");
  return response.data.places;
};

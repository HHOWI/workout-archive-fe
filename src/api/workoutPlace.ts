import { WorkoutPlaceDTO } from "../dtos/WorkoutDTO";
import { workoutPlaceAPI } from "./axiosConfig";

// 최근 사용한 운동 장소 가져오기 (인증 필요)
export const fetchRecentWorkoutPlacesAPI = async (): Promise<
  WorkoutPlaceDTO[]
> => {
  const response = await workoutPlaceAPI.get("/workout-places/recent");
  return response.data;
};

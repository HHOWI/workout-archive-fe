import { ExerciseDTO } from "../dtos/WorkoutDTO";
import { publicAPI } from "./axiosConfig";

// 운동 종류 목록 가져오기
export const fetchExercisesAPI = async (): Promise<ExerciseDTO[]> => {
  const response = await publicAPI.get("/exercises/exercises");
  return response.data;
};

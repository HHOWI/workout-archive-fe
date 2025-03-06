import axios from "axios";
import { WorkoutOfTheDay } from "../types/WorkoutTypes";

const instance = axios.create({
  baseURL: process.env.REACT_APP_API_URL + "/workouts",
  withCredentials: true,
});

// 운동 기록 저장하기
export const saveWorkoutRecord = async (
  workout: WorkoutOfTheDay
): Promise<any> => {
  const response = await instance.post("/workout-records", workout);
  return response.data;
};

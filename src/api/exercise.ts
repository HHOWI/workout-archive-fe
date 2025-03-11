import axios from "axios";
import { Exercise } from "../dtos/WorkoutDTO";

const instance = axios.create({
  baseURL: process.env.REACT_APP_API_URL + "/exercises",
});

// 운동 종류 목록 가져오기
export const fetchExercises = async (): Promise<Exercise[]> => {
  const response = await instance.get("/exercises");
  return response.data;
};

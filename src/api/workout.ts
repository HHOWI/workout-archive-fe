import axios from "axios";
import { WorkoutOfTheDay, WorkoutPlace } from "../types/WorkoutTypes";

const instance = axios.create({
  baseURL: process.env.REACT_APP_API_URL + "/workouts",
  withCredentials: true,
});

// 운동 기록 저장하기
export const saveWorkoutRecord = async (
  workout: WorkoutOfTheDay,
  placeInfo?: {
    kakaoPlaceId: string;
    placeName: string;
    addressName: string;
    roadAddressName: string;
    x: string;
    y: string;
  }
): Promise<any> => {
  const response = await instance.post("/workout-records", {
    ...workout,
    placeInfo,
  });
  return response.data;
};

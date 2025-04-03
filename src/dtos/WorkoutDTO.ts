import { z } from "zod";
import { ExerciseSchema } from "../schema/ExerciseSchema";
import {
  CursorPaginationSchema,
  SaveWorkoutSchema,
  DateCursorPaginationSchema,
} from "../schema/WorkoutSchema";

export interface WorkoutOfTheDayDTO {
  workoutOfTheDaySeq: number;
  recordDate: string;
  workoutPhoto?: string | null;
  workoutDiary?: string | null;
  workoutLikeCount: number;
  workoutPlace?: {
    placeName: string;
  };
  user?: {
    userNickname: string;
    profileImageUrl: string;
  };
  mainExerciseType?: string;
  workoutDetails?: WorkoutDetailDTO[];
  isLiked?: boolean;
}

export interface WorkoutDetailDTO {
  workoutDetailSeq?: number;
  exercise: {
    exerciseName: string;
    exerciseType: string;
  };
  weight?: number;
  reps?: number;
  distance?: number;
  recordTime?: number;
}

export type ExerciseDTO = z.infer<typeof ExerciseSchema>;

export interface ExerciseRecordDTO {
  id?: string;
  exercise: ExerciseDTO;
  sets: RecordDetailDTO[];
  setCount?: number;
}

export interface RecordDetailDTO {
  weight?: number | null;
  reps?: number | null;
  distance?: number | null;
  time?: number | null;
}

export interface WorkoutPlaceDTO {
  workoutPlaceSeq: number;
  kakaoPlaceId?: string;
  placeName: string;
  addressName?: string;
  roadAddressName?: string;
  x?: number | string;
  y?: number | string;
  placeAddress?: string;
}

export interface WorkoutDetailResponseDTO {
  workoutDetails: {
    exercise: ExerciseDTO;
    weight?: number;
    reps?: number;
    distance?: number;
    recordTime?: number;
  }[];
}

export type SaveWorkoutDTO = z.infer<typeof SaveWorkoutSchema>;
export type CursorPaginationDTO = z.infer<typeof CursorPaginationSchema>;
export type DateCursorPaginationDTO = z.infer<
  typeof DateCursorPaginationSchema
>;

import { z } from "zod";
import { ExerciseSchema } from "../schema/ExerciseSchema";

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
  exercise: ExerciseDTO;
  sets: RecordDetailDTO[];
  setCount?: number;
}

export interface RecordDetailDTO {
  weight?: number;
  reps?: number;
  time?: number;
  distance?: number;
  notes?: string;
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

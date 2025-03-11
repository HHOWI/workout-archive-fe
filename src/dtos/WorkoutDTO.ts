export interface WorkoutRecord {
  workoutOfTheDaySeq: number;
  recordDate: string;
  workoutPhoto: string | null;
  workoutDiary: string | null;
  workoutLikeCount: number;
  location?: string;
  workoutPlace?: {
    placeName: string;
  };
  mainExerciseType?: string;
  workoutDetails: WorkoutDetail[];
}

export interface WorkoutDetail {
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

export interface Exercise {
  exerciseSeq: number;
  exerciseType: string;
  exerciseName: string;
}

export interface WorkoutOfTheDay {
  date: string;
  location: string;
  exerciseRecords: ExerciseRecord[];
}

export interface ExerciseRecord {
  exercise: Exercise;
  sets: RecordDetail[];
  setCount?: number;
}

export interface RecordDetail {
  weight?: number;
  reps?: number;
  time?: number;
  distance?: number;
  notes?: string;
}

export interface WorkoutPlace {
  workoutPlaceSeq: number;
  kakaoPlaceId?: string;
  placeName: string;
  addressName?: string;
  roadAddressName?: string;
  x?: number | string;
  y?: number | string;
  placeAddress?: string;
}

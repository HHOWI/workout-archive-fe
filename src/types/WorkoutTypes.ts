export interface Exercise {
  exerciseSeq: number;
  exerciseType: string;
  exerciseName: string;
}

export interface RecordDetail {
  weight?: number;
  reps?: number;
  time?: number;
  distance?: number;
  notes?: string;
}

export interface ExerciseRecord {
  exercise: Exercise;
  sets: RecordDetail[];
  setCount?: number;
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

export interface WorkoutOfTheDay {
  date: string;
  location: string;
  exerciseRecords: ExerciseRecord[];
}

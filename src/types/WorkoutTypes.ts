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
}

export interface WorkoutOfTheDay {
  date: string;
  location: string;
  exerciseRecords: ExerciseRecord[];
}

export interface SetPerformanceLog {
  setNumber: number;
  reps: string;
  weight: string;
  completed: boolean;
}

export interface ExercisePerformanceLog {
  exerciseId: string;
  exerciseName: string;
  sets: SetPerformanceLog[];
}

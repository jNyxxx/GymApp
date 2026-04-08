import { GymStatus } from './GymStatus';
import { WorkoutSplit } from './WorkoutSplit';
import { ExercisePerformanceLog } from './ExerciseLog';

export interface GymEntry {
  id: string;
  dateKey: string; // YYYY-MM-DD
  status: GymStatus;
  split?: WorkoutSplit | string; // Built-in or custom split ID
  notes?: string; // Optional workout notes
  exerciseLogs?: ExercisePerformanceLog[]; // Optional performed exercise data
  loggedAt: string; // ISO timestamp
}

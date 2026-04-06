import { GymStatus } from './GymStatus';
import { WorkoutSplit } from './WorkoutSplit';

export interface GymEntry {
  id: string;
  dateKey: string; // YYYY-MM-DD
  status: GymStatus;
  split?: WorkoutSplit;
  loggedAt: string; // ISO timestamp
}

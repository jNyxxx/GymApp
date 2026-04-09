import { DEFAULT_RESET_HOUR } from '../constants/Constants';
import { GymEntry } from '../models/GymEntry';
import { ExercisePerformanceLog } from '../models/ExerciseLog';
import { GymStatus } from '../models/GymStatus';
import { WorkoutSplit } from '../models/WorkoutSplit';
import { getGymDateKey } from './DateLogicService';

export type EntryWriteSource = 'home-quick-log' | 'custom-session' | 'day-detail-edit' | 'store';
export type EntryWriteMode = 'create' | 'replace' | 'edit';

interface ResolveTargetDateInput {
  explicitDateKey?: string;
  now?: Date;
  resetHour?: number;
  resetMinute?: number;
}

interface EntryWritePolicyInput {
  existingEntry?: GymEntry | null;
  source: EntryWriteSource;
}

export interface EntryWritePolicy {
  allowsWrite: boolean;
  mode: EntryWriteMode;
  requiresReplaceConfirmation: boolean;
  blockedReason?: 'already-logged-for-effective-day';
}

interface ResolveExerciseLogsInput {
  existingEntry?: GymEntry | null;
  nextStatus: GymStatus;
  nextSplit?: WorkoutSplit | string;
  incomingExerciseLogs?: ExercisePerformanceLog[];
}

/**
 * Canonical write policy for daily entries.
 * Keeps date resolution, one-log-per-day behavior, replace semantics,
 * and exercise-log preservation decisions in one place.
 */
export class EntryPolicyService {
  /**
   * Contract:
   * - If `explicitDateKey` is provided (calendar/custom date), use it directly.
   * - Otherwise derive the key from the effective gym day (reset hour/minute).
   */
  static resolveTargetDateKey({
    explicitDateKey,
    now = new Date(),
    resetHour = DEFAULT_RESET_HOUR,
    resetMinute = 0,
  }: ResolveTargetDateInput): string {
    if (explicitDateKey) return explicitDateKey;
    return getGymDateKey(now, resetHour, resetMinute);
  }

  /**
   * Determines whether a write is allowed and how it should be interpreted.
   */
  static getWritePolicy({ existingEntry, source }: EntryWritePolicyInput): EntryWritePolicy {
    if (!existingEntry) {
      return {
        allowsWrite: true,
        mode: 'create',
        requiresReplaceConfirmation: false,
      };
    }

    if (source === 'home-quick-log') {
      // Allow upgrading from NO_GYM to WENT (user changed their mind)
      if (existingEntry.status === GymStatus.NO_GYM) {
        return {
          allowsWrite: true,
          mode: 'replace',
          requiresReplaceConfirmation: false,
        };
      }
      // Block if already logged as WENT
      return {
        allowsWrite: false,
        mode: 'edit',
        requiresReplaceConfirmation: false,
        blockedReason: 'already-logged-for-effective-day',
      };
    }

    if (source === 'custom-session') {
      return {
        allowsWrite: true,
        mode: 'replace',
        requiresReplaceConfirmation: true,
      };
    }

    if (source === 'day-detail-edit') {
      return {
        allowsWrite: true,
        mode: 'edit',
        requiresReplaceConfirmation: false,
      };
    }

    return {
      allowsWrite: true,
      mode: 'replace',
      requiresReplaceConfirmation: false,
    };
  }

  /**
   * Preserve existing exercise logs only when the entry stays a WENT entry
   * for the same split and the caller did not provide fresh logs.
   */
  static resolveExerciseLogs({
    existingEntry,
    nextStatus,
    nextSplit,
    incomingExerciseLogs,
  }: ResolveExerciseLogsInput): ExercisePerformanceLog[] | undefined {
    if (nextStatus !== GymStatus.WENT) {
      return undefined;
    }

    if (incomingExerciseLogs && incomingExerciseLogs.length > 0) {
      return incomingExerciseLogs;
    }

    if (!existingEntry || existingEntry.status !== GymStatus.WENT) {
      return undefined;
    }

    if (existingEntry.split !== nextSplit) {
      return undefined;
    }

    return existingEntry.exerciseLogs;
  }
}

import { GymEntry } from '../models/GymEntry';
import { GymStatus } from '../models/GymStatus';
import { WorkoutSplit } from '../models/WorkoutSplit';
import { EntryPolicyService } from './EntryPolicyService';

function createEntry(
  overrides: Partial<GymEntry> = {},
): GymEntry {
  return {
    id: '2026-04-06',
    dateKey: '2026-04-06',
    status: GymStatus.WENT,
    split: WorkoutSplit.PUSH,
    loggedAt: '2026-04-06T12:00:00.000Z',
    ...overrides,
  };
}

describe('EntryPolicyService', () => {
  describe('resolveTargetDateKey', () => {
    it('uses effective gym day when explicit date is not provided', () => {
      const key = EntryPolicyService.resolveTargetDateKey({
        now: new Date(2026, 3, 6, 5, 30, 0),
        resetHour: 6,
        resetMinute: 0,
      });
      expect(key).toBe('2026-04-05');
    });

    it('respects reset-minute boundary at exact reset time', () => {
      const key = EntryPolicyService.resolveTargetDateKey({
        now: new Date(2026, 3, 6, 5, 45, 0),
        resetHour: 5,
        resetMinute: 45,
      });
      expect(key).toBe('2026-04-06');
    });

    it('uses explicit date key for custom calendar entries', () => {
      const key = EntryPolicyService.resolveTargetDateKey({
        explicitDateKey: '2026-04-01',
        now: new Date(2026, 3, 6, 2, 0, 0),
        resetHour: 6,
      });
      expect(key).toBe('2026-04-01');
    });
  });

  describe('getWritePolicy', () => {
    it('creates a new entry when none exists yet', () => {
      const policy = EntryPolicyService.getWritePolicy({
        existingEntry: null,
        source: 'home-quick-log',
      });

      expect(policy.allowsWrite).toBe(true);
      expect(policy.mode).toBe('create');
      expect(policy.requiresReplaceConfirmation).toBe(false);
    });

    it('enforces one-log-per-day for home quick log when day already has entry', () => {
      const policy = EntryPolicyService.getWritePolicy({
        existingEntry: createEntry(),
        source: 'home-quick-log',
      });

      expect(policy.allowsWrite).toBe(false);
      expect(policy.mode).toBe('edit');
      expect(policy.blockedReason).toBe('already-logged-for-effective-day');
    });

    it('requires explicit replacement confirmation for custom date overwrite', () => {
      const policy = EntryPolicyService.getWritePolicy({
        existingEntry: createEntry({ dateKey: '2026-04-01' }),
        source: 'custom-session',
      });

      expect(policy.allowsWrite).toBe(true);
      expect(policy.mode).toBe('replace');
      expect(policy.requiresReplaceConfirmation).toBe(true);
    });

    it('treats same-day existing entry as replace in direct save paths', () => {
      const policy = EntryPolicyService.getWritePolicy({
        existingEntry: createEntry(),
        source: 'store',
      });

      expect(policy.allowsWrite).toBe(true);
      expect(policy.mode).toBe('replace');
      expect(policy.requiresReplaceConfirmation).toBe(false);
    });

    it('treats day-detail modifications as edits', () => {
      const policy = EntryPolicyService.getWritePolicy({
        existingEntry: createEntry(),
        source: 'day-detail-edit',
      });

      expect(policy.allowsWrite).toBe(true);
      expect(policy.mode).toBe('edit');
      expect(policy.requiresReplaceConfirmation).toBe(false);
    });
  });

  describe('resolveExerciseLogs', () => {
    const existingLogs = [
      {
        exerciseId: 'bench',
        exerciseName: 'Bench Press',
        sets: [{ setNumber: 1, reps: '8', weight: '100', completed: true }],
      },
    ];

    it('preserves logs when status stays WENT and split does not change', () => {
      const resolved = EntryPolicyService.resolveExerciseLogs({
        existingEntry: createEntry({
          split: WorkoutSplit.PUSH,
          exerciseLogs: existingLogs,
        }),
        nextStatus: GymStatus.WENT,
        nextSplit: WorkoutSplit.PUSH,
      });

      expect(resolved).toEqual(existingLogs);
    });

    it('clears logs when split changes', () => {
      const resolved = EntryPolicyService.resolveExerciseLogs({
        existingEntry: createEntry({
          split: WorkoutSplit.PUSH,
          exerciseLogs: existingLogs,
        }),
        nextStatus: GymStatus.WENT,
        nextSplit: WorkoutSplit.PULL,
      });

      expect(resolved).toBeUndefined();
    });

    it('clears logs when status changes to NO_GYM', () => {
      const resolved = EntryPolicyService.resolveExerciseLogs({
        existingEntry: createEntry({ exerciseLogs: existingLogs }),
        nextStatus: GymStatus.NO_GYM,
        nextSplit: undefined,
      });

      expect(resolved).toBeUndefined();
    });

    it('does not preserve logs when the existing entry was not a WENT session', () => {
      const resolved = EntryPolicyService.resolveExerciseLogs({
        existingEntry: createEntry({
          status: GymStatus.NO_GYM,
          split: WorkoutSplit.PUSH,
          exerciseLogs: existingLogs,
        }),
        nextStatus: GymStatus.WENT,
        nextSplit: WorkoutSplit.PUSH,
      });

      expect(resolved).toBeUndefined();
    });

    it('prefers incoming logs when provided by the caller', () => {
      const incomingLogs = [
        {
          exerciseId: 'squat',
          exerciseName: 'Squat',
          sets: [{ setNumber: 1, reps: '5', weight: '140', completed: true }],
        },
      ];
      const resolved = EntryPolicyService.resolveExerciseLogs({
        existingEntry: createEntry({ exerciseLogs: existingLogs }),
        nextStatus: GymStatus.WENT,
        nextSplit: WorkoutSplit.PUSH,
        incomingExerciseLogs: incomingLogs,
      });

      expect(resolved).toEqual(incomingLogs);
    });
  });
});

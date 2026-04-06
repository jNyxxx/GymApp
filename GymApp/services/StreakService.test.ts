import { StreakService } from './StreakService';
import { GymEntry } from '../models/GymEntry';
import { GymStatus } from '../models/GymStatus';
import { WorkoutSplit } from '../models/WorkoutSplit';

function createEntry(dateKey: string, status: GymStatus, split?: WorkoutSplit): GymEntry {
  return {
    id: dateKey,
    dateKey,
    status,
    split,
    loggedAt: new Date().toISOString(),
  };
}

describe('StreakService', () => {
  describe('calculateCurrentStreak', () => {
    it('returns 0 for empty entries', () => {
      expect(StreakService.calculateCurrentStreak([])).toBe(0);
    });

    it('returns 0 when no WENT entries exist', () => {
      const entries = [
        createEntry('2026-04-01', GymStatus.NO_GYM),
        createEntry('2026-04-02', GymStatus.NO_GYM),
      ];
      expect(StreakService.calculateCurrentStreak(entries)).toBe(0);
    });

    it('returns 1 for single WENT entry', () => {
      const entries = [createEntry('2026-04-06', GymStatus.WENT, WorkoutSplit.UPPER)];
      expect(StreakService.calculateCurrentStreak(entries)).toBe(1);
    });

    it('counts consecutive WENT days', () => {
      const entries = [
        createEntry('2026-04-04', GymStatus.WENT, WorkoutSplit.PUSH),
        createEntry('2026-04-05', GymStatus.WENT, WorkoutSplit.PULL),
        createEntry('2026-04-06', GymStatus.WENT, WorkoutSplit.LEGS),
      ];
      expect(StreakService.calculateCurrentStreak(entries)).toBe(3);
    });

    it('stops counting at gaps', () => {
      const entries = [
        createEntry('2026-04-01', GymStatus.WENT),
        createEntry('2026-04-02', GymStatus.NO_GYM), // gap
        createEntry('2026-04-04', GymStatus.WENT),
        createEntry('2026-04-05', GymStatus.WENT),
        createEntry('2026-04-06', GymStatus.WENT),
      ];
      expect(StreakService.calculateCurrentStreak(entries)).toBe(3);
    });

    it('ignores NO_GYM entries in streak calculation', () => {
      const entries = [
        createEntry('2026-04-05', GymStatus.WENT),
        createEntry('2026-04-06', GymStatus.NO_GYM),
      ];
      // Most recent WENT is 04-05, so streak is 1
      expect(StreakService.calculateCurrentStreak(entries)).toBe(1);
    });

    it('handles unordered entries', () => {
      const entries = [
        createEntry('2026-04-06', GymStatus.WENT),
        createEntry('2026-04-04', GymStatus.WENT),
        createEntry('2026-04-05', GymStatus.WENT),
      ];
      expect(StreakService.calculateCurrentStreak(entries)).toBe(3);
    });
  });

  describe('calculateBestStreak', () => {
    it('returns 0 for empty entries', () => {
      expect(StreakService.calculateBestStreak([])).toBe(0);
    });

    it('returns 0 when no WENT entries exist', () => {
      const entries = [
        createEntry('2026-04-01', GymStatus.NO_GYM),
        createEntry('2026-04-02', GymStatus.NO_GYM),
      ];
      expect(StreakService.calculateBestStreak(entries)).toBe(0);
    });

    it('returns 1 for single WENT entry', () => {
      const entries = [createEntry('2026-04-01', GymStatus.WENT)];
      expect(StreakService.calculateBestStreak(entries)).toBe(1);
    });

    it('finds longest streak among multiple', () => {
      const entries = [
        // Streak 1: 2 days
        createEntry('2026-04-01', GymStatus.WENT),
        createEntry('2026-04-02', GymStatus.WENT),
        // Gap
        createEntry('2026-04-03', GymStatus.NO_GYM),
        // Streak 2: 4 days (best)
        createEntry('2026-04-05', GymStatus.WENT),
        createEntry('2026-04-06', GymStatus.WENT),
        createEntry('2026-04-07', GymStatus.WENT),
        createEntry('2026-04-08', GymStatus.WENT),
        // Gap
        // Streak 3: 1 day
        createEntry('2026-04-15', GymStatus.WENT),
      ];
      expect(StreakService.calculateBestStreak(entries)).toBe(4);
    });

    it('handles single long streak', () => {
      const entries = [
        createEntry('2026-04-01', GymStatus.WENT),
        createEntry('2026-04-02', GymStatus.WENT),
        createEntry('2026-04-03', GymStatus.WENT),
        createEntry('2026-04-04', GymStatus.WENT),
        createEntry('2026-04-05', GymStatus.WENT),
        createEntry('2026-04-06', GymStatus.WENT),
        createEntry('2026-04-07', GymStatus.WENT),
      ];
      expect(StreakService.calculateBestStreak(entries)).toBe(7);
    });

    it('handles unordered entries', () => {
      const entries = [
        createEntry('2026-04-03', GymStatus.WENT),
        createEntry('2026-04-01', GymStatus.WENT),
        createEntry('2026-04-02', GymStatus.WENT),
      ];
      expect(StreakService.calculateBestStreak(entries)).toBe(3);
    });

    it('correctly identifies gaps across month boundaries', () => {
      const entries = [
        createEntry('2026-03-30', GymStatus.WENT),
        createEntry('2026-03-31', GymStatus.WENT),
        createEntry('2026-04-01', GymStatus.WENT),
        createEntry('2026-04-02', GymStatus.WENT),
      ];
      expect(StreakService.calculateBestStreak(entries)).toBe(4);
    });
  });
});

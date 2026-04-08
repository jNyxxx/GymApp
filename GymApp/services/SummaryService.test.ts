import { SummaryService, MonthlyStats } from './SummaryService';
import { GymEntry } from '../models/GymEntry';
import { GymStatus } from '../models/GymStatus';
import { WorkoutSplit } from '../models/WorkoutSplit';

function createEntry(dateKey: string, status: GymStatus, split?: WorkoutSplit | string): GymEntry {
  return {
    id: dateKey,
    dateKey,
    status,
    split,
    loggedAt: new Date().toISOString(),
  };
}

describe('SummaryService', () => {
  describe('getMonthlyStats', () => {
    it('returns zero stats for empty entries', () => {
      const stats = SummaryService.getMonthlyStats([], '2026-04');
      
      expect(stats.totalGymDays).toBe(0);
      expect(stats.totalNoGymDays).toBe(0);
      expect(stats.totalUnansweredDays).toBe(30); // April has 30 days
      expect(stats.sessionsPerWeek).toBe(0);
      expect(stats.currentStreak).toBe(0);
      expect(stats.bestStreak).toBe(0);
      expect(stats.strongestWeek).toBe('—');
      expect(stats.mostTrainedSplit).toBeNull();
    });

    it('counts gym days correctly', () => {
      const entries = [
        createEntry('2026-04-01', GymStatus.WENT, WorkoutSplit.UPPER),
        createEntry('2026-04-02', GymStatus.WENT, WorkoutSplit.LOWER),
        createEntry('2026-04-03', GymStatus.NO_GYM),
        createEntry('2026-04-04', GymStatus.WENT, WorkoutSplit.PUSH),
      ];
      
      const stats = SummaryService.getMonthlyStats(entries, '2026-04');
      
      expect(stats.totalGymDays).toBe(3);
      expect(stats.totalNoGymDays).toBe(1);
      expect(stats.totalUnansweredDays).toBe(26); // 30 - 4 answered
    });

    it('calculates sessions per week', () => {
      const entries = [
        createEntry('2026-04-01', GymStatus.WENT),
        createEntry('2026-04-02', GymStatus.WENT),
        createEntry('2026-04-03', GymStatus.WENT),
        createEntry('2026-04-04', GymStatus.WENT),
        createEntry('2026-04-05', GymStatus.WENT),
        createEntry('2026-04-06', GymStatus.WENT),
        createEntry('2026-04-07', GymStatus.WENT),
        createEntry('2026-04-08', GymStatus.WENT),
        createEntry('2026-04-09', GymStatus.WENT),
      ];
      
      const stats = SummaryService.getMonthlyStats(entries, '2026-04');
      
      // 9 days / 4.33 weeks ≈ 2.1
      expect(stats.sessionsPerWeek).toBeCloseTo(2.1, 1);
    });

    it('identifies most trained split', () => {
      const entries = [
        createEntry('2026-04-01', GymStatus.WENT, WorkoutSplit.UPPER),
        createEntry('2026-04-02', GymStatus.WENT, WorkoutSplit.LOWER),
        createEntry('2026-04-03', GymStatus.WENT, WorkoutSplit.UPPER),
        createEntry('2026-04-04', GymStatus.WENT, WorkoutSplit.UPPER),
        createEntry('2026-04-05', GymStatus.WENT, WorkoutSplit.LOWER),
      ];
      
      const stats = SummaryService.getMonthlyStats(entries, '2026-04');
      
      expect(stats.mostTrainedSplit).not.toBeNull();
      expect(stats.mostTrainedSplit?.split).toBe(WorkoutSplit.UPPER);
      expect(stats.mostTrainedSplit?.count).toBe(3);
    });

    it('tracks custom split ids in distribution and most-trained split', () => {
      const entries = [
        createEntry('2026-04-01', GymStatus.WENT, 'hybrid_push_pull'),
        createEntry('2026-04-02', GymStatus.WENT, 'hybrid_push_pull'),
        createEntry('2026-04-03', GymStatus.WENT, 'hybrid_push_pull'),
        createEntry('2026-04-04', GymStatus.WENT, WorkoutSplit.PUSH),
      ];

      const stats = SummaryService.getMonthlyStats(entries, '2026-04');

      expect(stats.splitCounts.hybrid_push_pull).toBe(3);
      expect(stats.mostTrainedSplit).toEqual({ split: 'hybrid_push_pull', count: 3 });
    });

    it('counts split distribution correctly', () => {
      const entries = [
        createEntry('2026-04-01', GymStatus.WENT, WorkoutSplit.PUSH),
        createEntry('2026-04-02', GymStatus.WENT, WorkoutSplit.PULL),
        createEntry('2026-04-03', GymStatus.WENT, WorkoutSplit.LEGS),
        createEntry('2026-04-04', GymStatus.WENT, WorkoutSplit.PUSH),
      ];
      
      const stats = SummaryService.getMonthlyStats(entries, '2026-04');
      
      expect(stats.splitCounts[WorkoutSplit.PUSH]).toBe(2);
      expect(stats.splitCounts[WorkoutSplit.PULL]).toBe(1);
      expect(stats.splitCounts[WorkoutSplit.LEGS]).toBe(1);
      expect(stats.splitCounts[WorkoutSplit.UPPER]).toBe(0);
    });

    it('only includes entries from specified month', () => {
      const entries = [
        createEntry('2026-03-30', GymStatus.WENT), // March
        createEntry('2026-03-31', GymStatus.WENT), // March
        createEntry('2026-04-01', GymStatus.WENT), // April
        createEntry('2026-04-02', GymStatus.WENT), // April
        createEntry('2026-05-01', GymStatus.WENT), // May
      ];
      
      const stats = SummaryService.getMonthlyStats(entries, '2026-04');
      
      expect(stats.totalGymDays).toBe(2);
    });

    it('handles February correctly (28/29 days)', () => {
      const entries = [
        createEntry('2026-02-01', GymStatus.WENT),
        createEntry('2026-02-02', GymStatus.NO_GYM),
      ];
      
      const stats = SummaryService.getMonthlyStats(entries, '2026-02');
      
      expect(stats.totalGymDays).toBe(1);
      expect(stats.totalNoGymDays).toBe(1);
      expect(stats.totalUnansweredDays).toBe(26); // 28 - 2
    });

    it('calculates strongest week', () => {
      const entries = [
        // Week 1: 2 days
        createEntry('2026-04-01', GymStatus.WENT),
        createEntry('2026-04-02', GymStatus.WENT),
        // Week 2: 5 days (strongest)
        createEntry('2026-04-08', GymStatus.WENT),
        createEntry('2026-04-09', GymStatus.WENT),
        createEntry('2026-04-10', GymStatus.WENT),
        createEntry('2026-04-11', GymStatus.WENT),
        createEntry('2026-04-12', GymStatus.WENT),
      ];
      
      const stats = SummaryService.getMonthlyStats(entries, '2026-04');
      
      expect(stats.strongestWeek).toContain('5 days');
      expect(stats.strongestWeek).toContain('Apr 8');
    });

    it('uses all entries for streak calculation', () => {
      // Streak spans from March into April
      const entries = [
        createEntry('2026-03-29', GymStatus.WENT),
        createEntry('2026-03-30', GymStatus.WENT),
        createEntry('2026-03-31', GymStatus.WENT),
        createEntry('2026-04-01', GymStatus.WENT),
        createEntry('2026-04-02', GymStatus.WENT),
      ];
      
      const stats = SummaryService.getMonthlyStats(entries, '2026-04');
      
      // Best streak should consider all entries, not just April
      expect(stats.bestStreak).toBe(5);
    });
  });
});

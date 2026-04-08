import { GymEntry } from '../models/GymEntry';
import { GymStatus } from '../models/GymStatus';
import { ProgressionService } from './ProgressionService';
import { PerformanceParsingService } from './PerformanceParsingService';

interface LoggedSet {
  reps: string;
  weight: string;
  completed?: boolean;
}

function createWorkoutEntry(
  dateKey: string,
  exerciseName: string,
  sets: LoggedSet[],
  exerciseId = exerciseName.toLowerCase().replace(/\s+/g, '_')
): GymEntry {
  return {
    id: dateKey,
    dateKey,
    status: GymStatus.WENT,
    loggedAt: new Date().toISOString(),
    exerciseLogs: [
      {
        exerciseId,
        exerciseName,
        sets: sets.map((set, index) => ({
          setNumber: index + 1,
          reps: set.reps,
          weight: set.weight,
          completed: set.completed ?? true,
        })),
      },
    ],
  };
}

describe('PerformanceParsingService', () => {
  it('parses weights with and without units', () => {
    expect(PerformanceParsingService.parseWeight('60')).toEqual({
      value: 60,
      unit: 'kg',
      valueKg: 60,
    });

    const lbs = PerformanceParsingService.parseWeight('135lbs');
    expect(lbs?.unit).toBe('lbs');
    expect(lbs?.valueKg).toBeCloseTo(61.2, 1);
  });

  it('parses reps safely and rejects invalid values', () => {
    expect(PerformanceParsingService.parseReps('10')).toBe(10);
    expect(PerformanceParsingService.parseReps('8-10')).toBe(8);
    expect(PerformanceParsingService.parseReps('abc')).toBeNull();
  });
});

describe('ProgressionService', () => {
  describe('getProgressionInsights', () => {
    it('returns empty progression data when no exercise logs exist', () => {
      const entries: GymEntry[] = [
        {
          id: '2026-04-10',
          dateKey: '2026-04-10',
          status: GymStatus.WENT,
          loggedAt: new Date().toISOString(),
        },
      ];

      const insights = ProgressionService.getProgressionInsights(entries, '2026-04');

      expect(insights.exerciseStats).toEqual([]);
      expect(insights.recentPRHighlights).toEqual([]);
      expect(insights.topImprovingExercises).toEqual([]);
    });

    it('computes latest session, best set, 1RM trend, and monthly volume', () => {
      const entries: GymEntry[] = [
        createWorkoutEntry('2026-03-05', 'Bench Press', [{ reps: '5', weight: '100kg' }]),
        createWorkoutEntry('2026-04-12', 'Bench Press', [
          { reps: '5', weight: '105kg' },
          { reps: '10', weight: '60' },
          { reps: '8', weight: '70kg', completed: false },
        ]),
      ];

      const insights = ProgressionService.getProgressionInsights(entries, '2026-04');
      const bench = insights.exerciseStats.find((exercise) => exercise.exerciseName === 'Bench Press');

      expect(bench).toBeDefined();
      expect(bench?.latestSession?.dateKey).toBe('2026-04-12');
      expect(bench?.latestSession?.completedSets).toBe(2);
      expect(bench?.latestSession?.parseableCompletedSets).toBe(2);
      expect(bench?.bestSet?.weight).toBe(105);
      expect(bench?.bestSet?.reps).toBe(5);
      expect(bench?.monthlyVolumeKg).toBeCloseTo(1125, 5);
      expect(bench?.estimatedOneRepMaxTrend.currentMonthKg).toBeCloseTo(122.5, 1);
      expect(bench?.estimatedOneRepMaxTrend.previousMonthKg).toBeCloseTo(116.7, 1);
      expect(bench?.estimatedOneRepMaxTrend.deltaKg).toBeGreaterThan(0);
    });

    it('identifies PR highlights and top improving exercises this month', () => {
      const entries: GymEntry[] = [
        createWorkoutEntry('2026-03-02', 'Bench Press', [{ reps: '5', weight: '100kg' }]),
        createWorkoutEntry('2026-03-03', 'Squat', [{ reps: '5', weight: '120kg' }]),
        createWorkoutEntry('2026-04-15', 'Bench Press', [{ reps: '5', weight: '105kg' }]),
        createWorkoutEntry('2026-04-16', 'Squat', [{ reps: '5', weight: '130kg' }]),
      ];

      const insights = ProgressionService.getProgressionInsights(entries, '2026-04');

      expect(insights.recentPRHighlights).toHaveLength(2);
      expect(insights.recentPRHighlights[0].dateKey).toBe('2026-04-16');
      expect(insights.recentPRHighlights[0].exerciseName).toBe('Squat');

      expect(insights.topImprovingExercises).toHaveLength(2);
      expect(insights.topImprovingExercises[0].exerciseName).toBe('Squat');
      expect(insights.topImprovingExercises[0].deltaKg).toBeGreaterThan(insights.topImprovingExercises[1].deltaKg);
    });

    it('supports lbs weights when estimating volume and progression', () => {
      const entries: GymEntry[] = [
        createWorkoutEntry('2026-03-12', 'Barbell Row', [{ reps: '8', weight: '120lbs' }]),
        createWorkoutEntry('2026-04-12', 'Barbell Row', [{ reps: '8', weight: '135lbs' }]),
      ];

      const insights = ProgressionService.getProgressionInsights(entries, '2026-04');
      const row = insights.exerciseStats.find((exercise) => exercise.exerciseName === 'Barbell Row');

      expect(row).toBeDefined();
      expect(row?.monthlyVolumeKg).toBeCloseTo(489.9, 1);
      expect(row?.estimatedOneRepMaxTrend.deltaKg).not.toBeNull();
      expect(row?.estimatedOneRepMaxTrend.deltaKg as number).toBeGreaterThan(0);
    });

    it('does not report PR highlights without historical sets before the selected month', () => {
      const entries: GymEntry[] = [
        createWorkoutEntry('2026-04-01', 'Deadlift', [{ reps: '5', weight: '140kg' }]),
        createWorkoutEntry('2026-04-15', 'Deadlift', [{ reps: '5', weight: '145kg' }]),
      ];

      const insights = ProgressionService.getProgressionInsights(entries, '2026-04');

      expect(insights.recentPRHighlights).toEqual([]);
      expect(insights.topImprovingExercises).toEqual([]);
    });

    it('sorts exercise stats by monthly volume (descending)', () => {
      const entries: GymEntry[] = [
        createWorkoutEntry('2026-04-05', 'Bench Press', [{ reps: '5', weight: '100kg' }]),
        createWorkoutEntry('2026-04-06', 'Squat', [{ reps: '8', weight: '120kg' }]),
      ];

      const insights = ProgressionService.getProgressionInsights(entries, '2026-04');

      expect(insights.exerciseStats[0].exerciseName).toBe('Squat');
      expect(insights.exerciseStats[1].exerciseName).toBe('Bench Press');
      expect(insights.exerciseStats[0].monthlyVolumeKg).toBeGreaterThan(insights.exerciseStats[1].monthlyVolumeKg);
    });

    it('keeps backward compatibility when completed flag is missing on sets', () => {
      const legacyEntry = {
        id: '2026-04-20',
        dateKey: '2026-04-20',
        status: GymStatus.WENT,
        loggedAt: new Date().toISOString(),
        exerciseLogs: [
          {
            exerciseId: 'legacy_bench',
            exerciseName: 'Bench Press',
            sets: [{ setNumber: 1, reps: '8', weight: '80kg' }],
          },
        ],
      } as unknown as GymEntry;

      const insights = ProgressionService.getProgressionInsights([legacyEntry], '2026-04');
      const bench = insights.exerciseStats.find((exercise) => exercise.exerciseName === 'Bench Press');

      expect(bench).toBeDefined();
      expect(bench?.latestSession?.completedSets).toBe(1);
      expect(bench?.monthlyVolumeKg).toBeCloseTo(640, 5);
    });
  });
});

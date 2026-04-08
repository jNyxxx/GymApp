import { GymEntry } from '../models/GymEntry';
import { getPreviousMonth } from './DateLogicService';
import { PerformanceParsingService, WeightUnit } from './PerformanceParsingService';

const EPSILON = 0.0001;

interface ParsedPerformanceSet {
  dateKey: string;
  setNumber: number;
  reps: number;
  weight: number;
  unit: WeightUnit;
  weightKg: number;
  estimatedOneRepMaxKg: number;
}

interface ExerciseSessionPerformance {
  dateKey: string;
  exerciseId: string;
  exerciseName: string;
  completedSets: number;
  parseableSets: ParsedPerformanceSet[];
}

export interface SetPerformanceSnapshot {
  dateKey: string;
  setNumber: number;
  reps: number;
  weight: number;
  unit: WeightUnit;
  weightKg: number;
  estimatedOneRepMaxKg: number;
}

export interface LatestSessionPerformance {
  dateKey: string;
  completedSets: number;
  parseableCompletedSets: number;
  volumeKg: number;
  estimatedOneRepMaxKg: number | null;
}

export interface OneRepMaxTrend {
  currentMonthKg: number | null;
  previousMonthKg: number | null;
  deltaKg: number | null;
}

export interface ExerciseProgressionStat {
  exerciseKey: string;
  exerciseId: string;
  exerciseName: string;
  latestSession: LatestSessionPerformance | null;
  bestSet: SetPerformanceSnapshot | null;
  estimatedOneRepMaxTrend: OneRepMaxTrend;
  monthlyVolumeKg: number;
}

export interface ProgressionHighlight {
  exerciseKey: string;
  exerciseName: string;
  dateKey: string;
  reps: number;
  weight: number;
  unit: WeightUnit;
  estimatedOneRepMaxKg: number;
  improvementKg: number;
}

export interface ExerciseImprovement {
  exerciseKey: string;
  exerciseName: string;
  currentMonthKg: number;
  previousMonthKg: number;
  deltaKg: number;
}

export interface ProgressionInsights {
  exerciseStats: ExerciseProgressionStat[];
  recentPRHighlights: ProgressionHighlight[];
  topImprovingExercises: ExerciseImprovement[];
}

/**
 * Service for deriving progression insights from logged exercise performance.
 */
export class ProgressionService {
  static getProgressionInsights(entries: GymEntry[], monthKey: string): ProgressionInsights {
    const sessionsByExercise = this.aggregateExerciseHistory(entries);
    const previousMonthKey = getPreviousMonth(monthKey);
    const monthStartKey = `${monthKey}-01`;

    const exerciseStats: ExerciseProgressionStat[] = [];
    const recentPRHighlights: ProgressionHighlight[] = [];

    for (const [exerciseKey, sessions] of sessionsByExercise.entries()) {
      const orderedSessions = [...sessions].sort((a, b) => a.dateKey.localeCompare(b.dateKey));
      const latest = orderedSessions[orderedSessions.length - 1] ?? null;
      const allSets = orderedSessions.flatMap((session) => session.parseableSets);

      const currentMonthSets = allSets.filter((set) => set.dateKey.startsWith(monthKey));
      const previousMonthSets = allSets.filter((set) => set.dateKey.startsWith(previousMonthKey));

      const currentMonthBestBy1RM = this.selectBestByOneRepMax(currentMonthSets);
      const previousMonthBestBy1RM = this.selectBestByOneRepMax(previousMonthSets);

      const currentMonth1RM = currentMonthBestBy1RM?.estimatedOneRepMaxKg ?? null;
      const previousMonth1RM = previousMonthBestBy1RM?.estimatedOneRepMaxKg ?? null;
      const trendDelta =
        currentMonth1RM !== null && previousMonth1RM !== null
          ? currentMonth1RM - previousMonth1RM
          : null;

      const monthlyVolumeKg = this.sumVolumeKg(currentMonthSets);
      const bestSet = this.selectBestSet(allSets);

      exerciseStats.push({
        exerciseKey,
        exerciseId: latest?.exerciseId ?? exerciseKey,
        exerciseName: latest?.exerciseName ?? 'Exercise',
        latestSession: latest
          ? {
              dateKey: latest.dateKey,
              completedSets: latest.completedSets,
              parseableCompletedSets: latest.parseableSets.length,
              volumeKg: this.sumVolumeKg(latest.parseableSets),
              estimatedOneRepMaxKg: this.selectBestByOneRepMax(latest.parseableSets)?.estimatedOneRepMaxKg ?? null,
            }
          : null,
        bestSet: bestSet ? this.toSetSnapshot(bestSet) : null,
        estimatedOneRepMaxTrend: {
          currentMonthKg: currentMonth1RM,
          previousMonthKg: previousMonth1RM,
          deltaKg: trendDelta,
        },
        monthlyVolumeKg,
      });

      if (currentMonthBestBy1RM) {
        const historicalSets = allSets.filter((set) => set.dateKey < monthStartKey);
        const historicalBest = this.selectBestByOneRepMax(historicalSets);

        if (historicalBest) {
          const improvement = currentMonthBestBy1RM.estimatedOneRepMaxKg - historicalBest.estimatedOneRepMaxKg;
          if (improvement > EPSILON) {
            recentPRHighlights.push({
              exerciseKey,
              exerciseName: latest?.exerciseName ?? 'Exercise',
              dateKey: currentMonthBestBy1RM.dateKey,
              reps: currentMonthBestBy1RM.reps,
              weight: currentMonthBestBy1RM.weight,
              unit: currentMonthBestBy1RM.unit,
              estimatedOneRepMaxKg: currentMonthBestBy1RM.estimatedOneRepMaxKg,
              improvementKg: improvement,
            });
          }
        }
      }
    }

    const topImprovingExercises: ExerciseImprovement[] = exerciseStats
      .filter(
        (exercise) =>
          exercise.estimatedOneRepMaxTrend.deltaKg !== null && exercise.estimatedOneRepMaxTrend.deltaKg > EPSILON
      )
      .map((exercise) => ({
        exerciseKey: exercise.exerciseKey,
        exerciseName: exercise.exerciseName,
        currentMonthKg: exercise.estimatedOneRepMaxTrend.currentMonthKg as number,
        previousMonthKg: exercise.estimatedOneRepMaxTrend.previousMonthKg as number,
        deltaKg: exercise.estimatedOneRepMaxTrend.deltaKg as number,
      }))
      .sort((a, b) => b.deltaKg - a.deltaKg);

    exerciseStats.sort((a, b) => b.monthlyVolumeKg - a.monthlyVolumeKg || a.exerciseName.localeCompare(b.exerciseName));
    recentPRHighlights.sort((a, b) => b.dateKey.localeCompare(a.dateKey) || b.improvementKg - a.improvementKg);

    return {
      exerciseStats,
      recentPRHighlights,
      topImprovingExercises,
    };
  }

  private static aggregateExerciseHistory(entries: GymEntry[]): Map<string, ExerciseSessionPerformance[]> {
    const sessionsByExercise = new Map<string, ExerciseSessionPerformance[]>();
    const orderedEntries = [...entries].sort((a, b) => a.dateKey.localeCompare(b.dateKey));

    for (const entry of orderedEntries) {
      if (!Array.isArray(entry.exerciseLogs) || entry.exerciseLogs.length === 0) continue;

      for (const exercise of entry.exerciseLogs) {
        const exerciseName = typeof exercise.exerciseName === 'string' ? exercise.exerciseName.trim() || 'Exercise' : 'Exercise';
        const exerciseId = typeof exercise.exerciseId === 'string' ? exercise.exerciseId : exerciseName;
        const exerciseKey = this.getExerciseKey(exerciseId, exerciseName);
        const parseableSets: ParsedPerformanceSet[] = [];
        let completedSets = 0;
        const sets = Array.isArray(exercise.sets) ? exercise.sets : [];

        for (const set of sets) {
          const isCompleted = set.completed !== false;
          if (!isCompleted) continue;
          completedSets += 1;

          const parsedWeight = PerformanceParsingService.parseWeight(set.weight);
          const parsedReps = PerformanceParsingService.parseReps(set.reps);
          if (!parsedWeight || parsedReps === null) continue;

          parseableSets.push({
            dateKey: entry.dateKey,
            setNumber: set.setNumber,
            reps: parsedReps,
            weight: parsedWeight.value,
            unit: parsedWeight.unit,
            weightKg: parsedWeight.valueKg,
            estimatedOneRepMaxKg: this.estimateOneRepMax(parsedWeight.valueKg, parsedReps),
          });
        }

        const existing = sessionsByExercise.get(exerciseKey) ?? [];
        existing.push({
          dateKey: entry.dateKey,
          exerciseId,
          exerciseName,
          completedSets,
          parseableSets,
        });
        sessionsByExercise.set(exerciseKey, existing);
      }
    }

    return sessionsByExercise;
  }

  private static getExerciseKey(exerciseId: string, exerciseName: string): string {
    const normalizedName = exerciseName.trim().toLowerCase();
    if (normalizedName) return normalizedName;
    return exerciseId.trim().toLowerCase() || 'exercise';
  }

  private static estimateOneRepMax(weightKg: number, reps: number): number {
    return weightKg * (1 + reps / 30);
  }

  private static selectBestSet(sets: ParsedPerformanceSet[]): ParsedPerformanceSet | null {
    if (sets.length === 0) return null;

    return sets.reduce((best, candidate) => {
      if (candidate.weightKg > best.weightKg + EPSILON) return candidate;
      if (Math.abs(candidate.weightKg - best.weightKg) <= EPSILON && candidate.reps > best.reps) return candidate;
      if (
        Math.abs(candidate.weightKg - best.weightKg) <= EPSILON &&
        Math.abs(candidate.reps - best.reps) <= EPSILON &&
        candidate.dateKey > best.dateKey
      ) {
        return candidate;
      }
      return best;
    });
  }

  private static selectBestByOneRepMax(sets: ParsedPerformanceSet[]): ParsedPerformanceSet | null {
    if (sets.length === 0) return null;

    return sets.reduce((best, candidate) => {
      if (candidate.estimatedOneRepMaxKg > best.estimatedOneRepMaxKg + EPSILON) return candidate;
      if (
        Math.abs(candidate.estimatedOneRepMaxKg - best.estimatedOneRepMaxKg) <= EPSILON &&
        candidate.dateKey > best.dateKey
      ) {
        return candidate;
      }
      return best;
    });
  }

  private static sumVolumeKg(sets: ParsedPerformanceSet[]): number {
    return sets.reduce((sum, set) => sum + set.weightKg * set.reps, 0);
  }

  private static toSetSnapshot(set: ParsedPerformanceSet): SetPerformanceSnapshot {
    return {
      dateKey: set.dateKey,
      setNumber: set.setNumber,
      reps: set.reps,
      weight: set.weight,
      unit: set.unit,
      weightKg: set.weightKg,
      estimatedOneRepMaxKg: set.estimatedOneRepMaxKg,
    };
  }
}

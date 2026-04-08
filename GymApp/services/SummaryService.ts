import { GymEntry } from '../models/GymEntry';
import { GymStatus } from '../models/GymStatus';
import { WorkoutSplit } from '../models/WorkoutSplit';
import { getMonthKey, getDateRange, getGymDateKey, parseDateKey } from './DateLogicService';
import { StreakService } from './StreakService';
import { AVERAGE_WEEKS_PER_MONTH } from '../constants/Constants';

export interface MonthlyStats {
  totalGymDays: number;
  totalNoGymDays: number;
  totalUnansweredDays: number;
  sessionsPerWeek: number;
  currentStreak: number;
  bestStreak: number;
  strongestWeek: string;
  mostTrainedSplit: { split: string; count: number } | null;
  splitCounts: Record<string, number>;
}

/**
 * Service for computing monthly summary statistics.
 */
export class SummaryService {
  /**
   * Get comprehensive monthly stats for a given month key (YYYY-MM).
   */
  static getMonthlyStats(entries: GymEntry[], monthKey: string): MonthlyStats {
    const monthEntries = entries.filter((e) => e.dateKey.startsWith(monthKey));
    const allEntries = entries;

    // Count status types
    const totalGymDays = monthEntries.filter((e) => e.status === GymStatus.WENT).length;
    const totalNoGymDays = monthEntries.filter((e) => e.status === GymStatus.NO_GYM).length;

    // Calculate total days in the month
    const [year, month] = monthKey.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    const totalAnswered = totalGymDays + totalNoGymDays;
    const totalUnansweredDays = daysInMonth - totalAnswered;

    // Sessions per week (average based on weeks per month)
    const sessionsPerWeek = parseFloat((totalGymDays / AVERAGE_WEEKS_PER_MONTH).toFixed(1));

    // Streaks (from ALL entries, not just this month)
    const currentStreak = StreakService.calculateCurrentStreak(allEntries);
    const bestStreak = StreakService.calculateBestStreak(allEntries);

    // Strongest week (most gym days in any 7-day window)
    const strongestWeek = this.calculateStrongestWeek(monthEntries);

    // Split counts — start with built-in splits, then add any custom ones found
    const splitCounts: Record<string, number> = {
      [WorkoutSplit.UPPER]: 0,
      [WorkoutSplit.LOWER]: 0,
      [WorkoutSplit.PUSH]: 0,
      [WorkoutSplit.PULL]: 0,
      [WorkoutSplit.LEGS]: 0,
      [WorkoutSplit.POSTERIOR]: 0,
      [WorkoutSplit.ANTERIOR]: 0,
    };

    // First pass: collect all unique split IDs
    for (const entry of monthEntries) {
      if (entry.split && !splitCounts.hasOwnProperty(entry.split)) {
        splitCounts[entry.split] = 0;
      }
    }

    // Second pass: count
    for (const entry of monthEntries) {
      if (entry.split) {
        splitCounts[entry.split] = (splitCounts[entry.split] || 0) + 1;
      }
    }

    // Most trained split — across ALL splits (built-in + custom)
    let mostTrainedSplit: { split: string; count: number } | null = null;
    for (const [split, count] of Object.entries(splitCounts)) {
      if (count > 0 && (!mostTrainedSplit || count > mostTrainedSplit.count)) {
        mostTrainedSplit = { split, count };
      }
    }

    return {
      totalGymDays,
      totalNoGymDays,
      totalUnansweredDays,
      sessionsPerWeek,
      currentStreak,
      bestStreak,
      strongestWeek,
      mostTrainedSplit,
      splitCounts,
    };
  }

  /**
   * Find the week with the most gym days in a month.
   * Returns a label like "Week of Jan 5".
   */
  private static calculateStrongestWeek(monthEntries: GymEntry[]): string {
    const wentEntries = monthEntries
      .filter((e) => e.status === GymStatus.WENT)
      .sort((a, b) => a.dateKey.localeCompare(b.dateKey));

    if (wentEntries.length === 0) return '—';

    let bestStart = wentEntries[0].dateKey;
    let bestCount = 0;

    // Sliding 7-day window
    for (const start of wentEntries) {
      const startDate = parseDateKey(start.dateKey);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);

      const count = wentEntries.filter((e) => {
        const d = parseDateKey(e.dateKey);
        return d >= startDate && d <= endDate;
      }).length;

      if (count > bestCount) {
        bestCount = count;
        bestStart = start.dateKey;
      }
    }

    const startLabel = this.formatShortDate(bestStart);
    return `${startLabel} (${bestCount} days)`;
  }

  private static formatShortDate(dateKey: string): string {
    const date = parseDateKey(dateKey);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}`;
  }
}

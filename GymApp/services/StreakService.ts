import { GymEntry } from '../models/GymEntry';
import { GymStatus } from '../models/GymStatus';
import { getDateRange, getGymDateKey, parseDateKey } from './DateLogicService';

/**
 * Service for calculating streaks from gym entries.
 */
export class StreakService {
  /**
   * Calculate the current streak (consecutive gym days ending today or most recent logged day).
   * Counts backwards from today (or most recent entry) through consecutive WENT days.
   */
  static calculateCurrentStreak(entries: GymEntry[]): number {
    if (entries.length === 0) return 0;

    const todayKey = getGymDateKey();
    const sorted = entries
      .filter((e) => e.status === GymStatus.WENT)
      .map((e) => e.dateKey)
      .sort()
      .reverse();

    if (sorted.length === 0) return 0;

    // Start counting from the most recent WENT day
    let streak = 0;
    let expectedDate = new Date(parseDateKey(sorted[0]));

    for (const key of sorted) {
      const expectedKey = toDateKey(expectedDate);

      if (key === expectedKey) {
        streak++;
        expectedDate.setDate(expectedDate.getDate() - 1);
      } else if (key < expectedKey) {
        // Gap found — streak ends
        break;
      }
    }

    return streak;
  }

  /**
   * Calculate the best streak ever recorded.
   * Looks at all WENT days and finds the longest consecutive run.
   */
  static calculateBestStreak(entries: GymEntry[]): number {
    const wentKeys = entries
      .filter((e) => e.status === GymStatus.WENT)
      .map((e) => e.dateKey)
      .sort();

    if (wentKeys.length === 0) return 0;

    let best = 1;
    let current = 1;

    for (let i = 1; i < wentKeys.length; i++) {
      const prevDate = parseDateKey(wentKeys[i - 1]);
      const currDate = parseDateKey(wentKeys[i]);

      const diffDays = Math.round(
        (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffDays === 1) {
        current++;
        best = Math.max(best, current);
      } else {
        current = 1;
      }
    }

    return best;
  }
}

/**
 * Converts a Date to YYYY-MM-DD format.
 * Exported for use by StreakService.
 */
function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

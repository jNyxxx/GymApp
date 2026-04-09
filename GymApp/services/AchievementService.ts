import AsyncStorage from '@react-native-async-storage/async-storage';
import { GymEntry } from '../models/GymEntry';
import { GymStatus } from '../models/GymStatus';
import { Achievement, ACHIEVEMENTS, UnlockedAchievement } from '../models/Achievement';
import { StreakService } from './StreakService';
import { parseDateKey, getMonthKey } from './DateLogicService';

const STORAGE_KEY = 'unlocked_achievements';

/**
 * Service for checking and managing achievements.
 */
export class AchievementService {
  /**
   * Get all unlocked achievements.
   */
  static async getUnlocked(): Promise<UnlockedAchievement[]> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch (error) {
      console.error('[AchievementService] Failed to load achievements:', error);
      return [];
    }
  }

  /**
   * Check if an achievement is unlocked.
   */
  static async isUnlocked(achievementId: string): Promise<boolean> {
    const unlocked = await this.getUnlocked();
    return unlocked.some((a) => a.achievementId === achievementId);
  }

  /**
   * Unlock an achievement.
   */
  private static async unlock(achievementId: string): Promise<void> {
    const unlocked = await this.getUnlocked();
    
    if (unlocked.some((a) => a.achievementId === achievementId)) {
      return; // Already unlocked
    }
    
    unlocked.push({
      achievementId,
      unlockedAt: new Date().toISOString(),
    });
    
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(unlocked));
  }

  /**
   * Check all achievements and return newly unlocked ones.
   */
  static async checkAchievements(entries: GymEntry[]): Promise<Achievement[]> {
    const newlyUnlocked: Achievement[] = [];
    const unlocked = await this.getUnlocked();
    const unlockedIds = new Set(unlocked.map((a) => a.achievementId));

    for (const achievement of ACHIEVEMENTS) {
      if (unlockedIds.has(achievement.id)) {
        continue; // Already unlocked
      }

      const isEarned = this.checkCondition(achievement, entries);
      
      if (isEarned) {
        await this.unlock(achievement.id);
        newlyUnlocked.push(achievement);
      }
    }

    return newlyUnlocked;
  }

  /**
   * Check if a specific achievement condition is met.
   */
  private static checkCondition(achievement: Achievement, entries: GymEntry[]): boolean {
    const { condition } = achievement;
    const wentEntries = entries.filter((e) => e.status === GymStatus.WENT);
    const noGymEntries = entries.filter((e) => e.status === GymStatus.NO_GYM);

    switch (condition.type) {
      case 'first_session':
        return wentEntries.length >= 1;

      case 'total_sessions':
        return wentEntries.length >= (condition.value || 0);

      case 'streak': {
        const bestStreak = StreakService.calculateBestStreak(entries);
        return bestStreak >= (condition.value || 0);
      }

      case 'split_variety': {
        const uniqueSplits = new Set(wentEntries.map((e) => e.split).filter(Boolean));
        return uniqueSplits.size >= (condition.value || 0);
      }

      case 'weekly_consistency': {
        return this.checkWeeklyConsistency(
          wentEntries,
          condition.value || 4,
          condition.weeks || 4
        );
      }

      case 'monthly_sessions': {
        return this.checkMonthlySessions(wentEntries, condition.value || 15);
      }

      case 'split_mastery': {
        if (condition.splitType === 'single') {
          return this.checkSplitDedication(wentEntries, condition.value || 10);
        }
        return this.checkSplitMastery(wentEntries, condition.value || 7);
      }

      case 'rest_days': {
        return noGymEntries.length >= (condition.value || 10);
      }

      case 'balance': {
        return this.checkBalancedLife(entries, condition.value || 10);
      }

      default:
        return false;
    }
  }

  /**
   * Check if user has maintained N sessions per week for M consecutive weeks.
   */
  private static checkWeeklyConsistency(
    wentEntries: GymEntry[],
    sessionsPerWeek: number,
    consecutiveWeeks: number
  ): boolean {
    if (wentEntries.length < sessionsPerWeek * consecutiveWeeks) {
      return false;
    }

    // Group entries by week (ISO week number)
    const weekCounts: Map<string, number> = new Map();

    for (const entry of wentEntries) {
      const date = parseDateKey(entry.dateKey);
      const weekKey = this.getISOWeekKey(date);
      weekCounts.set(weekKey, (weekCounts.get(weekKey) || 0) + 1);
    }

    // Sort weeks and find consecutive weeks meeting the threshold
    const sortedWeeks = Array.from(weekCounts.entries())
      .sort(([a], [b]) => a.localeCompare(b));

    let consecutive = 0;
    let lastWeek: string | null = null;

    for (const [weekKey, count] of sortedWeeks) {
      if (count >= sessionsPerWeek) {
        if (lastWeek === null || this.areConsecutiveWeeks(lastWeek, weekKey)) {
          consecutive++;
          if (consecutive >= consecutiveWeeks) {
            return true;
          }
        } else {
          consecutive = 1;
        }
        lastWeek = weekKey;
      } else {
        consecutive = 0;
        lastWeek = null;
      }
    }

    return false;
  }

  /**
   * Check if user has logged N sessions in any single calendar month.
   */
  private static checkMonthlySessions(
    wentEntries: GymEntry[],
    targetSessions: number
  ): boolean {
    if (wentEntries.length < targetSessions) return false;

    // Group by month
    const monthCounts: Map<string, number> = new Map();
    for (const entry of wentEntries) {
      const monthKey = getMonthKey(parseDateKey(entry.dateKey));
      monthCounts.set(monthKey, (monthCounts.get(monthKey) || 0) + 1);
    }

    // Check if any month meets the target
    for (const [, count] of monthCounts) {
      if (count >= targetSessions) return true;
    }
    return false;
  }

  /**
   * Check if user has trained all N built-in splits in any single month.
   */
  private static checkSplitMastery(
    wentEntries: GymEntry[],
    targetSplits: number
  ): boolean {
    // Group splits by month
    const monthSplits: Map<string, Set<string>> = new Map();
    for (const entry of wentEntries) {
      if (!entry.split) continue;
      const monthKey = getMonthKey(parseDateKey(entry.dateKey));
      if (!monthSplits.has(monthKey)) {
        monthSplits.set(monthKey, new Set());
      }
      monthSplits.get(monthKey)!.add(entry.split!);
    }

    // Check if any month has all target splits
    for (const [, splits] of monthSplits) {
      if (splits.size >= targetSplits) return true;
    }
    return false;
  }

  /**
   * Check if user has hit the same split N times in any single month.
   */
  private static checkSplitDedication(
    wentEntries: GymEntry[],
    targetCount: number
  ): boolean {
    // Group split counts by month
    const monthSplitCounts: Map<string, Map<string, number>> = new Map();
    for (const entry of wentEntries) {
      if (!entry.split) continue;
      const monthKey = getMonthKey(parseDateKey(entry.dateKey));
      if (!monthSplitCounts.has(monthKey)) {
        monthSplitCounts.set(monthKey, new Map());
      }
      const splitMap = monthSplitCounts.get(monthKey)!;
      splitMap.set(entry.split, (splitMap.get(entry.split) || 0) + 1);
    }

    // Check if any split was hit targetCount times in any month
    for (const [, splitMap] of monthSplitCounts) {
      for (const [, count] of splitMap) {
        if (count >= targetCount) return true;
      }
    }
    return false;
  }

  /**
   * Check if user has equal WENT and NO_GYM days in any month (both >= target).
   */
  private static checkBalancedLife(
    entries: GymEntry[],
    target: number
  ): boolean {
    // Group by month
    const monthWent: Map<string, number> = new Map();
    const monthNoGym: Map<string, number> = new Map();

    for (const entry of entries) {
      const monthKey = getMonthKey(parseDateKey(entry.dateKey));
      if (entry.status === GymStatus.WENT) {
        monthWent.set(monthKey, (monthWent.get(monthKey) || 0) + 1);
      } else if (entry.status === GymStatus.NO_GYM) {
        monthNoGym.set(monthKey, (monthNoGym.get(monthKey) || 0) + 1);
      }
    }

    // Check if any month has balanced counts
    for (const [monthKey, wentCount] of monthWent) {
      const noGymCount = monthNoGym.get(monthKey) || 0;
      if (wentCount >= target && noGymCount >= target) return true;
    }
    return false;
  }

  /**
   * Get ISO week key (YYYY-WW format).
   */
  private static getISOWeekKey(date: Date): string {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
    const week1 = new Date(d.getFullYear(), 0, 4);
    const weekNum = 1 + Math.round(
      ((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7
    );
    return `${d.getFullYear()}-${String(weekNum).padStart(2, '0')}`;
  }

  /**
   * Check if two week keys are consecutive.
   */
  private static areConsecutiveWeeks(week1: string, week2: string): boolean {
    const [y1, w1] = week1.split('-').map(Number);
    const [y2, w2] = week2.split('-').map(Number);

    if (y1 === y2) {
      return w2 === w1 + 1;
    } else if (y2 === y1 + 1 && w2 === 1) {
      // First week of next year - check if it's consecutive
      // This is a simplification; proper ISO week handling is more complex
      return w1 >= 52;
    }
    return false;
  }

  /**
   * Get progress towards next achievements.
   */
  static async getProgress(entries: GymEntry[]): Promise<{ achieved: number; total: number }> {
    const unlocked = await this.getUnlocked();
    return {
      achieved: unlocked.length,
      total: ACHIEVEMENTS.length,
    };
  }

  /**
   * Clear all achievements (for testing/reset).
   */
  static async clearAll(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEY);
  }
}

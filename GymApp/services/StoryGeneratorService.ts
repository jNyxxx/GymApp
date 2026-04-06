import { MonthlyStats } from './SummaryService';
import { SPLIT_LABELS } from '../models/WorkoutSplit';

export class StoryGeneratorService {
  static generateStory(stats: MonthlyStats): string {
    const lines: string[] = [];
    lines.push(this.getOpening(stats));
    lines.push(this.getStreakLine(stats));
    lines.push(this.getStrongestWeekLine(stats));
    lines.push(this.getMostTrainedSplitLine(stats));
    lines.push(this.getClosing(stats));
    return lines.filter(Boolean).join('\n');
  }

  private static getOpening(stats: MonthlyStats): string {
    const { totalGymDays, totalNoGymDays, totalUnansweredDays, sessionsPerWeek } = stats;

    if (totalGymDays === 0 && totalNoGymDays === 0) {
      return 'A blank canvas this month. Time to make some memories at the gym!';
    }

    if (sessionsPerWeek >= 4) {
      return `Elite consistency! ${totalGymDays} gym days averaging ${sessionsPerWeek} sessions per week. You are a machine!`;
    }

    if (sessionsPerWeek >= 3) {
      return `Strong month! ${totalGymDays} gym days, ${sessionsPerWeek} sessions per week on average. You are building real momentum.`;
    }

    if (sessionsPerWeek >= 2) {
      return `Solid effort with ${totalGymDays} gym days. ${totalNoGymDays} rest days and ${totalUnansweredDays} unanswered. Room to grow!`;
    }

    if (totalGymDays > 0) {
      return `${totalGymDays} gym days this month. Every session counts — keep showing up!`;
    }

    return `${totalNoGymDays} logged rest days and ${totalUnansweredDays} unanswered. Next month is a fresh start!`;
  }

  private static getStreakLine(stats: MonthlyStats): string {
    const { currentStreak, bestStreak } = stats;

    if (bestStreak === 0) {
      return 'No streaks yet — consistency is the next goal!';
    }

    if (currentStreak >= 7) {
      return `You are on a ${currentStreak}-day streak right now! Unstoppable energy!`;
    }

    if (currentStreak >= 3) {
      return `${currentStreak}-day current streak. Keep the fire going!`;
    }

    if (bestStreak >= 5) {
      return `Best streak: ${bestStreak} days. You have proven you can go hard — time to beat it!`;
    }

    return `Best streak ever: ${bestStreak} ${bestStreak === 1 ? 'day' : 'days'}. Let us build consistency!`;
  }

  private static getStrongestWeekLine(stats: MonthlyStats): string {
    if (stats.strongestWeek === '—') return '';
    return `Strongest week: ${stats.strongestWeek}. That is the blueprint for a great month!`;
  }

  private static getMostTrainedSplitLine(stats: MonthlyStats): string {
    if (!stats.mostTrainedSplit) return '';
    const splitName = SPLIT_LABELS[stats.mostTrainedSplit.split];
    return `${splitName} was your go-to split with ${stats.mostTrainedSplit.count} session${stats.mostTrainedSplit.count > 1 ? 's' : ''}.`;
  }

  private static getClosing(stats: MonthlyStats): string {
    const { sessionsPerWeek, totalGymDays } = stats;

    if (totalGymDays === 0) {
      return 'Next month starts fresh. Day one is always the best day. Let us go!';
    }

    if (sessionsPerWeek >= 4) {
      return 'You are operating at an elite level. Keep protecting that consistency!';
    }

    if (sessionsPerWeek >= 2) {
      return 'Good foundation. Push for one more session per week and watch the transformation.';
    }

    return 'Every rep matters. Every day you show up is a win. Next month will be better.';
  }
}

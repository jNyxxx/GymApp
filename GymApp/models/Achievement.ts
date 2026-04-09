/**
 * Achievement definitions and types.
 */

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'streak' | 'milestone' | 'consistency' | 'special';
  condition: AchievementCondition;
}

export interface AchievementCondition {
  type: 'streak' | 'total_sessions' | 'weekly_consistency' | 'split_variety' | 'first_session' | 'monthly_sessions' | 'split_mastery' | 'template_usage' | 'rest_days' | 'balance';
  value?: number;
  weeks?: number;
  splitType?: 'single' | 'all';
}

export interface UnlockedAchievement {
  achievementId: string;
  unlockedAt: string;
}

/**
 * All available achievements.
 */
export const ACHIEVEMENTS: Achievement[] = [
  // First milestones
  {
    id: 'first_session',
    title: 'First Step',
    description: 'Log your first gym session',
    icon: 'navigate',
    category: 'milestone',
    condition: { type: 'first_session' },
  },

  // Streak achievements
  {
    id: 'streak_3',
    title: 'Getting Started',
    description: 'Achieve a 3-day streak',
    icon: 'flame',
    category: 'streak',
    condition: { type: 'streak', value: 3 },
  },
  {
    id: 'streak_7',
    title: 'Week Warrior',
    description: 'Achieve a 7-day streak',
    icon: 'flash',
    category: 'streak',
    condition: { type: 'streak', value: 7 },
  },
  {
    id: 'streak_14',
    title: 'Two Week Terror',
    description: 'Achieve a 14-day streak',
    icon: 'barbell',
    category: 'streak',
    condition: { type: 'streak', value: 14 },
  },
  {
    id: 'streak_30',
    title: 'Monthly Machine',
    description: 'Achieve a 30-day streak',
    icon: 'trophy',
    category: 'streak',
    condition: { type: 'streak', value: 30 },
  },
  {
    id: 'streak_100',
    title: 'Century Club',
    description: 'Achieve a 100-day streak',
    icon: 'diamond',
    category: 'streak',
    condition: { type: 'streak', value: 100 },
  },

  // Total sessions
  {
    id: 'sessions_10',
    title: 'Warming Up',
    description: 'Complete 10 gym sessions',
    icon: 'walk',
    category: 'milestone',
    condition: { type: 'total_sessions', value: 10 },
  },
  {
    id: 'sessions_25',
    title: 'Quarter Century',
    description: 'Complete 25 gym sessions',
    icon: 'medal',
    category: 'milestone',
    condition: { type: 'total_sessions', value: 25 },
  },
  {
    id: 'sessions_50',
    title: 'Halfway Hero',
    description: 'Complete 50 gym sessions',
    icon: 'award',
    category: 'milestone',
    condition: { type: 'total_sessions', value: 50 },
  },
  {
    id: 'sessions_100',
    title: 'Century Slammer',
    description: 'Complete 100 gym sessions',
    icon: 'ribbon',
    category: 'milestone',
    condition: { type: 'total_sessions', value: 100 },
  },
  {
    id: 'sessions_250',
    title: 'Iron Veteran',
    description: 'Complete 250 gym sessions',
    icon: 'shield-checkmark',
    category: 'milestone',
    condition: { type: 'total_sessions', value: 250 },
  },
  {
    id: 'sessions_500',
    title: 'Gym Legend',
    description: 'Complete 500 gym sessions',
    icon: 'star',
    category: 'milestone',
    condition: { type: 'total_sessions', value: 500 },
  },

  // Consistency
  {
    id: 'weekly_4x4',
    title: 'Consistency King',
    description: 'Hit 4+ sessions/week for 4 weeks straight',
    icon: 'trending-up',
    category: 'consistency',
    condition: { type: 'weekly_consistency', value: 4, weeks: 4 },
  },

  // Special
  {
    id: 'split_variety',
    title: 'Well Rounded',
    description: 'Train at least 5 different splits',
    icon: 'layers',
    category: 'special',
    condition: { type: 'split_variety', value: 5 },
  },

  // Monthly milestones
  {
    id: 'monthly_15',
    title: 'Monthly Regular',
    description: 'Log 15 gym days in a single month',
    icon: 'calendar',
    category: 'consistency',
    condition: { type: 'monthly_sessions', value: 15 },
  },
  {
    id: 'monthly_20',
    title: 'Monthly Devotee',
    description: 'Log 20 gym days in a single month',
    icon: 'calendar-number',
    category: 'consistency',
    condition: { type: 'monthly_sessions', value: 20 },
  },
  {
    id: 'monthly_perfect',
    title: 'Perfect Month',
    description: 'Log gym every day for a full 30-day month',
    icon: 'sparkles',
    category: 'consistency',
    condition: { type: 'monthly_sessions', value: 30 },
  },

  // Split mastery
  {
    id: 'split_master',
    title: 'Split Master',
    description: 'Train all 7 built-in splits in one month',
    icon: 'grid',
    category: 'special',
    condition: { type: 'split_mastery', value: 7 },
  },
  {
    id: 'split_dedication',
    title: 'Split Dedication',
    description: 'Hit the same split 10 times in a month',
    icon: 'bullseye',
    category: 'special',
    condition: { type: 'split_mastery', value: 10, splitType: 'single' },
  },

  // Rest day achievements
  {
    id: 'rest_day_warrior',
    title: 'Rest Day Warrior',
    description: 'Log 10 No Gym days (rest is important too!)',
    icon: 'moon',
    category: 'special',
    condition: { type: 'rest_days', value: 10 },
  },
  {
    id: 'balanced_life',
    title: 'Balanced Life',
    description: 'Have equal WENT and NO_GYM days in a month (10+ each)',
    icon: 'balance',
    category: 'special',
    condition: { type: 'balance', value: 10 },
  },
];

/**
 * Get achievement by ID.
 */
export function getAchievementById(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id);
}

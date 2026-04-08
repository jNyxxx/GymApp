/**
 * Achievement definitions and types.
 */

export interface Achievement {
  id: string;
  title: string;
  description: string;
  emoji: string;
  category: 'streak' | 'milestone' | 'consistency' | 'special';
  condition: AchievementCondition;
}

export interface AchievementCondition {
  type: 'streak' | 'total_sessions' | 'weekly_consistency' | 'split_variety' | 'first_session';
  value?: number;
  weeks?: number;
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
    emoji: '🎯',
    category: 'milestone',
    condition: { type: 'first_session' },
  },
  
  // Streak achievements
  {
    id: 'streak_3',
    title: 'Getting Started',
    description: 'Achieve a 3-day streak',
    emoji: '🔥',
    category: 'streak',
    condition: { type: 'streak', value: 3 },
  },
  {
    id: 'streak_7',
    title: 'Week Warrior',
    description: 'Achieve a 7-day streak',
    emoji: '⚡',
    category: 'streak',
    condition: { type: 'streak', value: 7 },
  },
  {
    id: 'streak_14',
    title: 'Two Week Terror',
    description: 'Achieve a 14-day streak',
    emoji: '💪',
    category: 'streak',
    condition: { type: 'streak', value: 14 },
  },
  {
    id: 'streak_30',
    title: 'Monthly Machine',
    description: 'Achieve a 30-day streak',
    emoji: '🏆',
    category: 'streak',
    condition: { type: 'streak', value: 30 },
  },
  {
    id: 'streak_100',
    title: 'Century Club',
    description: 'Achieve a 100-day streak',
    emoji: '👑',
    category: 'streak',
    condition: { type: 'streak', value: 100 },
  },
  
  // Total sessions
  {
    id: 'sessions_10',
    title: 'Warming Up',
    description: 'Complete 10 gym sessions',
    emoji: '🏃',
    category: 'milestone',
    condition: { type: 'total_sessions', value: 10 },
  },
  {
    id: 'sessions_25',
    title: 'Quarter Century',
    description: 'Complete 25 gym sessions',
    emoji: '🎖️',
    category: 'milestone',
    condition: { type: 'total_sessions', value: 25 },
  },
  {
    id: 'sessions_50',
    title: 'Halfway Hero',
    description: 'Complete 50 gym sessions',
    emoji: '🥈',
    category: 'milestone',
    condition: { type: 'total_sessions', value: 50 },
  },
  {
    id: 'sessions_100',
    title: 'Century Slammer',
    description: 'Complete 100 gym sessions',
    emoji: '🥇',
    category: 'milestone',
    condition: { type: 'total_sessions', value: 100 },
  },
  {
    id: 'sessions_250',
    title: 'Iron Veteran',
    description: 'Complete 250 gym sessions',
    emoji: '🏅',
    category: 'milestone',
    condition: { type: 'total_sessions', value: 250 },
  },
  {
    id: 'sessions_500',
    title: 'Gym Legend',
    description: 'Complete 500 gym sessions',
    emoji: '🌟',
    category: 'milestone',
    condition: { type: 'total_sessions', value: 500 },
  },
  
  // Consistency
  {
    id: 'weekly_4x4',
    title: 'Consistency King',
    description: 'Hit 4+ sessions/week for 4 weeks straight',
    emoji: '📈',
    category: 'consistency',
    condition: { type: 'weekly_consistency', value: 4, weeks: 4 },
  },
  
  // Special
  {
    id: 'split_variety',
    title: 'Well Rounded',
    description: 'Train at least 5 different splits',
    emoji: '🎭',
    category: 'special',
    condition: { type: 'split_variety', value: 5 },
  },
];

/**
 * Get achievement by ID.
 */
export function getAchievementById(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id);
}

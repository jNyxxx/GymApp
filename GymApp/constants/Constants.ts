export const APP_NAME = 'We Go Gym';

export const STORAGE_KEYS = {
  ENTRIES: 'gym_entries',
  SETTINGS: 'app_settings',
  CUSTOM_SPLITS: 'custom_splits',
  WORKOUT_TEMPLATES: 'workout_templates',
  ENTRIES_VERSION: 'gym_entries_version',
  SETTINGS_VERSION: 'app_settings_version',
  TEMPLATES_VERSION: 'workout_templates_version',
  GOALS: 'fitness_goals_v2',
};

export const DEFAULT_RESET_HOUR = 6;

// Average weeks per month (used for calculating sessions per week)
export const AVERAGE_WEEKS_PER_MONTH = 4.33;

export const DARK_COLORS = {
  bg: '#0a0e1a',
  bgGradient: '#0d1117',
  cardBg: '#111827',
  cardBgAlt: '#0f1525',
  cardBorder: '#1e2a3a',
  cardBorderSubtle: '#1a2332',
  inputBg: '#0b1220',
  inputBorder: '#223047',
  primaryBorder: 'rgba(0, 212, 255, 0.3)',
  primary: '#00D4FF',
  primaryDark: '#0099CC',
  primaryGlow: 'rgba(0, 212, 255, 0.12)',
  primaryGlowStrong: 'rgba(0, 212, 255, 0.25)',
  success: '#00E676',
  successBg: 'rgba(0, 230, 118, 0.12)',
  danger: '#FF5252',
  dangerBg: 'rgba(255, 82, 82, 0.12)',
  warning: '#FFB74D',
  warningBg: 'rgba(255, 183, 77, 0.12)',
  text: '#FFFFFF',
  textSecondary: '#8892B0',
  textMuted: '#4A5578',
  gray: '#1a2332',
  grayLight: '#2a3548',
  grayBorder: '#2a3548',
  progressBarBg: '#1a2332',
  tabBarBg: '#0d1117',
  tabBarBorder: '#1a2332',
  tabActiveBg: 'rgba(0, 212, 255, 0.15)',
  overlay: 'rgba(0, 0, 0, 0.6)',
};

export const LIGHT_COLORS = {
  bg: '#F5F7FA',
  bgGradient: '#EEF1F5',
  cardBg: '#FFFFFF',
  cardBgAlt: '#F8F9FC',
  cardBorder: '#E2E8F0',
  cardBorderSubtle: '#EDF2F7',
  inputBg: '#FFFFFF',
  inputBorder: '#D7DEE8',
  primaryBorder: 'rgba(0, 120, 255, 0.25)',
  primary: '#0078FF',
  primaryDark: '#0060CC',
  primaryGlow: 'rgba(0, 120, 255, 0.08)',
  primaryGlowStrong: 'rgba(0, 120, 255, 0.15)',
  success: '#00C853',
  successBg: 'rgba(0, 200, 83, 0.1)',
  danger: '#E53935',
  dangerBg: 'rgba(229, 57, 53, 0.1)',
  warning: '#F57C00',
  warningBg: 'rgba(245, 124, 0, 0.1)',
  text: '#1A202C',
  textSecondary: '#718096',
  textMuted: '#A0AEC0',
  gray: '#E2E8F0',
  grayLight: '#CBD5E0',
  grayBorder: '#E2E8F0',
  progressBarBg: '#E2E8F0',
  tabBarBg: '#FFFFFF',
  tabBarBorder: '#E2E8F0',
  tabActiveBg: 'rgba(0, 120, 255, 0.1)',
  overlay: 'rgba(0, 0, 0, 0.4)',
};

export function getColors(theme: 'dark' | 'light') {
  return theme === 'dark' ? DARK_COLORS : LIGHT_COLORS;
}

export type ThemeMode = 'dark' | 'light';

export interface AppSettings {
  theme: ThemeMode;
  remindersEnabled: boolean;
  reminderHour: number;
  reminderMinute: number;
  resetHour: number; // 6 AM default, changeable
}

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  remindersEnabled: false,
  reminderHour: 18,
  reminderMinute: 0,
  resetHour: 6,
};

export type ThemeMode = 'dark' | 'light';

export interface AppSettings {
  theme: ThemeMode;
  remindersEnabled: boolean;
  reminderHour: number;
  reminderMinute: number;
  resetHour: number;
  resetMinute: number;
}

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  remindersEnabled: false,
  reminderHour: 18,
  reminderMinute: 0,
  resetHour: 6,
  resetMinute: 0,
};

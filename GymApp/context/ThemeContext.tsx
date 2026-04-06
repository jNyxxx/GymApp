import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { DARK_COLORS, LIGHT_COLORS, getColors } from '../constants/Constants';
import { AppSettings, DEFAULT_SETTINGS } from '../models/AppSettings';
import { STORAGE_KEYS } from '../constants/Constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeMode } from '../models/AppSettings';
import { NotificationService } from '../services/NotificationService';

type ThemeColors = typeof DARK_COLORS;

interface ThemeContextValue {
  theme: ThemeMode;
  colors: ThemeColors;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
  settings: AppSettings;
  updateSettings: (updated: Partial<AppSettings>) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
        if (raw) {
          setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(raw) });
        }
      } catch {
        // Use defaults
      }
      setLoading(false);
    })();
  }, []);

  // Schedule notifications on first load
  useEffect(() => {
    if (!loading) {
      (async () => {
        try {
          if (settings.remindersEnabled) {
            await NotificationService.scheduleDailyReminder(
              settings.reminderHour,
              settings.reminderMinute
            );
          }
          await NotificationService.scheduleResetNotification(settings.resetHour, settings.resetMinute);
        } catch {
          // Ignore scheduling errors on load
        }
      })();
    }
  }, [loading]);

  const updateSettings = async (updated: Partial<AppSettings>) => {
    const next = { ...settings, ...updated };
    setSettings(next);
    await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(next));

    // Handle notification scheduling when reminder settings change
    if ('remindersEnabled' in updated || 'reminderHour' in updated || 'reminderMinute' in updated) {
      if (next.remindersEnabled) {
        await NotificationService.scheduleDailyReminder(next.reminderHour, next.reminderMinute);
      } else {
        await NotificationService.cancelReminder();
      }
    }

    // Handle reset hour notification
    if ('resetHour' in updated || 'resetMinute' in updated) {
      await NotificationService.scheduleResetNotification(next.resetHour, next.resetMinute);
    }
  };

  const toggleTheme = () => {
    updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' });
  };

  const setTheme = (theme: ThemeMode) => {
    updateSettings({ theme });
  };

  const colors = getColors(settings.theme);

  if (loading) {
    return null;
  }

  return (
    <ThemeContext.Provider
      value={{ theme: settings.theme, colors, toggleTheme, setTheme, settings, updateSettings }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

export function useColors() {
  const { colors } = useTheme();
  return colors;
}

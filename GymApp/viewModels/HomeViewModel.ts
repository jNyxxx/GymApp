import { useState } from 'react';
import { GymStatus } from '../models/GymStatus';
import { WorkoutSplit } from '../models/WorkoutSplit';
import { ExercisePerformanceLog } from '../models/ExerciseLog';
import { GymLogService } from '../services/GymLogService';
import { getMonthKey } from '../services/DateLogicService';
import { EntryPolicyService } from '../services/EntryPolicyService';
import { useTheme } from '../context/ThemeContext';
import { useGymStore } from '../context/GymStore';

/**
 * ViewModel for the Home screen.
 */
export function useHomeViewModel() {
  const { settings } = useTheme();
  const [showSplitPicker, setShowSplitPicker] = useState(false);

  // Use global store for reactive updates
  const todayEntry = useGymStore((state) => state.todayEntry);
  const currentStreak = useGymStore((state) => state.currentStreak);
  const bestStreak = useGymStore((state) => state.bestStreak);
  const monthlyStats = useGymStore((state) => state.monthlyStats);
  const loading = useGymStore((state) => state.loading);
  const storeRefresh = useGymStore((state) => state.refresh);

  const monthKey = getMonthKey();
  const quickLogPolicy = EntryPolicyService.getWritePolicy({
    existingEntry: todayEntry,
    source: 'home-quick-log',
  });
  const quickLogBlockedMessage =
    quickLogPolicy.blockedReason === 'already-logged-for-effective-day'
      ? 'You already logged a gym session today! Tap your session card above to edit it.'
      : '';

  const confirmAndSaveWentGym = async (
    split: WorkoutSplit | string,
    notes?: string,
    exerciseLogs?: ExercisePerformanceLog[]
  ) => {
    if (!quickLogPolicy.allowsWrite) return false;

    try {
      await GymLogService.saveEntry(
        GymStatus.WENT,
        split,
        undefined,
        notes,
        undefined,
        exerciseLogs,
        {
          source: 'home-quick-log',
          resetHour: settings.resetHour,
          resetMinute: settings.resetMinute,
        }
      );
      setShowSplitPicker(false);
      await storeRefresh(settings.resetHour, settings.resetMinute);
      return true;
    } catch (error) {
      console.warn('[HomeViewModel] Failed to save quick gym entry:', error);
      return false;
    }
  };

  const confirmAndSaveNoGym = async () => {
    if (!quickLogPolicy.allowsWrite) return false;
    try {
      await GymLogService.saveEntry(GymStatus.NO_GYM, undefined, undefined, undefined, undefined, undefined, {
        source: 'home-quick-log',
        resetHour: settings.resetHour,
        resetMinute: settings.resetMinute,
      });
      await storeRefresh(settings.resetHour, settings.resetMinute);
      return true;
    } catch (error) {
      console.warn('[HomeViewModel] Failed to save quick no-gym entry:', error);
      return false;
    }
  };

  const openSplitPicker = () => {
    if (!quickLogPolicy.allowsWrite) return false;
    setShowSplitPicker(true);
    return true;
  };

  const closeSplitPicker = () => setShowSplitPicker(false);

  const [year, month] = monthKey.split('-').map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();

  return {
    todayEntry,
    loading,
    showSplitPicker,
    currentStreak,
    bestStreak,
    monthlyStats,
    daysInMonth,
    canQuickLogToday: quickLogPolicy.allowsWrite,
    quickLogBlockedMessage,
    confirmAndSaveWentGym,
    confirmAndSaveNoGym,
    openSplitPicker,
    closeSplitPicker,
    refresh: () => storeRefresh(settings.resetHour, settings.resetMinute),
  };
}

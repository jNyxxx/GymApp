import { useState } from 'react';
import { GymStatus } from '../models/GymStatus';
import { WorkoutSplit } from '../models/WorkoutSplit';
import { ExercisePerformanceLog } from '../models/ExerciseLog';
import { GymLogService } from '../services/GymLogService';
import { getMonthKey } from '../services/DateLogicService';
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

  const confirmAndSaveWentGym = async (
    split: WorkoutSplit | string,
    notes?: string,
    exerciseLogs?: ExercisePerformanceLog[]
  ) => {
    await GymLogService.saveEntry(GymStatus.WENT, split, undefined, notes, undefined, exerciseLogs);
    setShowSplitPicker(false);
    await storeRefresh(settings.resetHour, settings.resetMinute);
  };

  const confirmAndSaveNoGym = async () => {
    await GymLogService.saveEntry(GymStatus.NO_GYM);
    await storeRefresh(settings.resetHour, settings.resetMinute);
  };

  const openSplitPicker = () => {
    if (todayEntry) return;
    setShowSplitPicker(true);
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
    confirmAndSaveWentGym,
    confirmAndSaveNoGym,
    openSplitPicker,
    closeSplitPicker,
    refresh: () => storeRefresh(settings.resetHour, settings.resetMinute),
  };
}

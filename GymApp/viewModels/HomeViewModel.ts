import { useState, useEffect, useCallback } from 'react';
import { GymStatus } from '../models/GymStatus';
import { WorkoutSplit } from '../models/WorkoutSplit';
import { GymEntry } from '../models/GymEntry';
import { GymLogService } from '../services/GymLogService';
import { getGymDateKey, getMonthKey } from '../services/DateLogicService';
import { StreakService } from '../services/StreakService';
import { SummaryService, MonthlyStats } from '../services/SummaryService';
import { useTheme } from '../context/ThemeContext';

/**
 * ViewModel for the Home screen.
 */
export function useHomeViewModel() {
  const { settings } = useTheme();
  const [todayEntry, setTodayEntry] = useState<GymEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSplitPicker, setShowSplitPicker] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats | null>(null);
  const [showOverwriteConfirm, setShowOverwriteConfirm] = useState(false);

  const todayKey = getGymDateKey(new Date(), settings.resetHour);
  const monthKey = getMonthKey();

  const loadAll = useCallback(async () => {
    setLoading(true);

    const entry = await GymLogService.getEntry(todayKey);
    setTodayEntry(entry);

    const allEntries = await GymLogService.getAllEntries();

    const streak = StreakService.calculateCurrentStreak(allEntries);
    const best = StreakService.calculateBestStreak(allEntries);
    setCurrentStreak(streak);
    setBestStreak(best);

    const stats = SummaryService.getMonthlyStats(allEntries, monthKey);
    setMonthlyStats(stats);

    setLoading(false);
  }, [todayKey, monthKey]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const confirmAndSaveWentGym = async (split: WorkoutSplit) => {
    await GymLogService.saveEntry(GymStatus.WENT, split);
    setShowSplitPicker(false);
    setShowOverwriteConfirm(false);
    await loadAll();
  };

  const confirmAndSaveNoGym = async () => {
    await GymLogService.saveEntry(GymStatus.NO_GYM);
    setShowOverwriteConfirm(false);
    await loadAll();
  };

  const openSplitPicker = () => {
    if (todayEntry) {
      setShowOverwriteConfirm(true);
    } else {
      setShowSplitPicker(true);
    }
  };

  const closeSplitPicker = () => setShowSplitPicker(false);
  const closeOverwriteConfirm = () => setShowOverwriteConfirm(false);

  const [year, month] = monthKey.split('-').map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();

  return {
    todayEntry,
    loading,
    showSplitPicker,
    showOverwriteConfirm,
    currentStreak,
    bestStreak,
    monthlyStats,
    daysInMonth,
    confirmAndSaveWentGym,
    confirmAndSaveNoGym,
    openSplitPicker,
    closeSplitPicker,
    closeOverwriteConfirm,
    refresh: loadAll,
  };
}

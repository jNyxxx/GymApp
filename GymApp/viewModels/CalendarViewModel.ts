import { useState, useEffect, useCallback } from 'react';
import { GymEntry } from '../models/GymEntry';
import { GymLogService } from '../services/GymLogService';
import {
  getMonthKey,
  getPreviousMonth,
  getNextMonth,
  formatMonthLabel,
  parseDateKey,
  getGymDateKey,
} from '../services/DateLogicService';
import { useTheme } from '../context/ThemeContext';

export function useCalendarViewModel() {
  const { settings } = useTheme();
  const [currentMonth, setCurrentMonth] = useState(getMonthKey());
  const [entries, setEntries] = useState<GymEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [showDayDetail, setShowDayDetail] = useState(false);

  const todayKey = getGymDateKey(new Date(), settings.resetHour);

  const loadMonth = useCallback(async (monthKey: string) => {
    setLoading(true);
    const monthEntries = await GymLogService.getMonthEntries(monthKey);
    setEntries(monthEntries);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadMonth(currentMonth);
  }, [currentMonth, loadMonth]);

  const goToPrevMonth = () => {
    setCurrentMonth(getPreviousMonth(currentMonth));
  };

  const goToNextMonth = () => {
    setCurrentMonth(getNextMonth(currentMonth));
  };

  const openDayDetail = (dateKey: string) => {
    setSelectedDateKey(dateKey);
    setShowDayDetail(true);
  };

  const closeDayDetail = async () => {
    setShowDayDetail(false);
    await loadMonth(currentMonth);
  };

  const getEntryForDate = (dateKey: string): GymEntry | undefined => {
    return entries.find((e) => e.dateKey === dateKey);
  };

  const monthLabel = formatMonthLabel(currentMonth);

  return {
    currentMonth,
    entries,
    loading,
    monthLabel,
    selectedDateKey,
    todayKey,
    showDayDetail,
    goToPrevMonth,
    goToNextMonth,
    openDayDetail,
    closeDayDetail,
    getEntryForDate,
    refresh: () => loadMonth(currentMonth),
  };
}

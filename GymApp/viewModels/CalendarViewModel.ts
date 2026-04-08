import { useState, useEffect, useCallback, useMemo } from 'react';
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
import { useGymStore } from '../context/GymStore';

export function useCalendarViewModel() {
  const { settings } = useTheme();
  const [currentMonth, setCurrentMonth] = useState(getMonthKey());
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [showDayDetail, setShowDayDetail] = useState(false);

  // Use global store for entries - auto-updates when home logs a session
  const allEntries = useGymStore((state) => state.entries);
  const storeRefresh = useGymStore((state) => state.refresh);

  const todayKey = getGymDateKey(new Date(), settings.resetHour);

  // Filter entries for current month
  const entries = useMemo(() => {
    return allEntries.filter((e) => e.dateKey.startsWith(currentMonth));
  }, [allEntries, currentMonth]);

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

  const closeDayDetail = () => {
    setShowDayDetail(false);
  };

  const getEntryForDate = (dateKey: string): GymEntry | undefined => {
    return entries.find((e) => e.dateKey === dateKey);
  };

  const monthLabel = formatMonthLabel(currentMonth);

  return {
    currentMonth,
    entries,
    loading: false,
    monthLabel,
    selectedDateKey,
    todayKey,
    showDayDetail,
    goToPrevMonth,
    goToNextMonth,
    openDayDetail,
    closeDayDetail,
    getEntryForDate,
    refresh: () => storeRefresh(settings.resetHour, settings.resetMinute),
  };
}

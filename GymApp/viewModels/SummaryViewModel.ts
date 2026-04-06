import { useState, useEffect, useCallback } from 'react';
import { GymEntry } from '../models/GymEntry';
import { GymLogService } from '../services/GymLogService';
import { SummaryService, MonthlyStats } from '../services/SummaryService';
import { getMonthKey, getPreviousMonth, getNextMonth, formatMonthLabel } from '../services/DateLogicService';

export function useSummaryViewModel() {
  const [currentMonth, setCurrentMonth] = useState(getMonthKey());
  const [stats, setStats] = useState<MonthlyStats | null>(null);
  const [allEntries, setAllEntries] = useState<GymEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async (monthKey: string) => {
    setLoading(true);
    const entries = await GymLogService.getAllEntries();
    setAllEntries(entries);
    const monthlyStats = SummaryService.getMonthlyStats(entries, monthKey);
    setStats(monthlyStats);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData(currentMonth);
  }, [currentMonth, loadData]);

  const goToPrevMonth = () => {
    setCurrentMonth(getPreviousMonth(currentMonth));
  };

  const goToNextMonth = () => {
    setCurrentMonth(getNextMonth(currentMonth));
  };

  const monthLabel = formatMonthLabel(currentMonth);

  return {
    currentMonth,
    stats,
    allEntries,
    loading,
    monthLabel,
    goToPrevMonth,
    goToNextMonth,
    refresh: () => loadData(currentMonth),
  };
}

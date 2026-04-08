import { useState, useEffect, useCallback } from 'react';
import { GymEntry } from '../models/GymEntry';
import { SummaryService, MonthlyStats } from '../services/SummaryService';
import { ProgressionInsights, ProgressionService } from '../services/ProgressionService';
import { getMonthKey, getPreviousMonth, getNextMonth, formatMonthLabel } from '../services/DateLogicService';
import { useGymStore } from '../context/GymStore';

export function useSummaryViewModel() {
  const [currentMonth, setCurrentMonth] = useState(getMonthKey());
  const [stats, setStats] = useState<MonthlyStats | null>(null);
  const [progressionInsights, setProgressionInsights] = useState<ProgressionInsights | null>(null);
  const [loading, setLoading] = useState(true);

  // Use global store for reactive updates across tabs
  const allEntries = useGymStore((state) => state.entries);

  const loadData = useCallback((entries: GymEntry[], monthKey: string) => {
    setLoading(true);
    const monthlyStats = SummaryService.getMonthlyStats(entries, monthKey);
    const progression = ProgressionService.getProgressionInsights(entries, monthKey);
    setStats(monthlyStats);
    setProgressionInsights(progression);
    setLoading(false);
  }, []);

  // Reactively update when store entries change
  useEffect(() => {
    loadData(allEntries, currentMonth);
  }, [allEntries, currentMonth, loadData]);

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
    progressionInsights,
    allEntries,
    loading,
    monthLabel,
    goToPrevMonth,
    goToNextMonth,
    refresh: () => loadData(allEntries, currentMonth),
  };
}

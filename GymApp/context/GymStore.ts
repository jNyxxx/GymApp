import { create } from 'zustand';
import { GymEntry } from '../models/GymEntry';
import { GymStatus } from '../models/GymStatus';
import { WorkoutSplit } from '../models/WorkoutSplit';
import { GymLogService } from '../services/GymLogService';
import { StreakService } from '../services/StreakService';
import { SummaryService, MonthlyStats } from '../services/SummaryService';
import { getGymDateKey, getMonthKey } from '../services/DateLogicService';

interface GymStore {
  // Data
  entries: GymEntry[];
  todayEntry: GymEntry | null;
  currentStreak: number;
  bestStreak: number;
  monthlyStats: MonthlyStats | null;

  // Loading states
  loading: boolean;
  initialized: boolean;
  refreshing: boolean;

  // Actions
  initialize: (resetHour?: number, resetMinute?: number) => Promise<void>;
  saveEntry: (status: GymStatus, split?: WorkoutSplit | string, dateKey?: string, resetHour?: number, resetMinute?: number) => Promise<GymEntry>;
  deleteEntry: (dateKey: string, resetHour?: number, resetMinute?: number) => Promise<void>;
  refresh: (resetHour?: number, resetMinute?: number) => Promise<void>;
  clearAllData: () => Promise<void>;

  // Internal
  _computeStats: (entries: GymEntry[], resetHour: number, resetMinute: number) => void;
}

/**
 * Global store for gym data.
 * Provides single source of truth for all screens.
 * Eliminates stale data issues between screens.
 */
export const useGymStore = create<GymStore>((set, get) => ({
  // Initial state
  entries: [],
  todayEntry: null,
  currentStreak: 0,
  bestStreak: 0,
  monthlyStats: null,
  loading: true,
  initialized: false,
  refreshing: false,

  initialize: async (resetHour = 6, resetMinute = 0) => {
    if (get().initialized) return;

    set({ loading: true });

    try {
      const entries = await GymLogService.getAllEntries();
      get()._computeStats(entries, resetHour, resetMinute);
      set({ initialized: true });
    } catch (error) {
      console.error('[GymStore] Failed to initialize:', error);
      set({ loading: false });
    }
  },

  saveEntry: async (status, split, dateKey, resetHour = 6, resetMinute = 0) => {
    const entry = await GymLogService.saveEntry(status, split, dateKey);

    // Refresh all data after save
    const entries = await GymLogService.getAllEntries();
    get()._computeStats(entries, resetHour, resetMinute);

    return entry;
  },

  deleteEntry: async (dateKey, resetHour = 6, resetMinute = 0) => {
    await GymLogService.deleteEntry(dateKey);

    // Refresh all data after delete
    const entries = await GymLogService.getAllEntries();
    get()._computeStats(entries, resetHour, resetMinute);
  },

  refresh: async (resetHour = 6, resetMinute = 0) => {
    set({ refreshing: true });

    try {
      const entries = await GymLogService.getAllEntries();
      get()._computeStats(entries, resetHour, resetMinute);
    } catch (error) {
      console.error('[GymStore] Failed to refresh:', error);
    } finally {
      set({ refreshing: false });
    }
  },

  clearAllData: async () => {
    await GymLogService.clearAllEntries();
    set({
      entries: [],
      todayEntry: null,
      currentStreak: 0,
      bestStreak: 0,
      monthlyStats: null,
    });
  },

  _computeStats: (entries, resetHour, resetMinute = 0) => {
    const todayKey = getGymDateKey(new Date(), resetHour, resetMinute);
    const monthKey = getMonthKey();
    
    const todayEntry = entries.find((e) => e.dateKey === todayKey) || null;
    const currentStreak = StreakService.calculateCurrentStreak(entries);
    const bestStreak = StreakService.calculateBestStreak(entries);
    const monthlyStats = SummaryService.getMonthlyStats(entries, monthKey);
    
    set({
      entries,
      todayEntry,
      currentStreak,
      bestStreak,
      monthlyStats,
      loading: false,
    });
  },
}));

/**
 * Hook for calendar-specific data.
 * Derives month entries from global store.
 */
export function useCalendarEntries(monthKey: string) {
  const entries = useGymStore((state) => state.entries);
  return entries.filter((e) => e.dateKey.startsWith(monthKey));
}

/**
 * Hook to get entry for a specific date.
 */
export function useEntryForDate(dateKey: string) {
  const entries = useGymStore((state) => state.entries);
  return entries.find((e) => e.dateKey === dateKey) || null;
}

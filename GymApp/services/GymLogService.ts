import AsyncStorage from '@react-native-async-storage/async-storage';
import { GymEntry } from '../models/GymEntry';
import { GymStatus } from '../models/GymStatus';
import { WorkoutSplit } from '../models/WorkoutSplit';
import { ExercisePerformanceLog } from '../models/ExerciseLog';
import { STORAGE_KEYS } from '../constants/Constants';
import { getGymDateKey } from '../services/DateLogicService';
import { 
  validateGymEntries, 
  validateExportData,
  formatValidationErrors,
  CURRENT_DATA_VERSION,
  ValidatedExportData,
} from '../models/schemas';

/**
 * Service responsible for saving, retrieving, and managing daily gym log entries.
 * Uses AsyncStorage for persistence.
 */
export class GymLogService {
  /**
   * Load all entries from storage.
   */
  static async getAllEntries(): Promise<GymEntry[]> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.ENTRIES);
      if (!raw) return [];
      
      const parsed = JSON.parse(raw);
      const result = validateGymEntries(parsed);
      
      if (!result.success) {
        console.warn('[GymLogService] Invalid entries in storage:', formatValidationErrors(result.error));
        // Return what we can parse, filter out invalid entries
        return Array.isArray(parsed) ? parsed.filter((e: unknown) => 
          typeof e === 'object' && e !== null && 'dateKey' in e && 'status' in e
        ) : [];
      }
      
      return result.data;
    } catch (error) {
      console.error('[GymLogService] Failed to load entries:', error);
      return [];
    }
  }

  /**
   * Save or update today's entry. If an entry already exists for the date key,
   * it will be overwritten (latest tap wins).
   */
  static async saveEntry(
    status: GymStatus,
    split?: WorkoutSplit | string,
    dateKey?: string,
    notes?: string,
    loggedAt?: string,
    exerciseLogs?: ExercisePerformanceLog[]
  ): Promise<GymEntry> {
    const entries = await this.getAllEntries();
    const key = dateKey || getGymDateKey();
    const normalizedExerciseLogs =
      status === GymStatus.WENT
        ? exerciseLogs
            ?.map((exercise) => ({
              exerciseId: exercise.exerciseId,
              exerciseName: exercise.exerciseName.trim() || 'Exercise',
              sets: exercise.sets.map((set) => ({
                setNumber: set.setNumber,
                reps: set.reps.trim(),
                weight: set.weight.trim(),
                completed: Boolean(set.completed),
              })),
            }))
            .filter((exercise) => exercise.sets.length > 0)
        : undefined;

    const newEntry: GymEntry = {
      id: `${key}`,
      dateKey: key,
      status,
      split,
      notes: notes?.trim() || undefined,
      exerciseLogs: normalizedExerciseLogs?.length ? normalizedExerciseLogs : undefined,
      loggedAt: loggedAt || new Date().toISOString(),
    };

    // Remove existing entry for this date (latest tap wins)
    const filtered = entries.filter((e) => e.dateKey !== key);
    filtered.push(newEntry);

    await AsyncStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(filtered));
    return newEntry;
  }

  /**
   * Update notes for an existing entry.
   */
  static async updateNotes(dateKey: string, notes: string): Promise<GymEntry | null> {
    const entries = await this.getAllEntries();
    const entryIndex = entries.findIndex((e) => e.dateKey === dateKey);
    
    if (entryIndex === -1) return null;
    
    entries[entryIndex] = {
      ...entries[entryIndex],
      notes: notes.trim() || undefined,
    };
    
    await AsyncStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(entries));
    return entries[entryIndex];
  }

  /**
   * Get a specific entry by its date key.
   */
  static async getEntry(dateKey: string): Promise<GymEntry | null> {
    const entries = await this.getAllEntries();
    return entries.find((e) => e.dateKey === dateKey) || null;
  }

  /**
   * Backward-compatible alias for getEntry.
   */
  static async getEntryByDate(dateKey: string): Promise<GymEntry | null> {
    return this.getEntry(dateKey);
  }

  /**
   * Delete an entry for a given date key.
   */
  static async deleteEntry(dateKey: string): Promise<void> {
    const entries = await this.getAllEntries();
    const filtered = entries.filter((e) => e.dateKey !== dateKey);
    await AsyncStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(filtered));
  }

  /**
   * Get entries for a specific month (YYYY-MM).
   */
  static async getMonthEntries(monthKey: string): Promise<GymEntry[]> {
    const entries = await this.getAllEntries();
    return entries.filter((e) => e.dateKey.startsWith(monthKey));
  }

  /**
   * Get all entries sorted by date.
   */
  static async getSortedEntries(): Promise<GymEntry[]> {
    const entries = await this.getAllEntries();
    return entries.sort((a, b) => a.dateKey.localeCompare(b.dateKey));
  }

  /**
   * Clear all entries from storage.
   */
  static async clearAllEntries(): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify([]));
  }

  /**
   * Export all entries as a versioned JSON string.
   * Includes metadata for future compatibility.
   */
  static async exportData(): Promise<string> {
    const entries = await this.getAllEntries();
    
    const exportEnvelope: ValidatedExportData = {
      version: CURRENT_DATA_VERSION,
      exportedAt: new Date().toISOString(),
      entries,
    };
    
    return JSON.stringify(exportEnvelope, null, 2);
  }

  /**
   * Import entries from JSON string.
   * Validates data before importing.
   * @throws Error if validation fails
   */
  static async importData(jsonString: string): Promise<{ imported: number; errors: string[] }> {
    const errors: string[] = [];
    
    try {
      const parsed = JSON.parse(jsonString);
      
      // Check if it's the new versioned format
      const versionedResult = validateExportData(parsed);
      if (versionedResult.success) {
        // Handle version migrations if needed in the future
        const data = versionedResult.data;
        await AsyncStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(data.entries));
        return { imported: data.entries.length, errors: [] };
      }
      
      // Fall back to legacy format (just an array of entries)
      const legacyResult = validateGymEntries(parsed);
      if (legacyResult.success) {
        await AsyncStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(legacyResult.data));
        return { imported: legacyResult.data.length, errors: [] };
      }
      
      // Both validations failed
      errors.push('Invalid data format');
      if (!versionedResult.success) {
        errors.push(formatValidationErrors(versionedResult.error));
      }
      
      return { imported: 0, errors };
    } catch (parseError) {
      errors.push(`JSON parse error: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
      return { imported: 0, errors };
    }
  }
}

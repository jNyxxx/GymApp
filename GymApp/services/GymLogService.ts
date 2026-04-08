import AsyncStorage from '@react-native-async-storage/async-storage';
import { GymEntry } from '../models/GymEntry';
import { GymStatus } from '../models/GymStatus';
import { WorkoutSplit } from '../models/WorkoutSplit';
import { ExercisePerformanceLog } from '../models/ExerciseLog';
import { STORAGE_KEYS } from '../constants/Constants';
import { EntryPolicyService, EntryWriteSource } from './EntryPolicyService';
import {
  CURRENT_DATA_VERSION,
  ValidatedExportData,
} from '../models/schemas';
import { DataMigrationService } from './DataMigrationService';

interface SaveEntryPolicyOptions {
  source?: EntryWriteSource;
  resetHour?: number;
  resetMinute?: number;
  now?: Date;
}

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
      return await DataMigrationService.getEntries();
    } catch (error) {
      console.error('[GymLogService] Failed to load entries:', error);
      return [];
    }
  }

  /**
   * Save or update a daily entry according to EntryPolicyService rules.
   * Existing entries for the same date key are replaced after policy checks.
   */
  static async saveEntry(
    status: GymStatus,
    split?: WorkoutSplit | string,
    dateKey?: string,
    notes?: string,
    loggedAt?: string,
    exerciseLogs?: ExercisePerformanceLog[],
    options?: SaveEntryPolicyOptions
  ): Promise<GymEntry> {
    const entries = await this.getAllEntries();
    const key = EntryPolicyService.resolveTargetDateKey({
      explicitDateKey: dateKey,
      now: options?.now,
      resetHour: options?.resetHour,
      resetMinute: options?.resetMinute,
    });
    const existingEntry = entries.find((e) => e.dateKey === key) || null;
    const writePolicy = EntryPolicyService.getWritePolicy({
      existingEntry,
      source: options?.source || 'store',
    });

    if (!writePolicy.allowsWrite) {
      throw new Error('Entry already exists for this gym day and must be edited via edit flow');
    }

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
    const resolvedExerciseLogs = EntryPolicyService.resolveExerciseLogs({
      existingEntry,
      nextStatus: status,
      nextSplit: split,
      incomingExerciseLogs: normalizedExerciseLogs,
    });

    const newEntry: GymEntry = {
      id: `${key}`,
      dateKey: key,
      status,
      split,
      notes: notes?.trim() || undefined,
      exerciseLogs: resolvedExerciseLogs?.length ? resolvedExerciseLogs : undefined,
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
    const templates = await DataMigrationService.getTemplates();
    const settings = await DataMigrationService.getSettings();

    const exportEnvelope: ValidatedExportData = {
      version: CURRENT_DATA_VERSION,
      exportedAt: new Date().toISOString(),
      entries,
      templates,
      settings,
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

      const migrationResult = DataMigrationService.normalizeImportData(parsed);
      if (migrationResult.errors.length > 0) {
        errors.push(...migrationResult.errors);
        return { imported: 0, errors };
      }

      await DataMigrationService.persistImportedData({
        entries: migrationResult.entries,
        templates: migrationResult.templates,
        settings: migrationResult.settings,
      });

      if (migrationResult.warnings.length > 0) {
        console.warn('[GymLogService] Import migration warnings:', migrationResult.warnings.join(' | '));
      }

      return { imported: migrationResult.entries.length, errors: [] };
    } catch (parseError) {
      errors.push(`JSON parse error: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
      return { imported: 0, errors };
    }
  }
}

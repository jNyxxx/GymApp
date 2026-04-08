import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/Constants';
import { AppSettings, DEFAULT_SETTINGS } from '../models/AppSettings';
import { ExercisePerformanceLog, SetPerformanceLog } from '../models/ExerciseLog';
import { GymEntry } from '../models/GymEntry';
import { GymStatus } from '../models/GymStatus';
import { WorkoutTemplate } from '../models/WorkoutTemplate';
import {
  AppSettingsSchema,
  CURRENT_DATA_VERSION,
  formatValidationErrors,
  GymEntrySchema,
  validateAppSettings,
  validateGymEntries,
  validateWorkoutTemplates,
  WorkoutTemplateSchema,
} from '../models/schemas';

const ISO_FALLBACK = '1970-01-01T00:00:00.000Z';
const DATE_KEY_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const CURRENT_ENTRIES_VERSION = CURRENT_DATA_VERSION;
const CURRENT_SETTINGS_VERSION = CURRENT_DATA_VERSION;
const CURRENT_TEMPLATES_VERSION = CURRENT_DATA_VERSION;

interface ImportNormalizationResult {
  entries: GymEntry[];
  templates?: WorkoutTemplate[];
  settings?: AppSettings;
  errors: string[];
  warnings: string[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function toSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function toInteger(value: unknown): number | null {
  if (typeof value === 'number' && Number.isInteger(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number.parseInt(value, 10);
    return Number.isInteger(parsed) ? parsed : null;
  }
  return null;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export class DataMigrationService {
  static async getEntries(): Promise<GymEntry[]> {
    await this.migrateEntriesIfNeeded();
    return this.readEntriesFromStorage();
  }

  static async getTemplates(): Promise<WorkoutTemplate[]> {
    await this.migrateTemplatesIfNeeded();
    return this.readTemplatesFromStorage();
  }

  static async getSettings(): Promise<AppSettings> {
    await this.migrateSettingsIfNeeded();
    return this.readSettingsFromStorage();
  }

  static normalizeImportData(data: unknown): ImportNormalizationResult {
    if (Array.isArray(data)) {
      const { entries, warnings } = this.normalizeEntries(data, 'import.entries');
      return { entries, errors: [], warnings };
    }

    if (!isRecord(data)) {
      return {
        entries: [],
        errors: ['Invalid data format: expected either an entries array or export object'],
        warnings: [],
      };
    }

    const version = toInteger(data.version);
    if (!version || version < 1) {
      return {
        entries: [],
        errors: ['Invalid export data: missing or invalid version'],
        warnings: [],
      };
    }

    if (version > CURRENT_DATA_VERSION) {
      return {
        entries: [],
        errors: [`Unsupported export version ${version}. Current supported version is ${CURRENT_DATA_VERSION}.`],
        warnings: [],
      };
    }

    const errors: string[] = [];
    const warnings: string[] = [];

    if (!Array.isArray(data.entries)) {
      errors.push('Invalid export data: entries must be an array');
      return { entries: [], errors, warnings };
    }

    const normalizedEntries = this.normalizeEntries(data.entries, 'import.entries');
    warnings.push(...normalizedEntries.warnings);

    let templates: WorkoutTemplate[] | undefined;
    if (Object.prototype.hasOwnProperty.call(data, 'templates')) {
      const rawTemplates = data.templates;
      if (rawTemplates == null) {
        templates = [];
      } else if (Array.isArray(rawTemplates)) {
        const normalizedTemplates = this.normalizeTemplates(rawTemplates, 'import.templates');
        templates = normalizedTemplates.templates;
        warnings.push(...normalizedTemplates.warnings);
      } else {
        errors.push('Invalid export data: templates must be an array when provided');
      }
    }

    let settings: AppSettings | undefined;
    if (Object.prototype.hasOwnProperty.call(data, 'settings')) {
      const rawSettings = data.settings;
      if (rawSettings == null) {
        settings = DEFAULT_SETTINGS;
        warnings.push('import.settings: null settings replaced with defaults');
      } else if (isRecord(rawSettings)) {
        settings = this.normalizeSettings(rawSettings);
      } else {
        errors.push('Invalid export data: settings must be an object when provided');
      }
    }

    return {
      entries: normalizedEntries.entries,
      templates,
      settings,
      errors,
      warnings,
    };
  }

  static async persistImportedData(result: Omit<ImportNormalizationResult, 'errors' | 'warnings'>): Promise<void> {
    const writes: [string, string][] = [
      [STORAGE_KEYS.ENTRIES, JSON.stringify(result.entries)],
      [STORAGE_KEYS.ENTRIES_VERSION, String(CURRENT_ENTRIES_VERSION)],
    ];

    if (result.templates) {
      writes.push(
        [STORAGE_KEYS.WORKOUT_TEMPLATES, JSON.stringify(result.templates)],
        [STORAGE_KEYS.TEMPLATES_VERSION, String(CURRENT_TEMPLATES_VERSION)],
      );
    }

    if (result.settings) {
      writes.push(
        [STORAGE_KEYS.SETTINGS, JSON.stringify(result.settings)],
        [STORAGE_KEYS.SETTINGS_VERSION, String(CURRENT_SETTINGS_VERSION)],
      );
    }

    await AsyncStorage.multiSet(writes);
  }

  private static async readEntriesFromStorage(): Promise<GymEntry[]> {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.ENTRIES);
    if (!raw) return [];

    const parsed = this.parseJson(raw, 'entries');
    if (!parsed.ok) return [];

    const validated = validateGymEntries(parsed.value);
    if (validated.success) return validated.data;

    console.warn('[DataMigrationService] Invalid entries in storage:', formatValidationErrors(validated.error));
    if (!Array.isArray(parsed.value)) return [];

    return this.normalizeEntries(parsed.value, 'entries.read').entries;
  }

  private static async readTemplatesFromStorage(): Promise<WorkoutTemplate[]> {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.WORKOUT_TEMPLATES);
    if (!raw) return [];

    const parsed = this.parseJson(raw, 'templates');
    if (!parsed.ok) return [];

    const validated = validateWorkoutTemplates(parsed.value);
    if (validated.success) return validated.data;

    if (!Array.isArray(parsed.value)) {
      console.warn('[DataMigrationService] Invalid templates payload in storage; expected array.');
      return [];
    }

    return this.normalizeTemplates(parsed.value, 'templates.read').templates;
  }

  private static async readSettingsFromStorage(): Promise<AppSettings> {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;

    const parsed = this.parseJson(raw, 'settings');
    if (!parsed.ok) return DEFAULT_SETTINGS;

    const validated = validateAppSettings(parsed.value);
    if (validated.success) return validated.data;

    if (!isRecord(parsed.value)) return DEFAULT_SETTINGS;
    return this.normalizeSettings(parsed.value);
  }

  private static async migrateEntriesIfNeeded(): Promise<void> {
    const storedVersion = await this.getStoredVersion(STORAGE_KEYS.ENTRIES_VERSION, CURRENT_ENTRIES_VERSION);
    if (storedVersion >= CURRENT_ENTRIES_VERSION) return;

    const raw = await AsyncStorage.getItem(STORAGE_KEYS.ENTRIES);
    if (!raw) {
      await AsyncStorage.setItem(STORAGE_KEYS.ENTRIES_VERSION, String(CURRENT_ENTRIES_VERSION));
      return;
    }

    const parsed = this.parseJson(raw, 'entries');
    if (!parsed.ok || !Array.isArray(parsed.value)) return;

    const normalized = this.normalizeEntries(parsed.value, 'entries.migration');
    await AsyncStorage.multiSet([
      [STORAGE_KEYS.ENTRIES, JSON.stringify(normalized.entries)],
      [STORAGE_KEYS.ENTRIES_VERSION, String(CURRENT_ENTRIES_VERSION)],
    ]);

    if (normalized.warnings.length > 0) {
      console.warn('[DataMigrationService] Entries migration warnings:', normalized.warnings.join(' | '));
    }
  }

  private static async migrateTemplatesIfNeeded(): Promise<void> {
    const storedVersion = await this.getStoredVersion(STORAGE_KEYS.TEMPLATES_VERSION, CURRENT_TEMPLATES_VERSION);
    if (storedVersion >= CURRENT_TEMPLATES_VERSION) return;

    const raw = await AsyncStorage.getItem(STORAGE_KEYS.WORKOUT_TEMPLATES);
    if (!raw) {
      await AsyncStorage.setItem(STORAGE_KEYS.TEMPLATES_VERSION, String(CURRENT_TEMPLATES_VERSION));
      return;
    }

    const parsed = this.parseJson(raw, 'templates');
    if (!parsed.ok || !Array.isArray(parsed.value)) return;

    const normalized = this.normalizeTemplates(parsed.value, 'templates.migration');
    await AsyncStorage.multiSet([
      [STORAGE_KEYS.WORKOUT_TEMPLATES, JSON.stringify(normalized.templates)],
      [STORAGE_KEYS.TEMPLATES_VERSION, String(CURRENT_TEMPLATES_VERSION)],
    ]);

    if (normalized.warnings.length > 0) {
      console.warn('[DataMigrationService] Template migration warnings:', normalized.warnings.join(' | '));
    }
  }

  private static async migrateSettingsIfNeeded(): Promise<void> {
    const storedVersion = await this.getStoredVersion(STORAGE_KEYS.SETTINGS_VERSION, CURRENT_SETTINGS_VERSION);
    if (storedVersion >= CURRENT_SETTINGS_VERSION) return;

    const raw = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) {
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS_VERSION, String(CURRENT_SETTINGS_VERSION));
      return;
    }

    const parsed = this.parseJson(raw, 'settings');
    if (!parsed.ok || !isRecord(parsed.value)) return;

    const normalized = this.normalizeSettings(parsed.value);
    await AsyncStorage.multiSet([
      [STORAGE_KEYS.SETTINGS, JSON.stringify(normalized)],
      [STORAGE_KEYS.SETTINGS_VERSION, String(CURRENT_SETTINGS_VERSION)],
    ]);
  }

  private static normalizeEntries(entries: unknown[], context: string): { entries: GymEntry[]; warnings: string[] } {
    const warnings: string[] = [];
    const normalized: GymEntry[] = [];

    entries.forEach((entry, index) => {
      const migrated = this.normalizeEntry(entry);
      if (migrated) {
        normalized.push(migrated);
      } else {
        warnings.push(`${context}[${index}]: dropped invalid entry`);
      }
    });

    normalized.sort((a, b) => a.dateKey.localeCompare(b.dateKey));
    return { entries: normalized, warnings };
  }

  private static normalizeEntry(entry: unknown): GymEntry | null {
    if (!isRecord(entry)) return null;

    const dateKey = this.normalizeDateKey(entry.dateKey) || this.normalizeDateKey(entry.id);
    if (!dateKey) return null;

    const status = this.normalizeStatus(entry.status);
    if (!status) return null;

    const id = typeof entry.id === 'string' && entry.id.trim().length > 0 ? entry.id : dateKey;
    const split = typeof entry.split === 'string' && entry.split.trim().length > 0 ? entry.split : undefined;
    const notes = typeof entry.notes === 'string' ? entry.notes.trim() || undefined : undefined;
    const loggedAt = this.normalizeIsoDate(entry.loggedAt) || `${dateKey}T00:00:00.000Z`;
    const exerciseLogs = this.normalizeExerciseLogs(entry.exerciseLogs, id);

    const candidate: GymEntry = {
      id,
      dateKey,
      status,
      split,
      notes,
      exerciseLogs: exerciseLogs.length > 0 ? exerciseLogs : undefined,
      loggedAt,
    };

    const validated = GymEntrySchema.safeParse(candidate);
    return validated.success ? validated.data : null;
  }

  private static normalizeExerciseLogs(
    value: unknown,
    entryId: string,
  ): ExercisePerformanceLog[] {
    if (!Array.isArray(value)) return [];

    return value
      .map((exercise, exerciseIndex) => {
        if (!isRecord(exercise)) return null;

        const exerciseId =
          typeof exercise.exerciseId === 'string' && exercise.exerciseId.trim().length > 0
            ? exercise.exerciseId
            : `${entryId}_exercise_${exerciseIndex + 1}`;
        const exerciseName =
          typeof exercise.exerciseName === 'string' && exercise.exerciseName.trim().length > 0
            ? exercise.exerciseName.trim()
            : `Exercise ${exerciseIndex + 1}`;

        const sets = this.normalizePerformanceSets(exercise);
        if (sets.length === 0) return null;

        return {
          exerciseId,
          exerciseName,
          sets,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }

  private static normalizePerformanceSets(exercise: Record<string, unknown>): SetPerformanceLog[] {
    if (Array.isArray(exercise.sets)) {
      return exercise.sets
        .map((set, index) => {
          if (!isRecord(set)) return null;
          const setNumber = toInteger(set.setNumber);
          return {
            setNumber: setNumber && setNumber > 0 ? setNumber : index + 1,
            reps: typeof set.reps === 'string' ? set.reps.trim() : '',
            weight: typeof set.weight === 'string' ? set.weight.trim() : '',
            completed: Boolean(set.completed),
          };
        })
        .filter((set): set is NonNullable<typeof set> => set !== null);
    }

    const legacySetCount = toInteger(exercise.sets) || toInteger(exercise.setCount) || 0;
    if (legacySetCount <= 0) return [];

    const reps = typeof exercise.reps === 'string' ? exercise.reps.trim() : '';
    const weight = typeof exercise.weight === 'string' ? exercise.weight.trim() : '';

    return Array.from({ length: legacySetCount }, (_, index) => ({
      setNumber: index + 1,
      reps,
      weight,
      completed: false,
    }));
  }

  private static normalizeTemplates(
    templates: unknown[],
    context: string,
  ): { templates: WorkoutTemplate[]; warnings: string[] } {
    const warnings: string[] = [];
    const normalized: WorkoutTemplate[] = [];

    templates.forEach((template, index) => {
      const migrated = this.normalizeTemplate(template, index);
      if (migrated) {
        normalized.push(migrated);
      } else {
        warnings.push(`${context}[${index}]: dropped invalid template`);
      }
    });

    return { templates: normalized, warnings };
  }

  private static normalizeTemplate(template: unknown, templateIndex: number): WorkoutTemplate | null {
    if (!isRecord(template)) return null;

    const fallbackName = `Template ${templateIndex + 1}`;
    const name =
      typeof template.name === 'string' && template.name.trim().length > 0 ? template.name.trim() : fallbackName;
    const slug = toSlug(name) || `template_${templateIndex + 1}`;
    const templateId =
      typeof template.id === 'string' && template.id.trim().length > 0 ? template.id : `template_${slug}`;

    const exercises = this.normalizeTemplateExercises(template.exercises, templateId);
    const createdAt = this.normalizeIsoDate(template.createdAt) || ISO_FALLBACK;
    const updatedAt = this.normalizeIsoDate(template.updatedAt) || createdAt;
    const emoji = typeof template.emoji === 'string' && template.emoji.trim().length > 0 ? template.emoji : undefined;

    const candidate: WorkoutTemplate = {
      id: templateId,
      name,
      emoji,
      exercises,
      createdAt,
      updatedAt,
    };

    const validated = WorkoutTemplateSchema.safeParse(candidate);
    return validated.success ? validated.data : null;
  }

  private static normalizeTemplateExercises(value: unknown, templateId: string): WorkoutTemplate['exercises'] {
    if (!Array.isArray(value)) return [];

    return value
      .map((exercise, exerciseIndex) => {
        if (!isRecord(exercise)) return null;

        const exerciseName =
          typeof exercise.name === 'string' && exercise.name.trim().length > 0
            ? exercise.name.trim()
            : `Exercise ${exerciseIndex + 1}`;
        const exerciseId =
          typeof exercise.id === 'string' && exercise.id.trim().length > 0
            ? exercise.id
            : `${templateId}_exercise_${exerciseIndex + 1}`;
        const sets = this.normalizeTemplateSets(exercise, exerciseId);

        return {
          id: exerciseId,
          name: exerciseName,
          sets,
        };
      })
      .filter((exercise): exercise is NonNullable<typeof exercise> => exercise !== null);
  }

  private static normalizeTemplateSets(exercise: Record<string, unknown>, exerciseId: string): WorkoutTemplate['exercises'][number]['sets'] {
    if (Array.isArray(exercise.sets)) {
      return exercise.sets
        .map((set, setIndex) => {
          if (!isRecord(set)) return null;
          const setId =
            typeof set.id === 'string' && set.id.trim().length > 0 ? set.id : `${exerciseId}_set_${setIndex + 1}`;
          return {
            id: setId,
            reps: typeof set.reps === 'string' ? set.reps.trim() : '',
            weight: typeof set.weight === 'string' ? set.weight.trim() : '',
          };
        })
        .filter((set): set is NonNullable<typeof set> => set !== null);
    }

    const legacySetCount = toInteger(exercise.sets) || toInteger(exercise.setCount) || 0;
    if (legacySetCount <= 0) return [];

    const reps = typeof exercise.reps === 'string' ? exercise.reps.trim() : '';
    const weight = typeof exercise.weight === 'string' ? exercise.weight.trim() : '';

    return Array.from({ length: legacySetCount }, (_, index) => ({
      id: `${exerciseId}_set_${index + 1}`,
      reps,
      weight,
    }));
  }

  private static normalizeSettings(value: Record<string, unknown>): AppSettings {
    const normalized: AppSettings = {
      theme: value.theme === 'light' ? 'light' : 'dark',
      remindersEnabled:
        typeof value.remindersEnabled === 'boolean' ? value.remindersEnabled : DEFAULT_SETTINGS.remindersEnabled,
      reminderHour: clamp(
        toInteger(value.reminderHour) ?? DEFAULT_SETTINGS.reminderHour,
        0,
        23,
      ),
      reminderMinute: clamp(
        toInteger(value.reminderMinute) ?? DEFAULT_SETTINGS.reminderMinute,
        0,
        59,
      ),
      resetHour: clamp(
        toInteger(value.resetHour) ?? DEFAULT_SETTINGS.resetHour,
        0,
        23,
      ),
      resetMinute: clamp(
        toInteger(value.resetMinute) ?? DEFAULT_SETTINGS.resetMinute,
        0,
        59,
      ),
    };

    const validated = AppSettingsSchema.safeParse(normalized);
    return validated.success ? validated.data : DEFAULT_SETTINGS;
  }

  private static normalizeStatus(value: unknown): GymStatus | null {
    if (value === GymStatus.WENT || value === 'went') return GymStatus.WENT;
    if (value === GymStatus.NO_GYM || value === 'no_gym') return GymStatus.NO_GYM;
    return null;
  }

  private static normalizeDateKey(value: unknown): string | null {
    if (typeof value !== 'string') return null;
    return DATE_KEY_REGEX.test(value) ? value : null;
  }

  private static normalizeIsoDate(value: unknown): string | null {
    if (typeof value !== 'string' || value.trim().length === 0) return null;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return null;
    return parsed.toISOString();
  }

  private static async getStoredVersion(versionKey: string, fallbackVersion: number): Promise<number> {
    const raw = await AsyncStorage.getItem(versionKey);
    const parsed = toInteger(raw);
    return parsed && parsed > 0 ? parsed : fallbackVersion - 1;
  }

  private static parseJson(raw: string, key: string): { ok: true; value: unknown } | { ok: false } {
    try {
      return { ok: true, value: JSON.parse(raw) };
    } catch (error) {
      console.warn(
        `[DataMigrationService] Failed to parse ${key} JSON:`,
        error instanceof Error ? error.message : error,
      );
      return { ok: false };
    }
  }
}


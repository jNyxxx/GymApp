import { z } from 'zod';
import { GymStatus } from './GymStatus';
import { WorkoutSplit } from './WorkoutSplit';

/**
 * Zod schemas for data validation.
 * Used for import/export validation and runtime type safety.
 */

// Date key format: YYYY-MM-DD
const dateKeyRegex = /^\d{4}-\d{2}-\d{2}$/;

export const GymEntrySchema = z.object({
  id: z.string().min(1),
  dateKey: z.string().regex(dateKeyRegex, 'Date must be in YYYY-MM-DD format'),
  status: z.nativeEnum(GymStatus),
  split: z.nativeEnum(WorkoutSplit).optional(),
  loggedAt: z.string().datetime({ offset: true }).or(z.string().datetime()),
});

export const GymEntriesArraySchema = z.array(GymEntrySchema);

export const AppSettingsSchema = z.object({
  theme: z.enum(['dark', 'light']),
  remindersEnabled: z.boolean(),
  reminderHour: z.number().int().min(0).max(23),
  reminderMinute: z.number().int().min(0).max(59),
  resetHour: z.number().int().min(0).max(23),
});

// For partial settings updates
export const PartialAppSettingsSchema = AppSettingsSchema.partial();

// Export data envelope with version for migrations
export const ExportDataSchema = z.object({
  version: z.number().int().min(1),
  exportedAt: z.string().datetime(),
  entries: GymEntriesArraySchema,
  settings: AppSettingsSchema.optional(),
});

// Type exports derived from schemas
export type ValidatedGymEntry = z.infer<typeof GymEntrySchema>;
export type ValidatedAppSettings = z.infer<typeof AppSettingsSchema>;
export type ValidatedExportData = z.infer<typeof ExportDataSchema>;

/**
 * Validates an array of gym entries.
 * Returns { success: true, data } or { success: false, error }
 */
export function validateGymEntries(data: unknown): z.SafeParseReturnType<unknown, ValidatedGymEntry[]> {
  return GymEntriesArraySchema.safeParse(data);
}

/**
 * Validates app settings.
 * Returns { success: true, data } or { success: false, error }
 */
export function validateAppSettings(data: unknown): z.SafeParseReturnType<unknown, ValidatedAppSettings> {
  return AppSettingsSchema.safeParse(data);
}

/**
 * Validates export data envelope.
 * Returns { success: true, data } or { success: false, error }
 */
export function validateExportData(data: unknown): z.SafeParseReturnType<unknown, ValidatedExportData> {
  return ExportDataSchema.safeParse(data);
}

/**
 * Formats Zod errors into a human-readable string.
 */
export function formatValidationErrors(error: z.ZodError): string {
  return error.errors
    .map((e) => `${e.path.join('.')}: ${e.message}`)
    .join('\n');
}

// Current data version for export/import compatibility
export const CURRENT_DATA_VERSION = 1;

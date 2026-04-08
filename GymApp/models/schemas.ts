import { z } from 'zod';
import { GymStatus } from './GymStatus';
import { WorkoutSplit } from './WorkoutSplit';

/**
 * Zod schemas for data validation.
 * Used for import/export validation and runtime type safety.
 */

// Date key format: YYYY-MM-DD
const dateKeyRegex = /^\d{4}-\d{2}-\d{2}$/;

export const SetPerformanceLogSchema = z.object({
  setNumber: z.number().int().min(1),
  reps: z.string(),
  weight: z.string(),
  completed: z.boolean(),
});

export const ExercisePerformanceLogSchema = z.object({
  exerciseId: z.string().min(1),
  exerciseName: z.string().min(1),
  sets: z.array(SetPerformanceLogSchema),
});

export const GymEntrySchema = z.object({
  id: z.string().min(1),
  dateKey: z.string().regex(dateKeyRegex, 'Date must be in YYYY-MM-DD format'),
  status: z.nativeEnum(GymStatus),
  split: z.union([z.nativeEnum(WorkoutSplit), z.string()]).optional(),
  notes: z.string().optional(),
  exerciseLogs: z.array(ExercisePerformanceLogSchema).optional(),
  loggedAt: z.string().datetime({ offset: true }).or(z.string().datetime()),
});

export const GymEntriesArraySchema = z.array(GymEntrySchema);

export const TemplateSetEntrySchema = z.object({
  id: z.string().min(1),
  reps: z.string(),
  weight: z.string(),
});

export const TemplateExerciseSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  sets: z.array(TemplateSetEntrySchema),
});

export const WorkoutTemplateSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  emoji: z.string().optional(),
  exercises: z.array(TemplateExerciseSchema),
  createdAt: z.string().datetime({ offset: true }).or(z.string().datetime()),
  updatedAt: z.string().datetime({ offset: true }).or(z.string().datetime()),
});

export const WorkoutTemplatesArraySchema = z.array(WorkoutTemplateSchema);

export const AppSettingsSchema = z.object({
  theme: z.enum(['dark', 'light']),
  remindersEnabled: z.boolean(),
  reminderHour: z.number().int().min(0).max(23),
  reminderMinute: z.number().int().min(0).max(59),
  resetHour: z.number().int().min(0).max(23),
  resetMinute: z.number().int().min(0).max(59),
});

const GoalBaseSchema = z.object({
  id: z.string().min(1),
  createdAt: z.string().datetime({ offset: true }).or(z.string().datetime()),
});

export const AttendanceGoalSchema = GoalBaseSchema.extend({
  type: z.literal('attendance'),
  targetGymDays: z.number().int().min(1),
});

export const MonthlyVolumeGoalSchema = GoalBaseSchema.extend({
  type: z.literal('monthly-volume'),
  targetVolumeKg: z.number().positive(),
});

export const ExerciseProgressionGoalSchema = GoalBaseSchema.extend({
  type: z.literal('exercise-progression'),
  exerciseName: z.string().min(1),
  exerciseKey: z.string().min(1),
  targetEstimatedOneRepMaxKg: z.number().positive(),
});

export const FitnessGoalSchema = z.discriminatedUnion('type', [
  AttendanceGoalSchema,
  MonthlyVolumeGoalSchema,
  ExerciseProgressionGoalSchema,
]);

export const FitnessGoalsArraySchema = z.array(FitnessGoalSchema);

// For partial settings updates
export const PartialAppSettingsSchema = AppSettingsSchema.partial();

// Export data envelope with version for migrations
export const ExportDataSchema = z.object({
  version: z.number().int().min(1),
  exportedAt: z.string().datetime(),
  entries: GymEntriesArraySchema,
  templates: WorkoutTemplatesArraySchema.optional(),
  settings: AppSettingsSchema.optional(),
  goals: FitnessGoalsArraySchema.optional(),
});

// Type exports derived from schemas
export type ValidatedGymEntry = z.infer<typeof GymEntrySchema>;
export type ValidatedWorkoutTemplate = z.infer<typeof WorkoutTemplateSchema>;
export type ValidatedAppSettings = z.infer<typeof AppSettingsSchema>;
export type ValidatedFitnessGoal = z.infer<typeof FitnessGoalSchema>;
export type ValidatedExportData = z.infer<typeof ExportDataSchema>;

/**
 * Validates an array of gym entries.
 * Returns { success: true, data } or { success: false, error }
 */
export function validateGymEntries(data: unknown): z.SafeParseReturnType<unknown, ValidatedGymEntry[]> {
  return GymEntriesArraySchema.safeParse(data);
}

/**
 * Validates workout templates.
 * Returns { success: true, data } or { success: false, error }
 */
export function validateWorkoutTemplates(data: unknown): z.SafeParseReturnType<unknown, ValidatedWorkoutTemplate[]> {
  return WorkoutTemplatesArraySchema.safeParse(data);
}

/**
 * Validates app settings.
 * Returns { success: true, data } or { success: false, error }
 */
export function validateAppSettings(data: unknown): z.SafeParseReturnType<unknown, ValidatedAppSettings> {
  return AppSettingsSchema.safeParse(data);
}

/**
 * Validates fitness goals.
 * Returns { success: true, data } or { success: false, error }
 */
export function validateFitnessGoals(data: unknown): z.SafeParseReturnType<unknown, ValidatedFitnessGoal[]> {
  return FitnessGoalsArraySchema.safeParse(data);
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
export const CURRENT_DATA_VERSION = 2;

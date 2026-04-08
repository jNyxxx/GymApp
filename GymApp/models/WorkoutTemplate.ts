/**
 * Workout template model - custom splits with exercise lists.
 */

/**
 * A single set within an exercise, with its own reps and weight.
 */
export interface SetEntry {
  id: string;
  reps: string;  // e.g. "10", "8-12"
  weight: string; // e.g. "60kg", "135lbs"
}

/**
 * An exercise within a workout template.
 */
export interface Exercise {
  id: string;
  name: string;
  sets: SetEntry[];
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  emoji?: string;
  exercises: Exercise[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Generate a unique exercise ID.
 */
export function generateExerciseId(): string {
  return `ex_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generate a unique set entry ID.
 */
export function generateSetId(): string {
  return `set_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generate a unique template ID.
 */
export function generateTemplateId(name: string): string {
  return `template_${name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`;
}

/**
 * Migrate an old-format exercise (flat sets/reps/weight) to the new per-set model.
 */
export function migrateExercise(exercise: any): Exercise {
  const fallbackSlug =
    typeof exercise?.name === 'string'
      ? exercise.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')
      : '';
  const exerciseId =
    typeof exercise?.id === 'string' && exercise.id.trim().length > 0
      ? exercise.id
      : `exercise_${fallbackSlug || 'legacy'}`;
  const exerciseName =
    typeof exercise?.name === 'string' && exercise.name.trim().length > 0 ? exercise.name.trim() : 'Exercise';

  if (Array.isArray(exercise?.sets)) {
    const normalizedSets = exercise.sets
      .map((set: any, index: number) => ({
        id:
          typeof set?.id === 'string' && set.id.trim().length > 0
            ? set.id
            : `${exerciseId}_set_${index + 1}`,
        reps: typeof set?.reps === 'string' ? set.reps : '',
        weight: typeof set?.weight === 'string' ? set.weight : '',
      }))
      .filter((set: SetEntry) => typeof set.id === 'string' && set.id.length > 0);

    return {
      id: exerciseId,
      name: exerciseName,
      sets: normalizedSets,
    };
  }

  const setCount = typeof exercise?.sets === 'number' ? Math.max(0, Math.floor(exercise.sets)) : 0;
  const reps = typeof exercise?.reps === 'string' ? exercise.reps : '';
  const weight = typeof exercise?.weight === 'string' ? exercise.weight : '';

  const setEntries: SetEntry[] = Array.from({ length: setCount }, (_, index) => ({
    id: `${exerciseId}_set_${index + 1}`,
    reps,
    weight,
  }));

  return {
    id: exerciseId,
    name: exerciseName,
    sets: setEntries,
  };
}

/**
 * Migrate all exercises in a template.
 */
export function migrateTemplate(template: any): WorkoutTemplate {
  return {
    ...template,
    exercises: (template.exercises || []).map(migrateExercise),
  };
}

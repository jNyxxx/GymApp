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
  // Already in new format
  if (Array.isArray(exercise.sets)) {
    return exercise as Exercise;
  }

  // Old flat format: sets?: number, reps?: string, weight?: string
  const setCount = exercise.sets || 0;
  const reps = exercise.reps || '';
  const weight = exercise.weight || '';

  const setEntries: SetEntry[] = [];
  for (let i = 0; i < setCount; i++) {
    setEntries.push({
      id: generateSetId(),
      reps,
      weight,
    });
  }

  return {
    id: exercise.id,
    name: exercise.name,
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

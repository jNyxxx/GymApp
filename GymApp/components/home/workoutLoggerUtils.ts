import { ExercisePerformanceLog, SetPerformanceLog } from '../../models/ExerciseLog';
import { GymEntry } from '../../models/GymEntry';
import { GymStatus } from '../../models/GymStatus';
import { WorkoutTemplate } from '../../models/WorkoutTemplate';

export function buildInitialExerciseLogs(template: WorkoutTemplate): ExercisePerformanceLog[] {
  return template.exercises.map((exercise) => ({
    exerciseId: exercise.id,
    exerciseName: exercise.name,
    sets: exercise.sets.map((set, index) => ({
      setNumber: index + 1,
      reps: set.reps || '',
      weight: set.weight || '',
      completed: false,
    })),
  }));
}

export function addSetToExercise(
  exerciseLogs: ExercisePerformanceLog[],
  exerciseId: string
): ExercisePerformanceLog[] {
  return exerciseLogs.map((exercise) => {
    if (exercise.exerciseId !== exerciseId) return exercise;
    const nextSetNumber = exercise.sets.length + 1;
    return {
      ...exercise,
      sets: [...exercise.sets, { setNumber: nextSetNumber, reps: '', weight: '', completed: false }],
    };
  });
}

export function removeSetFromExercise(
  exerciseLogs: ExercisePerformanceLog[],
  exerciseId: string,
  setNumber: number
): ExercisePerformanceLog[] {
  return exerciseLogs.map((exercise) => {
    if (exercise.exerciseId !== exerciseId) return exercise;
    if (exercise.sets.length <= 1) return exercise;

    const remaining = exercise.sets.filter((set) => set.setNumber !== setNumber);
    return {
      ...exercise,
      sets: remaining.map((set, index) => ({ ...set, setNumber: index + 1 })),
    };
  });
}

export function updateSetField(
  exerciseLogs: ExercisePerformanceLog[],
  exerciseId: string,
  setNumber: number,
  field: 'reps' | 'weight' | 'completed',
  value: string | boolean
): ExercisePerformanceLog[] {
  return exerciseLogs.map((exercise) => {
    if (exercise.exerciseId !== exerciseId) return exercise;
    return {
      ...exercise,
      sets: exercise.sets.map((set) => {
        if (set.setNumber !== setNumber) return set;
        if (field === 'completed') return { ...set, completed: Boolean(value) };
        if (field === 'reps') return { ...set, reps: String(value) };
        return { ...set, weight: String(value) };
      }),
    };
  });
}

export function markExerciseSetsComplete(exercise: ExercisePerformanceLog): ExercisePerformanceLog {
  return {
    ...exercise,
    sets: exercise.sets.map((set) => ({ ...set, completed: true })),
  };
}

export function getExerciseCompletion(exercise: ExercisePerformanceLog): { completed: number; total: number } {
  const completed = exercise.sets.filter((set) => set.completed).length;
  return { completed, total: exercise.sets.length };
}

function normalizeName(name: string): string {
  return name.trim().toLowerCase();
}

function sortEntriesByMostRecent(entries: GymEntry[]): GymEntry[] {
  return [...entries].sort((a, b) => {
    const aTime = a.loggedAt || a.dateKey;
    const bTime = b.loggedAt || b.dateKey;
    return bTime.localeCompare(aTime);
  });
}

export function getLatestExerciseLog(
  entries: GymEntry[],
  exercise: ExercisePerformanceLog
): ExercisePerformanceLog | null {
  const targetName = normalizeName(exercise.exerciseName);
  const sortedEntries = sortEntriesByMostRecent(entries);

  for (const entry of sortedEntries) {
    if (!entry.exerciseLogs?.length) continue;

    const byId = entry.exerciseLogs.find(
      (item) => item.exerciseId === exercise.exerciseId && item.sets.length > 0
    );
    if (byId) return byId;

    const byName = entry.exerciseLogs.find(
      (item) => normalizeName(item.exerciseName) === targetName && item.sets.length > 0
    );
    if (byName) return byName;
  }

  return null;
}

export function getLatestRepeatableEntry(entries: GymEntry[]): GymEntry | null {
  const sortedEntries = sortEntriesByMostRecent(entries);

  for (const entry of sortedEntries) {
    if (entry.status !== GymStatus.WENT) continue;
    if (!entry.split) continue;
    if (!entry.exerciseLogs?.length) continue;
    return entry;
  }

  return null;
}

export function cloneExerciseLogsForNewSession(exerciseLogs: ExercisePerformanceLog[]): ExercisePerformanceLog[] {
  return exerciseLogs.map((exercise) => ({
    ...exercise,
    sets: exercise.sets.map((set) => ({
      ...set,
      completed: false,
    })),
  }));
}

function resolveReferenceSet(
  currentSet: SetPerformanceLog,
  currentSetIndex: number,
  reference: ExercisePerformanceLog
): SetPerformanceLog | undefined {
  return (
    reference.sets.find((set) => set.setNumber === currentSet.setNumber) ||
    reference.sets[currentSetIndex] ||
    reference.sets[reference.sets.length - 1]
  );
}

export function applyLastValuesToSet(
  currentSet: SetPerformanceLog,
  currentSetIndex: number,
  reference: ExercisePerformanceLog
): SetPerformanceLog {
  const sourceSet = resolveReferenceSet(currentSet, currentSetIndex, reference);
  if (!sourceSet) return currentSet;
  return {
    ...currentSet,
    reps: sourceSet.reps,
    weight: sourceSet.weight,
  };
}

export function applyLastValuesAsDefaultsToSet(
  currentSet: SetPerformanceLog,
  currentSetIndex: number,
  reference: ExercisePerformanceLog
): SetPerformanceLog {
  const sourceSet = resolveReferenceSet(currentSet, currentSetIndex, reference);
  if (!sourceSet) return currentSet;

  return {
    ...currentSet,
    reps: currentSet.reps.trim() ? currentSet.reps : sourceSet.reps,
    weight: currentSet.weight.trim() ? currentSet.weight : sourceSet.weight,
  };
}

export function applyLastValuesToExercise(
  exercise: ExercisePerformanceLog,
  reference: ExercisePerformanceLog
): ExercisePerformanceLog {
  return {
    ...exercise,
    sets: exercise.sets.map((set, index) => applyLastValuesToSet(set, index, reference)),
  };
}

export function applyLastValuesAsDefaultsToExercise(
  exercise: ExercisePerformanceLog,
  reference: ExercisePerformanceLog
): ExercisePerformanceLog {
  return {
    ...exercise,
    sets: exercise.sets.map((set, index) => applyLastValuesAsDefaultsToSet(set, index, reference)),
  };
}

export function applyHistoryDefaultsToExerciseLogs(
  entries: GymEntry[],
  exerciseLogs: ExercisePerformanceLog[]
): { exerciseLogs: ExercisePerformanceLog[]; didApplyDefaults: boolean } {
  let didApplyDefaults = false;

  const mergedExerciseLogs = exerciseLogs.map((exercise) => {
    const reference = getLatestExerciseLog(entries, exercise);
    if (!reference) return exercise;

    const mergedExercise = applyLastValuesAsDefaultsToExercise(exercise, reference);
    const changed = mergedExercise.sets.some(
      (set, index) => set.reps !== exercise.sets[index]?.reps || set.weight !== exercise.sets[index]?.weight
    );
    if (changed) {
      didApplyDefaults = true;
    }

    return mergedExercise;
  });

  return {
    exerciseLogs: mergedExerciseLogs,
    didApplyDefaults,
  };
}

export function formatTimer(seconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safeSeconds / 60)
    .toString()
    .padStart(2, '0');
  const remainingSeconds = (safeSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${remainingSeconds}`;
}

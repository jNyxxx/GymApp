import {
  addSetToExercise,
  applyHistoryDefaultsToExerciseLogs,
  applyLastValuesAsDefaultsToExercise,
  applyLastValuesToExercise,
  buildInitialExerciseLogs,
  cloneExerciseLogsForNewSession,
  formatTimer,
  getLatestExerciseLog,
  getLatestRepeatableEntry,
  removeSetFromExercise,
} from './workoutLoggerUtils';
import { GymStatus } from '../../models/GymStatus';
import { GymEntry } from '../../models/GymEntry';
import { WorkoutTemplate } from '../../models/WorkoutTemplate';

describe('workoutLoggerUtils', () => {
  const template: WorkoutTemplate = {
    id: 'template_push',
    name: 'Push',
    emoji: '🔥',
    createdAt: '2026-04-01T00:00:00.000Z',
    updatedAt: '2026-04-01T00:00:00.000Z',
    exercises: [
      {
        id: 'ex_bench',
        name: 'Bench Press',
        sets: [
          { id: 'set_1', reps: '10', weight: '60' },
          { id: 'set_2', reps: '8', weight: '65' },
        ],
      },
    ],
  };

  it('builds initial exercise logs from template', () => {
    const logs = buildInitialExerciseLogs(template);
    expect(logs).toHaveLength(1);
    expect(logs[0].exerciseName).toBe('Bench Press');
    expect(logs[0].sets).toEqual([
      { setNumber: 1, reps: '10', weight: '60', completed: false },
      { setNumber: 2, reps: '8', weight: '65', completed: false },
    ]);
  });

  it('adds and removes sets safely with renumbering', () => {
    const initial = buildInitialExerciseLogs(template);
    const added = addSetToExercise(initial, 'ex_bench');
    expect(added[0].sets).toHaveLength(3);
    expect(added[0].sets[2].setNumber).toBe(3);

    const removedMiddle = removeSetFromExercise(added, 'ex_bench', 2);
    expect(removedMiddle[0].sets.map((set) => set.setNumber)).toEqual([1, 2]);

    const removeWhenSingle = removeSetFromExercise(
      [{ ...added[0], sets: [added[0].sets[0]] }],
      'ex_bench',
      1
    );
    expect(removeWhenSingle[0].sets).toHaveLength(1);
  });

  it('applies last exercise values by set mapping', () => {
    const current = buildInitialExerciseLogs(template)[0];
    const reference = {
      ...current,
      sets: [
        { setNumber: 1, reps: '12', weight: '62.5', completed: true },
        { setNumber: 2, reps: '10', weight: '67.5', completed: true },
      ],
    };

    const merged = applyLastValuesToExercise(current, reference);
    expect(merged.sets[0].reps).toBe('12');
    expect(merged.sets[0].weight).toBe('62.5');
    expect(merged.sets[1].reps).toBe('10');
    expect(merged.sets[1].weight).toBe('67.5');
    expect(merged.sets[0].completed).toBe(false);
  });

  it('applies last values as defaults without overriding existing fields', () => {
    const current = buildInitialExerciseLogs(template)[0];
    const reference = {
      ...current,
      sets: [
        { setNumber: 1, reps: '12', weight: '62.5', completed: true },
        { setNumber: 2, reps: '10', weight: '67.5', completed: true },
      ],
    };

    const withCurrentTargets = {
      ...current,
      sets: [
        { ...current.sets[0], reps: '8', weight: '' },
        { ...current.sets[1], reps: '', weight: '70' },
      ],
    };

    const merged = applyLastValuesAsDefaultsToExercise(withCurrentTargets, reference);
    expect(merged.sets[0].reps).toBe('8');
    expect(merged.sets[0].weight).toBe('62.5');
    expect(merged.sets[1].reps).toBe('10');
    expect(merged.sets[1].weight).toBe('70');
  });

  it('gets latest matching exercise log from history', () => {
    const current = buildInitialExerciseLogs(template)[0];
    const entries: GymEntry[] = [
      {
        id: '2026-04-01',
        dateKey: '2026-04-01',
        status: GymStatus.WENT,
        split: 'template_push',
        exerciseLogs: [
          {
            exerciseId: 'different_id',
            exerciseName: 'Bench Press',
            sets: [{ setNumber: 1, reps: '9', weight: '57.5', completed: true }],
          },
        ],
        loggedAt: '2026-04-01T10:00:00.000Z',
      },
      {
        id: '2026-04-04',
        dateKey: '2026-04-04',
        status: GymStatus.WENT,
        split: 'template_push',
        exerciseLogs: [
          {
            exerciseId: 'ex_bench',
            exerciseName: 'Bench Press',
            sets: [{ setNumber: 1, reps: '11', weight: '60', completed: true }],
          },
        ],
        loggedAt: '2026-04-04T10:00:00.000Z',
      },
    ];

    const latest = getLatestExerciseLog(entries, current);
    expect(latest?.sets[0].reps).toBe('11');
  });

  it('gets latest repeatable entry with split and exercise logs', () => {
    const entries: GymEntry[] = [
      {
        id: '2026-04-03',
        dateKey: '2026-04-03',
        status: GymStatus.WENT,
        split: 'template_push',
        loggedAt: '2026-04-03T10:00:00.000Z',
      },
      {
        id: '2026-04-04',
        dateKey: '2026-04-04',
        status: GymStatus.NO_GYM,
        split: 'template_push',
        loggedAt: '2026-04-04T10:00:00.000Z',
      },
      {
        id: '2026-04-05',
        dateKey: '2026-04-05',
        status: GymStatus.WENT,
        split: 'template_push',
        exerciseLogs: [
          {
            exerciseId: 'ex_bench',
            exerciseName: 'Bench Press',
            sets: [{ setNumber: 1, reps: '10', weight: '60', completed: true }],
          },
        ],
        loggedAt: '2026-04-05T10:00:00.000Z',
      },
    ];

    const latest = getLatestRepeatableEntry(entries);
    expect(latest?.id).toBe('2026-04-05');
  });

  it('prefers the most recently logged repeatable entry', () => {
    const entries: GymEntry[] = [
      {
        id: 'older_date_but_newer_log',
        dateKey: '2026-04-04',
        status: GymStatus.WENT,
        split: 'template_push',
        exerciseLogs: [
          {
            exerciseId: 'ex_bench',
            exerciseName: 'Bench Press',
            sets: [{ setNumber: 1, reps: '12', weight: '60', completed: true }],
          },
        ],
        loggedAt: '2026-04-06T12:00:00.000Z',
      },
      {
        id: 'newer_date_but_older_log',
        dateKey: '2026-04-05',
        status: GymStatus.WENT,
        split: 'template_push',
        exerciseLogs: [
          {
            exerciseId: 'ex_bench',
            exerciseName: 'Bench Press',
            sets: [{ setNumber: 1, reps: '10', weight: '60', completed: true }],
          },
        ],
        loggedAt: '2026-04-05T09:00:00.000Z',
      },
    ];

    const latest = getLatestRepeatableEntry(entries);
    expect(latest?.id).toBe('older_date_but_newer_log');
  });

  it('clones repeat logs for a new session and resets completion', () => {
    const logs = [
      {
        exerciseId: 'ex_bench',
        exerciseName: 'Bench Press',
        sets: [
          { setNumber: 1, reps: '10', weight: '60', completed: true },
          { setNumber: 2, reps: '8', weight: '65', completed: true },
        ],
      },
    ];

    const cloned = cloneExerciseLogsForNewSession(logs);
    expect(cloned).not.toBe(logs);
    expect(cloned[0].sets.every((set) => !set.completed)).toBe(true);
    expect(logs[0].sets.every((set) => set.completed)).toBe(true);
  });

  it('applies history defaults across exercise logs when available', () => {
    const currentLogs = buildInitialExerciseLogs(template);
    const blankLogs = [
      {
        ...currentLogs[0],
        sets: currentLogs[0].sets.map((set) => ({ ...set, reps: '', weight: '' })),
      },
    ];
    const entries: GymEntry[] = [
      {
        id: '2026-04-05',
        dateKey: '2026-04-05',
        status: GymStatus.WENT,
        split: 'template_push',
        exerciseLogs: [
          {
            exerciseId: 'ex_bench',
            exerciseName: 'Bench Press',
            sets: [
              { setNumber: 1, reps: '10', weight: '62.5', completed: true },
              { setNumber: 2, reps: '8', weight: '67.5', completed: true },
            ],
          },
        ],
        loggedAt: '2026-04-05T10:00:00.000Z',
      },
    ];

    const result = applyHistoryDefaultsToExerciseLogs(entries, blankLogs);
    expect(result.didApplyDefaults).toBe(true);
    expect(result.exerciseLogs[0].sets[0].reps).toBe('10');
    expect(result.exerciseLogs[0].sets[1].weight).toBe('67.5');
  });

  it('falls back to the last historical set when current exercise has extra sets', () => {
    const currentLogs = buildInitialExerciseLogs(template);
    const expandedLogs = [
      {
        ...currentLogs[0],
        sets: [
          { setNumber: 1, reps: '', weight: '', completed: false },
          { setNumber: 2, reps: '', weight: '', completed: false },
          { setNumber: 3, reps: '', weight: '', completed: false },
        ],
      },
    ];
    const entries: GymEntry[] = [
      {
        id: '2026-04-05',
        dateKey: '2026-04-05',
        status: GymStatus.WENT,
        split: 'template_push',
        exerciseLogs: [
          {
            exerciseId: 'ex_bench',
            exerciseName: 'Bench Press',
            sets: [{ setNumber: 1, reps: '10', weight: '62.5', completed: true }],
          },
        ],
        loggedAt: '2026-04-05T10:00:00.000Z',
      },
    ];

    const result = applyHistoryDefaultsToExerciseLogs(entries, expandedLogs);

    expect(result.didApplyDefaults).toBe(true);
    expect(result.exerciseLogs[0].sets.map((set) => set.reps)).toEqual(['10', '10', '10']);
    expect(result.exerciseLogs[0].sets.map((set) => set.weight)).toEqual(['62.5', '62.5', '62.5']);
  });

  it('formats timer values as mm:ss', () => {
    expect(formatTimer(0)).toBe('00:00');
    expect(formatTimer(65)).toBe('01:05');
    expect(formatTimer(600)).toBe('10:00');
  });
});

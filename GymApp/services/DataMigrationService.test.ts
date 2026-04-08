import { STORAGE_KEYS } from '../constants/Constants';
import { DEFAULT_SETTINGS } from '../models/AppSettings';
import { GymStatus } from '../models/GymStatus';
import { CURRENT_DATA_VERSION } from '../models/schemas';

const storage: Record<string, string> = {};

const AsyncStorageMock = {
  getItem: jest.fn(async (key: string) => (key in storage ? storage[key] : null)),
  setItem: jest.fn(async (key: string, value: string) => {
    storage[key] = value;
  }),
  removeItem: jest.fn(async (key: string) => {
    delete storage[key];
  }),
  multiSet: jest.fn(async (pairs: [string, string][]) => {
    pairs.forEach(([key, value]) => {
      storage[key] = value;
    });
  }),
};

jest.mock('@react-native-async-storage/async-storage', () => AsyncStorageMock);

import { DataMigrationService } from './DataMigrationService';

describe('DataMigrationService', () => {
  beforeEach(() => {
    Object.keys(storage).forEach((key) => delete storage[key]);
    jest.clearAllMocks();
  });

  it('migrates legacy entries to current schema deterministically', async () => {
    storage[STORAGE_KEYS.ENTRIES] = JSON.stringify([
      {
        dateKey: '2026-06-15',
        status: 'went',
        exerciseLogs: [
          {
            exerciseName: 'Bench Press',
            sets: [{ reps: '10', weight: '60' }],
          },
        ],
      },
    ]);

    const migrated = await DataMigrationService.getEntries();

    expect(migrated).toHaveLength(1);
    expect(migrated[0]).toMatchObject({
      id: '2026-06-15',
      dateKey: '2026-06-15',
      status: 'went',
      loggedAt: '2026-06-15T00:00:00.000Z',
    });
    expect(migrated[0].exerciseLogs?.[0].sets).toEqual([
      { setNumber: 1, reps: '10', weight: '60', completed: false },
    ]);
    expect(storage[STORAGE_KEYS.ENTRIES_VERSION]).toBe(String(CURRENT_DATA_VERSION));
  });

  it('migrates legacy templates with stable set ids', async () => {
    storage[STORAGE_KEYS.WORKOUT_TEMPLATES] = JSON.stringify([
      {
        name: 'Push Day',
        exercises: [
          {
            name: 'Bench Press',
            sets: 2,
            reps: '8',
            weight: '70',
          },
        ],
      },
    ]);

    const firstRead = await DataMigrationService.getTemplates();
    const secondRead = await DataMigrationService.getTemplates();

    expect(firstRead).toHaveLength(1);
    expect(firstRead[0].id).toBe('template_push_day');
    expect(firstRead[0].exercises[0].sets.map((set) => set.id)).toEqual([
      'template_push_day_exercise_1_set_1',
      'template_push_day_exercise_1_set_2',
    ]);
    expect(secondRead[0].exercises[0].sets.map((set) => set.id)).toEqual(
      firstRead[0].exercises[0].sets.map((set) => set.id),
    );
    expect(storage[STORAGE_KEYS.TEMPLATES_VERSION]).toBe(String(CURRENT_DATA_VERSION));
  });

  it('migrates legacy settings and fills missing fields', async () => {
    storage[STORAGE_KEYS.SETTINGS] = JSON.stringify({
      theme: 'light',
      remindersEnabled: true,
      reminderHour: 27,
      reminderMinute: -5,
      resetHour: 5,
    });

    const settings = await DataMigrationService.getSettings();

    expect(settings).toEqual({
      theme: 'light',
      remindersEnabled: true,
      reminderHour: 23,
      reminderMinute: 0,
      resetHour: 5,
      resetMinute: 0,
    });
    expect(storage[STORAGE_KEYS.SETTINGS_VERSION]).toBe(String(CURRENT_DATA_VERSION));
  });

  it('keeps template/settings storage untouched when importing legacy entries-only payload', async () => {
    storage[STORAGE_KEYS.WORKOUT_TEMPLATES] = JSON.stringify([{ id: 'template_existing', name: 'Existing', exercises: [], createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' }]);
    storage[STORAGE_KEYS.SETTINGS] = JSON.stringify({
      theme: 'dark',
      remindersEnabled: false,
      reminderHour: 18,
      reminderMinute: 0,
      resetHour: 6,
      resetMinute: 0,
    });

    const normalized = DataMigrationService.normalizeImportData([
      { id: '2026-06-20', dateKey: '2026-06-20', status: 'went', loggedAt: '2026-06-20T10:00:00.000Z' },
    ]);

    expect(normalized.errors).toEqual([]);

    await DataMigrationService.persistImportedData({
      entries: normalized.entries,
      templates: normalized.templates,
      settings: normalized.settings,
    });

    expect(storage[STORAGE_KEYS.WORKOUT_TEMPLATES]).toContain('template_existing');
    expect(storage[STORAGE_KEYS.SETTINGS]).toContain('"theme":"dark"');
    expect(storage[STORAGE_KEYS.ENTRIES]).toContain('2026-06-20');
  });

  it('normalizes versioned imports with nullable templates/settings', () => {
    const result = DataMigrationService.normalizeImportData({
      version: CURRENT_DATA_VERSION,
      exportedAt: '2026-06-20T10:00:00.000Z',
      entries: [{ id: '2026-06-20', dateKey: '2026-06-20', status: 'went', loggedAt: '2026-06-20T10:00:00.000Z' }],
      templates: null,
      settings: null,
    });

    expect(result.errors).toEqual([]);
    expect(result.templates).toEqual([]);
    expect(result.settings).toEqual(DEFAULT_SETTINGS);
    expect(result.warnings).toContain('import.settings: null settings replaced with defaults');
  });

  it('persists version keys for imported templates and settings when provided', async () => {
    await DataMigrationService.persistImportedData({
      entries: [{ id: '2026-06-20', dateKey: '2026-06-20', status: GymStatus.WENT, loggedAt: '2026-06-20T10:00:00.000Z' }],
      templates: [
        {
          id: 'template_pull',
          name: 'Pull Day',
          exercises: [],
          createdAt: '2026-06-20T10:00:00.000Z',
          updatedAt: '2026-06-20T10:00:00.000Z',
        },
      ],
      settings: {
        theme: 'light',
        remindersEnabled: true,
        reminderHour: 7,
        reminderMinute: 15,
        resetHour: 5,
        resetMinute: 30,
      },
    });

    expect(storage[STORAGE_KEYS.TEMPLATES_VERSION]).toBe(String(CURRENT_DATA_VERSION));
    expect(storage[STORAGE_KEYS.SETTINGS_VERSION]).toBe(String(CURRENT_DATA_VERSION));
    expect(storage[STORAGE_KEYS.WORKOUT_TEMPLATES]).toContain('template_pull');
    expect(storage[STORAGE_KEYS.SETTINGS]).toContain('"theme":"light"');
  });

  it('rejects unsupported import versions', () => {
    const result = DataMigrationService.normalizeImportData({
      version: CURRENT_DATA_VERSION + 1,
      exportedAt: '2026-06-20T10:00:00.000Z',
      entries: [],
    });

    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain('Unsupported export version');
  });
});


import { STORAGE_KEYS } from '../constants/Constants';
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

import { GymLogService } from './GymLogService';

describe('GymLogService migrations integration', () => {
  beforeEach(() => {
    Object.keys(storage).forEach((key) => delete storage[key]);
    jest.clearAllMocks();
  });

  it('exports current schema with templates and settings', async () => {
    storage[STORAGE_KEYS.ENTRIES] = JSON.stringify([
      { id: '2026-06-01', dateKey: '2026-06-01', status: 'went', loggedAt: '2026-06-01T10:00:00.000Z' },
    ]);
    storage[STORAGE_KEYS.WORKOUT_TEMPLATES] = JSON.stringify([
      {
        id: 'template_push',
        name: 'Push',
        exercises: [],
        createdAt: '2026-06-01T10:00:00.000Z',
        updatedAt: '2026-06-01T10:00:00.000Z',
      },
    ]);
    storage[STORAGE_KEYS.SETTINGS] = JSON.stringify({
      theme: 'dark',
      remindersEnabled: false,
      reminderHour: 18,
      reminderMinute: 0,
      resetHour: 6,
      resetMinute: 0,
    });

    const exported = JSON.parse(await GymLogService.exportData());

    expect(exported.version).toBe(CURRENT_DATA_VERSION);
    expect(exported.entries).toHaveLength(1);
    expect(exported.templates).toHaveLength(1);
    expect(exported.settings.theme).toBe('dark');
  });

  it('imports versioned payload and writes templates/settings alongside entries', async () => {
    const payload = {
      version: CURRENT_DATA_VERSION,
      exportedAt: '2026-06-20T10:00:00.000Z',
      entries: [{ id: '2026-06-20', dateKey: '2026-06-20', status: 'went', loggedAt: '2026-06-20T10:00:00.000Z' }],
      templates: [
        {
          id: 'template_pull',
          name: 'Pull',
          exercises: [],
          createdAt: '2026-06-20T10:00:00.000Z',
          updatedAt: '2026-06-20T10:00:00.000Z',
        },
      ],
      settings: {
        theme: 'light',
        remindersEnabled: true,
        reminderHour: 21,
        reminderMinute: 15,
        resetHour: 5,
        resetMinute: 45,
      },
    };

    const result = await GymLogService.importData(JSON.stringify(payload));

    expect(result).toEqual({ imported: 1, errors: [] });
    expect(storage[STORAGE_KEYS.ENTRIES]).toContain('2026-06-20');
    expect(storage[STORAGE_KEYS.WORKOUT_TEMPLATES]).toContain('template_pull');
    expect(storage[STORAGE_KEYS.SETTINGS]).toContain('"theme":"light"');
  });
});


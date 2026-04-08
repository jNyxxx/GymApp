import { 
  GymEntrySchema, 
  GymEntriesArraySchema,
  WorkoutTemplateSchema,
  AppSettingsSchema,
  FitnessGoalSchema,
  FitnessGoalsArraySchema,
  ExportDataSchema,
  validateGymEntries,
  validateWorkoutTemplates,
  validateFitnessGoals,
  validateExportData,
  formatValidationErrors,
  CURRENT_DATA_VERSION,
} from './schemas';
import { GymStatus } from './GymStatus';
import { WorkoutSplit } from './WorkoutSplit';

describe('schemas', () => {
  describe('GymEntrySchema', () => {
    it('validates a correct entry', () => {
      const entry = {
        id: '2026-04-06',
        dateKey: '2026-04-06',
        status: GymStatus.WENT,
        split: WorkoutSplit.UPPER,
        loggedAt: '2026-04-06T10:30:00.000Z',
      };
      
      const result = GymEntrySchema.safeParse(entry);
      expect(result.success).toBe(true);
    });

    it('validates entry without optional split', () => {
      const entry = {
        id: '2026-04-06',
        dateKey: '2026-04-06',
        status: GymStatus.NO_GYM,
        loggedAt: '2026-04-06T10:30:00.000Z',
      };
      
      const result = GymEntrySchema.safeParse(entry);
      expect(result.success).toBe(true);
    });

    it('validates entry with exercise performance logs', () => {
      const entry = {
        id: '2026-04-06',
        dateKey: '2026-04-06',
        status: GymStatus.WENT,
        split: 'template_push_day',
        notes: 'Solid session',
        exerciseLogs: [
          {
            exerciseId: 'ex_bench',
            exerciseName: 'Bench Press',
            sets: [
              { setNumber: 1, reps: '10', weight: '60', completed: true },
              { setNumber: 2, reps: '8', weight: '65', completed: true },
            ],
          },
        ],
        loggedAt: '2026-04-06T10:30:00.000Z',
      };

      const result = GymEntrySchema.safeParse(entry);
      expect(result.success).toBe(true);
    });

    it('rejects malformed exercise performance logs', () => {
      const entry = {
        id: '2026-04-06',
        dateKey: '2026-04-06',
        status: GymStatus.WENT,
        exerciseLogs: [
          {
            exerciseId: 'ex_bench',
            exerciseName: 'Bench Press',
            sets: [
              { setNumber: '1', reps: '10', weight: '60', completed: true },
            ],
          },
        ],
        loggedAt: '2026-04-06T10:30:00.000Z',
      };

      const result = GymEntrySchema.safeParse(entry);
      expect(result.success).toBe(false);
    });

    it('rejects invalid date key format', () => {
      const entry = {
        id: '2026-04-06',
        dateKey: '04-06-2026', // Wrong format
        status: GymStatus.WENT,
        loggedAt: '2026-04-06T10:30:00.000Z',
      };
      
      const result = GymEntrySchema.safeParse(entry);
      expect(result.success).toBe(false);
    });

    it('rejects invalid status', () => {
      const entry = {
        id: '2026-04-06',
        dateKey: '2026-04-06',
        status: 'invalid_status',
        loggedAt: '2026-04-06T10:30:00.000Z',
      };
      
      const result = GymEntrySchema.safeParse(entry);
      expect(result.success).toBe(false);
    });

    it('rejects missing required fields', () => {
      const entry = {
        id: '2026-04-06',
        // missing dateKey, status, loggedAt
      };
      
      const result = GymEntrySchema.safeParse(entry);
      expect(result.success).toBe(false);
    });
  });

  describe('AppSettingsSchema', () => {
    it('validates correct settings', () => {
      const settings = {
        theme: 'dark',
        remindersEnabled: true,
        reminderHour: 18,
        reminderMinute: 30,
        resetHour: 6,
        resetMinute: 0,
      };
      
      const result = AppSettingsSchema.safeParse(settings);
      expect(result.success).toBe(true);
    });

    it('rejects invalid theme', () => {
      const settings = {
        theme: 'blue', // Invalid
        remindersEnabled: true,
        reminderHour: 18,
        reminderMinute: 30,
        resetHour: 6,
        resetMinute: 0,
      };
      
      const result = AppSettingsSchema.safeParse(settings);
      expect(result.success).toBe(false);
    });

    it('rejects out-of-range hours', () => {
      const settings = {
        theme: 'dark',
        remindersEnabled: true,
        reminderHour: 25, // Invalid
        reminderMinute: 30,
        resetHour: 6,
        resetMinute: 0,
      };
      
      const result = AppSettingsSchema.safeParse(settings);
      expect(result.success).toBe(false);
    });
  });

  describe('WorkoutTemplateSchema', () => {
    it('validates a correct workout template', () => {
      const template = {
        id: 'template_push',
        name: 'Push Day',
        emoji: '🔥',
        exercises: [
          {
            id: 'ex_bench',
            name: 'Bench Press',
            sets: [
              { id: 'set_1', reps: '10', weight: '60' },
            ],
          },
        ],
        createdAt: '2026-04-06T10:30:00.000Z',
        updatedAt: '2026-04-06T10:30:00.000Z',
      };

      const result = WorkoutTemplateSchema.safeParse(template);
      expect(result.success).toBe(true);
    });

    it('rejects malformed template sets', () => {
      const template = {
        id: 'template_push',
        name: 'Push Day',
        exercises: [
          {
            id: 'ex_bench',
            name: 'Bench Press',
            sets: [{ reps: '10', weight: '60' }],
          },
        ],
        createdAt: '2026-04-06T10:30:00.000Z',
        updatedAt: '2026-04-06T10:30:00.000Z',
      };

      const result = WorkoutTemplateSchema.safeParse(template);
      expect(result.success).toBe(false);
    });
  });

  describe('FitnessGoalSchema', () => {
    it('validates an attendance goal', () => {
      const goal = {
        id: 'attendance_goal',
        type: 'attendance',
        targetGymDays: 16,
        createdAt: '2026-04-06T10:30:00.000Z',
      };

      const result = FitnessGoalSchema.safeParse(goal);
      expect(result.success).toBe(true);
    });

    it('validates a monthly volume goal', () => {
      const goal = {
        id: 'volume_goal',
        type: 'monthly-volume',
        targetVolumeKg: 12000,
        createdAt: '2026-04-06T10:30:00.000Z',
      };

      const result = FitnessGoalSchema.safeParse(goal);
      expect(result.success).toBe(true);
    });

    it('validates an exercise progression goal', () => {
      const goal = {
        id: 'bench_goal',
        type: 'exercise-progression',
        exerciseName: 'Bench Press',
        exerciseKey: 'bench press',
        targetEstimatedOneRepMaxKg: 120,
        createdAt: '2026-04-06T10:30:00.000Z',
      };

      const result = FitnessGoalSchema.safeParse(goal);
      expect(result.success).toBe(true);
    });

    it('rejects exercise goals with invalid target', () => {
      const goal = {
        id: 'bad_goal',
        type: 'exercise-progression',
        exerciseName: 'Bench Press',
        exerciseKey: 'bench press',
        targetEstimatedOneRepMaxKg: 0,
        createdAt: '2026-04-06T10:30:00.000Z',
      };

      const result = FitnessGoalSchema.safeParse(goal);
      expect(result.success).toBe(false);
    });
  });

  describe('ExportDataSchema', () => {
    it('validates correct export data', () => {
      const exportData = {
        version: CURRENT_DATA_VERSION,
        exportedAt: '2026-04-06T10:30:00.000Z',
        entries: [
          {
            id: '2026-04-06',
            dateKey: '2026-04-06',
            status: GymStatus.WENT,
            split: WorkoutSplit.PUSH,
            loggedAt: '2026-04-06T10:30:00.000Z',
          },
        ],
      };
      
      const result = ExportDataSchema.safeParse(exportData);
      expect(result.success).toBe(true);
    });

    it('validates export data with optional settings', () => {
      const exportData = {
        version: CURRENT_DATA_VERSION,
        exportedAt: '2026-04-06T10:30:00.000Z',
        entries: [],
        settings: {
          theme: 'light',
          remindersEnabled: false,
          reminderHour: 18,
          reminderMinute: 0,
          resetHour: 6,
          resetMinute: 0,
        },
      };
      
      const result = ExportDataSchema.safeParse(exportData);
      expect(result.success).toBe(true);
    });

    it('validates export data with goals', () => {
      const exportData = {
        version: CURRENT_DATA_VERSION,
        exportedAt: '2026-04-06T10:30:00.000Z',
        entries: [],
        goals: [
          {
            id: 'volume_goal',
            type: 'monthly-volume',
            targetVolumeKg: 12000,
            createdAt: '2026-04-06T10:30:00.000Z',
          },
        ],
      };

      const result = ExportDataSchema.safeParse(exportData);
      expect(result.success).toBe(true);
    });

    it('validates export data with templates', () => {
      const exportData = {
        version: CURRENT_DATA_VERSION,
        exportedAt: '2026-04-06T10:30:00.000Z',
        entries: [],
        templates: [
          {
            id: 'template_pull',
            name: 'Pull Day',
            exercises: [
              {
                id: 'ex_row',
                name: 'Barbell Row',
                sets: [{ id: 'set_1', reps: '8', weight: '70' }],
              },
            ],
            createdAt: '2026-04-06T10:30:00.000Z',
            updatedAt: '2026-04-06T10:30:00.000Z',
          },
        ],
      };

      const result = ExportDataSchema.safeParse(exportData);
      expect(result.success).toBe(true);
    });

    it('rejects export data with incomplete settings', () => {
      const exportData = {
        version: CURRENT_DATA_VERSION,
        exportedAt: '2026-04-06T10:30:00.000Z',
        entries: [],
        settings: {
          theme: 'light',
          remindersEnabled: false,
          reminderHour: 18,
          reminderMinute: 0,
          resetHour: 6,
        },
      };

      const result = ExportDataSchema.safeParse(exportData);
      expect(result.success).toBe(false);
    });
  });

  describe('validateGymEntries', () => {
    it('validates array of entries', () => {
      const entries = [
        {
          id: '2026-04-05',
          dateKey: '2026-04-05',
          status: GymStatus.WENT,
          split: WorkoutSplit.UPPER,
          loggedAt: '2026-04-05T10:00:00.000Z',
        },
        {
          id: '2026-04-06',
          dateKey: '2026-04-06',
          status: GymStatus.NO_GYM,
          loggedAt: '2026-04-06T10:00:00.000Z',
        },
      ];
      
      const result = validateGymEntries(entries);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveLength(2);
      }
    });

    it('returns error for invalid entries', () => {
      const entries = [
        { invalid: 'data' },
      ];
      
      const result = validateGymEntries(entries);
      expect(result.success).toBe(false);
    });
  });

  describe('validateFitnessGoals', () => {
    it('validates a goals array', () => {
      const goals = [
        {
          id: 'attendance_goal',
          type: 'attendance',
          targetGymDays: 12,
          createdAt: '2026-04-06T10:30:00.000Z',
        },
        {
          id: 'volume_goal',
          type: 'monthly-volume',
          targetVolumeKg: 8000,
          createdAt: '2026-04-06T10:30:00.000Z',
        },
      ];

      const result = validateFitnessGoals(goals);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveLength(2);
      }
    });

    it('returns error for invalid goals', () => {
      const goals = [
        {
          id: 'bad_goal',
          type: 'monthly-volume',
          targetVolumeKg: -100,
          createdAt: '2026-04-06T10:30:00.000Z',
        },
      ];

      const result = validateFitnessGoals(goals);
      expect(result.success).toBe(false);
    });
  });

  describe('validateWorkoutTemplates', () => {
    it('validates array of templates', () => {
      const templates = [
        {
          id: 'template_push',
          name: 'Push Day',
          exercises: [],
          createdAt: '2026-04-06T10:30:00.000Z',
          updatedAt: '2026-04-06T10:30:00.000Z',
        },
      ];

      const result = validateWorkoutTemplates(templates);
      expect(result.success).toBe(true);
    });

    it('returns error for invalid templates', () => {
      const templates = [{ id: 'bad_template' }];
      const result = validateWorkoutTemplates(templates);
      expect(result.success).toBe(false);
    });
  });

  describe('validateExportData', () => {
    it('validates complete export envelope', () => {
      const data = {
        version: CURRENT_DATA_VERSION,
        exportedAt: new Date().toISOString(),
        entries: [],
      };
      
      const result = validateExportData(data);
      expect(result.success).toBe(true);
    });

    it('validates export envelope with current settings fields', () => {
      const data = {
        version: CURRENT_DATA_VERSION,
        exportedAt: new Date().toISOString(),
        entries: [],
        settings: {
          theme: 'dark',
          remindersEnabled: true,
          reminderHour: 20,
          reminderMinute: 15,
          resetHour: 5,
          resetMinute: 45,
        },
      };

      const result = validateExportData(data);
      expect(result.success).toBe(true);
    });

    it('rejects settings missing resetMinute in export envelope', () => {
      const data = {
        version: CURRENT_DATA_VERSION,
        exportedAt: new Date().toISOString(),
        entries: [],
        settings: {
          theme: 'dark',
          remindersEnabled: true,
          reminderHour: 20,
          reminderMinute: 15,
          resetHour: 5,
        },
      };

      const result = validateExportData(data);
      expect(result.success).toBe(false);
    });
  });

  describe('formatValidationErrors', () => {
    it('formats errors into readable string', () => {
      const result = GymEntrySchema.safeParse({ id: '', dateKey: 'invalid' });
      
      if (!result.success) {
        const formatted = formatValidationErrors(result.error);
        expect(typeof formatted).toBe('string');
        expect(formatted.length).toBeGreaterThan(0);
      }
    });
  });
});

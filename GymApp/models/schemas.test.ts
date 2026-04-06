import { 
  GymEntrySchema, 
  GymEntriesArraySchema,
  AppSettingsSchema,
  ExportDataSchema,
  validateGymEntries,
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
      };
      
      const result = AppSettingsSchema.safeParse(settings);
      expect(result.success).toBe(false);
    });
  });

  describe('ExportDataSchema', () => {
    it('validates correct export data', () => {
      const exportData = {
        version: 1,
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
        version: 1,
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
      expect(result.success).toBe(true);
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

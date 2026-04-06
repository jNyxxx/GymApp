import {
  getGymDateKey,
  getMonthKey,
  parseDateKey,
  getDateRange,
  formatFriendly,
  formatMonthLabel,
  getPreviousMonth,
  getNextMonth,
  formatResetHour,
} from './DateLogicService';

describe('DateLogicService', () => {
  describe('getGymDateKey', () => {
    it('returns today when after reset hour', () => {
      const date = new Date(2026, 3, 6, 10, 0, 0); // April 6, 2026 at 10 AM
      const result = getGymDateKey(date, 6);
      expect(result).toBe('2026-04-06');
    });

    it('returns yesterday when before reset hour', () => {
      const date = new Date(2026, 3, 6, 3, 0, 0); // April 6, 2026 at 3 AM
      const result = getGymDateKey(date, 6);
      expect(result).toBe('2026-04-05');
    });

    it('returns today at exactly reset hour', () => {
      const date = new Date(2026, 3, 6, 6, 0, 0); // April 6, 2026 at 6 AM
      const result = getGymDateKey(date, 6);
      expect(result).toBe('2026-04-06');
    });

    it('uses default reset hour of 6 when not specified', () => {
      const date = new Date(2026, 3, 6, 5, 0, 0); // 5 AM - before default 6 AM
      const result = getGymDateKey(date);
      expect(result).toBe('2026-04-05');
    });

    it('handles month boundary when rolling back', () => {
      const date = new Date(2026, 3, 1, 2, 0, 0); // April 1 at 2 AM
      const result = getGymDateKey(date, 6);
      expect(result).toBe('2026-03-31');
    });

    it('handles year boundary when rolling back', () => {
      const date = new Date(2026, 0, 1, 2, 0, 0); // Jan 1 at 2 AM
      const result = getGymDateKey(date, 6);
      expect(result).toBe('2025-12-31');
    });

    it('pads single digit months and days', () => {
      const date = new Date(2026, 0, 5, 10, 0, 0); // Jan 5 at 10 AM
      const result = getGymDateKey(date, 6);
      expect(result).toBe('2026-01-05');
    });
  });

  describe('getMonthKey', () => {
    it('returns YYYY-MM format', () => {
      const date = new Date(2026, 3, 15);
      expect(getMonthKey(date)).toBe('2026-04');
    });

    it('pads single digit months', () => {
      const date = new Date(2026, 0, 15);
      expect(getMonthKey(date)).toBe('2026-01');
    });

    it('uses current date when no argument', () => {
      const result = getMonthKey();
      const now = new Date();
      const expected = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      expect(result).toBe(expected);
    });
  });

  describe('parseDateKey', () => {
    it('parses YYYY-MM-DD into Date object', () => {
      const result = parseDateKey('2026-04-15');
      expect(result.getFullYear()).toBe(2026);
      expect(result.getMonth()).toBe(3); // April is 3 (0-indexed)
      expect(result.getDate()).toBe(15);
    });

    it('parses padded values correctly', () => {
      const result = parseDateKey('2026-01-05');
      expect(result.getMonth()).toBe(0);
      expect(result.getDate()).toBe(5);
    });
  });

  describe('getDateRange', () => {
    it('returns inclusive range of date keys', () => {
      const result = getDateRange('2026-04-01', '2026-04-03');
      expect(result).toHaveLength(3);
      expect(result).toContain('2026-04-01');
      expect(result).toContain('2026-04-02');
      expect(result).toContain('2026-04-03');
    });

    it('returns single date when start equals end', () => {
      const result = getDateRange('2026-04-01', '2026-04-01');
      expect(result).toHaveLength(1);
      expect(result[0]).toBe('2026-04-01');
    });

    it('handles month boundaries', () => {
      const result = getDateRange('2026-03-30', '2026-04-02');
      expect(result).toHaveLength(4);
      expect(result).toContain('2026-03-30');
      expect(result).toContain('2026-04-01');
    });
  });

  describe('formatFriendly', () => {
    it('formats date as "Day, Mon D"', () => {
      const result = formatFriendly('2026-04-06'); // Monday
      expect(result).toBe('Mon, Apr 6');
    });

    it('handles different days of week', () => {
      expect(formatFriendly('2026-04-05')).toBe('Sun, Apr 5');
      expect(formatFriendly('2026-04-07')).toBe('Tue, Apr 7');
    });
  });

  describe('formatMonthLabel', () => {
    it('returns full month name with year', () => {
      expect(formatMonthLabel('2026-04')).toBe('April 2026');
      expect(formatMonthLabel('2026-01')).toBe('January 2026');
      expect(formatMonthLabel('2026-12')).toBe('December 2026');
    });
  });

  describe('getPreviousMonth', () => {
    it('returns previous month key', () => {
      expect(getPreviousMonth('2026-04')).toBe('2026-03');
    });

    it('handles year boundary', () => {
      expect(getPreviousMonth('2026-01')).toBe('2025-12');
    });
  });

  describe('getNextMonth', () => {
    it('returns next month key', () => {
      expect(getNextMonth('2026-04')).toBe('2026-05');
    });

    it('handles year boundary', () => {
      expect(getNextMonth('2026-12')).toBe('2027-01');
    });
  });

  describe('formatResetHour', () => {
    it('formats AM hours correctly', () => {
      expect(formatResetHour(6)).toBe('6:00 AM');
      expect(formatResetHour(0)).toBe('12:00 AM');
      expect(formatResetHour(11)).toBe('11:00 AM');
    });

    it('formats PM hours correctly', () => {
      expect(formatResetHour(12)).toBe('12:00 PM');
      expect(formatResetHour(13)).toBe('1:00 PM');
      expect(formatResetHour(23)).toBe('11:00 PM');
    });
  });
});

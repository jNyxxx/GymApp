import { DEFAULT_RESET_HOUR } from '../constants/Constants';

/**
 * Returns the "effective" date for gym logging.
 * If the current hour is before the reset hour, returns yesterday's date.
 * Otherwise returns today's date.
 * All returned dates are in YYYY-MM-DD format.
 */
export function getGymDateKey(date: Date = new Date(), resetHour: number = DEFAULT_RESET_HOUR, resetMinute: number = 0): string {
  const adjusted = new Date(date);
  const currentMinutes = adjusted.getHours() * 60 + adjusted.getMinutes();
  const resetMinutes = resetHour * 60 + resetMinute;

  if (currentMinutes < resetMinutes) {
    adjusted.setDate(adjusted.getDate() - 1);
  }

  const year = adjusted.getFullYear();
  const month = String(adjusted.getMonth() + 1).padStart(2, '0');
  const day = String(adjusted.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/**
 * Formats a Date into YYYY-MM-DD without applying reset-hour logic.
 * Use this when the user explicitly picks a calendar date.
 */
export function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns a month key in YYYY-MM format for a given date.
 */
export function getMonthKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Parses a YYYY-MM-DD string into a Date object.
 */
export function parseDateKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Returns an array of all date keys between two date keys (inclusive).
 */
export function getDateRange(startKey: string, endKey: string): string[] {
  const start = parseDateKey(startKey);
  const end = parseDateKey(endKey);
  const keys: string[] = [];

  const current = new Date(start);
  while (current <= end) {
    keys.push(getGymDateKey(current));
    current.setDate(current.getDate() + 1);
  }

  return keys;
}

/**
 * Formats a date key into a human-readable string like "Mon, Jan 5".
 */
export function formatFriendly(dateKey: string): string {
  const date = parseDateKey(dateKey);
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`;
}

/**
 * Returns the full month label for a month key, e.g. "January 2026".
 */
export function formatMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split('-').map(Number);
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  return `${months[month - 1]} ${year}`;
}

/**
 * Returns the month key for the previous month.
 */
export function getPreviousMonth(monthKey: string): string {
  const [year, month] = monthKey.split('-').map(Number);
  const date = new Date(year, month - 1, 1);
  date.setMonth(date.getMonth() - 1);
  return getMonthKey(date);
}

/**
 * Returns the month key for the next month.
 */
export function getNextMonth(monthKey: string): string {
  const [year, month] = monthKey.split('-').map(Number);
  const date = new Date(year, month - 1, 1);
  date.setMonth(date.getMonth() + 1);
  return getMonthKey(date);
}

/**
 * Formats an hour and minute into a 12-hour display string (e.g. "2:41 AM").
 */
export function formatResetHour(hour: number, minute: number = 0): string {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  const displayMinute = String(minute).padStart(2, '0');
  return `${displayHour}:${displayMinute} ${period}`;
}

export type WeightUnit = 'kg' | 'lbs';

export interface ParsedWeight {
  value: number;
  unit: WeightUnit;
  valueKg: number;
}

const LBS_TO_KG = 0.45359237;

export class PerformanceParsingService {
  /**
   * Parse a weight string such as "60", "60kg", or "135lbs".
   * Defaults to kilograms when no unit is provided.
   */
  static parseWeight(input: string | number | null | undefined): ParsedWeight | null {
    if (typeof input === 'number') {
      if (!Number.isFinite(input) || input <= 0) return null;
      return { value: input, unit: 'kg', valueKg: input };
    }

    if (typeof input !== 'string') return null;

    const normalized = input.trim().toLowerCase();
    if (!normalized) return null;

    const match = normalized.match(/^(\d+(?:\.\d+)?)\s*(kg|kgs|lb|lbs)?$/i);
    if (!match) return null;

    const value = Number.parseFloat(match[1]);
    if (!Number.isFinite(value) || value <= 0) return null;

    const unitToken = match[2]?.toLowerCase();
    const unit: WeightUnit = unitToken === 'lb' || unitToken === 'lbs' ? 'lbs' : 'kg';
    const valueKg = unit === 'lbs' ? value * LBS_TO_KG : value;

    return { value, unit, valueKg };
  }

  /**
   * Parse reps safely from strings like "10", "10 reps", or "8-10".
   * Uses the first numeric token found.
   */
  static parseReps(input: string | number | null | undefined): number | null {
    if (typeof input === 'number') {
      if (!Number.isFinite(input) || input <= 0) return null;
      return input;
    }

    if (typeof input !== 'string') return null;

    const normalized = input.trim().toLowerCase();
    if (!normalized) return null;

    const match = normalized.match(/(\d+(?:\.\d+)?)/);
    if (!match) return null;

    const reps = Number.parseFloat(match[1]);
    if (!Number.isFinite(reps) || reps <= 0) return null;

    return reps;
  }
}

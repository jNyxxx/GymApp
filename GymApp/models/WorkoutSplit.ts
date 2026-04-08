export enum WorkoutSplit {
  UPPER = 'upper',
  LOWER = 'lower',
  PUSH = 'push',
  PULL = 'pull',
  LEGS = 'legs',
  POSTERIOR = 'posterior',
  ANTERIOR = 'anterior',
}

export const SPLIT_LABELS: Record<WorkoutSplit, string> = {
  [WorkoutSplit.UPPER]: 'Upper',
  [WorkoutSplit.LOWER]: 'Lower',
  [WorkoutSplit.PUSH]: 'Push',
  [WorkoutSplit.PULL]: 'Pull',
  [WorkoutSplit.LEGS]: 'Legs',
  [WorkoutSplit.POSTERIOR]: 'Posterior',
  [WorkoutSplit.ANTERIOR]: 'Anterior',
};

/**
 * Get label for a split (built-in or custom).
 * For custom splits, use the provided customLabels map.
 */
export function getSplitLabel(splitId: string, customLabels?: Record<string, string>): string {
  // Check if it's a built-in split
  if (Object.values(WorkoutSplit).includes(splitId as WorkoutSplit)) {
    return SPLIT_LABELS[splitId as WorkoutSplit];
  }
  
  // Check custom splits
  if (customLabels && customLabels[splitId]) {
    return customLabels[splitId];
  }
  
  // Fallback: format the ID as a label
  return splitId.replace('custom_', '').replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase());
}

/**
 * Check if a split ID is a custom split.
 */
export function isCustomSplit(splitId: string): boolean {
  return splitId.startsWith('custom_');
}

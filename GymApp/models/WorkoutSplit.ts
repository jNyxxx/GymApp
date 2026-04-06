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

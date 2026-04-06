import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColors } from '../../context/ThemeContext';
import { WorkoutSplit, SPLIT_LABELS } from '../../models/WorkoutSplit';
import ProgressBar from '../shared/ProgressBar';
import SplitIcon from '../shared/SplitIcon';

interface MonthlyProgressCardProps {
  gymDays: number;
  totalDays: number;
  noGymDays: number;
  mostTrainedSplit?: { split: WorkoutSplit; count: number };
}

export default function MonthlyProgressCard({
  gymDays,
  totalDays,
  noGymDays,
  mostTrainedSplit,
}: MonthlyProgressCardProps) {
  const colors = useColors();
  const percentage = totalDays > 0 ? Math.round((gymDays / totalDays) * 100) : 0;
  const pillColor = percentage >= 50 ? colors.success : colors.warning;
  const pillBg = percentage >= 50 ? colors.successBg : colors.warningBg;

  return (
    <View style={[styles.container, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
      <Text style={[styles.label, { color: colors.textMuted }]}>This month</Text>

      <View style={styles.topRow}>
        <Text style={[styles.count, { color: colors.text }]}>
          {gymDays} <Text style={[styles.countTotal, { color: colors.textSecondary }]}>/ {totalDays}</Text>
        </Text>
        <View style={[styles.pill, { backgroundColor: pillBg }]}>
          <Text style={[styles.pillText, { color: pillColor }]}>{percentage}% gym days</Text>
        </View>
      </View>

      <ProgressBar progress={gymDays / totalDays} style={{ marginVertical: 4 }} />

      <View style={styles.bottomRow}>
        {mostTrainedSplit && (
          <View style={styles.splitRow}>
            <SplitIcon split={mostTrainedSplit.split} size="sm" />
            <Text style={[styles.splitText, { color: colors.textSecondary }]}>
              Most trained:{' '}
              <Text style={[styles.splitBold, { color: colors.text }]}>
                {SPLIT_LABELS[mostTrainedSplit.split]}
              </Text>
            </Text>
          </View>
        )}
        <View style={[styles.noGymBadge, { backgroundColor: colors.gray }]}>
          <Text style={[styles.noGymText, { color: colors.textSecondary }]}>No gym: {noGymDays}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    gap: 14,
  },
  label: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    fontWeight: '700',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  count: {
    fontSize: 36,
    fontWeight: '900',
  },
  countTotal: {
    fontSize: 20,
    fontWeight: '700',
  },
  pill: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  splitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  splitText: {
    fontSize: 13,
    fontWeight: '500',
  },
  splitBold: {
    fontWeight: '700',
  },
  noGymBadge: {
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  noGymText: {
    fontSize: 12,
    fontWeight: '700',
  },
});

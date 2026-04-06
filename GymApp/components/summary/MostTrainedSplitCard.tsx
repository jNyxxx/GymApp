import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColors } from '../../context/ThemeContext';
import { MonthlyStats } from '../../services/SummaryService';
import { SPLIT_LABELS, WorkoutSplit } from '../../models/WorkoutSplit';
import SplitIcon from '../shared/SplitIcon';

interface MostTrainedSplitCardProps {
  stats: MonthlyStats;
}

export default function MostTrainedSplitCard({ stats }: MostTrainedSplitCardProps) {
  const colors = useColors();
  const splits = Object.values(WorkoutSplit);
  const totalGymDays = stats.totalGymDays;

  return (
    <View style={[styles.container, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
      <Text style={[styles.label, { color: colors.textMuted }]}>Most trained split</Text>

      {stats.mostTrainedSplit && (
        <View style={styles.topSplitRow}>
          <Text style={[styles.topSplitName, { color: colors.text }]}>
            {SPLIT_LABELS[stats.mostTrainedSplit.split]}
          </Text>
          <SplitIcon split={stats.mostTrainedSplit.split} size="sm" />
        </View>
      )}

      <View style={styles.bars}>
        {splits.map((split) => {
          const count = stats.splitCounts[split] || 0;
          const percentage = totalGymDays > 0 ? (count / totalGymDays) * 100 : 0;

          return (
            <View key={split} style={styles.barRow}>
              <View style={styles.splitLabelRow}>
                <SplitIcon split={split} size="sm" />
                <Text style={[styles.splitName, { color: colors.text }]}>{SPLIT_LABELS[split]}</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: colors.gray }]}>
                <View style={[styles.barFill, { width: `${percentage}%`, backgroundColor: colors.primary }]} />
              </View>
              <Text style={[styles.barCount, { color: colors.textSecondary }]}>{count}</Text>
            </View>
          );
        })}
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
  topSplitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topSplitName: {
    fontSize: 20,
    fontWeight: '800',
  },
  bars: {
    gap: 12,
    marginTop: 4,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  splitLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: 100,
  },
  splitName: {
    fontSize: 14,
    fontWeight: '600',
  },
  barTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  barCount: {
    fontSize: 14,
    fontWeight: '700',
    width: 20,
    textAlign: 'right',
  },
});

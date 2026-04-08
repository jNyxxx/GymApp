import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColors } from '../../context/ThemeContext';
import { MonthlyStats } from '../../services/SummaryService';
import { SPLIT_LABELS, WorkoutSplit } from '../../models/WorkoutSplit';
import { WorkoutTemplateService } from '../../services/WorkoutTemplateService';
import SplitIcon from '../shared/SplitIcon';

interface MostTrainedSplitCardProps {
  stats: MonthlyStats;
}

/**
 * Resolve a human-readable label for any split ID.
 */
function resolveSplitLabel(splitId: string, customNames: Record<string, string>): string {
  // Built-in split
  if (Object.values(WorkoutSplit).includes(splitId as WorkoutSplit)) {
    return SPLIT_LABELS[splitId as WorkoutSplit];
  }
  // Custom split with resolved name
  if (customNames[splitId]) {
    return customNames[splitId];
  }
  // Fallback: parse from ID (custom_chest_back_123456 -> Chest Back)
  return splitId
    .replace(/^(custom_|template_)/, '')
    .replace(/_\d+$/, '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

export default function MostTrainedSplitCard({ stats }: MostTrainedSplitCardProps) {
  const colors = useColors();
  const totalGymDays = stats.totalGymDays;

  // Resolve custom split names asynchronously
  const [customNames, setCustomNames] = useState<Record<string, string>>({});

  useEffect(() => {
    const resolveNames = async () => {
      const names: Record<string, string> = {};
      const customSplitIds = Object.keys(stats.splitCounts).filter(
        (id) => !Object.values(WorkoutSplit).includes(id as WorkoutSplit)
      );

      for (const id of customSplitIds) {
        if (WorkoutTemplateService.isTemplate(id)) {
          const template = await WorkoutTemplateService.getById(id);
          if (template) {
            names[id] = template.name;
          }
        }
      }

      setCustomNames(names);
    };
    resolveNames();
  }, [stats.splitCounts]);

  // Build a sorted list of ALL splits with counts (built-in + custom)
  const allSplits = Object.entries(stats.splitCounts)
    .filter(([, count]) => count > 0)
    .sort(([, a], [, b]) => b - a)
    .map(([split, count]) => ({
      split,
      count,
      percentage: totalGymDays > 0 ? Math.round((count / totalGymDays) * 100) : 0,
    }));

  const topSplit = allSplits[0] || null;

  return (
    <View style={[styles.container, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
      <Text style={[styles.label, { color: colors.textMuted }]}>Most trained split</Text>

      {topSplit && (
        <View style={styles.topSplitRow}>
          <Text style={[styles.topSplitName, { color: colors.text }]}>
            {resolveSplitLabel(topSplit.split, customNames)}
          </Text>
          <SplitIcon split={topSplit.split} size="sm" />
        </View>
      )}

      {allSplits.length > 0 && (
        <View style={styles.bars}>
          {allSplits.map(({ split, count, percentage }) => (
            <View key={split} style={styles.barRow}>
              <View style={styles.splitLabelRow}>
                <SplitIcon split={split} size="sm" />
                <Text style={[styles.splitName, { color: colors.text }]} numberOfLines={1}>
                  {resolveSplitLabel(split, customNames)}
                </Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: colors.gray }]}>
                <View style={[styles.barFill, { width: `${percentage}%`, backgroundColor: colors.primary }]} />
              </View>
              <Text style={[styles.barCount, { color: colors.textSecondary }]}>{count}</Text>
            </View>
          ))}
        </View>
      )}
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
    flex: 1,
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

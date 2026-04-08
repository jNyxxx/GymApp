import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColors } from '../../context/ThemeContext';
import { GymEntry } from '../../models/GymEntry';
import { GymStatus } from '../../models/GymStatus';
import { WorkoutSplit, SPLIT_LABELS } from '../../models/WorkoutSplit';
import { WorkoutTemplateService } from '../../services/WorkoutTemplateService';

interface SplitDistributionCardProps {
  entries: GymEntry[];
  monthKey: string;
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

/**
 * Stacked bar chart showing split distribution for the month.
 */
export default function SplitDistributionCard({ entries, monthKey }: SplitDistributionCardProps) {
  const colors = useColors();

  const monthEntries = entries.filter(
    (e) => e.status === GymStatus.WENT && e.dateKey.startsWith(monthKey) && e.split
  );

  if (monthEntries.length === 0) {
    return null;
  }

  // Count splits
  const splitCounts: Record<string, number> = {};
  for (const entry of monthEntries) {
    if (entry.split) {
      splitCounts[entry.split] = (splitCounts[entry.split] || 0) + 1;
    }
  }

  // Sort by count descending
  const sortedSplits = Object.entries(splitCounts)
    .sort(([, a], [, b]) => b - a)
    .map(([split, count]) => ({
      split,
      count,
      percentage: Math.round((count / monthEntries.length) * 100),
    }));

  const total = monthEntries.length;

  // Resolve custom split names
  const [customNames, setCustomNames] = useState<Record<string, string>>({});

  useEffect(() => {
    const resolveNames = async () => {
      const names: Record<string, string> = {};
      const customSplitIds = Object.keys(splitCounts).filter(
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
  }, [monthKey]);

  // Color palette for splits
  const splitColors = [
    colors.primary,
    colors.success,
    colors.warning,
    colors.primaryDark,
    colors.textSecondary,
    colors.grayLight,
    colors.primaryGlowStrong,
  ];

  return (
    <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
      <Text style={[styles.label, { color: colors.textMuted }]}>Split usage</Text>
      <Text style={[styles.title, { color: colors.text }]}>Split Distribution</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        {total} sessions this month
      </Text>

      <View style={styles.chartContainer}>
        {/* Stacked horizontal bar */}
        <View style={[styles.stackedBar, { backgroundColor: colors.gray }]}>
          {sortedSplits.map((item, index) => (
            <View
              key={item.split}
              style={[
                styles.barSegment,
                {
                  backgroundColor: splitColors[index % splitColors.length],
                  width: `${item.percentage}%`,
                },
              ]}
            />
          ))}
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          {sortedSplits.map((item, index) => (
            <View key={item.split} style={styles.legendItem}>
              <View
                style={[
                  styles.legendDot,
                  { backgroundColor: splitColors[index % splitColors.length] },
                ]}
              />
              <Text style={[styles.legendLabel, { color: colors.text }]}>
                {resolveSplitLabel(item.split, customNames)}
              </Text>
              <Text style={[styles.legendValue, { color: colors.textSecondary }]}>
                {item.count} ({item.percentage}%)
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
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
  title: {
    fontSize: 18,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 13,
    marginTop: -6,
  },
  chartContainer: {
    gap: 16,
  },
  stackedBar: {
    height: 16,
    borderRadius: 8,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  barSegment: {
    height: '100%',
  },
  legend: {
    gap: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  legendValue: {
    fontSize: 13,
  },
});

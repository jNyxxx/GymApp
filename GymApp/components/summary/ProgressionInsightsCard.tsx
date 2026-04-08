import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColors } from '../../context/ThemeContext';
import { ProgressionInsights } from '../../services/ProgressionService';
import { cardSurfaceStyle, sectionHeadingTextStyle } from '../../constants/DesignSystem';

interface ProgressionInsightsCardProps {
  insights: ProgressionInsights;
}

function formatShortDate(dateKey: string): string {
  const [year, month, day] = dateKey.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}`;
}

function formatKg(value: number): string {
  return `${value.toFixed(1)} kg`;
}

function formatWeight(weight: number, unit: 'kg' | 'lbs'): string {
  const rounded = Number.isInteger(weight) ? weight.toString() : weight.toFixed(1);
  return `${rounded}${unit}`;
}

export default function ProgressionInsightsCard({ insights }: ProgressionInsightsCardProps) {
  const colors = useColors();
  const prHighlights = insights.recentPRHighlights.slice(0, 3);
  const topImproving = insights.topImprovingExercises.slice(0, 3);
  const hasInsights = prHighlights.length > 0 || topImproving.length > 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
      <Text style={[styles.label, { color: colors.textMuted }]}>Progression insights</Text>

      {!hasInsights ? (
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          Log completed sets with reps and weight to unlock progression trends.
        </Text>
      ) : (
        <View style={styles.sections}>
          {prHighlights.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent PR highlights</Text>
              {prHighlights.map((highlight) => (
                <View key={`${highlight.exerciseKey}_${highlight.dateKey}`} style={styles.item}>
                  <Text style={[styles.itemTitle, { color: colors.text }]} numberOfLines={1}>
                    {highlight.exerciseName}
                  </Text>
                  <Text style={[styles.itemDetail, { color: colors.textSecondary }]}>
                    {formatShortDate(highlight.dateKey)} · {formatWeight(highlight.weight, highlight.unit)} × {highlight.reps}
                  </Text>
                  <Text style={[styles.itemAccent, { color: colors.success }]}>
                    +{formatKg(highlight.improvementKg)} est. 1RM
                  </Text>
                </View>
              ))}
            </View>
          )}

          {topImproving.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Top improving this month</Text>
              {topImproving.map((exercise) => (
                <View key={exercise.exerciseKey} style={styles.item}>
                  <Text style={[styles.itemTitle, { color: colors.text }]} numberOfLines={1}>
                    {exercise.exerciseName}
                  </Text>
                  <Text style={[styles.itemAccent, { color: colors.success }]}>
                    +{formatKg(exercise.deltaKg)} est. 1RM vs last month
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...cardSurfaceStyle,
    gap: 14,
  },
  label: sectionHeadingTextStyle,
  sections: {
    gap: 14,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  item: {
    gap: 2,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  itemDetail: {
    fontSize: 13,
    fontWeight: '500',
  },
  itemAccent: {
    fontSize: 13,
    fontWeight: '700',
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '500',
  },
});

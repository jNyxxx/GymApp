import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColors } from '../../context/ThemeContext';
import { MonthlyStats } from '../../services/SummaryService';
import { StoryGeneratorService } from '../../services/StoryGeneratorService';
import { cardSurfaceStyle, sectionHeadingTextStyle } from '../../constants/DesignSystem';

interface StoryCardProps {
  stats: MonthlyStats;
}

export default function StoryCard({ stats }: StoryCardProps) {
  const colors = useColors();
  const story = StoryGeneratorService.generateStory(stats);

  return (
    <View style={[styles.container, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
      <Text style={[styles.label, { color: colors.textMuted }]}>Monthly story</Text>
      <Text style={[styles.story, { color: colors.textSecondary }]}>{story}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...cardSurfaceStyle,
    gap: 14,
  },
  label: sectionHeadingTextStyle,
  story: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '500',
  },
});

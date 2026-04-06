import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColors } from '../../context/ThemeContext';
import { MonthlyStats } from '../../services/SummaryService';
import { StoryGeneratorService } from '../../services/StoryGeneratorService';

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
  story: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '500',
  },
});

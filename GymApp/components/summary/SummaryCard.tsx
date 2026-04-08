import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColors } from '../../context/ThemeContext';
import { MonthlyStats } from '../../services/SummaryService';

interface SummaryCardProps {
  stats: MonthlyStats;
}

export default function SummaryCard({ stats }: SummaryCardProps) {
  const colors = useColors();
  return (
    <View style={styles.container}>
      <Text style={[styles.heading, { color: colors.textMuted }]}>Overview</Text>
      <View style={styles.grid}>
        <View style={[styles.statCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>Gym days</Text>
          <Text style={[styles.statValue, { color: colors.text }]}>{stats.totalGymDays}</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>Sessions per week</Text>
          <Text style={[styles.statValue, { color: colors.text }]}>{stats.sessionsPerWeek}</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>Current streak</Text>
          <Text style={[styles.statValue, { color: colors.text }]}>{stats.currentStreak}</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>Best streak</Text>
          <Text style={[styles.statValue, { color: colors.text }]}>{stats.bestStreak}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  heading: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '46%',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
  },
  statLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '700',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 30,
    fontWeight: '900',
  },
});

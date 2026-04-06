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
    <View style={styles.grid}>
      <View style={[styles.statCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
        <Text style={[styles.statLabel, { color: colors.textMuted }]}>Gym Days</Text>
        <Text style={[styles.statValue, { color: colors.text }]}>{stats.totalGymDays}</Text>
      </View>
      <View style={[styles.statCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
        <Text style={[styles.statLabel, { color: colors.textMuted }]}>Sessions / Week</Text>
        <Text style={[styles.statValue, { color: colors.text }]}>{stats.sessionsPerWeek}</Text>
      </View>
      <View style={[styles.statCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
        <Text style={[styles.statLabel, { color: colors.textMuted }]}>Current Streak</Text>
        <Text style={[styles.statValue, { color: colors.text }]}>{stats.currentStreak}</Text>
      </View>
      <View style={[styles.statCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
        <Text style={[styles.statLabel, { color: colors.textMuted }]}>Best Streak</Text>
        <Text style={[styles.statValue, { color: colors.text }]}>{stats.bestStreak}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    borderRadius: 16,
    padding: 16,
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
    fontSize: 28,
    fontWeight: '900',
  },
});

import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColors } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { cardSurfaceStyle } from '../../constants/DesignSystem';

interface StreakCardProps {
  currentStreak: number;
  bestStreak: number;
}

function StreakCard({ currentStreak, bestStreak }: StreakCardProps) {
  const colors = useColors();

  return (
    <View 
      style={[styles.container, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}
      accessibilityRole="group"
      accessibilityLabel={`Streaks: current ${currentStreak} days, best ${bestStreak} days`}
    >
      <View style={styles.streakItem}>
        <View style={styles.streakHeader}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Current streak</Text>
          <View style={[styles.streakIcon, { backgroundColor: colors.primaryGlow }]}>
            <Ionicons name="flame" size={14} color={colors.primary} />
          </View>
        </View>
        <Text style={[styles.value, { color: colors.text }]}>
          {currentStreak} <Text style={[styles.unit, { color: colors.textSecondary }]}>days</Text>
        </Text>
      </View>

      <View style={[styles.divider, { backgroundColor: colors.cardBorder }]} />

      <View style={styles.streakItem}>
        <View style={styles.streakHeader}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Best streak</Text>
          <View style={[styles.streakIcon, { backgroundColor: colors.gray }]}>
            <Ionicons name="trophy" size={14} color={colors.textSecondary} />
          </View>
        </View>
        <Text style={[styles.value, { color: colors.text }]}>
          {bestStreak} <Text style={[styles.unit, { color: colors.textSecondary }]}>days</Text>
        </Text>
      </View>
    </View>
  );
}

// Memoize to prevent unnecessary re-renders when parent updates
export default memo(StreakCard);

const styles = StyleSheet.create({
  container: {
    ...cardSurfaceStyle,
    flexDirection: 'row',
  },
  streakItem: {
    flex: 1,
  },
  streakHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
  streakIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: 28,
    fontWeight: '900',
  },
  unit: {
    fontSize: 16,
    fontWeight: '700',
  },
  divider: {
    width: 1,
    marginHorizontal: 16,
    alignSelf: 'stretch',
  },
});

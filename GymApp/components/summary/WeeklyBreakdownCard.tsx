import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColors } from '../../context/ThemeContext';
import { MonthlyStats } from '../../services/SummaryService';
import { GymEntry } from '../../models/GymEntry';
import { GymStatus } from '../../models/GymStatus';
import { cardSurfaceStyle, sectionHeadingTextStyle } from '../../constants/DesignSystem';

interface WeeklyBreakdownCardProps {
  stats: MonthlyStats;
  entries: GymEntry[];
  monthKey: string;
}

export default function WeeklyBreakdownCard({ stats, entries, monthKey }: WeeklyBreakdownCardProps) {
  const colors = useColors();
  const weeks = computeWeeklyBreakdown(entries, monthKey);
  const maxCount = Math.max(...weeks.map((w) => w.count), 1);
  const strongestIndex = weeks.reduce((maxIdx, w, i) => (w.count > weeks[maxIdx].count ? i : maxIdx), 0);

  return (
    <View style={[styles.container, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
      <Text style={[styles.label, { color: colors.textMuted }]}>Weekly rhythm</Text>
      <Text style={[styles.strongest, { color: colors.text }]}>
        Strongest week:{' '}
        <Text style={[styles.strongestValue, { color: colors.primary }]}>Week {strongestIndex + 1}</Text>
      </Text>

      <View style={styles.weeks}>
        {weeks.map((week, i) => (
          <View key={i} style={styles.weekRow}>
            <Text style={[styles.weekLabel, { color: colors.text }]}>Week {i + 1}</Text>
            <View style={[styles.barTrack, { backgroundColor: colors.gray }]}>
              <View style={[styles.barFill, { width: `${(week.count / maxCount) * 100}%`, backgroundColor: colors.primary }]} />
            </View>
            <Text style={[styles.weekCount, { color: colors.textSecondary }]}>{week.count} sessions</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function computeWeeklyBreakdown(entries: GymEntry[], monthKey: string) {
  const [year, month] = monthKey.split('-').map(Number);
  const lastDay = new Date(year, month, 0);
  const startDayOfWeek = new Date(year, month - 1, 1).getDay();

  const weeks: { count: number }[] = [];
  let currentWeekCount = 0;
  let dayInWeek = 0;

  for (let i = 0; i < startDayOfWeek; i++) {
    dayInWeek++;
  }

  for (let day = 1; day <= lastDay.getDate(); day++) {
    const dateKey = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const entry = entries.find((e) => e.dateKey === dateKey);

    if (entry && entry.status === GymStatus.WENT) {
      currentWeekCount++;
    }

    dayInWeek++;
    if (dayInWeek === 7 || day === lastDay.getDate()) {
      weeks.push({ count: currentWeekCount });
      currentWeekCount = 0;
      dayInWeek = 0;
    }
  }

  if (dayInWeek > 0) {
    weeks.push({ count: currentWeekCount });
  }

  while (weeks.length < 4) {
    weeks.push({ count: 0 });
  }

  return weeks;
}

const styles = StyleSheet.create({
  container: {
    ...cardSurfaceStyle,
    gap: 14,
  },
  label: sectionHeadingTextStyle,
  strongest: {
    fontSize: 16,
    fontWeight: '700',
  },
  strongestValue: {
    fontWeight: '700',
  },
  weeks: {
    gap: 12,
    marginTop: 4,
  },
  weekRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  weekLabel: {
    fontSize: 14,
    fontWeight: '600',
    width: 70,
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
  weekCount: {
    fontSize: 13,
    fontWeight: '700',
    width: 70,
    textAlign: 'right',
  },
});

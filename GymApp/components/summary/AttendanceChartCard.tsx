import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColors } from '../../context/ThemeContext';
import { GymEntry } from '../../models/GymEntry';
import { GymStatus } from '../../models/GymStatus';
import { parseDateKey } from '../../services/DateLogicService';
import SimpleBarChart from '../shared/SimpleBarChart';

interface AttendanceChartCardProps {
  entries: GymEntry[];
  monthKey: string;
}

/**
 * Weekly attendance bar chart for a given month.
 */
export default function AttendanceChartCard({ entries, monthKey }: AttendanceChartCardProps) {
  const colors = useColors();

  // Calculate weekly gym days for the month
  const weeklyData = getWeeklyAttendance(entries, monthKey);

  if (weeklyData.length === 0) {
    return null;
  }

  return (
    <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
      <Text style={[styles.label, { color: colors.textMuted }]}>Attendance</Text>
      <Text style={[styles.title, { color: colors.text }]}>Weekly Attendance</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Gym sessions per week this month
      </Text>

      <View style={styles.chartContainer}>
        <SimpleBarChart
          data={weeklyData}
          maxValue={7}
          height={100}
          barColor={colors.primary}
        />
      </View>

      <View style={styles.legend}>
        <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
        <Text style={[styles.legendText, { color: colors.textMuted }]}>Gym sessions</Text>
      </View>
    </View>
  );
}

function getWeeklyAttendance(entries: GymEntry[], monthKey: string): { label: string; value: number }[] {
  const [year, month] = monthKey.split('-').map(Number);
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);

  // Get gym entries for this month
  const monthEntries = entries.filter(
    (e) => e.status === GymStatus.WENT && e.dateKey.startsWith(monthKey)
  );

  // Group by week (Sunday-Saturday)
  const weeks: { label: string; value: number }[] = [];
  let currentWeekStart = new Date(firstDay);
  
  // Adjust to previous Sunday if month doesn't start on Sunday
  const dayOfWeek = currentWeekStart.getDay();
  if (dayOfWeek !== 0) {
    currentWeekStart.setDate(currentWeekStart.getDate() - dayOfWeek);
  }

  let weekNum = 1;
  while (currentWeekStart <= lastDay) {
    const weekEnd = new Date(currentWeekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const weekEntries = monthEntries.filter((e) => {
      const entryDate = parseDateKey(e.dateKey);
      return entryDate >= currentWeekStart && entryDate <= weekEnd;
    });

    weeks.push({
      label: `W${weekNum}`,
      value: weekEntries.length,
    });

    currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    weekNum++;
  }

  return weeks;
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
    marginTop: 8,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
  },
});

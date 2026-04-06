import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColors } from '../../context/ThemeContext';
import CalendarDayCell from './CalendarDayCell';
import { GymEntry } from '../../models/GymEntry';

interface CalendarGridProps {
  year: number;
  month: number;
  entries: GymEntry[];
  onDayTap: (dateKey: string) => void;
}

const DAY_LABELS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function CalendarGrid({
  year,
  month,
  entries,
  onDayTap,
}: CalendarGridProps) {
  const colors = useColors();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDayOfWeek = firstDay.getDay();
  const daysInMonth = lastDay.getDate();
  const prevMonthLastDay = new Date(year, month, 0).getDate();

  const weeks: (number | null)[][] = [];
  let currentWeek: (number | null)[] = [];

  for (let i = 0; i < startDayOfWeek; i++) {
    currentWeek.push(prevMonthLastDay - startDayOfWeek + i + 1);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  let nextDay = 1;
  while (currentWeek.length > 0 && currentWeek.length < 7) {
    currentWeek.push(nextDay);
    nextDay++;
  }
  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  const getEntryStatus = (day: number): GymEntry['status'] | null => {
    const date = new Date(year, month, day);
    const key = toDateKey(date);
    const entry = entries.find((e) => e.dateKey === key);
    return entry ? entry.status : null;
  };

  const isCurrentMonthDay = (day: number, weekIndex: number): boolean => {
    const isFirstWeek = weekIndex === 0;
    const isLastWeek = weekIndex === weeks.length - 1;
    if (isFirstWeek && day > 20) return false;
    if (isLastWeek && day < 15) return false;
    return true;
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {DAY_LABELS.map((label) => (
          <View key={label} style={styles.cell}>
            <Text style={[styles.dayLabel, { color: colors.textMuted }]}>{label}</Text>
          </View>
        ))}
      </View>

      {weeks.map((week, weekIndex) => (
        <View key={weekIndex} style={styles.row}>
          {week.map((day, dayIndex) => {
            if (day === null) {
              return <View key={dayIndex} style={styles.cell} />;
            }

            const isCurrentMonth = isCurrentMonthDay(day, weekIndex);
            const status = isCurrentMonth ? getEntryStatus(day) : null;

            return (
              <View key={dayIndex} style={styles.cell}>
                {isCurrentMonth && day > 0 ? (
                  <CalendarDayCell
                    day={day}
                    status={status}
                    isCurrentMonth={isCurrentMonth}
                    onTap={() => {
                      const date = new Date(year, month, day);
                      onDayTap(toDateKey(date));
                    }}
                  />
                ) : (
                  <Text style={[styles.dayText, { color: colors.gray }]}>{day}</Text>
                )}
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  cell: {
    flex: 1,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  dayText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

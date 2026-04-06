import React, { memo } from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, View } from 'react-native';
import { useColors } from '../../context/ThemeContext';
import { GymStatus } from '../../models/GymStatus';

interface CalendarDayCellProps {
  day: number;
  status: GymStatus | null;
  isCurrentMonth: boolean;
  onTap: () => void;
  style?: ViewStyle;
  dateKey?: string;
}

function CalendarDayCell({
  day,
  status,
  isCurrentMonth,
  onTap,
  style,
  dateKey,
}: CalendarDayCellProps) {
  const colors = useColors();
  const isWent = status === GymStatus.WENT;
  const isNoGym = status === GymStatus.NO_GYM;

  // Build accessibility label
  let accessibilityLabel = `Day ${day}`;
  if (isWent) {
    accessibilityLabel += ', gym session logged';
  } else if (isNoGym) {
    accessibilityLabel += ', rest day';
  } else if (isCurrentMonth) {
    accessibilityLabel += ', no entry';
  }

  return (
    <TouchableOpacity 
      activeOpacity={0.7} 
      onPress={onTap} 
      style={[styles.container, style]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint="Tap to view or edit this day's entry"
    >
      {isWent && isCurrentMonth ? (
        // Filled circle behind the number
        <View style={[styles.filledCircle, { backgroundColor: colors.primary }]}>
          <Text style={[styles.dayText, styles.dayTextOnFilled, { color: '#000' }]}>
            {day}
          </Text>
        </View>
      ) : (
        // Plain number, no circle
        <Text
          style={[
            styles.dayText,
            { color: colors.text },
            !isCurrentMonth && { color: colors.gray },
          ]}
        >
          {day}
        </Text>
      )}
    </TouchableOpacity>
  );
}

// Memoize to prevent unnecessary re-renders in calendar grid
export default memo(CalendarDayCell);

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filledCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    fontSize: 16,
    fontWeight: '700',
  },
  dayTextOnFilled: {
    fontWeight: '800',
  },
});

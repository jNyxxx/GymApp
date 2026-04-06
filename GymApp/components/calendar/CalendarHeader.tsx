import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useColors } from '../../context/ThemeContext';

interface CalendarHeaderProps {
  monthLabel: string;
  subtitle?: string;
  onPrev: () => void;
  onNext: () => void;
}

export default function CalendarHeader({ monthLabel, subtitle, onPrev, onNext }: CalendarHeaderProps) {
  const colors = useColors();
  return (
    <View style={styles.container}>
      <View>
        <Text 
          style={[styles.monthLabel, { color: colors.text }]}
          accessibilityRole="header"
        >
          {monthLabel}
        </Text>
        {subtitle && (
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {subtitle}
          </Text>
        )}
      </View>
      <View style={styles.arrows} accessibilityRole="group" accessibilityLabel="Month navigation">
        <TouchableOpacity
          onPress={onPrev}
          activeOpacity={0.6}
          style={[styles.arrowButton, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}
          accessibilityRole="button"
          accessibilityLabel="Previous month"
          accessibilityHint="Navigate to the previous month"
        >
          <Text style={[styles.arrowText, { color: colors.text }]} accessibilityElementsHidden>‹</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onNext}
          activeOpacity={0.6}
          style={[styles.arrowButton, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}
          accessibilityRole="button"
          accessibilityLabel="Next month"
          accessibilityHint="Navigate to the next month"
        >
          <Text style={[styles.arrowText, { color: colors.text }]} accessibilityElementsHidden>›</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  monthLabel: {
    fontSize: 26,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 4,
  },
  arrows: {
    flexDirection: 'row',
    gap: 8,
  },
  arrowButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  arrowText: {
    fontSize: 22,
    fontWeight: '700',
  },
});

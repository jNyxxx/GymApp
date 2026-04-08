import React from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { useColors, useTheme } from '../../context/ThemeContext';
import { getGymDateKey, parseDateKey } from '../../services/DateLogicService';

export default function GreetingHeader() {
  const colors = useColors();
  const { settings } = useTheme();

  // Use the effective gym date (respects reset hour)
  const effectiveDateKey = getGymDateKey(new Date(), settings.resetHour, settings.resetMinute);
  const effectiveDate = parseDateKey(effectiveDateKey);
  
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const gymDayLabel = `Gym day: ${months[effectiveDate.getMonth()]} ${effectiveDate.getDate()}`;

  return (
    <View style={[styles.container, { paddingTop: StatusBar.currentHeight || 20 }]}>
      <Text style={[styles.greeting, { color: colors.text }]}>Nyx</Text>
      <Text style={[styles.gymDay, { color: colors.textSecondary }]}>{gymDayLabel}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 4,
  },
  gymDay: {
    fontSize: 14,
    fontWeight: '500',
  },
});

import React from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { useColors } from '../../context/ThemeContext';

export default function GreetingHeader() {
  const colors = useColors();

  const today = new Date();
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const gymDayLabel = `Gym day: ${months[today.getMonth()]} ${today.getDate()}`;

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

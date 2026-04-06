import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useColors } from '../../context/ThemeContext';

interface StatPillProps {
  label: string;
  value: string | number;
  color?: string;
  style?: ViewStyle;
}

export default function StatPill({ label, value, color, style }: StatPillProps) {
  const colors = useColors();
  return (
    <View style={[styles.container, { backgroundColor: colors.cardBgAlt, borderColor: colors.cardBorder }, style]}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.value, { color: color || colors.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    minWidth: 80,
    borderWidth: 1,
  },
  label: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontWeight: '600',
    marginBottom: 4,
  },
  value: {
    fontSize: 20,
    fontWeight: '800',
  },
});

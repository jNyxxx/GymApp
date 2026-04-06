import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColors } from '../../context/ThemeContext';

interface EmptyStateViewProps {
  icon: string;
  title: string;
  subtitle?: string;
}

export default function EmptyStateView({ icon, title, subtitle }: EmptyStateViewProps) {
  const colors = useColors();
  return (
    <View style={styles.container}>
      <Text style={[styles.icon, { color: colors.textMuted }]}>{icon}</Text>
      <Text style={[styles.title, { color: colors.textSecondary }]}>{title}</Text>
      {subtitle && <Text style={[styles.subtitle, { color: colors.textMuted }]}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
});

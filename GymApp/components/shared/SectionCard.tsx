import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useColors } from '../../context/ThemeContext';

interface SectionCardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'glow';
}

export default function SectionCard({ title, subtitle, children, style, variant = 'default' }: SectionCardProps) {
  const colors = useColors();
  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.cardBg, borderColor: colors.cardBorder },
        variant === 'glow' && { borderColor: colors.primaryBorder },
        style,
      ]}
    >
      {title && (
        <View>
          <Text style={[styles.title, { color: colors.textMuted }]}>{title}</Text>
          {subtitle && <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>}
        </View>
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    width: '100%',
    gap: 16,
  },
  title: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
});

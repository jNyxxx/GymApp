import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useColors } from '../../context/ThemeContext';

interface PillProps {
  label: string;
  icon?: string;
  variant?: 'default' | 'success' | 'warning' | 'primary';
  style?: ViewStyle;
}

export default function Pill({ label, icon, variant = 'default', style }: PillProps) {
  const colors = useColors();
  const variantStyles: Record<string, { bg: string; text: string }> = {
    default: { bg: colors.gray, text: colors.textSecondary },
    success: { bg: colors.successBg, text: colors.success },
    warning: { bg: colors.warningBg, text: colors.warning },
    primary: { bg: colors.primaryGlow, text: colors.primary },
  };
  const v = variantStyles[variant];

  return (
    <View style={[styles.container, { backgroundColor: v.bg }, style]}>
      {icon && <Text style={styles.icon}>{icon}</Text>}
      <Text style={[styles.label, { color: v.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    alignSelf: 'flex-start',
  },
  icon: {
    fontSize: 13,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useColors } from '../../context/ThemeContext';

interface SplitIconProps {
  split: string;
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
}

const SPLIT_DATA: Record<string, { label: string; color: string }> = {
  upper: { label: 'UP', color: '#00D4FF' },
  lower: { label: 'LO', color: '#00E676' },
  push: { label: 'PU', color: '#FFB74D' },
  pull: { label: 'PL', color: '#FF5252' },
  legs: { label: 'LG', color: '#B388FF' },
  posterior: { label: 'PO', color: '#FF8A65' },
  anterior: { label: 'AN', color: '#4DD0E1' },
};

export default function SplitIcon({ split, size = 'md', style }: SplitIconProps) {
  const colors = useColors();
  const data = SPLIT_DATA[split];

  const sizes = {
    sm: { container: 28, font: 10 },
    md: { container: 36, font: 12 },
    lg: { container: 44, font: 14 },
  };

  const s = sizes[size];

  // For custom/template splits, show first 2 letters
  if (!data) {
    const label = getCustomLabel(split);
    return (
      <View
        style={[
          styles.container,
          {
            width: s.container,
            height: s.container,
            borderRadius: s.container / 2,
            backgroundColor: colors.primaryGlow,
            borderColor: colors.primary + '40',
          },
          style,
        ]}
      >
        <Text
          style={[
            styles.text,
            {
              fontSize: s.font,
              color: colors.primary,
            },
          ]}
        >
          {label}
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          width: s.container,
          height: s.container,
          borderRadius: s.container / 2,
          backgroundColor: colors.primaryGlow,
          borderColor: data.color + '40',
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            fontSize: s.font,
            color: data.color,
          },
        ]}
      >
        {data.label}
      </Text>
    </View>
  );
}

function getCustomLabel(splitId: string): string {
  // Extract label from template_chest_day_123456 -> CD
  // Or custom_arms_123456 -> AR
  const parts = splitId.replace(/^(template_|custom_)/, '').split('_');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return parts[0].substring(0, 2).toUpperCase();
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  text: {
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});

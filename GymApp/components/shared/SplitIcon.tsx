import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useColors } from '../../context/ThemeContext';

interface SplitIconProps {
  split: 'upper' | 'lower' | 'push' | 'pull' | 'legs' | 'posterior' | 'anterior';
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

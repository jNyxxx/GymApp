import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useColors } from '../../context/ThemeContext';

interface ProgressBarProps {
  progress: number;
  color?: string;
  height?: number;
  style?: ViewStyle;
}

export default function ProgressBar({
  progress,
  color,
  height = 6,
  style,
}: ProgressBarProps) {
  const colors = useColors();
  const clamped = Math.max(0, Math.min(1, progress));

  return (
    <View style={[styles.container, { height, borderRadius: height / 2, backgroundColor: colors.progressBarBg }, style]}>
      <View
        style={[
          styles.fill,
          { width: `${clamped * 100}%`, backgroundColor: color || colors.primary, borderRadius: height / 2 },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
});

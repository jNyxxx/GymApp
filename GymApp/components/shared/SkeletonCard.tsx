import React from 'react';
import { View, StyleSheet, DimensionValue } from 'react-native';
import { useColors } from '../../context/ThemeContext';

interface SkeletonCardProps {
  height?: number;
  width?: DimensionValue;
  borderRadius?: number;
}

export default function SkeletonCard({
  height = 100,
  width = '100%',
  borderRadius = 20,
}: SkeletonCardProps) {
  const colors = useColors();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.cardBgAlt,
          height,
          width,
          borderRadius,
          borderColor: colors.cardBorder,
        },
      ]}
    >
      <View style={[styles.shimmer, { backgroundColor: colors.grayLight }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderWidth: 1,
  },
  shimmer: {
    flex: 1,
    opacity: 0.5,
  },
});

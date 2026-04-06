import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useColors } from '../../context/ThemeContext';

interface IconCircleProps {
  icon: string;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  backgroundColor?: string;
  style?: ViewStyle;
}

export default function IconCircle({
  icon,
  size = 'md',
  color,
  backgroundColor,
  style,
}: IconCircleProps) {
  const colors = useColors();
  const sizes = {
    sm: { container: 28, icon: 14 },
    md: { container: 36, icon: 18 },
    lg: { container: 44, icon: 22 },
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
          backgroundColor: backgroundColor || colors.primaryGlow,
        },
        style,
      ]}
    >
      <Text style={{ fontSize: s.icon }}>{icon}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

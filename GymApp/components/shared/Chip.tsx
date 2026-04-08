import React from 'react';
import { StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import { useColors } from '../../context/ThemeContext';
import { chipTextStyle, createChipContainerStyle } from '../../constants/DesignSystem';

interface ChipProps {
  label: string;
  compact?: boolean;
  backgroundColor?: string;
  textColor?: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export default function Chip({
  label,
  compact = false,
  backgroundColor,
  textColor,
  style,
  textStyle,
}: ChipProps) {
  const colors = useColors();

  return (
    <View style={[createChipContainerStyle(compact), { backgroundColor: backgroundColor ?? colors.gray }, style]}>
      <Text style={[styles.text, chipTextStyle, { color: textColor ?? colors.textSecondary }, textStyle]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  text: {
    textAlign: 'center',
  },
});

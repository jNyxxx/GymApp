import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { sheetActionRowStyle } from '../../constants/DesignSystem';

interface SheetActionsProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export default function SheetActions({ children, style }: SheetActionsProps) {
  return <View style={[styles.actions, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  actions: sheetActionRowStyle,
});

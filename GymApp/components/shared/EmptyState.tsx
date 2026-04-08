import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../context/ThemeContext';
import { cardSurfaceStyle } from '../../constants/DesignSystem';
import PrimaryButton from './PrimaryButton';

interface EmptyStateProps {
  iconName?: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
}

export default function EmptyState({
  iconName = 'sparkles-outline',
  title,
  description,
  actionLabel,
  onAction,
  style,
}: EmptyStateProps) {
  const colors = useColors();
  const hasAction = Boolean(actionLabel && onAction);

  return (
    <View style={[styles.container, cardSurfaceStyle, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }, style]}>
      <View style={[styles.iconCircle, { backgroundColor: colors.primaryGlow }]}>
        <Ionicons name={iconName} size={28} color={colors.primary} />
      </View>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.description, { color: colors.textSecondary }]}>{description}</Text>
      {hasAction && (
        <PrimaryButton
          title={actionLabel}
          onPress={onAction!}
          variant="primary"
          style={styles.action}
          accessibilityLabel={actionLabel}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  action: {
    marginTop: 4,
  },
});

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, View } from 'react-native';
import { useColors } from '../../context/ThemeContext';

interface PrimaryButtonProps {
  title: string;
  icon?: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  style?: ViewStyle;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export default function PrimaryButton({
  title,
  icon,
  onPress,
  variant = 'primary',
  disabled = false,
  style,
  accessibilityLabel,
  accessibilityHint,
}: PrimaryButtonProps) {
  const colors = useColors();

  const a11yProps = {
    accessibilityRole: 'button' as const,
    accessibilityLabel: accessibilityLabel || title,
    accessibilityHint,
    accessibilityState: { disabled },
  };

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        disabled={disabled}
        style={[styles.primaryWrapper, disabled && styles.disabled, style]}
        {...a11yProps}
      >
        <View style={[styles.primaryButton, { backgroundColor: colors.primary }]}>
          {icon && <Text style={{ fontSize: 20 }} accessibilityElementsHidden>{icon}</Text>}
          <Text style={styles.primaryText}>{title}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  if (variant === 'secondary') {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
        disabled={disabled}
        style={[
          styles.secondaryButton,
          { backgroundColor: colors.cardBg, borderColor: colors.cardBorder },
          disabled && styles.disabled,
          style,
        ]}
        {...a11yProps}
      >
        {icon && <Text style={{ fontSize: 18 }} accessibilityElementsHidden>{icon}</Text>}
        <Text style={[styles.secondaryText, { color: colors.text }]}>{title}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      disabled={disabled}
      style={[styles.ghostButton, style]}
      {...a11yProps}
    >
      <Text style={[styles.ghostText, { color: colors.textSecondary }]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  primaryWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    width: '100%',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 10,
  },
  primaryText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 10,
    width: '100%',
    borderWidth: 1,
  },
  secondaryText: {
    fontSize: 16,
    fontWeight: '800',
  },
  ghostButton: {
    paddingVertical: 14,
    alignItems: 'center',
    width: '100%',
  },
  ghostText: {
    fontSize: 15,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.4,
  },
});

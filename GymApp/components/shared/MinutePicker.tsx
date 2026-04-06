import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useColors } from '../../context/ThemeContext';

interface MinutePickerProps {
  value: number;
  onChange: (minute: number) => void;
}

const MINUTES = [0, 15, 30, 45];

export default function MinutePicker({ value, onChange }: MinutePickerProps) {
  const colors = useColors();

  return (
    <View style={styles.container}>
      {MINUTES.map((m) => {
        const isSelected = m === value;
        return (
          <TouchableOpacity
            key={m}
            activeOpacity={0.7}
            onPress={() => onChange(m)}
            style={[
              styles.minuteButton,
              isSelected && styles.minuteButtonSelected,
              { borderColor: isSelected ? colors.primary : colors.cardBorder },
            ]}
          >
            <Text
              style={[
                styles.minuteText,
                isSelected && styles.minuteTextSelected,
                { color: isSelected ? colors.primary : colors.textSecondary },
              ]}
            >
              {String(m).padStart(2, '0')}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  minuteButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  minuteButtonSelected: {
    backgroundColor: 'rgba(0, 212, 255, 0.12)',
  },
  minuteText: {
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  minuteTextSelected: {
    fontWeight: '800',
  },
});

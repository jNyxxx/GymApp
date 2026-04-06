import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useColors } from '../../context/ThemeContext';

interface HourPickerProps {
  value: number;
  onChange: (hour: number) => void;
}

export default function HourPicker({ value, onChange }: HourPickerProps) {
  const colors = useColors();
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {hours.map((h) => {
          const isSelected = h === value;
          const period = h >= 12 ? 'PM' : 'AM';
          const displayHour = h > 12 ? h - 12 : h === 0 ? 12 : h;
          const label = `${displayHour} ${period}`;

          return (
            <TouchableOpacity
              key={h}
              activeOpacity={0.7}
              onPress={() => onChange(h)}
              style={[
                styles.hourButton,
                isSelected && styles.hourButtonSelected,
                { borderColor: isSelected ? colors.primary : colors.cardBorder },
              ]}
            >
              <Text
                style={[
                  styles.hourText,
                  isSelected && styles.hourTextSelected,
                  { color: isSelected ? colors.primary : colors.textSecondary },
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  scrollContent: {
    gap: 8,
    paddingVertical: 4,
  },
  hourButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  hourButtonSelected: {
    backgroundColor: 'rgba(0, 212, 255, 0.12)',
  },
  hourText: {
    fontSize: 13,
    fontWeight: '700',
  },
  hourTextSelected: {
    fontWeight: '800',
  },
});

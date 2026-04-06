import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useColors } from '../../context/ThemeContext';

interface TimePickerSheetProps {
  visible: boolean;
  value: number;
  minute?: number;
  onChange: (hour: number, minute?: number) => void;
  onClose: () => void;
  title: string;
}

export default function TimePickerSheet({
  visible,
  value,
  minute = 0,
  onChange,
  onClose,
  title,
}: TimePickerSheetProps) {
  const colors = useColors();

  const getDateFromValue = () => {
    const date = new Date();
    date.setHours(value, minute, 0, 0);
    return date;
  };

  const handleTimeChange = (_event: any, selectedDate?: Date) => {
    if (selectedDate) {
      const h = selectedDate.getHours();
      const m = selectedDate.getMinutes();
      onChange(h, m);
    }
  };

  const formatDisplay = () => {
    const period = value >= 12 ? 'PM' : 'AM';
    const displayHour = value > 12 ? value - 12 : value === 0 ? 12 : value;
    const displayMinute = String(minute).padStart(2, '0');
    return `${displayHour}:${displayMinute} ${period}`;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
          <View style={[styles.sheet, { backgroundColor: colors.cardBg }]}>
            <View style={styles.header}>
              <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{formatDisplay()}</Text>
            </View>

            <View style={[styles.pickerWrapper, { borderColor: colors.cardBorder }]}>
              <DateTimePicker
                value={getDateFromValue()}
                mode="time"
                is24Hour={false}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleTimeChange}
                textColor={colors.text}
              />
            </View>

            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: colors.primary }]}
              onPress={onClose}
            >
              <Text style={styles.closeButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
    gap: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 14,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 8,
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  closeButton: {
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 48,
    alignItems: 'center',
    width: '100%',
  },
  closeButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '800',
  },
});

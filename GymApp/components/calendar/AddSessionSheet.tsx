import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  ScrollView,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '../../context/ThemeContext';
import { WorkoutSplit } from '../../models/WorkoutSplit';
import { GymStatus } from '../../models/GymStatus';
import { GymLogService } from '../../services/GymLogService';
import { formatDateKey } from '../../services/DateLogicService';
import SplitIcon from '../shared/SplitIcon';
import PrimaryButton from '../shared/PrimaryButton';

interface AddSessionSheetProps {
  visible: boolean;
  preselectedDate?: string; // YYYY-MM-DD format
  onClose: () => void;
  onSaved: () => void;
}

const BUILT_IN_SPLITS: Array<{ value: WorkoutSplit; label: string }> = [
  { value: WorkoutSplit.PUSH, label: 'Push' },
  { value: WorkoutSplit.PULL, label: 'Pull' },
  { value: WorkoutSplit.LEGS, label: 'Legs' },
  { value: WorkoutSplit.UPPER, label: 'Upper' },
  { value: WorkoutSplit.LOWER, label: 'Lower' },
  { value: WorkoutSplit.ANTERIOR, label: 'Anterior' },
  { value: WorkoutSplit.POSTERIOR, label: 'Posterior' },
];

export default function AddSessionSheet({
  visible,
  preselectedDate,
  onClose,
  onSaved,
}: AddSessionSheetProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSplit, setSelectedSplit] = useState<WorkoutSplit | string>(WorkoutSplit.PUSH);
  const [time, setTime] = useState<Date>(new Date());
  const [notes, setNotes] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    if (visible) {
      // Reset to preselected date or today
      if (preselectedDate) {
        const [year, month, day] = preselectedDate.split('-').map(Number);
        setSelectedDate(new Date(year, month - 1, day));
      } else {
        setSelectedDate(new Date());
      }
      setTime(new Date());
      setNotes('');
    }
  }, [visible, preselectedDate]);

  const handleSave = async () => {
    const dateKey = formatDateKey(selectedDate);
    
    // Check if session already exists for this date
    const existingEntry = await GymLogService.getEntry(dateKey);
    
    if (existingEntry) {
      Alert.alert(
        'Session Exists',
        `You already have a session logged for ${dateKey}. Do you want to replace it?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Replace',
            style: 'destructive',
            onPress: async () => {
              await saveSession(dateKey);
            },
          },
        ]
      );
    } else {
      await saveSession(dateKey);
    }
  };

  const saveSession = async (dateKey: string) => {
    try {
      const loggedAtDate = new Date(selectedDate);
      loggedAtDate.setHours(time.getHours(), time.getMinutes(), 0, 0);

      await GymLogService.saveEntry(
        GymStatus.WENT,
        selectedSplit,
        dateKey,
        notes.trim() || undefined,
        loggedAtDate.toISOString()
      );
      onSaved();
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to save session');
    }
  };

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(Platform.OS === 'ios'); // Keep open on iOS
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleTimeChange = (event: any, newTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios'); // Keep open on iOS
    if (newTime) {
      setTime(newTime);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.overlay, { backgroundColor: colors.overlay }]}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardAvoid}
        >
          <View
            style={[
              styles.sheet,
              {
                backgroundColor: colors.cardBg,
                borderColor: colors.cardBorder,
                paddingBottom: Math.max(insets.bottom + 12, 24),
              },
            ]}
          >
            <View style={[styles.handle, { backgroundColor: colors.grayLight }]} />

            <Text style={[styles.title, { color: colors.text }]}>Add Session</Text>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Date Selector */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.textMuted }]}>Date</Text>
              <TouchableOpacity
                style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}
                onPress={() => setShowDatePicker(true)}
                accessibilityRole="button"
                accessibilityLabel="Select session date"
                accessibilityHint="Opens date picker"
              >
                <Ionicons name="calendar-outline" size={20} color={colors.primary} />
                <Text style={[styles.inputText, { color: colors.text }]}>
                  {selectedDate.toLocaleDateString()}
                </Text>
              </TouchableOpacity>
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
              />
            )}

            {/* Time Selector */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.textMuted }]}>Time</Text>
              <TouchableOpacity
                style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}
                onPress={() => setShowTimePicker(true)}
                accessibilityRole="button"
                accessibilityLabel="Select session time"
                accessibilityHint="Opens time picker"
              >
                <Ionicons name="time-outline" size={20} color={colors.primary} />
                <Text style={[styles.inputText, { color: colors.text }]}>
                  {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </TouchableOpacity>
            </View>

            {showTimePicker && (
              <DateTimePicker
                value={time}
                mode="time"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleTimeChange}
              />
            )}

            {/* Split Selector */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.textMuted }]}>Workout Split</Text>
              <View style={styles.splitGrid}>
                {BUILT_IN_SPLITS.map((split) => (
                  <TouchableOpacity
                    key={split.value}
                    style={[
                      styles.splitButton,
                      { backgroundColor: colors.cardBg, borderColor: colors.cardBorder },
                      selectedSplit === split.value && { borderColor: colors.primary, borderWidth: 2 },
                    ]}
                    onPress={() => setSelectedSplit(split.value)}
                    accessibilityRole="button"
                    accessibilityLabel={`${split.label} split`}
                    accessibilityHint="Select this split for the session"
                    accessibilityState={{ selected: selectedSplit === split.value }}
                  >
                    <SplitIcon split={split.value} size={24} />
                    <Text style={[
                      styles.splitLabel,
                      { color: colors.text },
                      selectedSplit === split.value && { color: colors.primary, fontWeight: '700' },
                    ]}>
                      {split.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Notes Input */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.textMuted }]}>Notes (Optional)</Text>
              <TextInput
                style={[styles.notesInput, {
                  backgroundColor: colors.inputBg,
                  borderColor: colors.inputBorder,
                  color: colors.text,
                }]}
                placeholder="Exercises, sets, reps, how you felt..."
                placeholderTextColor={colors.textMuted}
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
            </ScrollView>

            <View style={styles.actions}>
              <PrimaryButton
                title="Cancel"
                onPress={onClose}
                variant="secondary"
                style={styles.actionButton}
                accessibilityLabel="Cancel adding session"
              />
              <PrimaryButton
                title="Save Session"
                onPress={handleSave}
                variant="primary"
                style={styles.actionButton}
                accessibilityLabel="Save session"
                accessibilityHint="Creates or replaces the selected date entry"
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  keyboardAvoid: {
    width: '100%',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderBottomWidth: 0,
    maxHeight: '90%',
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 16,
  },
  content: {
    paddingHorizontal: 24,
    maxHeight: 500,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  inputText: {
    fontSize: 16,
    flex: 1,
  },
  splitGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  splitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
    minWidth: '47%',
  },
  splitLabel: {
    fontSize: 14,
  },
  notesInput: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 15,
    minHeight: 100,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  actionButton: {
    flex: 1,
  },
});

import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../context/ThemeContext';
import { WorkoutSplit, SPLIT_LABELS } from '../../models/WorkoutSplit';
import { ExercisePerformanceLog } from '../../models/ExerciseLog';
import SplitIcon from '../shared/SplitIcon';

interface SplitPickerSheetProps {
  visible: boolean;
  onSelect: (split: string, notes?: string, exerciseLogs?: ExercisePerformanceLog[]) => void;
  onClose: () => void;
  currentSplit?: string;
  currentNotes?: string;
}

const BUILT_IN_SPLITS = [
  WorkoutSplit.PUSH,
  WorkoutSplit.PULL,
  WorkoutSplit.LEGS,
  WorkoutSplit.UPPER,
  WorkoutSplit.LOWER,
  WorkoutSplit.ANTERIOR,
  WorkoutSplit.POSTERIOR,
];

export default function SplitPickerSheet({
  visible,
  onSelect,
  onClose,
  currentSplit,
  currentNotes,
}: SplitPickerSheetProps) {
  const colors = useColors();
  const [selectedSplit, setSelectedSplit] = useState<string | null>(currentSplit || null);
  const [notes, setNotes] = useState(currentNotes || '');
  const [showCustomSplitInput, setShowCustomSplitInput] = useState(false);
  const [customSplitName, setCustomSplitName] = useState('');

  useEffect(() => {
    if (!visible) return;
    setSelectedSplit(currentSplit || null);
    setNotes(currentNotes || '');
    setShowCustomSplitInput(false);
    setCustomSplitName('');
  }, [visible, currentSplit, currentNotes]);

  const resetAndClose = () => {
    setSelectedSplit(null);
    setNotes('');
    setShowCustomSplitInput(false);
    setCustomSplitName('');
    onClose();
  };

  const selectSplit = (split: string) => {
    setSelectedSplit(split);
    setShowCustomSplitInput(false);
    setCustomSplitName('');
  };

  const handleConfirm = () => {
    if (!selectedSplit) return;

    // If custom split, use the custom split name
    const finalSplit = selectedSplit === 'custom' ? `custom_${customSplitName.trim().toLowerCase().replace(/\s+/g, '_')}` : selectedSplit;

    if (selectedSplit === 'custom' && !customSplitName.trim()) {
      return; // Don't confirm if custom split name is empty
    }

    onSelect(finalSplit, notes.trim() || undefined);
    resetAndClose();
  };

  const handleCustomSplitPress = () => {
    setSelectedSplit('custom');
    setShowCustomSplitInput(true);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={resetAndClose}>
      <SafeAreaView style={[styles.overlay, { backgroundColor: colors.overlay }]}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={resetAndClose} />

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboardAvoid}>
          <View style={[styles.sheet, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
            <View style={[styles.handle, { backgroundColor: colors.grayLight }]} />
            <Text style={[styles.title, { color: colors.text }]}>Pick Your Split</Text>

            <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
              <View style={styles.options}>
                {BUILT_IN_SPLITS.map((split) => {
                  const isSelected = split === selectedSplit;
                  return (
                    <TouchableOpacity
                      key={split}
                      style={[
                        styles.option,
                        { backgroundColor: colors.cardBgAlt, borderColor: colors.cardBorder },
                        isSelected && [styles.selectedOption, { borderColor: colors.primary, backgroundColor: colors.primaryGlow }],
                      ]}
                      onPress={() => selectSplit(split)}
                      accessibilityRole="button"
                      accessibilityState={{ selected: isSelected }}
                      accessibilityLabel={`${SPLIT_LABELS[split]} split`}
                    >
                      <SplitIcon split={split} size="sm" style={isSelected ? { borderColor: colors.primary + '60' } : undefined} />
                      <Text style={[styles.optionLabel, { color: colors.text }, isSelected && { color: colors.primary }]}>
                        {SPLIT_LABELS[split]}
                      </Text>
                      {isSelected && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}
                    </TouchableOpacity>
                  );
                })}

                {/* Custom Split Option */}
                <TouchableOpacity
                  style={[
                    styles.option,
                    { backgroundColor: colors.cardBgAlt, borderColor: colors.cardBorder },
                    selectedSplit === 'custom' && [styles.selectedOption, { borderColor: colors.primary, backgroundColor: colors.primaryGlow }],
                  ]}
                  onPress={handleCustomSplitPress}
                  accessibilityRole="button"
                  accessibilityState={{ selected: selectedSplit === 'custom' }}
                  accessibilityLabel="Custom split"
                >
                  <View style={[styles.customIconCircle, { backgroundColor: colors.primaryGlow }]}>
                    <Ionicons name="create-outline" size={18} color={colors.primary} />
                  </View>
                  <Text style={[styles.optionLabel, { color: colors.text }, selectedSplit === 'custom' && { color: colors.primary }]}>
                    Custom Split
                  </Text>
                  {selectedSplit === 'custom' && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}
                </TouchableOpacity>
              </View>

              {/* Custom Split Input */}
              {showCustomSplitInput && (
                <View style={styles.customSplitSection}>
                  <Text style={[styles.customSplitLabel, { color: colors.textSecondary }]}>Split Name</Text>
                  <TextInput
                    style={[
                      styles.customSplitInput,
                      { backgroundColor: colors.cardBgAlt, borderColor: colors.cardBorder, color: colors.text },
                    ]}
                    placeholder="e.g. Chest & Triceps, Full Body..."
                    placeholderTextColor={colors.textMuted}
                    value={customSplitName}
                    onChangeText={setCustomSplitName}
                    maxLength={50}
                    autoFocus
                  />
                </View>
              )}

              {selectedSplit && (
                <>
                  <View style={styles.notesSection}>
                    <Text style={[styles.notesLabel, { color: colors.textSecondary }]}>Notes (optional)</Text>
                    <TextInput
                      style={[
                        styles.notesInput,
                        { backgroundColor: colors.cardBgAlt, borderColor: colors.cardBorder, color: colors.text },
                      ]}
                      placeholder="What exercises did you do? How did it feel?"
                      placeholderTextColor={colors.textMuted}
                      value={notes}
                      onChangeText={setNotes}
                      multiline
                      maxLength={500}
                      textAlignVertical="top"
                    />
                  </View>

                  <TouchableOpacity style={[styles.confirmButton, { backgroundColor: colors.primary }]} onPress={handleConfirm}>
                    <Text style={styles.confirmButtonText}>Log Workout</Text>
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { flex: 1 },
  keyboardAvoid: { width: '100%' },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    borderWidth: 1,
    borderBottomWidth: 0,
    maxHeight: '88%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 24,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  options: {
    gap: 10,
    paddingBottom: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    gap: 14,
  },
  selectedOption: { borderWidth: 1 },
  optionLabel: { flex: 1, fontSize: 16, fontWeight: '700' },
  customIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customSplitSection: {
    marginTop: 12,
    gap: 8,
  },
  customSplitLabel: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  customSplitInput: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    fontSize: 15,
  },
  notesSection: { marginTop: 16, gap: 8 },
  notesLabel: { fontSize: 14, fontWeight: '600' },
  notesInput: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    fontSize: 15,
    minHeight: 80,
    maxHeight: 120,
  },
  confirmButton: {
    marginTop: 16,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#000',
  },
});

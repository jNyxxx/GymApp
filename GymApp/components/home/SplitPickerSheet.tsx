import React, { useEffect, useMemo, useState } from 'react';
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
import { router } from 'expo-router';
import { useColors } from '../../context/ThemeContext';
import { WorkoutSplit, SPLIT_LABELS } from '../../models/WorkoutSplit';
import { ExercisePerformanceLog } from '../../models/ExerciseLog';
import { WorkoutTemplate } from '../../models/WorkoutTemplate';
import { WorkoutTemplateService } from '../../services/WorkoutTemplateService';
import SplitIcon from '../shared/SplitIcon';
import WorkoutLoggerSheet from './WorkoutLoggerSheet';

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
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [showWorkoutLogger, setShowWorkoutLogger] = useState(false);

  const selectedTemplate = useMemo(
    () => templates.find((t) => t.id === selectedSplit) || null,
    [templates, selectedSplit]
  );

  const loadTemplates = async () => {
    await WorkoutTemplateService.migrateFromCustomSplits();
    const loaded = await WorkoutTemplateService.getAll();
    setTemplates(loaded);
  };

  useEffect(() => {
    if (!visible) return;
    setSelectedSplit(currentSplit || null);
    setNotes(currentNotes || '');
    setShowWorkoutLogger(false);
    loadTemplates();
  }, [visible, currentSplit, currentNotes]);

  const resetAndClose = () => {
    setSelectedSplit(null);
    setNotes('');
    setShowWorkoutLogger(false);
    onClose();
  };

  const handleConfirm = () => {
    if (!selectedSplit) return;

    if (selectedTemplate && selectedTemplate.exercises.length > 0) {
      setShowWorkoutLogger(true);
      return;
    }

    onSelect(selectedSplit, notes.trim() || undefined);
    resetAndClose();
  };

  const handleWorkoutSave = (exerciseLogs: ExercisePerformanceLog[], workoutNotes?: string) => {
    if (!selectedSplit) return;
    const resolvedNotes = workoutNotes ?? (notes.trim() || undefined);
    onSelect(selectedSplit, resolvedNotes, exerciseLogs);
    resetAndClose();
  };

  const handleManageTemplates = () => {
    resetAndClose();
    router.push('/(tabs)/templates');
  };

  return (
    <>
      <Modal visible={visible && !showWorkoutLogger} transparent animationType="slide" onRequestClose={resetAndClose}>
        <SafeAreaView style={[styles.overlay, { backgroundColor: colors.overlay }]}>
          <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={resetAndClose} />

          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboardAvoid}>
            <View style={[styles.sheet, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
              <View style={[styles.handle, { backgroundColor: colors.grayLight }]} />
              <Text style={[styles.title, { color: colors.text }]}>Pick Your Split</Text>

              <ScrollView style={styles.optionsScroll} showsVerticalScrollIndicator={false}>
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
                        onPress={() => setSelectedSplit(split)}
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

                  {templates.length > 0 && (
                    <>
                      <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>Templates</Text>
                      {templates.map((template) => {
                        const isSelected = template.id === selectedSplit;
                        const totalSets = template.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
                        return (
                          <TouchableOpacity
                            key={template.id}
                            style={[
                              styles.option,
                              { backgroundColor: colors.cardBgAlt, borderColor: colors.cardBorder },
                              isSelected && [styles.selectedOption, { borderColor: colors.primary, backgroundColor: colors.primaryGlow }],
                            ]}
                            onPress={() => setSelectedSplit(template.id)}
                            accessibilityRole="button"
                            accessibilityState={{ selected: isSelected }}
                            accessibilityLabel={`${template.name} template`}
                          >
                            <View style={[styles.templateIconCircle, { backgroundColor: colors.primaryGlow }]}>
                              <Text style={styles.templateEmoji}>{template.emoji || '🏋️'}</Text>
                            </View>
                            <View style={styles.templateInfo}>
                              <Text style={[styles.optionLabel, { color: colors.text }, isSelected && { color: colors.primary }]}>
                                {template.name}
                              </Text>
                              <Text style={[styles.templateMeta, { color: colors.textSecondary }]}>
                                {template.exercises.length} exercises · {totalSets} sets
                              </Text>
                            </View>
                            {isSelected && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}
                          </TouchableOpacity>
                        );
                      })}
                    </>
                  )}

                  <TouchableOpacity style={[styles.manageButton, { borderColor: colors.primary }]} onPress={handleManageTemplates}>
                    <Ionicons name="settings-outline" size={18} color={colors.primary} />
                    <Text style={[styles.manageButtonText, { color: colors.primary }]}>Manage Templates</Text>
                    <Ionicons name="chevron-forward" size={18} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              </ScrollView>

              {selectedTemplate && selectedTemplate.exercises.length > 0 && (
                <View style={[styles.exercisesPreview, { backgroundColor: colors.cardBgAlt, borderColor: colors.cardBorder }]}>
                  <Text style={[styles.exercisesTitle, { color: colors.textSecondary }]}>
                    Includes set logging for {selectedTemplate.name}
                  </Text>
                  <Text style={[styles.exercisesList, { color: colors.text }]}>
                    {selectedTemplate.exercises.map((e) => e.name || 'Unnamed').join(' • ')}
                  </Text>
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
                    <Text style={styles.confirmButtonText}>
                      {selectedTemplate && selectedTemplate.exercises.length > 0 ? 'Log Workout Details' : 'Log Workout'}
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>

      <WorkoutLoggerSheet
        visible={visible && showWorkoutLogger}
        template={selectedTemplate}
        initialNotes={notes}
        onClose={() => setShowWorkoutLogger(false)}
        onSave={handleWorkoutSave}
      />
    </>
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
    paddingHorizontal: 24,
    paddingBottom: 24,
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
  },
  optionsScroll: {
    maxHeight: 320,
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
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginTop: 8,
    marginBottom: 4,
  },
  templateIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  templateEmoji: { fontSize: 16 },
  templateInfo: { flex: 1, gap: 2 },
  templateMeta: { fontSize: 12 },
  manageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginTop: 4,
    gap: 8,
  },
  manageButtonText: { fontSize: 15, fontWeight: '700' },
  exercisesPreview: {
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
  },
  exercisesTitle: { fontSize: 12, fontWeight: '600', marginBottom: 4 },
  exercisesList: { fontSize: 13, lineHeight: 18 },
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

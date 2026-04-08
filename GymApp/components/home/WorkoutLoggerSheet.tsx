import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal,
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
import { ExercisePerformanceLog } from '../../models/ExerciseLog';
import { WorkoutTemplate } from '../../models/WorkoutTemplate';

interface WorkoutLoggerSheetProps {
  visible: boolean;
  template: WorkoutTemplate | null;
  initialNotes?: string;
  onClose: () => void;
  onSave: (exerciseLogs: ExercisePerformanceLog[], notes?: string) => void;
}

export default function WorkoutLoggerSheet({
  visible,
  template,
  initialNotes,
  onClose,
  onSave,
}: WorkoutLoggerSheetProps) {
  const colors = useColors();
  const [exerciseLogs, setExerciseLogs] = useState<ExercisePerformanceLog[]>([]);
  const [notes, setNotes] = useState(initialNotes || '');

  useEffect(() => {
    if (!visible || !template) return;
    setNotes(initialNotes || '');
    setExerciseLogs(
      template.exercises.map((exercise) => ({
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        sets: exercise.sets.map((set, index) => ({
          setNumber: index + 1,
          reps: set.reps || '',
          weight: set.weight || '',
          completed: false,
        })),
      }))
    );
  }, [visible, template, initialNotes]);

  const totalSets = useMemo(
    () => exerciseLogs.reduce((sum, exercise) => sum + exercise.sets.length, 0),
    [exerciseLogs]
  );

  const updateSet = (
    exerciseId: string,
    setNumber: number,
    field: 'reps' | 'weight' | 'completed',
    value: string | boolean
  ) => {
    setExerciseLogs((current) =>
      current.map((exercise) => {
        if (exercise.exerciseId !== exerciseId) return exercise;
        return {
          ...exercise,
          sets: exercise.sets.map((set) => {
            if (set.setNumber !== setNumber) return set;
            if (field === 'completed') return { ...set, completed: Boolean(value) };
            if (field === 'reps') return { ...set, reps: String(value) };
            return { ...set, weight: String(value) };
          }),
        };
      })
    );
  };

  const handleSave = () => {
    onSave(exerciseLogs, notes.trim() || undefined);
  };

  if (!template) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={[styles.overlay, { backgroundColor: colors.overlay }]}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

        <View style={[styles.sheet, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
          <View style={[styles.handle, { backgroundColor: colors.grayLight }]} />
          <Text style={[styles.title, { color: colors.text }]}>
            {template.emoji ? `${template.emoji} ${template.name}` : template.name}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Log your actual performance ({template.exercises.length} exercises · {totalSets} sets)
          </Text>

          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {exerciseLogs.map((exercise) => (
              <View
                key={exercise.exerciseId}
                style={[styles.exerciseCard, { backgroundColor: colors.cardBgAlt, borderColor: colors.cardBorder }]}
              >
                <Text style={[styles.exerciseName, { color: colors.text }]}>{exercise.exerciseName}</Text>

                {exercise.sets.map((set) => (
                  <View key={`${exercise.exerciseId}_${set.setNumber}`} style={styles.setRow}>
                    <View style={[styles.setBadge, { backgroundColor: colors.gray }]}>
                      <Text style={[styles.setBadgeText, { color: colors.textSecondary }]}>{set.setNumber}</Text>
                    </View>

                    <TextInput
                      style={[styles.setInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                      placeholder="Reps"
                      placeholderTextColor={colors.textMuted}
                      value={set.reps}
                      onChangeText={(value) => updateSet(exercise.exerciseId, set.setNumber, 'reps', value)}
                      keyboardType="number-pad"
                    />
                    <TextInput
                      style={[styles.setInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                      placeholder="Weight"
                      placeholderTextColor={colors.textMuted}
                      value={set.weight}
                      onChangeText={(value) => updateSet(exercise.exerciseId, set.setNumber, 'weight', value)}
                    />
                    <TouchableOpacity
                      style={[
                        styles.completedButton,
                        { borderColor: colors.cardBorder, backgroundColor: set.completed ? colors.successBg : colors.cardBg },
                      ]}
                      onPress={() => updateSet(exercise.exerciseId, set.setNumber, 'completed', !set.completed)}
                    >
                      <Ionicons name={set.completed ? 'checkmark-circle' : 'ellipse-outline'} size={20} color={set.completed ? colors.success : colors.textMuted} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            ))}

            <View style={styles.notesSection}>
              <Text style={[styles.notesLabel, { color: colors.textSecondary }]}>Notes (optional)</Text>
              <TextInput
                style={[styles.notesInput, { backgroundColor: colors.cardBgAlt, borderColor: colors.cardBorder, color: colors.text }]}
                placeholder="How did this workout go?"
                placeholderTextColor={colors.textMuted}
                value={notes}
                onChangeText={setNotes}
                multiline
                maxLength={500}
                textAlignVertical="top"
              />
            </View>
          </ScrollView>

          <View style={styles.actions}>
            <TouchableOpacity style={[styles.cancelButton, { backgroundColor: colors.gray }]} onPress={onClose}>
              <Text style={[styles.cancelText, { color: colors.textSecondary }]}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.saveButton, { backgroundColor: colors.primary }]} onPress={handleSave}>
              <Text style={styles.saveText}>Save Workout</Text>
            </TouchableOpacity>
          </View>
        </View>
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
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderBottomWidth: 0,
    maxHeight: '92%',
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 14,
  },
  scrollView: {
    maxHeight: 520,
  },
  scrollContent: {
    gap: 12,
    paddingBottom: 10,
  },
  exerciseCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    gap: 10,
  },
  exerciseName: {
    fontSize: 15,
    fontWeight: '700',
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  setBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  setBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  setInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
  },
  completedButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  notesSection: {
    gap: 8,
    marginTop: 4,
  },
  notesLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  notesInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    minHeight: 84,
    maxHeight: 120,
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  cancelButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '700',
  },
  saveButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#000',
  },
});

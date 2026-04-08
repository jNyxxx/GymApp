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
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../context/ThemeContext';
import { WorkoutTemplate, Exercise, SetEntry, generateExerciseId, generateSetId } from '../../models/WorkoutTemplate';
import { WorkoutTemplateService } from '../../services/WorkoutTemplateService';

interface TemplateEditorSheetProps {
  visible: boolean;
  template: WorkoutTemplate | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function TemplateEditorSheet({
  visible,
  template,
  onClose,
  onSaved,
}: TemplateEditorSheetProps) {
  const colors = useColors();
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(null);

  // Keyboard listeners
  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardWillShow', () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener('keyboardWillHide', () => setKeyboardVisible(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Load template data when sheet opens
  useEffect(() => {
    if (template) {
      setExercises(template.exercises);
    } else {
      setExercises([]);
    }
    setExpandedExerciseId(null);
  }, [template, visible]);

  // Auto-save when sheet closes
  const handleDismiss = async () => {
    if (template) {
      await WorkoutTemplateService.update(template.id, { exercises });
    }
    onSaved();
    onClose();
  };

  // --- Exercise CRUD ---

  const handleAddExercise = () => {
    const newExercise: Exercise = {
      id: generateExerciseId(),
      name: '',
      sets: [],
    };
    const updated = [...exercises, newExercise];
    setExercises(updated);
    setExpandedExerciseId(newExercise.id);
  };

  const handleRemoveExercise = (id: string) => {
    setExercises(exercises.filter((e) => e.id !== id));
    if (expandedExerciseId === id) setExpandedExerciseId(null);
  };

  const handleToggleExpand = (id: string) => {
    setExpandedExerciseId(expandedExerciseId === id ? null : id);
  };

  const updateExerciseName = (id: string, name: string) => {
    setExercises(exercises.map((e) => (e.id === id ? { ...e, name } : e)));
  };

  // --- Per-Set CRUD ---

  const addSet = (exerciseId: string) => {
    setExercises(
      exercises.map((ex) => {
        if (ex.id !== exerciseId) return ex;
        return { ...ex, sets: [...ex.sets, { id: generateSetId(), reps: '', weight: '' }] };
      })
    );
  };

  const removeSet = (exerciseId: string, setId: string) => {
    setExercises(
      exercises.map((ex) => {
        if (ex.id !== exerciseId) return ex;
        return { ...ex, sets: ex.sets.filter((s) => s.id !== setId) };
      })
    );
  };

  const updateSet = (exerciseId: string, setId: string, field: 'reps' | 'weight', value: string) => {
    setExercises(
      exercises.map((ex) => {
        if (ex.id !== exerciseId) return ex;
        return {
          ...ex,
          sets: ex.sets.map((s) => (s.id === setId ? { ...s, [field]: value } : s)),
        };
      })
    );
  };

  // --- Helpers ---

  function getAvgWeight(sets: SetEntry[]): string {
    const weights = sets
      .map((s) => s.weight)
      .filter(Boolean)
      .map((w) => parseFloat(w.replace(/[^0-9.]/g, '')))
      .filter((n) => !isNaN(n));
    if (weights.length === 0) return '';
    const avg = Math.round(weights.reduce((a, b) => a + b, 0) / weights.length);
    const unit = sets[0]?.weight?.replace(/[0-9.]/g, '') || 'kg';
    return `${avg}${unit}`;
  }

  const totalSets = exercises.reduce((sum, e) => sum + e.sets.length, 0);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleDismiss}>
      <SafeAreaView style={[styles.overlay, { backgroundColor: colors.overlay }]}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={handleDismiss} />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoid}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          <View style={[styles.sheet, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
            {/* Handle bar */}
            <View style={[styles.handle, { backgroundColor: colors.grayLight }]} />

            {/* Template name header */}
            {template && (
              <View style={styles.nameHeader}>
                {template.emoji && <Text style={styles.headerEmoji}>{template.emoji}</Text>}
                <Text style={[styles.headerName, { color: colors.text }]}>{template.name}</Text>
                <Text style={[styles.headerMeta, { color: colors.textMuted }]}>
                  {exercises.length} {exercises.length === 1 ? 'exercise' : 'exercises'}
                  {totalSets > 0 && ` · ${totalSets} sets`}
                </Text>
              </View>
            )}

            <ScrollView
              style={styles.content}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.scrollContent}
            >
              {/* Section label */}
              <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>Exercises</Text>

              {exercises.length === 0 && (
                <View style={styles.emptyState}>
                  <Ionicons name="fitness-outline" size={40} color={colors.textMuted} />
                  <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                    No exercises yet
                  </Text>
                </View>
              )}

              {/* Exercise cards */}
              <View style={styles.exercisesList}>
                {exercises.map((exercise, index) => {
                  const isExpanded = expandedExerciseId === exercise.id;
                  return (
                    <View
                      key={exercise.id}
                      style={[
                        styles.exerciseCard,
                        {
                          backgroundColor: colors.cardBgAlt,
                          borderColor: isExpanded ? colors.primary + '60' : colors.cardBorder,
                        },
                      ]}
                    >
                      {/* Header */}
                      <TouchableOpacity
                        style={styles.exerciseHeader}
                        onPress={() => handleToggleExpand(exercise.id)}
                        activeOpacity={0.7}
                      >
                        <View style={[styles.numberBadge, { backgroundColor: colors.primaryGlow }]}>
                          <Text style={[styles.numberText, { color: colors.primary }]}>{index + 1}</Text>
                        </View>
                        <View style={styles.exerciseInfo}>
                          <Text style={[styles.exerciseName, { color: exercise.name ? colors.text : colors.textMuted }]}>
                            {exercise.name || 'Tap to name exercise'}
                          </Text>
                          {exercise.sets.length > 0 && (
                            <Text style={[styles.setSummary, { color: colors.textMuted }]}>
                              {exercise.sets.length} {exercise.sets.length === 1 ? 'set' : 'sets'}
                              {getAvgWeight(exercise.sets) ? ` · avg ${getAvgWeight(exercise.sets)}` : ''}
                            </Text>
                          )}
                        </View>
                        <Ionicons
                          name={isExpanded ? 'chevron-up' : 'chevron-down'}
                          size={18}
                          color={colors.textMuted}
                        />
                      </TouchableOpacity>

                      {/* Expanded area */}
                      {isExpanded && (
                        <View style={styles.editArea}>
                          {/* Name input */}
                          <TextInput
                            style={[styles.nameInput, { backgroundColor: colors.bg, borderColor: colors.cardBorder, color: colors.text }]}
                            placeholder="Exercise name"
                            placeholderTextColor={colors.textMuted}
                            value={exercise.name}
                            onChangeText={(text) => updateExerciseName(exercise.id, text)}
                          />

                          {/* Sets header */}
                          {exercise.sets.length > 0 && (
                            <View style={styles.setsHeader}>
                              <Text style={[styles.setsLabel, { color: colors.textMuted }]}>Sets</Text>
                              <View style={styles.setsCols}>
                                <Text style={[styles.setsColLabel, { color: colors.textMuted }]}>Reps</Text>
                                <Text style={[styles.setsColLabel, { color: colors.textMuted }]}>Weight</Text>
                                <View style={{ width: 28 }} />
                              </View>
                            </View>
                          )}

                          {/* Set rows */}
                          {exercise.sets.map((set, setIdx) => (
                            <View key={set.id} style={styles.setRow}>
                              <View style={[styles.setBadge, { backgroundColor: colors.gray }]}>
                                <Text style={[styles.setBadgeText, { color: colors.textMuted }]}>{setIdx + 1}</Text>
                              </View>
                              <TextInput
                                style={[styles.setInput, { backgroundColor: colors.bg, borderColor: colors.cardBorder, color: colors.text }]}
                                placeholder="10"
                                placeholderTextColor={colors.textMuted}
                                keyboardType="number-pad"
                                value={set.reps}
                                onChangeText={(text) => updateSet(exercise.id, set.id, 'reps', text)}
                              />
                              <TextInput
                                style={[styles.setInput, { backgroundColor: colors.bg, borderColor: colors.cardBorder, color: colors.text }]}
                                placeholder="60kg"
                                placeholderTextColor={colors.textMuted}
                                value={set.weight}
                                onChangeText={(text) => updateSet(exercise.id, set.id, 'weight', text)}
                              />
                              <TouchableOpacity
                                style={[styles.removeSetBtn, { backgroundColor: colors.dangerBg }]}
                                onPress={() => removeSet(exercise.id, set.id)}
                              >
                                <Ionicons name="close" size={14} color={colors.danger} />
                              </TouchableOpacity>
                            </View>
                          ))}

                          {/* Add Set */}
                          <TouchableOpacity
                            style={[styles.addSetBtn, { borderColor: colors.primary + '40' }]}
                            onPress={() => addSet(exercise.id)}
                          >
                            <Ionicons name="add-circle-outline" size={16} color={colors.primary} />
                            <Text style={[styles.addSetText, { color: colors.primary }]}>Add Set</Text>
                          </TouchableOpacity>

                          {/* Remove Exercise */}
                          <TouchableOpacity
                            style={styles.removeExerciseBtn}
                            onPress={() => handleRemoveExercise(exercise.id)}
                          >
                            <Ionicons name="trash-outline" size={14} color={colors.danger} />
                            <Text style={[styles.removeExerciseText, { color: colors.danger }]}>Remove</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            </ScrollView>

            {/* FAB */}
            <TouchableOpacity
              style={[styles.fab, { backgroundColor: colors.primary }]}
              onPress={handleAddExercise}
            >
              <Ionicons name="add" size={24} color="#000" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { flex: 1 },
  keyboardAvoid: { justifyContent: 'flex-end' },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderWidth: 1,
    borderBottomWidth: 0,
    maxHeight: '85%',
    overflow: 'hidden',
  },
  handle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  nameHeader: { alignItems: 'center', marginBottom: 20 },
  headerEmoji: { fontSize: 28, marginBottom: 4 },
  headerName: { fontSize: 22, fontWeight: '800' },
  headerMeta: { fontSize: 13, marginTop: 4 },
  content: { flexGrow: 1 },
  scrollContent: { paddingBottom: 80 },
  sectionLabel: {
    fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: '700', marginBottom: 12,
  },
  emptyState: { alignItems: 'center', paddingVertical: 32, gap: 8 },
  emptyText: { fontSize: 14 },
  exercisesList: { gap: 10 },
  exerciseCard: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  exerciseHeader: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  numberBadge: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  numberText: { fontSize: 13, fontWeight: '800' },
  exerciseInfo: { flex: 1 },
  exerciseName: { fontSize: 16, fontWeight: '700' },
  setSummary: { fontSize: 12, marginTop: 2 },
  editArea: { paddingHorizontal: 14, paddingBottom: 14, gap: 10 },
  nameInput: { borderRadius: 10, borderWidth: 1, padding: 12, fontSize: 15 },

  // Sets
  setsHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  setsLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  setsCols: { flexDirection: 'row', gap: 8 },
  setsColLabel: { fontSize: 11, fontWeight: '600', width: 56, textAlign: 'center' },
  setRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  setBadge: { width: 24, height: 24, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  setBadgeText: { fontSize: 11, fontWeight: '700' },
  setInput: {
    flex: 1, borderRadius: 10, borderWidth: 1, paddingVertical: 10, paddingHorizontal: 10,
    fontSize: 14, textAlign: 'center',
  },
  removeSetBtn: { width: 28, height: 28, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  addSetBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    borderRadius: 10, borderWidth: 1, borderStyle: 'dashed', paddingVertical: 10,
  },
  addSetText: { fontSize: 13, fontWeight: '600' },
  removeExerciseBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 10,
  },
  removeExerciseText: { fontSize: 13, fontWeight: '600' },

  // FAB
  fab: {
    position: 'absolute', right: 20, bottom: 24,
    width: 48, height: 48, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3, shadowRadius: 6,
  },
});

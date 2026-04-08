import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../context/ThemeContext';
import { WorkoutTemplate, Exercise, SetEntry, generateExerciseId, generateSetId } from '../../models/WorkoutTemplate';
import { WorkoutTemplateService } from '../../services/WorkoutTemplateService';
import PrimaryButton from '../shared/PrimaryButton';

interface TemplateDetailViewProps {
  template: WorkoutTemplate;
  onBack: () => void;
  onSaved: () => void;
}

export default function TemplateDetailView({ template, onBack, onSaved }: TemplateDetailViewProps) {
  const colors = useColors();
  const [exercises, setExercises] = useState<Exercise[]>(template.exercises);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState('');

  // Auto-save exercises back to the template
  const saveExercises = useCallback(async (updated: Exercise[]) => {
    await WorkoutTemplateService.update(template.id, { exercises: updated });
    onSaved();
  }, [template.id, onSaved]);

  // --- Exercise CRUD ---

  const handleAddExercise = () => {
    setNewExerciseName('');
    setShowAddExerciseModal(true);
  };

  const handleConfirmAddExercise = () => {
    const name = newExerciseName.trim();
    if (!name) return;

    const newExercise: Exercise = {
      id: generateExerciseId(),
      name,
      sets: [],
    };
    const updated = [...exercises, newExercise];
    setExercises(updated);
    setExpandedId(newExercise.id);
    saveExercises(updated);
    setShowAddExerciseModal(false);
  };

  const handleRemoveExercise = (id: string) => {
    const updated = exercises.filter((e) => e.id !== id);
    setExercises(updated);
    if (expandedId === id) setExpandedId(null);
    saveExercises(updated);
  };

  const handleToggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const updateExerciseName = (id: string, name: string) => {
    const updated = exercises.map((e) => (e.id === id ? { ...e, name } : e));
    setExercises(updated);
    saveExercises(updated);
  };

  const handleReorderExercise = (id: string, direction: 'up' | 'down') => {
    const idx = exercises.findIndex((e) => e.id === id);
    if (idx < 0) return;
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= exercises.length) return;
    const updated = [...exercises];
    [updated[idx], updated[swapIdx]] = [updated[swapIdx], updated[idx]];
    setExercises(updated);
    saveExercises(updated);
  };

  // --- Per-Set CRUD ---

  const addSet = (exerciseId: string) => {
    const updated = exercises.map((ex) => {
      if (ex.id !== exerciseId) return ex;
      return { ...ex, sets: [...ex.sets, { id: generateSetId(), reps: '', weight: '' }] };
    });
    setExercises(updated);
    saveExercises(updated);
  };

  const removeSet = (exerciseId: string, setId: string) => {
    const updated = exercises.map((ex) => {
      if (ex.id !== exerciseId) return ex;
      return { ...ex, sets: ex.sets.filter((s) => s.id !== setId) };
    });
    setExercises(updated);
    saveExercises(updated);
  };

  const updateSet = (exerciseId: string, setId: string, field: 'reps' | 'weight', value: string) => {
    const updated = exercises.map((ex) => {
      if (ex.id !== exerciseId) return ex;
      return {
        ...ex,
        sets: ex.sets.map((s) => (s.id === setId ? { ...s, [field]: value } : s)),
      };
    });
    setExercises(updated);
    saveExercises(updated);
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
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: colors.bg }]} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Back to templates"
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          {template.emoji && <Text style={styles.headerEmoji}>{template.emoji}</Text>}
          <Text style={[styles.headerTitle, { color: colors.text }]}>{template.name}</Text>
          <Text style={[styles.headerMeta, { color: colors.textMuted }]}>
            {exercises.length} {exercises.length === 1 ? 'exercise' : 'exercises'}
            {totalSets > 0 && ` · ${totalSets} sets`}
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Section label */}
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>Exercises</Text>

        {exercises.length === 0 && (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIconContainer, { backgroundColor: colors.primaryGlow }]}>
              <Ionicons name="fitness-outline" size={40} color={colors.primary} />
            </View>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              No exercises yet. Tap + to add one.
            </Text>
          </View>
        )}

        {/* Exercise cards */}
        <View style={styles.exercisesList}>
          {exercises.map((exercise, index) => {
            const isExpanded = expandedId === exercise.id;
            return (
              <View
                key={exercise.id}
                style={[
                  styles.exerciseCard,
                  {
                    backgroundColor: colors.cardBg,
                    borderColor: isExpanded ? colors.primary + '60' : colors.cardBorder,
                  },
                ]}
              >
                {/* Header */}
                <View style={styles.exerciseHeader}>
                  <View style={[styles.numberBadge, { backgroundColor: colors.primaryGlow }]}>
                    <Text style={[styles.numberText, { color: colors.primary }]}>{index + 1}</Text>
                  </View>
                  <View style={styles.exerciseInfo}>
                    <Text style={[styles.exerciseName, { color: colors.text }]}>{exercise.name}</Text>
                    {exercise.sets.length > 0 && (
                      <Text style={[styles.setSummary, { color: colors.textMuted }]}>
                        {exercise.sets.length} {exercise.sets.length === 1 ? 'set' : 'sets'}
                        {getAvgWeight(exercise.sets) ? ` · avg ${getAvgWeight(exercise.sets)}` : ''}
                      </Text>
                    )}
                  </View>

                  {/* Reorder buttons */}
                  <View style={styles.reorderButtons}>
                    <TouchableOpacity
                      style={[styles.reorderBtn, { opacity: index === 0 ? 0.3 : 1 }]}
                      onPress={() => handleReorderExercise(exercise.id, 'up')}
                      disabled={index === 0}
                    >
                      <Ionicons name="chevron-up" size={16} color={colors.textMuted} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.reorderBtn, { opacity: index === exercises.length - 1 ? 0.3 : 1 }]}
                      onPress={() => handleReorderExercise(exercise.id, 'down')}
                      disabled={index === exercises.length - 1}
                    >
                      <Ionicons name="chevron-down" size={16} color={colors.textMuted} />
                    </TouchableOpacity>
                  </View>

                  {/* Expand chevron */}
                  <TouchableOpacity
                    style={[styles.expandButton, { backgroundColor: colors.gray }]}
                    onPress={() => handleToggleExpand(exercise.id)}
                  >
                    <Ionicons
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={16}
                      color={colors.textMuted}
                    />
                  </TouchableOpacity>
                </View>

                {/* Expanded editing area */}
                {isExpanded && (
                  <View style={styles.editArea}>
                    {/* Name input */}
                    <TextInput
                      style={[styles.nameInput, { backgroundColor: colors.cardBgAlt, borderColor: colors.cardBorder, color: colors.text }]}
                      placeholder="Exercise name"
                      placeholderTextColor={colors.textMuted}
                      value={exercise.name}
                      onChangeText={(text) => updateExerciseName(exercise.id, text)}
                    />

                    {/* Sets header */}
                    {exercise.sets.length > 0 && (
                      <View style={styles.setsHeader}>
                        <Text style={[styles.setsLabel, { color: colors.textMuted }]}>Sets</Text>
                        <View style={styles.setBadgePlaceholder} />
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
                          style={[styles.setInput, { backgroundColor: colors.cardBgAlt, borderColor: colors.cardBorder, color: colors.text }]}
                          placeholder="10"
                          placeholderTextColor={colors.textMuted}
                          keyboardType="number-pad"
                          value={set.reps}
                          onChangeText={(text) => updateSet(exercise.id, set.id, 'reps', text)}
                        />
                        <TextInput
                          style={[styles.setInput, { backgroundColor: colors.cardBgAlt, borderColor: colors.cardBorder, color: colors.text }]}
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
                      <Text style={[styles.removeExerciseText, { color: colors.danger }]}>Remove Exercise</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={handleAddExercise}
        accessibilityRole="button"
        accessibilityLabel="Add exercise"
        accessibilityHint="Opens the add exercise dialog"
      >
        <Ionicons name="add" size={24} color="#000" />
      </TouchableOpacity>

      <Modal
        visible={showAddExerciseModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddExerciseModal(false)}
      >
        <SafeAreaView style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowAddExerciseModal(false)}
          />
          <View style={[styles.modalCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Add Exercise</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.cardBgAlt, borderColor: colors.cardBorder, color: colors.text }]}
              placeholder="Exercise name"
              placeholderTextColor={colors.textMuted}
              value={newExerciseName}
              onChangeText={setNewExerciseName}
              autoFocus
              maxLength={60}
              accessibilityLabel="Exercise name"
            />
            <View style={styles.modalActions}>
              <PrimaryButton
                title="Cancel"
                onPress={() => setShowAddExerciseModal(false)}
                variant="secondary"
                style={styles.modalActionButton}
                accessibilityLabel="Cancel adding exercise"
              />
              <PrimaryButton
                title="Add"
                onPress={handleConfirmAddExercise}
                variant="primary"
                style={[styles.modalActionButton, !newExerciseName.trim() && styles.disabledButton]}
                disabled={!newExerciseName.trim()}
                accessibilityLabel="Add exercise"
                accessibilityHint="Adds this exercise to the template"
              />
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backButton: { padding: 8 },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerEmoji: { fontSize: 24, marginBottom: 2 },
  headerTitle: { fontSize: 20, fontWeight: '800' },
  headerMeta: { fontSize: 12, marginTop: 2 },
  scrollView: { flex: 1 },
  scrollContent: { padding: 20, gap: 12 },
  sectionLabel: {
    fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: '700',
  },
  emptyState: { alignItems: 'center', paddingVertical: 48, gap: 12 },
  emptyIconContainer: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 14, textAlign: 'center' },
  exercisesList: { gap: 12 },
  exerciseCard: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  exerciseHeader: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 10 },
  numberBadge: { width: 26, height: 26, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  numberText: { fontSize: 12, fontWeight: '800' },
  exerciseInfo: { flex: 1 },
  exerciseName: { fontSize: 16, fontWeight: '700' },
  setSummary: { fontSize: 12, marginTop: 2 },
  reorderButtons: { flexDirection: 'row', gap: 2 },
  reorderBtn: { padding: 2 },
  expandButton: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  editArea: { paddingHorizontal: 14, paddingBottom: 14, gap: 10 },
  nameInput: { borderRadius: 10, borderWidth: 1, padding: 12, fontSize: 15 },
  setsHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4, alignItems: 'center' },
  setsLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  setBadgePlaceholder: { width: 24, height: 24, marginRight: 8 },
  setsCols: { flexDirection: 'row', gap: 8, flex: 1 },
  setsColLabel: { fontSize: 11, fontWeight: '600', flex: 1, textAlign: 'center' },
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
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  modalBackdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  modalCard: {
    width: '88%',
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
    gap: 12,
  },
  modalTitle: { fontSize: 18, fontWeight: '800' },
  modalInput: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  modalActions: { flexDirection: 'row', gap: 10 },
  modalActionButton: { flex: 1 },
  disabledButton: { opacity: 0.5 },
  fab: {
    position: 'absolute', right: 20, bottom: 24,
    width: 48, height: 48, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3, shadowRadius: 6,
  },
});

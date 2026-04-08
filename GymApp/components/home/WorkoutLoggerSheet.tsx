import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Keyboard,
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
import { ExercisePerformanceLog } from '../../models/ExerciseLog';
import { WorkoutTemplate } from '../../models/WorkoutTemplate';
import { useGymStore } from '../../context/GymStore';
import {
  addSetToExercise,
  applyHistoryDefaultsToExerciseLogs,
  applyLastValuesToExercise,
  applyLastValuesToSet,
  buildInitialExerciseLogs,
  cloneExerciseLogsForNewSession,
  formatTimer,
  getExerciseCompletion,
  getLatestExerciseLog,
  markExerciseSetsComplete,
  removeSetFromExercise,
  updateSetField,
} from './workoutLoggerUtils';

interface WorkoutLoggerSheetProps {
  visible: boolean;
  template: WorkoutTemplate | null;
  initialNotes?: string;
  initialExerciseLogs?: ExercisePerformanceLog[];
  autoFillLastValues?: boolean;
  titleOverride?: string;
  onClose: () => void;
  onSave: (exerciseLogs: ExercisePerformanceLog[], notes?: string) => void;
}

const REST_PRESETS = [60, 90, 120] as const;
const DEFAULT_REST_SECONDS = 90;

export default function WorkoutLoggerSheet({
  visible,
  template,
  initialNotes,
  initialExerciseLogs,
  autoFillLastValues = true,
  titleOverride,
  onClose,
  onSave,
}: WorkoutLoggerSheetProps) {
  const colors = useColors();
  const entries = useGymStore((state) => state.entries);

  const [exerciseLogs, setExerciseLogs] = useState<ExercisePerformanceLog[]>([]);
  const [notes, setNotes] = useState(initialNotes || '');
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);

  const [restDurationSeconds, setRestDurationSeconds] = useState(DEFAULT_REST_SECONDS);
  const [restSecondsRemaining, setRestSecondsRemaining] = useState(DEFAULT_REST_SECONDS);
  const [isRestTimerRunning, setIsRestTimerRunning] = useState(false);
  const [appliedHistoryDefaults, setAppliedHistoryDefaults] = useState(false);

  const inputRefs = useRef<Record<string, TextInput | null>>({});
  const wasVisibleRef = useRef(false);

  useEffect(() => {
    if (!visible) {
      setExerciseLogs([]);
      setNotes(initialNotes || '');
      setCurrentExerciseIndex(0);
      setRestDurationSeconds(DEFAULT_REST_SECONDS);
      setRestSecondsRemaining(DEFAULT_REST_SECONDS);
      setIsRestTimerRunning(false);
      setAppliedHistoryDefaults(false);
      wasVisibleRef.current = false;
      return;
    }

    if (wasVisibleRef.current) {
      return;
    }
    wasVisibleRef.current = true;

    setNotes(initialNotes || '');
    const initialLogs =
      initialExerciseLogs && initialExerciseLogs.length > 0
        ? cloneExerciseLogsForNewSession(initialExerciseLogs)
        : template
          ? buildInitialExerciseLogs(template)
          : [];

    if (autoFillLastValues && initialLogs.length > 0 && !(initialExerciseLogs && initialExerciseLogs.length > 0)) {
      const defaultsApplied = applyHistoryDefaultsToExerciseLogs(entries, initialLogs);
      setExerciseLogs(defaultsApplied.exerciseLogs);
      setAppliedHistoryDefaults(defaultsApplied.didApplyDefaults);
    } else {
      setExerciseLogs(initialLogs);
      setAppliedHistoryDefaults(false);
    }

    setCurrentExerciseIndex(0);
    setRestDurationSeconds(DEFAULT_REST_SECONDS);
    setRestSecondsRemaining(DEFAULT_REST_SECONDS);
    setIsRestTimerRunning(false);
  }, [visible, template, initialNotes, initialExerciseLogs, autoFillLastValues, entries]);

  useEffect(() => {
    if (currentExerciseIndex >= exerciseLogs.length && exerciseLogs.length > 0) {
      setCurrentExerciseIndex(exerciseLogs.length - 1);
    }
  }, [exerciseLogs.length, currentExerciseIndex]);

  useEffect(() => {
    if (!visible || !isRestTimerRunning || restSecondsRemaining <= 0) return;

    const interval = setInterval(() => {
      setRestSecondsRemaining((current) => {
        if (current <= 1) {
          setIsRestTimerRunning(false);
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [visible, isRestTimerRunning, restSecondsRemaining]);

  const totalSets = useMemo(
    () => exerciseLogs.reduce((sum, exercise) => sum + exercise.sets.length, 0),
    [exerciseLogs]
  );
  const completedSets = useMemo(
    () => exerciseLogs.reduce((sum, exercise) => sum + exercise.sets.filter((set) => set.completed).length, 0),
    [exerciseLogs]
  );
  const workoutProgress = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;

  const currentExercise = exerciseLogs[currentExerciseIndex] || null;
  const currentExerciseCompletion = currentExercise ? getExerciseCompletion(currentExercise) : { completed: 0, total: 0 };

  const latestHistoryByExercise = useMemo(() => {
    const result: Record<string, ExercisePerformanceLog | null> = {};
    for (const exercise of exerciseLogs) {
      result[exercise.exerciseId] = getLatestExerciseLog(entries, exercise);
    }
    return result;
  }, [entries, exerciseLogs]);

  const currentExerciseHistory = currentExercise ? latestHistoryByExercise[currentExercise.exerciseId] : null;

  const startRestTimer = (seconds: number) => {
    const safeSeconds = Math.max(1, Math.floor(seconds));
    setRestDurationSeconds(safeSeconds);
    setRestSecondsRemaining(safeSeconds);
    setIsRestTimerRunning(true);
  };

  const toggleRestTimer = () => {
    if (isRestTimerRunning) {
      setIsRestTimerRunning(false);
      return;
    }
    if (restSecondsRemaining <= 0) {
      setRestSecondsRemaining(restDurationSeconds);
    }
    setIsRestTimerRunning(true);
  };

  const resetRestTimer = () => {
    setIsRestTimerRunning(false);
    setRestSecondsRemaining(restDurationSeconds);
  };

  const setInputRef = (key: string, ref: TextInput | null) => {
    inputRefs.current[key] = ref;
  };

  const buildInputKey = (exerciseId: string, setNumber: number, field: 'reps' | 'weight') =>
    `${exerciseId}_${setNumber}_${field}`;

  const focusInput = (exerciseId: string, setNumber: number, field: 'reps' | 'weight') => {
    const key = buildInputKey(exerciseId, setNumber, field);
    inputRefs.current[key]?.focus();
  };

  const handleSetInputSubmit = (setNumber: number, field: 'reps' | 'weight') => {
    if (!currentExercise) return;

    if (field === 'reps') {
      focusInput(currentExercise.exerciseId, setNumber, 'weight');
      return;
    }

    const nextSet = currentExercise.sets.find((set) => set.setNumber === setNumber + 1);
    if (nextSet) {
      focusInput(currentExercise.exerciseId, nextSet.setNumber, 'reps');
      return;
    }

    Keyboard.dismiss();
  };

  const handleSetFieldUpdate = (
    exerciseId: string,
    setNumber: number,
    field: 'reps' | 'weight' | 'completed',
    value: string | boolean
  ) => {
    setExerciseLogs((current) => updateSetField(current, exerciseId, setNumber, field, value));
  };

  const handleToggleSetCompletion = (setNumber: number) => {
    if (!currentExercise) return;

    let becameCompleted = false;
    setExerciseLogs((current) =>
      current.map((exercise) => {
        if (exercise.exerciseId !== currentExercise.exerciseId) return exercise;
        return {
          ...exercise,
          sets: exercise.sets.map((set) => {
            if (set.setNumber !== setNumber) return set;
            const nextCompleted = !set.completed;
            becameCompleted = nextCompleted;
            return { ...set, completed: nextCompleted };
          }),
        };
      })
    );

    if (becameCompleted) {
      startRestTimer(restDurationSeconds);
    }
  };

  const handleAddSet = () => {
    if (!currentExercise) return;
    setExerciseLogs((current) => addSetToExercise(current, currentExercise.exerciseId));
  };

  const handleRemoveSet = (setNumber: number) => {
    if (!currentExercise) return;
    setExerciseLogs((current) => removeSetFromExercise(current, currentExercise.exerciseId, setNumber));
  };

  const handleUseLastValuesForSet = (setNumber: number, setIndex: number) => {
    if (!currentExercise || !currentExerciseHistory) return;
    setExerciseLogs((current) =>
      current.map((exercise) => {
        if (exercise.exerciseId !== currentExercise.exerciseId) return exercise;
        return {
          ...exercise,
          sets: exercise.sets.map((set) => {
            if (set.setNumber !== setNumber) return set;
            return applyLastValuesToSet(set, setIndex, currentExerciseHistory);
          }),
        };
      })
    );
  };

  const handleUseLastValuesForExercise = () => {
    if (!currentExercise || !currentExerciseHistory) return;
    setExerciseLogs((current) =>
      current.map((exercise) =>
        exercise.exerciseId === currentExercise.exerciseId
          ? applyLastValuesToExercise(exercise, currentExerciseHistory)
          : exercise
      )
    );
  };

  const handleCompleteAllSets = () => {
    if (!currentExercise) return;

    setExerciseLogs((current) =>
      current.map((exercise) =>
        exercise.exerciseId === currentExercise.exerciseId ? markExerciseSetsComplete(exercise) : exercise
      )
    );

    startRestTimer(restDurationSeconds);
    setCurrentExerciseIndex((index) => Math.min(index + 1, Math.max(exerciseLogs.length - 1, 0)));
  };

  const handleSave = () => {
    onSave(exerciseLogs, notes.trim() || undefined);
  };

  if (!template && !(initialExerciseLogs && initialExerciseLogs.length > 0)) return null;

  const canGoPrevious = currentExerciseIndex > 0;
  const canGoNext = currentExerciseIndex < exerciseLogs.length - 1;
  const resolvedTitle = titleOverride || (template ? (template.emoji ? `${template.emoji} ${template.name}` : template.name) : 'Workout Logger');

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={[styles.overlay, { backgroundColor: colors.overlay }]}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboardAvoid}>
            <View style={[styles.sheet, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
              <View style={[styles.handle, { backgroundColor: colors.grayLight }]} />
              <Text style={[styles.title, { color: colors.text }]}>{resolvedTitle}</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Workout mode · {completedSets}/{totalSets} sets complete ({workoutProgress}%)
              </Text>
              {appliedHistoryDefaults && (
                <View style={[styles.defaultHint, { backgroundColor: colors.primaryGlow, borderColor: colors.primaryBorder }]}>
                  <Text style={[styles.defaultHintText, { color: colors.primary }]}>
                    Filled with last numbers where available.
                  </Text>
                </View>
              )}

            <View style={[styles.progressCard, { backgroundColor: colors.cardBgAlt, borderColor: colors.cardBorder }]}>
              <View style={styles.progressHeader}>
                <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>Current Exercise</Text>
                <Text style={[styles.progressValue, { color: colors.text }]}>
                  {exerciseLogs.length > 0 ? `${currentExerciseIndex + 1}/${exerciseLogs.length}` : '0/0'}
                </Text>
              </View>
              <View style={[styles.progressTrack, { backgroundColor: colors.gray }]}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      backgroundColor: colors.primary,
                      width: `${exerciseLogs.length > 0 ? ((currentExerciseIndex + 1) / exerciseLogs.length) * 100 : 0}%`,
                    },
                  ]}
                />
              </View>
            </View>

            <View style={[styles.timerCard, { backgroundColor: colors.cardBgAlt, borderColor: colors.cardBorder }]}>
              <Text style={[styles.timerTitle, { color: colors.textSecondary }]}>Rest Timer</Text>
              <Text style={[styles.timerValue, { color: restSecondsRemaining === 0 ? colors.warning : colors.text }]}>
                {formatTimer(restSecondsRemaining)}
              </Text>
              <View style={styles.timerActions}>
                <TouchableOpacity
                  style={[styles.timerActionButton, { backgroundColor: colors.primary }]}
                  onPress={toggleRestTimer}
                >
                  <Text style={styles.timerActionText}>
                    {isRestTimerRunning ? 'Pause' : restSecondsRemaining === 0 ? 'Restart' : 'Start'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.timerActionButton, { backgroundColor: colors.gray }]}
                  onPress={resetRestTimer}
                >
                  <Text style={[styles.timerResetText, { color: colors.textSecondary }]}>Reset</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.presetRow}>
                {REST_PRESETS.map((preset) => (
                  <TouchableOpacity
                    key={preset}
                    style={[
                      styles.presetButton,
                      {
                        borderColor: colors.cardBorder,
                        backgroundColor: restDurationSeconds === preset ? colors.primaryGlow : colors.cardBg,
                      },
                    ]}
                    onPress={() => startRestTimer(preset)}
                  >
                    <Text
                      style={[
                        styles.presetText,
                        { color: restDurationSeconds === preset ? colors.primary : colors.textSecondary },
                      ]}
                    >
                      {preset}s
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {currentExercise ? (
                <View
                  style={[styles.exerciseCard, { backgroundColor: colors.cardBgAlt, borderColor: colors.cardBorder }]}
                >
                  <View style={styles.exerciseHeader}>
                    <Text style={[styles.exerciseName, { color: colors.text }]}>{currentExercise.exerciseName}</Text>
                    <Text style={[styles.exerciseMeta, { color: colors.textSecondary }]}>
                      {currentExerciseCompletion.completed}/{currentExerciseCompletion.total} sets done
                    </Text>
                  </View>

                  <View style={styles.quickActionRow}>
                    <TouchableOpacity
                      style={[
                        styles.quickActionButton,
                        {
                          backgroundColor: currentExerciseHistory ? colors.primaryGlow : colors.gray,
                          opacity: currentExerciseHistory ? 1 : 0.45,
                        },
                      ]}
                      onPress={handleUseLastValuesForExercise}
                      disabled={!currentExerciseHistory}
                    >
                      <Text
                        style={[
                          styles.quickActionText,
                          { color: currentExerciseHistory ? colors.primary : colors.textMuted },
                        ]}
                        >
                        Use last numbers
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.quickActionButton, { backgroundColor: colors.successBg }]}
                      onPress={handleCompleteAllSets}
                    >
                      <Text style={[styles.quickActionText, { color: colors.success }]}>Complete all sets</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.quickActionButton, { backgroundColor: colors.gray }]} onPress={handleAddSet}>
                      <Text style={[styles.quickActionText, { color: colors.textSecondary }]}>+ Add set</Text>
                    </TouchableOpacity>
                  </View>

                  {currentExercise.sets.map((set, setIndex) => {
                    const canRemoveSet = currentExercise.sets.length > 1;

                    return (
                      <View
                        key={`${currentExercise.exerciseId}_${set.setNumber}`}
                        style={[
                          styles.setCard,
                          {
                            backgroundColor: set.completed ? colors.successBg : colors.cardBg,
                            borderColor: set.completed ? `${colors.success}60` : colors.cardBorder,
                          },
                        ]}
                      >
                        <View style={styles.setCardHeader}>
                          <View style={[styles.setBadge, { backgroundColor: colors.gray }]}>
                            <Text style={[styles.setBadgeText, { color: colors.textSecondary }]}>Set {set.setNumber}</Text>
                          </View>
                          <View style={styles.setHeaderActions}>
                            {currentExerciseHistory && (
                              <TouchableOpacity
                                style={[styles.smallActionButton, { backgroundColor: colors.primaryGlow }]}
                                onPress={() => handleUseLastValuesForSet(set.setNumber, setIndex)}
                              >
                                <Text style={[styles.smallActionText, { color: colors.primary }]}>Last</Text>
                              </TouchableOpacity>
                            )}
                            <TouchableOpacity
                              style={[
                                styles.smallActionButton,
                                {
                                  backgroundColor: canRemoveSet ? colors.dangerBg : colors.gray,
                                  opacity: canRemoveSet ? 1 : 0.5,
                                },
                              ]}
                              onPress={() => handleRemoveSet(set.setNumber)}
                              disabled={!canRemoveSet}
                            >
                              <Ionicons name="remove" size={14} color={canRemoveSet ? colors.danger : colors.textMuted} />
                            </TouchableOpacity>
                          </View>
                        </View>

                        <View style={styles.setInputRow}>
                          <TextInput
                            ref={(ref) => setInputRef(buildInputKey(currentExercise.exerciseId, set.setNumber, 'reps'), ref)}
                            style={[
                              styles.setInput,
                              { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text },
                            ]}
                            placeholder="Reps"
                            placeholderTextColor={colors.textMuted}
                            value={set.reps}
                            onChangeText={(value) =>
                              handleSetFieldUpdate(currentExercise.exerciseId, set.setNumber, 'reps', value)
                            }
                            keyboardType="number-pad"
                            returnKeyType="next"
                            blurOnSubmit={false}
                            selectTextOnFocus
                            onSubmitEditing={() => handleSetInputSubmit(set.setNumber, 'reps')}
                          />
                          <TextInput
                            ref={(ref) => setInputRef(buildInputKey(currentExercise.exerciseId, set.setNumber, 'weight'), ref)}
                            style={[
                              styles.setInput,
                              { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text },
                            ]}
                            placeholder="Weight"
                            placeholderTextColor={colors.textMuted}
                            value={set.weight}
                            onChangeText={(value) =>
                              handleSetFieldUpdate(currentExercise.exerciseId, set.setNumber, 'weight', value)
                            }
                            keyboardType="decimal-pad"
                            returnKeyType={setIndex === currentExercise.sets.length - 1 ? 'done' : 'next'}
                            blurOnSubmit={setIndex === currentExercise.sets.length - 1}
                            selectTextOnFocus
                            onSubmitEditing={() => handleSetInputSubmit(set.setNumber, 'weight')}
                          />
                          <TouchableOpacity
                            style={[
                              styles.completedButton,
                              {
                                borderColor: set.completed ? `${colors.success}60` : colors.cardBorder,
                                backgroundColor: set.completed ? colors.successBg : colors.cardBg,
                              },
                            ]}
                            onPress={() => handleToggleSetCompletion(set.setNumber)}
                          >
                            <Ionicons
                              name={set.completed ? 'checkmark-circle' : 'ellipse-outline'}
                              size={20}
                              color={set.completed ? colors.success : colors.textMuted}
                            />
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })}
                </View>
              ) : (
                <View style={[styles.emptyCard, { backgroundColor: colors.cardBgAlt, borderColor: colors.cardBorder }]}>
                  <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No exercise data loaded.</Text>
                </View>
              )}

              <View style={styles.notesSection}>
                <Text style={[styles.notesLabel, { color: colors.textSecondary }]}>Notes (optional)</Text>
                <TextInput
                  style={[
                    styles.notesInput,
                    { backgroundColor: colors.cardBgAlt, borderColor: colors.cardBorder, color: colors.text },
                  ]}
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

            <View style={styles.navigationRow}>
              <TouchableOpacity
                style={[styles.navigationButton, { backgroundColor: colors.gray, opacity: canGoPrevious ? 1 : 0.45 }]}
                disabled={!canGoPrevious}
                onPress={() => setCurrentExerciseIndex((index) => Math.max(index - 1, 0))}
              >
                <Ionicons name="chevron-back" size={16} color={colors.textSecondary} />
                <Text style={[styles.navigationText, { color: colors.textSecondary }]}>Previous</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.navigationButton, { backgroundColor: colors.gray, opacity: canGoNext ? 1 : 0.45 }]}
                disabled={!canGoNext}
                onPress={() => setCurrentExerciseIndex((index) => Math.min(index + 1, exerciseLogs.length - 1))}
              >
                <Text style={[styles.navigationText, { color: colors.textSecondary }]}>Next</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity style={[styles.cancelButton, { backgroundColor: colors.gray }]} onPress={onClose}>
                <Text style={[styles.cancelText, { color: colors.textSecondary }]}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.saveButton, { backgroundColor: colors.primary }]} onPress={handleSave}>
                <Text style={styles.saveText}>Save Workout</Text>
              </TouchableOpacity>
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
    maxHeight: '94%',
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
    marginBottom: 12,
  },
  defaultHint: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  defaultHintText: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  progressCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    gap: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressValue: {
    fontSize: 12,
    fontWeight: '700',
  },
  progressTrack: {
    height: 6,
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  timerCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    gap: 10,
  },
  timerTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  timerValue: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 1,
  },
  timerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  timerActionButton: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  timerActionText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '800',
  },
  timerResetText: {
    fontSize: 14,
    fontWeight: '700',
  },
  presetRow: {
    flexDirection: 'row',
    gap: 8,
  },
  presetButton: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 8,
    alignItems: 'center',
  },
  presetText: {
    fontSize: 13,
    fontWeight: '700',
  },
  scrollView: {
    maxHeight: 440,
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
  exerciseHeader: {
    gap: 4,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '800',
  },
  exerciseMeta: {
    fontSize: 12,
    fontWeight: '600',
  },
  quickActionRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  quickActionButton: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '700',
  },
  setCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 10,
    gap: 8,
  },
  setCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  setBadge: {
    paddingHorizontal: 8,
    height: 24,
    borderRadius: 8,
    justifyContent: 'center',
  },
  setBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  setHeaderActions: {
    flexDirection: 'row',
    gap: 6,
  },
  smallActionButton: {
    minWidth: 34,
    height: 26,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  smallActionText: {
    fontSize: 11,
    fontWeight: '700',
  },
  setInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  setInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    fontSize: 14,
    textAlign: 'center',
  },
  completedButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  emptyCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
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
  navigationRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  navigationButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  navigationText: {
    fontSize: 14,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
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

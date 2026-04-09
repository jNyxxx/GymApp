import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '../../context/ThemeContext';
import { GymEntry } from '../../models/GymEntry';
import { SetPerformanceLog } from '../../models/ExerciseLog';
import { GymStatus } from '../../models/GymStatus';
import { SPLIT_LABELS, WorkoutSplit } from '../../models/WorkoutSplit';
import { formatFriendly } from '../../services/DateLogicService';
import { GymLogService } from '../../services/GymLogService';
import { WorkoutTemplateService } from '../../services/WorkoutTemplateService';
import SplitIcon from '../shared/SplitIcon';
import PrimaryButton from '../shared/PrimaryButton';
import SheetActions from '../shared/SheetActions';
import { DESIGN_SYSTEM, sectionHeadingTextStyle } from '../../constants/DesignSystem';

interface DayDetailSheetProps {
  visible: boolean;
  dateKey: string;
  entry: GymEntry | null;
  onClose: () => void;
  onEntryUpdated: () => void;
}

export default function DayDetailSheet({
  visible,
  dateKey,
  entry,
  onClose,
  onEntryUpdated,
}: DayDetailSheetProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [editing, setEditing] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notes, setNotes] = useState(entry?.notes || '');
  const [splitLabel, setSplitLabel] = useState<string>('');
  const [templates, setTemplates] = useState<{ id: string; name: string; emoji?: string }[]>([]);
  const friendlyDate = formatFriendly(dateKey);

  // Load split label (either built-in or template name)
  useEffect(() => {
    const loadSplitLabel = async () => {
      if (!entry?.split) {
        setSplitLabel('');
        return;
      }

      // Check if it's a built-in split
      if (Object.values(WorkoutSplit).includes(entry.split as WorkoutSplit)) {
        setSplitLabel(SPLIT_LABELS[entry.split as WorkoutSplit]);
      } else if (WorkoutTemplateService.isTemplate(entry.split)) {
        // It's a template - fetch the name
        const template = await WorkoutTemplateService.getById(entry.split);
        setSplitLabel(template?.name || 'Custom Template');
      } else {
        // Old custom split
        setSplitLabel(entry.split.replace(/^custom_/, '').replace(/_/g, ' '));
      }
    };

    loadSplitLabel();
  }, [entry?.split]);

  useEffect(() => {
    const loadTemplates = async () => {
      const all = await WorkoutTemplateService.getAll();
      setTemplates(all.map((t) => ({ id: t.id, name: t.name, emoji: t.emoji })));
    };
    if (visible) {
      loadTemplates();
    }
  }, [visible]);

  const handleSetWent = async (split: WorkoutSplit | string) => {
    await GymLogService.saveEntry(
      GymStatus.WENT,
      split,
      dateKey,
      entry?.notes,
      undefined,
      undefined,
      { source: 'day-detail-edit' }
    );
    setEditing(false);
    onEntryUpdated();
  };

  const handleSetNoGym = async () => {
    await GymLogService.saveEntry(GymStatus.NO_GYM, undefined, dateKey, undefined, undefined, undefined, {
      source: 'day-detail-edit',
    });
    setEditing(false);
    onEntryUpdated();
  };

  const handleDelete = async () => {
    await GymLogService.deleteEntry(dateKey);
    setEditing(false);
    onEntryUpdated();
  };

  const handleSaveNotes = async () => {
    await GymLogService.updateNotes(dateKey, notes);
    setEditingNotes(false);
    onEntryUpdated();
  };

  const handleStartEditNotes = () => {
    setNotes(entry?.notes || '');
    setEditingNotes(true);
  };

  const loggedTime = entry?.loggedAt
    ? new Date(entry.loggedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    : '';

  const formatSetPerformance = (set: SetPerformanceLog): string => {
    const reps = set.reps || '—';
    const weight = set.weight || '—';
    const status = set.completed ? '✓' : '○';
    return `${status} Set ${set.setNumber}: ${reps} reps · ${weight}`;
  };

  if (editing) {
    return (
      <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
        <SafeAreaView style={[styles.overlay, { backgroundColor: colors.overlay }]}>
          <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
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
            <Text style={[styles.sheetTitle, { color: colors.text }]}>Change Session</Text>
            <Text style={[styles.label, { color: colors.textMuted }]}>Choose a split</Text>

            <ScrollView style={styles.editScroll} showsVerticalScrollIndicator={false}>
              <View style={styles.editOptions}>
                {Object.values(WorkoutSplit).map((split) => (
                  <TouchableOpacity
                    key={split}
                    style={[
                      styles.splitOption,
                      { backgroundColor: colors.cardBgAlt, borderColor: colors.cardBorder },
                      entry?.split === split && [styles.splitOptionSelected, { borderColor: colors.primary, backgroundColor: colors.primaryGlow }],
                    ]}
                    onPress={() => handleSetWent(split)}
                    accessibilityRole="button"
                    accessibilityLabel={`${SPLIT_LABELS[split]} split`}
                    accessibilityHint="Update this day to the selected split"
                    accessibilityState={{ selected: entry?.split === split }}
                  >
                    <SplitIcon
                      split={split}
                      size="sm"
                      style={entry?.split === split ? { borderColor: colors.primary + '60' } : undefined}
                    />
                    <Text style={[
                      styles.splitOptionText,
                      { color: colors.text },
                      entry?.split === split && { color: colors.primary },
                    ]}>
                      {SPLIT_LABELS[split]}
                    </Text>
                  </TouchableOpacity>
                ))}

                {templates.length > 0 && (
                  <Text style={[styles.templatesLabel, { color: colors.textMuted }]}>Templates</Text>
                )}
                {templates.map((template) => (
                  <TouchableOpacity
                    key={template.id}
                    style={[
                      styles.splitOption,
                      { backgroundColor: colors.cardBgAlt, borderColor: colors.cardBorder },
                      entry?.split === template.id && [styles.splitOptionSelected, { borderColor: colors.primary, backgroundColor: colors.primaryGlow }],
                    ]}
                    onPress={() => handleSetWent(template.id)}
                    accessibilityRole="button"
                    accessibilityLabel={`${template.name} template`}
                    accessibilityHint="Update this day to this template"
                    accessibilityState={{ selected: entry?.split === template.id }}
                  >
                    <SplitIcon
                      split={template.id}
                      size="sm"
                      style={entry?.split === template.id ? { borderColor: colors.primary + '60' } : undefined}
                    />
                    <Text
                      style={[
                        styles.splitOptionText,
                        { color: colors.text },
                        entry?.split === template.id && { color: colors.primary },
                      ]}
                    >
                      {template.emoji ? `${template.emoji} ${template.name}` : template.name}
                    </Text>
                  </TouchableOpacity>
                ))}

                <TouchableOpacity
                  style={[styles.noGymOption, { backgroundColor: colors.cardBgAlt, borderColor: colors.cardBorder }]}
                  onPress={handleSetNoGym}
                  accessibilityRole="button"
                  accessibilityLabel="Mark as no gym"
                  accessibilityHint="Sets this day to no gym"
                >
                  <Text style={[styles.noGymText, { color: colors.textSecondary }]}>✕  No Gym</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>

            <PrimaryButton
              title="Cancel"
              onPress={() => setEditing(false)}
              variant="secondary"
              accessibilityLabel="Cancel session changes"
            />
          </View>
        </SafeAreaView>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={[styles.overlay, { backgroundColor: colors.overlay }]}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
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
          <Text style={[styles.sheetTitle, { color: colors.text }]}>Day Details</Text>

          <ScrollView style={styles.detailScroll} showsVerticalScrollIndicator={false}>
            <Text style={[styles.label, { color: colors.textMuted }]}>Selected day</Text>
            <Text style={[styles.date, { color: colors.text }]}>{friendlyDate}</Text>

            {entry ? (
              <>
                <View style={styles.statusRow}>
                  <Text style={[styles.statusText, { color: colors.text }]}>
                    {entry.status === GymStatus.WENT ? 'Went to gym' : 'No gym'}
                  </Text>
                  {loggedTime && (
                    <Text style={[styles.timeText, { color: colors.textSecondary }]}>· {loggedTime}</Text>
                  )}
                  {entry.split && (
                    <View style={{ marginLeft: 'auto' }}>
                      <SplitIcon split={entry.split} size="sm" />
                    </View>
                  )}
                </View>

                {entry.split && (
                  <View style={[styles.sessionInfo, { backgroundColor: colors.cardBgAlt, borderColor: colors.cardBorder }]}>
                    <Text style={[styles.sessionLabel, { color: colors.textSecondary }]}>
                      Logged split
                    </Text>
                    <Text style={[styles.sessionSplit, { color: colors.text }]}>{splitLabel}</Text>
                    <Text style={[styles.sessionHint, { color: colors.textMuted }]}>
                      Saved from your split selection when this session was logged.
                    </Text>
                  </View>
                )}

                {/* Notes Section */}
                {entry.status === GymStatus.WENT && (
                  <View style={[styles.notesSection, { backgroundColor: colors.cardBgAlt, borderColor: colors.cardBorder }]}>
                    <View style={styles.notesHeader}>
                      <Text style={[styles.notesLabel, { color: colors.textSecondary }]}>Notes</Text>
                      <TouchableOpacity
                        onPress={handleStartEditNotes}
                        accessibilityRole="button"
                        accessibilityLabel={entry.notes ? "Edit notes" : "Add notes"}
                        accessibilityHint="Opens note editor for this day"
                      >
                        <Text style={[styles.editNotesButton, { color: colors.primary }]}>
                          {entry.notes ? 'Edit' : 'Add'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                    {editingNotes ? (
                      <View style={styles.notesEditContainer}>
                        <TextInput
                          style={[
                            styles.notesInput,
                            {
                              backgroundColor: colors.bg,
                              borderColor: colors.cardBorder,
                              color: colors.text,
                            },
                          ]}
                          placeholder="What exercises did you do? How did it feel?"
                          placeholderTextColor={colors.textMuted}
                          value={notes}
                          onChangeText={setNotes}
                          multiline
                          maxLength={500}
                          textAlignVertical="top"
                          autoFocus
                        />
                        <SheetActions style={styles.notesEditActions}>
                          <TouchableOpacity
                            style={[styles.notesCancelBtn, { backgroundColor: colors.gray }]}
                            onPress={() => setEditingNotes(false)}
                            accessibilityRole="button"
                            accessibilityLabel="Cancel notes editing"
                          >
                            <Text style={[styles.notesCancelText, { color: colors.textSecondary }]}>Cancel</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.notesSaveBtn, { backgroundColor: colors.primary }]}
                            onPress={handleSaveNotes}
                            accessibilityRole="button"
                            accessibilityLabel="Save notes"
                            accessibilityHint="Updates notes for this day"
                          >
                            <Text style={styles.notesSaveText}>Save</Text>
                          </TouchableOpacity>
                        </SheetActions>
                      </View>
                    ) : (
                      <Text style={[styles.notesText, { color: entry.notes ? colors.text : colors.textMuted }]}>
                        {entry.notes || 'No notes added'}
                      </Text>
                    )}
                  </View>
                )}

                {entry.status === GymStatus.WENT && entry.exerciseLogs && entry.exerciseLogs.length > 0 && (
                  <View style={[styles.performanceSection, { backgroundColor: colors.cardBgAlt, borderColor: colors.cardBorder }]}>
                    <Text style={[styles.performanceTitle, { color: colors.textSecondary }]}>Exercise Performance</Text>
                    <View style={styles.performanceList}>
                      {entry.exerciseLogs.map((exercise) => (
                        <View key={exercise.exerciseId} style={styles.performanceExercise}>
                          <Text style={[styles.performanceExerciseName, { color: colors.text }]}>
                            {exercise.exerciseName}
                          </Text>
                          <View style={styles.performanceSets}>
                            {exercise.sets.map((set) => (
                              <Text key={`${exercise.exerciseId}_${set.setNumber}`} style={[styles.performanceSetText, { color: colors.textSecondary }]}>
                                {formatSetPerformance(set)}
                              </Text>
                            ))}
                          </View>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </>
            ) : (
              <View style={styles.emptyContent}>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No entry for this day</Text>
                <Text style={[styles.emptyHint, { color: colors.textMuted }]}>This day is unanswered</Text>
              </View>
            )}
          </ScrollView>

          {entry ? (
            <SheetActions style={styles.actions}>
              <PrimaryButton
                title="Change Session"
                onPress={() => setEditing(true)}
                variant="primary"
                style={styles.actionButton}
                accessibilityLabel="Change session"
                accessibilityHint="Opens split choices for this day"
              />
              {entry.status === GymStatus.WENT && (
                <PrimaryButton
                  title="Mark No Gym"
                  onPress={handleSetNoGym}
                  variant="secondary"
                  style={styles.actionButton}
                  accessibilityLabel="Mark day as no gym"
                  accessibilityHint="Replaces the current session with no gym"
                  />
                )}
            </SheetActions>
          ) : (
            <PrimaryButton
              title="Mark No Gym"
              onPress={handleSetNoGym}
              variant="secondary"
              style={styles.markButton}
              accessibilityLabel="Mark this day as no gym"
            />
          )}
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
    borderTopLeftRadius: DESIGN_SYSTEM.sheet.topRadius,
    borderTopRightRadius: DESIGN_SYSTEM.sheet.topRadius,
    paddingTop: 12,
    paddingHorizontal: DESIGN_SYSTEM.sheet.horizontalPadding,
    paddingBottom: 24,
    borderWidth: 1,
    borderBottomWidth: 0,
    maxHeight: '90%',
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
    paddingHorizontal: DESIGN_SYSTEM.sheet.horizontalPadding,
  },
  detailScroll: {
    maxHeight: 400,
    paddingHorizontal: DESIGN_SYSTEM.sheet.horizontalPadding,
  },
  label: {
    ...sectionHeadingTextStyle,
    marginBottom: 4,
  },
  date: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 20,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  statusText: {
    fontSize: 15,
    fontWeight: '600',
  },
  timeText: {
    fontSize: 14,
  },
  sessionInfo: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    gap: 8,
    marginBottom: 16,
  },
  sessionLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  sessionSplit: {
    fontSize: 18,
    fontWeight: '800',
  },
  sessionHint: {
    fontSize: 12,
  },
  actions: {},
  actionButton: {
    flex: 1,
  },
  emptyContent: {
    paddingVertical: 20,
    alignItems: 'center',
    gap: 8,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '700',
  },
  emptyHint: {
    fontSize: 13,
  },
  markButton: {
    marginTop: 12,
    width: '100%',
  },
  editOptions: {
    gap: 10,
    width: '100%',
    paddingBottom: 16,
  },
  editScroll: {
    maxHeight: 320,
    width: '100%',
    marginBottom: 16,
  },
  templatesLabel: {
    ...sectionHeadingTextStyle,
    letterSpacing: 1.2,
    marginTop: 4,
  },
  splitOption: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    gap: 12,
  },
  splitOptionSelected: {
    borderWidth: 1,
  },
  splitOptionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
  },
  noGymOption: {
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  noGymText: {
    fontSize: 15,
    fontWeight: '700',
  },
  notesSection: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  notesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  notesLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  editNotesButton: {
    fontSize: 14,
    fontWeight: '700',
  },
  notesText: {
    fontSize: 14,
    lineHeight: 20,
  },
  notesEditContainer: {
    gap: 12,
  },
  notesInput: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
    maxHeight: 120,
  },
  notesEditActions: {
    gap: 10,
  },
  notesCancelBtn: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  notesCancelText: {
    fontSize: 14,
    fontWeight: '700',
  },
  notesSaveBtn: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  notesSaveText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
  },
  performanceSection: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
    gap: 10,
  },
  performanceTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  performanceList: {
    gap: 10,
  },
  performanceExercise: {
    gap: 4,
  },
  performanceExerciseName: {
    fontSize: 14,
    fontWeight: '700',
  },
  performanceSets: {
    gap: 2,
  },
  performanceSetText: {
    fontSize: 13,
  },
});

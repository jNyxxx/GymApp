import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useColors } from '../../context/ThemeContext';
import { GymEntry } from '../../models/GymEntry';
import { GymStatus } from '../../models/GymStatus';
import { SPLIT_LABELS, WorkoutSplit } from '../../models/WorkoutSplit';
import { formatFriendly } from '../../services/DateLogicService';
import { GymLogService } from '../../services/GymLogService';
import SplitIcon from '../shared/SplitIcon';

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
  const [editing, setEditing] = useState(false);
  const friendlyDate = formatFriendly(dateKey);

  const handleSetWent = async (split: WorkoutSplit) => {
    await GymLogService.saveEntry(GymStatus.WENT, split, dateKey);
    setEditing(false);
    onEntryUpdated();
  };

  const handleSetNoGym = async () => {
    await GymLogService.saveEntry(GymStatus.NO_GYM, undefined, dateKey);
    setEditing(false);
    onEntryUpdated();
  };

  const handleDelete = async () => {
    await GymLogService.deleteEntry(dateKey);
    setEditing(false);
    onEntryUpdated();
  };

  const loggedTime = entry?.loggedAt
    ? new Date(entry.loggedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    : '';

  if (editing) {
    return (
      <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
        <SafeAreaView style={[styles.overlay, { backgroundColor: colors.overlay }]}>
          <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
          <View style={[styles.sheet, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
            <View style={[styles.handle, { backgroundColor: colors.grayLight }]} />
            <Text style={[styles.sheetTitle, { color: colors.text }]}>Change session</Text>

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
              <TouchableOpacity
                style={[styles.noGymOption, { backgroundColor: colors.cardBgAlt, borderColor: colors.cardBorder }]}
                onPress={handleSetNoGym}
              >
                <Text style={[styles.noGymText, { color: colors.textSecondary }]}>✕  No gym</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.cancelButton} onPress={() => setEditing(false)}>
              <Text style={[styles.cancelText, { color: colors.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={[styles.overlay, { backgroundColor: colors.overlay }]}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        <View style={[styles.sheet, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
          <View style={[styles.handle, { backgroundColor: colors.grayLight }]} />
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
                    Session picked for this date:
                  </Text>
                  <Text style={[styles.sessionSplit, { color: colors.text }]}>{SPLIT_LABELS[entry.split]}</Text>
                  <Text style={[styles.sessionHint, { color: colors.textMuted }]}>
                    This is the exact split you tapped after pressing WE GO GYM.
                  </Text>
                </View>
              )}

              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.changeButton, { backgroundColor: colors.primary }]}
                  onPress={() => setEditing(true)}
                >
                  <Text style={styles.changeButtonText}>Change session</Text>
                </TouchableOpacity>
                {entry.status === GymStatus.WENT && (
                  <TouchableOpacity
                    style={[styles.noGymButton, { backgroundColor: colors.cardBgAlt, borderColor: colors.cardBorder }]}
                    onPress={handleSetNoGym}
                  >
                    <Text style={[styles.noGymButtonText, { color: colors.textSecondary }]}>Mark No Gym</Text>
                  </TouchableOpacity>
                )}
              </View>
            </>
          ) : (
            <View style={styles.emptyContent}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No entry for this day</Text>
              <Text style={[styles.emptyHint, { color: colors.textMuted }]}>This day is unanswered</Text>
              <TouchableOpacity
                style={[styles.markButton, { backgroundColor: colors.gray }]}
                onPress={handleSetNoGym}
              >
                <Text style={[styles.markButtonText, { color: colors.textSecondary }]}>Mark as No Gym</Text>
              </TouchableOpacity>
            </View>
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
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingHorizontal: 24,
    paddingBottom: 40,
    borderWidth: 1,
    borderBottomWidth: 0,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 12,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    fontWeight: '700',
  },
  date: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 16,
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
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  changeButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  changeButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#000',
  },
  noGymButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
  },
  noGymButtonText: {
    fontSize: 15,
    fontWeight: '700',
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
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  markButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  editOptions: {
    gap: 10,
    width: '100%',
    marginBottom: 16,
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
  cancelButton: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '700',
  },
});

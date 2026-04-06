import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useColors } from '../../context/ThemeContext';
import { WorkoutSplit, SPLIT_LABELS } from '../../models/WorkoutSplit';
import SplitIcon from '../shared/SplitIcon';

interface SplitPickerSheetProps {
  visible: boolean;
  onSelect: (split: WorkoutSplit) => void;
  onClose: () => void;
  currentSplit?: WorkoutSplit;
}

const SPLITS = [
  WorkoutSplit.UPPER,
  WorkoutSplit.LOWER,
  WorkoutSplit.PUSH,
  WorkoutSplit.PULL,
  WorkoutSplit.LEGS,
];

export default function SplitPickerSheet({
  visible,
  onSelect,
  onClose,
  currentSplit,
}: SplitPickerSheetProps) {
  const colors = useColors();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.overlay, { backgroundColor: colors.overlay }]}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        <View style={[styles.sheet, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
          <View style={[styles.handle, { backgroundColor: colors.grayLight }]} />
          <Text style={[styles.title, { color: colors.text }]}>Pick your split</Text>

          <View style={styles.options}>
            {SPLITS.map((split) => {
              const isSelected = split === currentSplit;
              return (
                <TouchableOpacity
                  key={split}
                  style={[
                    styles.option,
                    { backgroundColor: colors.cardBgAlt, borderColor: colors.cardBorder },
                    isSelected && [styles.selectedOption, { borderColor: colors.primary, backgroundColor: colors.primaryGlow }],
                  ]}
                  onPress={() => onSelect(split)}
                >
                  <SplitIcon split={split} size="sm" style={isSelected ? { borderColor: colors.primary + '60' } : undefined} />
                  <Text
                    style={[
                      styles.optionLabel,
                      { color: colors.text },
                      isSelected && { color: colors.primary },
                    ]}
                  >
                    {SPLIT_LABELS[split]}
                  </Text>
                  {isSelected && <Text style={[styles.checkmark, { color: colors.primary }]}>✓</Text>}
                </TouchableOpacity>
              );
            })}
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
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 24,
  },
  options: {
    gap: 10,
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
  selectedOption: {
    borderWidth: 1,
  },
  optionLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
  },
  checkmark: {
    fontSize: 18,
    fontWeight: '800',
  },
});

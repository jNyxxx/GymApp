import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useColors } from '../../context/ThemeContext';
import { CustomSplitService, CustomSplit } from '../../services/CustomSplitService';

interface CustomSplitsCardProps {
  onSplitsChanged?: () => void;
}

export default function CustomSplitsCard({ onSplitsChanged }: CustomSplitsCardProps) {
  const colors = useColors();
  const [customSplits, setCustomSplits] = useState<CustomSplit[]>([]);
  const [adding, setAdding] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newEmoji, setNewEmoji] = useState('');

  const loadSplits = async () => {
    const splits = await CustomSplitService.getAll();
    setCustomSplits(splits);
  };

  useEffect(() => {
    loadSplits();
  }, []);

  const handleAddSplit = async () => {
    if (!newLabel.trim()) {
      Alert.alert('Error', 'Please enter a split name');
      return;
    }

    await CustomSplitService.add(newLabel, newEmoji);
    setNewLabel('');
    setNewEmoji('');
    setAdding(false);
    await loadSplits();
    onSplitsChanged?.();
  };

  const handleDeleteSplit = async (split: CustomSplit) => {
    Alert.alert(
      'Delete Split',
      `Are you sure you want to delete "${split.label}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await CustomSplitService.delete(split.id);
            await loadSplits();
            onSplitsChanged?.();
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
      <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>Custom Splits</Text>

      {customSplits.length > 0 && (
        <View style={styles.splitsList}>
          {customSplits.map((split) => (
            <View 
              key={split.id} 
              style={[styles.splitRow, { backgroundColor: colors.cardBgAlt, borderColor: colors.cardBorder }]}
            >
              <View style={styles.splitInfo}>
                {split.emoji && <Text style={styles.splitEmoji}>{split.emoji}</Text>}
                <Text style={[styles.splitLabel, { color: colors.text }]}>{split.label}</Text>
              </View>
              <TouchableOpacity
                onPress={() => handleDeleteSplit(split)}
                style={[styles.deleteButton, { backgroundColor: colors.dangerBg }]}
              >
                <Text style={[styles.deleteText, { color: colors.danger }]}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {adding ? (
        <View style={styles.addForm}>
          <View style={styles.inputRow}>
            <TextInput
              style={[
                styles.emojiInput,
                { backgroundColor: colors.cardBgAlt, borderColor: colors.cardBorder, color: colors.text },
              ]}
              placeholder="🏋️"
              placeholderTextColor={colors.textMuted}
              value={newEmoji}
              onChangeText={setNewEmoji}
              maxLength={2}
            />
            <TextInput
              style={[
                styles.labelInput,
                { backgroundColor: colors.cardBgAlt, borderColor: colors.cardBorder, color: colors.text },
              ]}
              placeholder="Split name"
              placeholderTextColor={colors.textMuted}
              value={newLabel}
              onChangeText={setNewLabel}
              maxLength={20}
              autoFocus
            />
          </View>
          <View style={styles.addActions}>
            <TouchableOpacity
              style={[styles.cancelButton, { backgroundColor: colors.gray }]}
              onPress={() => {
                setAdding(false);
                setNewLabel('');
                setNewEmoji('');
              }}
            >
              <Text style={[styles.cancelText, { color: colors.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: colors.primary }]}
              onPress={handleAddSplit}
            >
              <Text style={styles.saveText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.cardBgAlt, borderColor: colors.cardBorder }]}
          onPress={() => setAdding(true)}
        >
          <Text style={[styles.addButtonText, { color: colors.primary }]}>+ Add Custom Split</Text>
        </TouchableOpacity>
      )}

      <Text style={[styles.hint, { color: colors.textMuted }]}>
        Create your own workout types beyond the built-in splits.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    gap: 16,
  },
  sectionLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    fontWeight: '700',
  },
  splitsList: {
    gap: 8,
  },
  splitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
  },
  splitInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  splitEmoji: {
    fontSize: 18,
  },
  splitLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  deleteButton: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteText: {
    fontSize: 20,
    fontWeight: '700',
  },
  addForm: {
    gap: 12,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  emojiInput: {
    width: 50,
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    fontSize: 18,
    textAlign: 'center',
  },
  labelInput: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    fontSize: 15,
  },
  addActions: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '700',
  },
  saveButton: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
  },
  addButton: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  hint: {
    fontSize: 12,
    lineHeight: 18,
  },
});

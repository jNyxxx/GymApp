import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../context/ThemeContext';
import { WorkoutTemplate, SetEntry } from '../../models/WorkoutTemplate';

interface TemplateCardProps {
  template: WorkoutTemplate;
  onSelect: (template: WorkoutTemplate) => void;
  onDelete: (template: WorkoutTemplate) => void;
}

export default function TemplateCard({ template, onSelect, onDelete }: TemplateCardProps) {
  const colors = useColors();

  const handleLongPress = () => {
    onDelete(template);
  };

  return (
    <Pressable
      onPress={() => onSelect(template)}
      onLongPress={handleLongPress}
      delayLongPress={500}
      accessibilityRole="button"
      accessibilityLabel={`${template.name} template`}
      accessibilityHint="Tap to edit template. Long press to delete."
    >
      <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {template.emoji ? (
              <View style={[styles.iconContainer, { backgroundColor: colors.primaryGlow }]}>
                <Text style={styles.icon}>{template.emoji}</Text>
              </View>
            ) : (
              <View style={[styles.iconContainer, { backgroundColor: colors.primaryGlow }]}>
                <Ionicons name="barbell-outline" size={16} color={colors.primary} />
              </View>
            )}
            <View style={styles.headerText}>
              <Text style={[styles.name, { color: colors.text }]}>{template.name}</Text>
              <Text style={[styles.meta, { color: colors.textMuted }]}>
                {template.exercises.length} {template.exercises.length === 1 ? 'exercise' : 'exercises'}
                {' · '}
                {getTotalSets(template.exercises)} total sets
              </Text>
            </View>
          </View>

          <View style={[styles.arrowContainer, { backgroundColor: colors.gray }]}>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

function getTotalSets(exercises: { sets: SetEntry[] }[]): number {
  return exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 18 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconContainer: {
    width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  icon: { fontSize: 18 },
  headerText: { flex: 1 },
  name: { fontSize: 17, fontWeight: '700', marginBottom: 2 },
  meta: { fontSize: 12, fontWeight: '600' },
  arrowContainer: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
});

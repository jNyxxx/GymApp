import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  SafeAreaView,
  TextInput,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../context/ThemeContext';
import { WorkoutTemplate } from '../../models/WorkoutTemplate';
import { WorkoutTemplateService } from '../../services/WorkoutTemplateService';
import TemplateCard from './TemplateCard';
import TemplateDetailView from './TemplateDetailView';
import PrimaryButton from '../shared/PrimaryButton';

export default function TemplatesView() {
  const colors = useColors();
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<WorkoutTemplate | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');

  const loadTemplates = useCallback(async () => {
    setLoading(true);
    const allTemplates = await WorkoutTemplateService.getAll();
    setTemplates(allTemplates);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  useFocusEffect(
    useCallback(() => {
      loadTemplates();
    }, [loadTemplates])
  );

  const handleCreateNew = () => {
    setNewTemplateName('');
    setShowCreateModal(true);
  };

  const handleCreateConfirm = async () => {
    const trimmed = newTemplateName.trim();
    if (!trimmed) return;

    const template = await WorkoutTemplateService.create(trimmed);
    setShowCreateModal(false);
    setSelectedTemplate(template);
    loadTemplates();
  };

  const handleSelectTemplate = (template: WorkoutTemplate) => {
    setSelectedTemplate(template);
  };

  const handleDelete = (template: WorkoutTemplate) => {
    Alert.alert(
      'Delete Template',
      `Delete "${template.name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await WorkoutTemplateService.delete(template.id);
            loadTemplates();
          },
        },
      ]
    );
  };

  const handleBack = () => {
    setSelectedTemplate(null);
    loadTemplates();
  };

  const totalExercises = templates.reduce((sum, t) => sum + t.exercises.length, 0);
  const totalSets = templates.reduce((sum, t) => sum + t.exercises.reduce((s, e) => s + e.sets.length, 0), 0);

  // Show detail view if a template is selected
  if (selectedTemplate) {
    return (
      <TemplateDetailView
        template={selectedTemplate}
        onBack={handleBack}
        onSaved={loadTemplates}
      />
    );
  }

  // Show list view
  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
        <View style={styles.headerLeft}>
          <Text style={[styles.title, { color: colors.text }]}>Workout Templates</Text>
          {templates.length > 0 && (
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              {templates.length} template{templates.length !== 1 ? 's' : ''} · {totalExercises} exercises · {totalSets} sets
            </Text>
          )}
        </View>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={handleCreateNew}
          accessibilityRole="button"
          accessibilityLabel="Create template"
          accessibilityHint="Opens the create template dialog"
        >
          <Ionicons name="add" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <Text style={[styles.loadingText, { color: colors.textMuted }]}>
            Loading templates...
          </Text>
        ) : templates.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIconContainer, { backgroundColor: colors.primaryGlow }]}>
              <Ionicons name="barbell-outline" size={48} color={colors.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              No Templates Yet
            </Text>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              Create reusable workout templates to quickly log your sessions.
            </Text>
            <TouchableOpacity
              style={[styles.emptyButton, { backgroundColor: colors.primary }]}
              onPress={handleCreateNew}
              accessibilityRole="button"
              accessibilityLabel="Create first template"
              accessibilityHint="Opens the create template dialog"
            >
              <Ionicons name="add-circle-outline" size={20} color="#000" />
              <Text style={styles.emptyButtonText}>Create Your First Template</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.templateList}>
            {templates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onSelect={handleSelectTemplate}
                onDelete={handleDelete}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <Modal visible={showCreateModal} transparent animationType="fade" onRequestClose={() => setShowCreateModal(false)}>
        <SafeAreaView style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setShowCreateModal(false)} />
          <View style={[styles.modalCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>New Template</Text>
            <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
              Enter a name for your workout template
            </Text>

            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.cardBgAlt, borderColor: colors.cardBorder, color: colors.text }]}
              placeholder="e.g. Push Day"
              placeholderTextColor={colors.textMuted}
              value={newTemplateName}
              onChangeText={setNewTemplateName}
              autoFocus
              maxLength={40}
              accessibilityLabel="Template name"
            />

            <View style={styles.modalActions}>
              <PrimaryButton
                title="Cancel"
                onPress={() => setShowCreateModal(false)}
                variant="secondary"
                style={styles.modalActionButton}
                accessibilityLabel="Cancel creating template"
              />
              <PrimaryButton
                title="Create"
                onPress={handleCreateConfirm}
                variant="primary"
                style={[styles.modalActionButton, !newTemplateName.trim() && styles.disabledButton]}
                disabled={!newTemplateName.trim()}
                accessibilityLabel="Create template"
                accessibilityHint="Creates a new workout template"
              />
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerLeft: { flex: 1 },
  title: { fontSize: 28, fontWeight: '800', lineHeight: 34 },
  subtitle: { fontSize: 13, fontWeight: '500', marginTop: 4 },
  addButton: {
    width: 42, height: 42, borderRadius: 21,
    justifyContent: 'center', alignItems: 'center',
  },
  scrollView: { flex: 1 },
  scrollContent: { padding: 20, gap: 14 },
  loadingText: { fontSize: 14, textAlign: 'center', paddingVertical: 40 },
  emptyState: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    paddingVertical: 80, paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 80, height: 80, borderRadius: 40,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: { fontSize: 22, fontWeight: '800', marginBottom: 8, textAlign: 'center' },
  emptyText: { fontSize: 14, textAlign: 'center', marginBottom: 28, lineHeight: 20 },
  emptyButton: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 24, paddingVertical: 14, borderRadius: 14,
  },
  emptyButtonText: { color: '#000', fontSize: 15, fontWeight: '700' },
  templateList: { gap: 14 },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  modalBackdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  modalCard: {
    width: '88%',
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    gap: 12,
  },
  modalTitle: { fontSize: 20, fontWeight: '800' },
  modalSubtitle: { fontSize: 13 },
  modalInput: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  modalActionButton: { flex: 1 },
  disabledButton: { opacity: 0.5 },
});

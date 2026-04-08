const fs = require('fs');
const path = require('path');

// Create templates directory
const templatesDir = path.join(__dirname, 'GymApp', 'components', 'templates');
if (!fs.existsSync(templatesDir)) {
  fs.mkdirSync(templatesDir, { recursive: true });
  console.log('Created templates directory');
}

// Create TemplatesView.tsx
const templatesViewContent = `import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../context/ThemeContext';
import { WorkoutTemplate } from '../../models/WorkoutTemplate';
import { WorkoutTemplateService } from '../../services/WorkoutTemplateService';
import TemplateCard from './TemplateCard';
import TemplateEditorSheet from '../home/TemplateEditorSheet';

export default function TemplatesView() {
  const colors = useColors();
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editorVisible, setEditorVisible] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<WorkoutTemplate | null>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    const allTemplates = await WorkoutTemplateService.getAll();
    setTemplates(allTemplates);
    setLoading(false);
  };

  const handleCreateNew = () => {
    setEditingTemplate(null);
    setEditorVisible(true);
  };

  const handleEdit = (template: WorkoutTemplate) => {
    setEditingTemplate(template);
    setEditorVisible(true);
  };

  const handleDelete = (template: WorkoutTemplate) => {
    Alert.alert(
      'Delete Template',
      \`Are you sure you want to delete "\${template.name}"?\`,
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

  const handleEditorClose = () => {
    setEditorVisible(false);
    setEditingTemplate(null);
  };

  const handleEditorSaved = () => {
    loadTemplates();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
        <Text style={[styles.title, { color: colors.text }]}>Workout Templates</Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={handleCreateNew}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>
            Loading templates...
          </Text>
        ) : templates.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="barbell-outline" size={64} color={colors.textMuted} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              No Templates Yet
            </Text>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              Create your first workout template to get started!
            </Text>
            <TouchableOpacity
              style={[styles.emptyButton, { backgroundColor: colors.primary }]}
              onPress={handleCreateNew}
            >
              <Text style={styles.emptyButtonText}>Create Template</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.templateList}>
            {templates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Template Editor Modal */}
      <TemplateEditorSheet
        visible={editorVisible}
        template={editingTemplate}
        onClose={handleEditorClose}
        onSaved={handleEditorSaved}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  templateList: {
    gap: 12,
  },
});
`;

fs.writeFileSync(path.join(templatesDir, 'TemplatesView.tsx'), templatesViewContent);
console.log('Created TemplatesView.tsx');

// Create TemplateCard.tsx
const templateCardContent = `import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../context/ThemeContext';
import { WorkoutTemplate } from '../../models/WorkoutTemplate';

interface TemplateCardProps {
  template: WorkoutTemplate;
  onEdit: (template: WorkoutTemplate) => void;
  onDelete: (template: WorkoutTemplate) => void;
}

export default function TemplateCard({ template, onEdit, onDelete }: TemplateCardProps) {
  const colors = useColors();
  const [expanded, setExpanded] = useState(false);

  const handleToggleExpand = () => {
    setExpanded(!expanded);
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
      {/* Header */}
      <Pressable onPress={handleToggleExpand}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {template.emoji && (
              <Text style={styles.emoji}>{template.emoji}</Text>
            )}
            <View style={styles.headerText}>
              <Text style={[styles.name, { color: colors.text }]}>{template.name}</Text>
              <Text style={[styles.exerciseCount, { color: colors.textMuted }]}>
                {template.exercises.length} {template.exercises.length === 1 ? 'exercise' : 'exercises'}
              </Text>
            </View>
          </View>

          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => onEdit(template)}
            >
              <Ionicons name="pencil" size={20} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => onDelete(template)}
            >
              <Ionicons name="trash-outline" size={20} color={colors.danger} />
            </TouchableOpacity>
            <Ionicons
              name={expanded ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={colors.textMuted}
            />
          </View>
        </View>
      </Pressable>

      {/* Expanded Exercise List */}
      {expanded && template.exercises.length > 0 && (
        <View style={[styles.exerciseList, { borderTopColor: colors.cardBorder }]}>
          {template.exercises.map((exercise, index) => (
            <View key={exercise.id} style={styles.exerciseItem}>
              <Text style={[styles.exerciseNumber, { color: colors.textMuted }]}>
                {index + 1}.
              </Text>
              <Text style={[styles.exerciseName, { color: colors.text }]}>
                {exercise.name}
              </Text>
              {(exercise.sets || exercise.reps) && (
                <Text style={[styles.exerciseDetails, { color: colors.textMuted }]}>
                  {exercise.sets && \`\${exercise.sets} sets\`}
                  {exercise.sets && exercise.reps && ' × '}
                  {exercise.reps && exercise.reps}
                </Text>
              )}
            </View>
          ))}
        </View>
      )}

      {expanded && template.exercises.length === 0 && (
        <View style={[styles.exerciseList, { borderTopColor: colors.cardBorder }]}>
          <Text style={[styles.emptyExercises, { color: colors.textMuted }]}>
            No exercises added yet
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  emoji: {
    fontSize: 32,
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  exerciseCount: {
    fontSize: 13,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    padding: 4,
  },
  exerciseList: {
    borderTopWidth: 1,
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  exerciseNumber: {
    fontSize: 14,
    marginRight: 8,
    minWidth: 20,
  },
  exerciseName: {
    fontSize: 15,
    flex: 1,
  },
  exerciseDetails: {
    fontSize: 13,
    marginLeft: 8,
  },
  emptyExercises: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
`;

fs.writeFileSync(path.join(templatesDir, 'TemplateCard.tsx'), templateCardContent);
console.log('Created TemplateCard.tsx');

console.log('✅ All template files created successfully!');

@echo off
echo Creating Templates directory and files...

mkdir "GymApp\components\templates" 2>nul

echo Creating TemplatesView.tsx...
(
echo import React, { useState, useEffect } from 'react';
echo import {
echo   View,
echo   Text,
echo   ScrollView,
echo   TouchableOpacity,
echo   StyleSheet,
echo   Alert,
echo } from 'react-native';
echo import { Ionicons } from '@expo/vector-icons';
echo import { useColors } from '../../context/ThemeContext';
echo import { WorkoutTemplate } from '../../models/WorkoutTemplate';
echo import { WorkoutTemplateService } from '../../services/WorkoutTemplateService';
echo import TemplateCard from './TemplateCard';
echo import TemplateEditorSheet from '../home/TemplateEditorSheet';
echo.
echo export default function TemplatesView^(^) {
echo   const colors = useColors^(^);
echo   const [templates, setTemplates] = useState^<WorkoutTemplate[]^>^([]^);
echo   const [loading, setLoading] = useState^(true^);
echo   const [editorVisible, setEditorVisible] = useState^(false^);
echo   const [editingTemplate, setEditingTemplate] = useState^<WorkoutTemplate ^| null^>^(null^);
echo.
echo   useEffect^(^(^) =^> {
echo     loadTemplates^(^);
echo   }, []^);
echo.
echo   const loadTemplates = async ^(^) =^> {
echo     setLoading^(true^);
echo     const allTemplates = await WorkoutTemplateService.getAll^(^);
echo     setTemplates^(allTemplates^);
echo     setLoading^(false^);
echo   };
echo.
echo   const handleCreateNew = ^(^) =^> {
echo     setEditingTemplate^(null^);
echo     setEditorVisible^(true^);
echo   };
echo.
echo   const handleEdit = ^(template: WorkoutTemplate^) =^> {
echo     setEditingTemplate^(template^);
echo     setEditorVisible^(true^);
echo   };
echo.
echo   const handleDelete = ^(template: WorkoutTemplate^) =^> {
echo     Alert.alert^(
echo       'Delete Template',
echo       `Are you sure you want to delete "${template.name}"?`,
echo       [
echo         { text: 'Cancel', style: 'cancel' },
echo         {
echo           text: 'Delete',
echo           style: 'destructive',
echo           onPress: async ^(^) =^> {
echo             await WorkoutTemplateService.delete^(template.id^);
echo             loadTemplates^(^);
echo           },
echo         },
echo       ]
echo     ^);
echo   };
echo.
echo   const handleEditorClose = ^(^) =^> {
echo     setEditorVisible^(false^);
echo     setEditingTemplate^(null^);
echo   };
echo.
echo   const handleEditorSaved = ^(^) =^> {
echo     loadTemplates^(^);
echo   };
echo.
echo   return ^(
echo     ^<View style={styles.container}^>
echo       {/* Header */}
echo       ^<View style={[styles.header, { borderBottomColor: colors.cardBorder }]}^>
echo         ^<Text style={[styles.title, { color: colors.text }]}^>Workout Templates^</Text^>
echo         ^<TouchableOpacity
echo           style={[styles.addButton, { backgroundColor: colors.primary }]}
echo           onPress={handleCreateNew}
echo         ^>
echo           ^<Ionicons name="add" size={24} color="#FFFFFF" /^>
echo         ^</TouchableOpacity^>
echo       ^</View^>
echo.
echo       {/* Content */}
echo       ^<ScrollView
echo         style={styles.scrollView}
echo         contentContainerStyle={styles.scrollContent}
echo         showsVerticalScrollIndicator={false}
echo       ^>
echo         {loading ? ^(
echo           ^<Text style={[styles.emptyText, { color: colors.textMuted }]}^>
echo             Loading templates...
echo           ^</Text^>
echo         ^) : templates.length === 0 ? ^(
echo           ^<View style={styles.emptyState}^>
echo             ^<Ionicons name="barbell-outline" size={64} color={colors.textMuted} /^>
echo             ^<Text style={[styles.emptyTitle, { color: colors.text }]}^>
echo               No Templates Yet
echo             ^</Text^>
echo             ^<Text style={[styles.emptyText, { color: colors.textMuted }]}^>
echo               Create your first workout template to get started!
echo             ^</Text^>
echo             ^<TouchableOpacity
echo               style={[styles.emptyButton, { backgroundColor: colors.primary }]}
echo               onPress={handleCreateNew}
echo             ^>
echo               ^<Text style={styles.emptyButtonText}^>Create Template^</Text^>
echo             ^</TouchableOpacity^>
echo           ^</View^>
echo         ^) : ^(
echo           ^<View style={styles.templateList}^>
echo             {templates.map^(^(template^) =^> ^(
echo               ^<TemplateCard
echo                 key={template.id}
echo                 template={template}
echo                 onEdit={handleEdit}
echo                 onDelete={handleDelete}
echo               /^>
echo             ^)^)}
echo           ^</View^>
echo         ^)}
echo       ^</ScrollView^>
echo.
echo       {/* Template Editor Modal */}
echo       ^<TemplateEditorSheet
echo         visible={editorVisible}
echo         template={editingTemplate}
echo         onClose={handleEditorClose}
echo         onSaved={handleEditorSaved}
echo       /^>
echo     ^</View^>
echo   ^);
echo }
echo.
echo const styles = StyleSheet.create^({
echo   container: {
echo     flex: 1,
echo   },
echo   header: {
echo     flexDirection: 'row',
echo     justifyContent: 'space-between',
echo     alignItems: 'center',
echo     paddingHorizontal: 20,
echo     paddingVertical: 16,
echo     borderBottomWidth: 1,
echo   },
echo   title: {
echo     fontSize: 28,
echo     fontWeight: '700',
echo   },
echo   addButton: {
echo     width: 40,
echo     height: 40,
echo     borderRadius: 20,
echo     justifyContent: 'center',
echo     alignItems: 'center',
echo   },
echo   scrollView: {
echo     flex: 1,
echo   },
echo   scrollContent: {
echo     padding: 20,
echo   },
echo   emptyState: {
echo     flex: 1,
echo     justifyContent: 'center',
echo     alignItems: 'center',
echo     paddingVertical: 80,
echo   },
echo   emptyTitle: {
echo     fontSize: 20,
echo     fontWeight: '700',
echo     marginTop: 16,
echo     marginBottom: 8,
echo   },
echo   emptyText: {
echo     fontSize: 14,
echo     textAlign: 'center',
echo     marginBottom: 24,
echo   },
echo   emptyButton: {
echo     paddingHorizontal: 24,
echo     paddingVertical: 12,
echo     borderRadius: 12,
echo   },
echo   emptyButtonText: {
echo     color: '#FFFFFF',
echo     fontSize: 16,
echo     fontWeight: '600',
echo   },
echo   templateList: {
echo     gap: 12,
echo   },
echo }^);
) > "GymApp\components\templates\TemplatesView.tsx"

echo.
echo ✓ Files created successfully!
echo.
echo Please run: node create-templates.js
echo Or manually create the TemplateCard.tsx file from create-templates.js

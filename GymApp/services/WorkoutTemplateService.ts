import AsyncStorage from '@react-native-async-storage/async-storage';
import { WorkoutTemplate, Exercise, SetEntry, generateTemplateId, generateExerciseId, generateSetId } from '../models/WorkoutTemplate';
import { STORAGE_KEYS } from '../constants/Constants';
import { DataMigrationService } from './DataMigrationService';

const STORAGE_KEY = STORAGE_KEYS.WORKOUT_TEMPLATES;

/**
 * Service for managing workout templates (custom splits with exercises).
 */
export class WorkoutTemplateService {
  /**
   * Get all workout templates (with auto-migration of old format).
   */
  static async getAll(): Promise<WorkoutTemplate[]> {
    try {
      return await DataMigrationService.getTemplates();
    } catch (error) {
      console.error('[WorkoutTemplateService] Failed to load templates:', error);
      return [];
    }
  }

  /**
   * Get a single template by ID (with auto-migration).
   */
  static async getById(id: string): Promise<WorkoutTemplate | null> {
    const templates = await this.getAll();
    return templates.find((t) => t.id === id) || null;
  }

  /**
   * Create a new workout template.
   */
  static async create(name: string, emoji?: string, exercises: Exercise[] = []): Promise<WorkoutTemplate> {
    const templates = await this.getAll();
    const now = new Date().toISOString();
    
    const newTemplate: WorkoutTemplate = {
      id: generateTemplateId(name),
      name: name.trim(),
      emoji: emoji?.trim() || undefined,
      exercises,
      createdAt: now,
      updatedAt: now,
    };
    
    templates.push(newTemplate);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
    
    return newTemplate;
  }

  /**
   * Update a workout template.
   */
  static async update(id: string, updates: Partial<Pick<WorkoutTemplate, 'name' | 'emoji' | 'exercises'>>): Promise<WorkoutTemplate | null> {
    const templates = await this.getAll();
    const index = templates.findIndex((t) => t.id === id);
    
    if (index === -1) return null;
    
    templates[index] = {
      ...templates[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
    return templates[index];
  }

  /**
   * Add an exercise to a template with a single default set.
   */
  static async addExercise(templateId: string, exerciseName: string, reps?: string, weight?: string): Promise<WorkoutTemplate | null> {
    const template = await this.getById(templateId);
    if (!template) return null;

    const defaultSet: SetEntry = {
      id: generateSetId(),
      reps: reps || '',
      weight: weight || '',
    };

    const newExercise: Exercise = {
      id: generateExerciseId(),
      name: exerciseName.trim(),
      sets: [defaultSet],
    };

    return this.update(templateId, {
      exercises: [...template.exercises, newExercise],
    });
  }

  /**
   * Remove an exercise from a template.
   */
  static async removeExercise(templateId: string, exerciseId: string): Promise<WorkoutTemplate | null> {
    const template = await this.getById(templateId);
    if (!template) return null;
    
    return this.update(templateId, {
      exercises: template.exercises.filter((e) => e.id !== exerciseId),
    });
  }

  /**
   * Delete a workout template.
   */
  static async delete(id: string): Promise<void> {
    const templates = await this.getAll();
    const filtered = templates.filter((t) => t.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  }

  /**
   * Check if a split ID is a template.
   */
  static isTemplate(splitId: string): boolean {
    return splitId.startsWith('template_');
  }

  /**
   * Migrate old custom splits to templates.
   */
  static async migrateFromCustomSplits(): Promise<void> {
    try {
      const oldSplits = await AsyncStorage.getItem('custom_splits');
      if (!oldSplits) return;
      
      const parsed = JSON.parse(oldSplits);
      if (!Array.isArray(parsed) || parsed.length === 0) return;
      
      const templates = await this.getAll();
      
      for (const split of parsed) {
        // Check if already migrated
        const existingId = `template_${split.label.toLowerCase().replace(/\s+/g, '_')}`;
        const alreadyExists = templates.some((t) => t.id.startsWith(existingId.slice(0, existingId.length - 13)));
        
        if (!alreadyExists) {
          await this.create(split.label, split.emoji, []);
        }
      }
      
      // Clear old custom splits
      await AsyncStorage.removeItem('custom_splits');
    } catch (error) {
      console.error('[WorkoutTemplateService] Migration failed:', error);
    }
  }
}

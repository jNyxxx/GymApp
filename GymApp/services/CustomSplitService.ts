import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/Constants';

export interface CustomSplit {
  id: string;
  label: string;
  emoji?: string;
  createdAt: string;
}

/**
 * Service for managing custom workout splits.
 */
export class CustomSplitService {
  /**
   * Get all custom splits.
   */
  static async getAll(): Promise<CustomSplit[]> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.CUSTOM_SPLITS);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch (error) {
      console.error('[CustomSplitService] Failed to load custom splits:', error);
      return [];
    }
  }

  /**
   * Add a new custom split.
   */
  static async add(label: string, emoji?: string): Promise<CustomSplit> {
    const splits = await this.getAll();
    
    // Generate a unique ID based on label
    const id = `custom_${label.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`;
    
    const newSplit: CustomSplit = {
      id,
      label: label.trim(),
      emoji: emoji?.trim() || undefined,
      createdAt: new Date().toISOString(),
    };
    
    splits.push(newSplit);
    await AsyncStorage.setItem(STORAGE_KEYS.CUSTOM_SPLITS, JSON.stringify(splits));
    
    return newSplit;
  }

  /**
   * Update an existing custom split.
   */
  static async update(id: string, label: string, emoji?: string): Promise<CustomSplit | null> {
    const splits = await this.getAll();
    const index = splits.findIndex((s) => s.id === id);
    
    if (index === -1) return null;
    
    splits[index] = {
      ...splits[index],
      label: label.trim(),
      emoji: emoji?.trim() || undefined,
    };
    
    await AsyncStorage.setItem(STORAGE_KEYS.CUSTOM_SPLITS, JSON.stringify(splits));
    return splits[index];
  }

  /**
   * Delete a custom split.
   */
  static async delete(id: string): Promise<void> {
    const splits = await this.getAll();
    const filtered = splits.filter((s) => s.id !== id);
    await AsyncStorage.setItem(STORAGE_KEYS.CUSTOM_SPLITS, JSON.stringify(filtered));
  }

  /**
   * Check if a split ID is a custom split.
   */
  static isCustomSplit(splitId: string): boolean {
    return splitId.startsWith('custom_');
  }
}

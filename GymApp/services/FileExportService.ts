import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { Platform } from 'react-native';
import { GymLogService } from './GymLogService';

/**
 * Service for exporting and importing gym data as files.
 * Uses expo-file-system and expo-sharing for cross-platform file operations.
 */
export class FileExportService {
  private static readonly EXPORT_FILENAME = 'wegogym-backup.json';

  /**
   * Export gym data to a shareable file.
   * On mobile: Opens share sheet to save/send file.
   * On web: Downloads the file directly.
   */
  static async exportToFile(): Promise<{ success: boolean; message: string }> {
    try {
      const jsonData = await GymLogService.exportData();
      const parsed = JSON.parse(jsonData);
      const entryCount = parsed.entries?.length || 0;

      if (Platform.OS === 'web') {
        // Web: Create blob and download
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = this.EXPORT_FILENAME;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        return {
          success: true,
          message: `Downloaded ${entryCount} gym entries`,
        };
      }

      // Mobile: Write to cache directory and share
      const fileUri = `${FileSystem.cacheDirectory}${this.EXPORT_FILENAME}`;
      await FileSystem.writeAsStringAsync(fileUri, jsonData, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      // Check if sharing is available
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        return {
          success: false,
          message: 'Sharing is not available on this device',
        };
      }

      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/json',
        dialogTitle: 'Export Gym Data',
        UTI: 'public.json',
      });

      return {
        success: true,
        message: `Exported ${entryCount} gym entries`,
      };
    } catch (error) {
      console.error('[FileExportService] Export failed:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Export failed',
      };
    }
  }

  /**
   * Import gym data from a file.
   * Opens file picker to select a JSON backup file.
   */
  static async importFromFile(): Promise<{ success: boolean; message: string; imported?: number }> {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return {
          success: false,
          message: 'Import cancelled',
        };
      }

      const file = result.assets[0];
      if (!file?.uri) {
        return {
          success: false,
          message: 'No file selected',
        };
      }

      // Read file contents
      let jsonContent: string;
      
      if (Platform.OS === 'web') {
        // Web: Fetch the blob URI
        const response = await fetch(file.uri);
        jsonContent = await response.text();
      } else {
        // Mobile: Read from file system
        jsonContent = await FileSystem.readAsStringAsync(file.uri, {
          encoding: FileSystem.EncodingType.UTF8,
        });
      }

      // Import the data
      const importResult = await GymLogService.importData(jsonContent);

      if (importResult.errors.length > 0) {
        return {
          success: false,
          message: `Import failed: ${importResult.errors.join(', ')}`,
        };
      }

      return {
        success: true,
        message: `Successfully imported ${importResult.imported} entries`,
        imported: importResult.imported,
      };
    } catch (error) {
      console.error('[FileExportService] Import failed:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Import failed',
      };
    }
  }
}

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
  Alert,
  RefreshControl,
} from 'react-native';
import { useTheme, useColors } from '../../context/ThemeContext';
import { GymLogService } from '../../services/GymLogService';
import { FileExportService } from '../../services/FileExportService';
import { formatResetHour } from '../../services/DateLogicService';
import { useGymStore } from '../../context/GymStore';
import HourPicker from '../shared/HourPicker';
import MinutePicker from '../shared/MinutePicker';

export default function SettingsView() {
  const { settings, toggleTheme, updateSettings } = useTheme();
  const colors = useColors();
  const { theme } = useTheme();
  const clearAllData = useGymStore((state) => state.clearAllData);
  const refresh = useGymStore((state) => state.refresh);
  const refreshing = useGymStore((state) => state.refreshing);

  const [showReminderPicker, setShowReminderPicker] = useState(false);
  const [showResetPicker, setShowResetPicker] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const reminderDisplay = format12Hour(settings.reminderHour, settings.reminderMinute);
  const resetDisplay = formatResetHour(settings.resetHour);

  const handleThemeToggle = () => {
    toggleTheme();
  };

  const handleReminderToggle = async () => {
    await updateSettings({ remindersEnabled: !settings.remindersEnabled });
  };

  const handleResetHourChange = async (hour: number) => {
    await updateSettings({ resetHour: hour });
  };

  const handleReminderTimeChange = async (hour: number, minute: number) => {
    await updateSettings({ reminderHour: hour, reminderMinute: minute });
  };

  const handleClearAllData = async () => {
    Alert.alert(
      'Clear All Data',
      'This will delete all your gym entries. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Everything',
          style: 'destructive',
          onPress: async () => {
            await clearAllData();
            Alert.alert('Success', 'All gym data has been cleared.');
          },
        },
      ]
    );
  };

  const handleExportData = async () => {
    try {
      setIsExporting(true);
      const result = await FileExportService.exportToFile();
      
      if (result.success) {
        Alert.alert('Export Successful', result.message);
      } else {
        Alert.alert('Export Failed', result.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportData = async () => {
    Alert.alert(
      'Import Data',
      'This will replace your existing data with the imported data. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: async () => {
            try {
              setIsImporting(true);
              const result = await FileExportService.importFromFile();
              
              if (result.success) {
                await refresh(settings.resetHour);
                Alert.alert('Import Successful', result.message);
              } else if (result.message !== 'Import cancelled') {
                Alert.alert('Import Failed', result.message);
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to import data. Please try again.');
            } finally {
              setIsImporting(false);
            }
          },
        },
      ]
    );
  };

  const handleRefresh = () => {
    refresh(settings.resetHour);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.bg }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
    >
      <Text 
        style={[styles.pageTitle, { color: colors.text }]}
        accessibilityRole="header"
      >
        Settings
      </Text>
      <Text style={[styles.pageSubtitle, { color: colors.textSecondary }]}>
        Minimal controls, cleaner focus
      </Text>

      {/* Appearance */}
      <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>Appearance</Text>

        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: colors.primaryGlow },
              ]}
            >
              <Text style={styles.iconText}>{theme === 'dark' ? '🌙' : '☀️'}</Text>
            </View>
            <View style={styles.rowText}>
              <Text style={[styles.rowTitle, { color: colors.text }]}>
                {theme === 'dark' ? 'Dark mode' : 'Light mode'}
              </Text>
              <Text style={[styles.rowHint, { color: colors.textSecondary }]}>
                {theme === 'dark' ? 'Dark theme active' : 'Light theme active'}
              </Text>
            </View>
          </View>
          <Switch
            value={theme === 'dark'}
            onValueChange={handleThemeToggle}
            trackColor={{ false: colors.gray, true: colors.primary }}
            thumbColor="#000"
          />
        </View>
      </View>

      {/* Reminders */}
      <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>Reminders</Text>

        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: colors.primaryGlow },
              ]}
            >
              <Text style={styles.iconText}>🔔</Text>
            </View>
            <View style={styles.rowText}>
              <Text style={[styles.rowTitle, { color: colors.text }]}>Daily reminder</Text>
              <Text style={[styles.rowHint, { color: colors.textSecondary }]}>
                {settings.remindersEnabled
                  ? `Asks you at ${reminderDisplay}`
                  : 'Currently disabled'}
              </Text>
            </View>
          </View>
          <Switch
            value={settings.remindersEnabled}
            onValueChange={handleReminderToggle}
            trackColor={{ false: colors.gray, true: colors.primary }}
            thumbColor="#000"
          />
        </View>

        {settings.remindersEnabled && (
          <View>
            <TouchableOpacity
              style={[
                styles.expandRow,
                { backgroundColor: colors.cardBgAlt, borderColor: colors.cardBorder },
              ]}
              onPress={() => setShowReminderPicker(!showReminderPicker)}
            >
              <Text style={[styles.expandLabel, { color: colors.textSecondary }]}>
                Reminder time
              </Text>
              <View
                style={[
                  styles.pill,
                  { backgroundColor: colors.primaryGlow, borderColor: colors.primaryBorder },
                ]}
              >
                <Text style={[styles.pillText, { color: colors.primary }]}>{reminderDisplay}</Text>
              </View>
            </TouchableOpacity>

            {showReminderPicker && (
              <View style={styles.pickerContainer}>
                <Text style={[styles.pickerLabel, { color: colors.textSecondary }]}>Hour</Text>
                <HourPicker
                  value={settings.reminderHour}
                  onChange={(h) => handleReminderTimeChange(h, settings.reminderMinute)}
                />
                <Text style={[styles.pickerLabel, { color: colors.textSecondary, marginTop: 12 }]}>
                  Minute
                </Text>
                <MinutePicker
                  value={settings.reminderMinute}
                  onChange={(m) => handleReminderTimeChange(settings.reminderHour, m)}
                />
              </View>
            )}
          </View>
        )}
      </View>

      {/* Gym Day Reset */}
      <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>Gym Day Reset</Text>

        <View style={styles.expandRow}>
          <Text style={[styles.expandLabel, { color: colors.textSecondary }]}>
            Gym day resets at
          </Text>
          <TouchableOpacity
            onPress={() => setShowResetPicker(!showResetPicker)}
          >
            <View
              style={[
                styles.pill,
                { backgroundColor: colors.primaryGlow, borderColor: colors.primaryBorder },
              ]}
            >
              <Text style={[styles.pillText, { color: colors.primary }]}>{resetDisplay}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {showResetPicker && (
          <View style={styles.pickerContainer}>
            <Text style={[styles.pickerLabel, { color: colors.textSecondary }]}>
              Select reset hour
            </Text>
            <HourPicker value={settings.resetHour} onChange={handleResetHourChange} />
          </View>
        )}

        <Text style={[styles.infoHint, { color: colors.textMuted }]}>
          If you log before the reset hour, it counts as the previous day.
        </Text>
      </View>

      {/* Data Management */}
      <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>Data Management</Text>

        <TouchableOpacity
          style={[
            styles.exportButton,
            { backgroundColor: colors.cardBgAlt, borderColor: colors.cardBorder },
          ]}
          onPress={handleExportData}
          disabled={isExporting}
          accessibilityRole="button"
          accessibilityLabel="Export gym data"
          accessibilityHint="Creates a backup file of all your gym entries"
          accessibilityState={{ disabled: isExporting }}
        >
          <Text style={[styles.exportButtonText, { color: colors.text }]}>
            {isExporting ? 'Exporting...' : 'Export Gym Data'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.importButton,
            { backgroundColor: colors.cardBgAlt, borderColor: colors.cardBorder },
          ]}
          onPress={handleImportData}
          disabled={isImporting}
          accessibilityRole="button"
          accessibilityLabel="Import gym data"
          accessibilityHint="Imports gym entries from a backup file"
          accessibilityState={{ disabled: isImporting }}
        >
          <Text style={[styles.importButtonText, { color: colors.text }]}>
            {isImporting ? 'Importing...' : 'Import Gym Data'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Danger Zone */}
      <TouchableOpacity
        style={[
          styles.clearButton,
          { backgroundColor: colors.cardBg, borderColor: colors.danger || '#FF5252' },
        ]}
        onPress={handleClearAllData}
        accessibilityRole="button"
        accessibilityLabel="Clear all gym data"
        accessibilityHint="Permanently deletes all your gym entries"
      >
        <Text style={[styles.clearButtonText, { color: colors.danger || '#FF5252' }]}>
          Clear All Gym Data
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function format12Hour(hour: number, minute: number): string {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  const displayMinute = String(minute).padStart(2, '0');
  return `${displayHour}:${displayMinute} ${period}`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingTop: 24,
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 80,
    gap: 20,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: '800',
  },
  pageSubtitle: {
    fontSize: 13,
    marginTop: -12,
  },
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 18,
  },
  rowText: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  rowHint: {
    fontSize: 13,
    marginTop: 2,
  },
  expandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
  },
  expandLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  pill: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
  },
  pillText: {
    fontSize: 14,
    fontWeight: '700',
  },
  pickerContainer: {
    marginTop: 8,
  },
  pickerLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  infoHint: {
    fontSize: 12,
    marginTop: 4,
    lineHeight: 18,
  },
  clearButton: {
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    borderWidth: 1,
  },
  clearButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  exportButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: 10,
  },
  exportButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  importButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
  },
  importButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
});

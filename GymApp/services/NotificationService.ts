import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const REMINDER_ID = 'com.wegogym.daily-reminder';

/**
 * Service for scheduling local notifications/reminders.
 * Uses Expo Notifications API for native push notifications.
 */
export class NotificationService {
  /**
   * Request permission to send notifications.
   * Returns true if granted, false otherwise.
   */
  static async requestPermission(): Promise<boolean> {
    try {
      const { status } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
          allowAnnouncements: false,
          allowDisplayInCarPlay: false,
          allowCriticalAlerts: false,
          allowTimeSensitiveNotifications: false,
        },
        android: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
          allowDisplayInCarPlay: false,
          allowCriticalAlerts: false,
        },
      });

      return status === 'granted';
    } catch {
      return false;
    }
  }

  /**
   * Check if notification permission is granted.
   */
  static async checkPermission(): Promise<boolean> {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      return status === 'granted';
    } catch {
      return false;
    }
  }

  /**
   * Schedule a daily reminder at the specified hour and minute.
   * Returns the notification ID if successful, null otherwise.
   */
  static async scheduleDailyReminder(hour: number, minute: number): Promise<string | null> {
    try {
      // Check permission first
      const hasPermission = await this.checkPermission();
      if (!hasPermission) {
        const granted = await this.requestPermission();
        if (!granted) {
          return null;
        }
      }

      // Cancel any existing reminder to avoid duplicates
      await this.cancelAllReminders();

      // Create trigger for daily notification at specified time
      const trigger: Notifications.NotificationTriggerInput = {
        hour,
        minute,
        repeats: true,
      };

      // Schedule the notification
      const notificationId = await Notifications.scheduleNotificationAsync({
        identifier: REMINDER_ID,
        content: {
          title: 'We Go Gym',
          body: 'Time to log today\'s gym session!',
          sound: true,
        },
        trigger,
      });

      return notificationId;
    } catch (error) {
      console.error('[NotificationService] Failed to schedule reminder:', error);
      return null;
    }
  }

  /**
   * Cancel all scheduled notifications.
   */
  static async cancelAllReminders(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('[NotificationService] Failed to cancel reminders:', error);
    }
  }

  /**
   * Update the reminder time (cancel and reschedule).
   */
  static async updateReminderTime(hour: number, minute: number): Promise<string | null> {
    await this.cancelAllReminders();
    return this.scheduleDailyReminder(hour, minute);
  }
}

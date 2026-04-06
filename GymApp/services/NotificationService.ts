import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const REMINDER_ID = 'com.wegogym.daily-reminder';
const RESET_ID = 'com.wegogym.day-reset';

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
          allowDisplayInCarPlay: false,
          allowCriticalAlerts: false,
          allowTimeSensitiveNotifications: true,
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

      // Cancel existing reminder to avoid duplicates
      await this.cancelReminder();

      // Create calendar trigger for daily notification at specified time
      const trigger: Notifications.NotificationTriggerInput = {
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        hour,
        minute,
        repeats: true,
      };

      // Schedule the notification
      const notificationId = await Notifications.scheduleNotificationAsync({
        identifier: REMINDER_ID,
        content: {
          title: 'We Go Gym',
          body: "Time to log today's gym session!",
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
   * Schedule a daily notification at the gym day reset hour and minute.
   */
  static async scheduleResetNotification(hour: number, minute: number = 0): Promise<string | null> {
    try {
      const hasPermission = await this.checkPermission();
      if (!hasPermission) {
        const granted = await this.requestPermission();
        if (!granted) {
          return null;
        }
      }

      // Cancel existing reset notification
      await this.cancelResetNotification();

      const trigger: Notifications.NotificationTriggerInput = {
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        hour,
        minute,
        repeats: true,
      };

      const notificationId = await Notifications.scheduleNotificationAsync({
        identifier: RESET_ID,
        content: {
          title: 'We Go Gym',
          body: 'New gym day starts now. Log your workout!',
          sound: true,
        },
        trigger,
      });

      return notificationId;
    } catch (error) {
      console.error('[NotificationService] Failed to schedule reset notification:', error);
      return null;
    }
  }

  /**
   * Cancel the reminder notification.
   */
  static async cancelReminder(): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(REMINDER_ID);
    } catch {
      // Ignore
    }
  }

  /**
   * Cancel the reset notification.
   */
  static async cancelResetNotification(): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(RESET_ID);
    } catch {
      // Ignore
    }
  }

  /**
   * Cancel all scheduled notifications.
   */
  static async cancelAllNotifications(): Promise<void> {
    try {
      await this.cancelReminder();
      await this.cancelResetNotification();
    } catch (error) {
      console.error('[NotificationService] Failed to cancel notifications:', error);
    }
  }

  /**
   * Update reminder time (cancel and reschedule).
   */
  static async updateReminderTime(hour: number, minute: number): Promise<string | null> {
    return this.scheduleDailyReminder(hour, minute);
  }

  /**
   * Update reset notification time (cancel and reschedule).
   */
  static async updateResetTime(hour: number): Promise<string | null> {
    return this.scheduleResetNotification(hour);
  }
}

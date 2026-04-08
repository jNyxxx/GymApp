# Home Screen Widgets Implementation Guide

## Overview

Home screen widgets provide quick access to gym streak and logging functionality without opening the full app. This document outlines how to implement widgets for iOS (WidgetKit) and Android.

## iOS Implementation (WidgetKit)

### Prerequisites
- Apple Developer account
- Xcode 14+
- App Groups enabled for data sharing

### Steps

1. **Create Widget Extension**
   ```bash
   # In Xcode: File > New > Target > Widget Extension
   # Name: WeGoGymWidget
   ```

2. **Configure App Groups**
   - Add App Group capability to both main app and widget
   - Group identifier: `group.com.wegogym.shared`

3. **Create Shared Data Service**
   
   The widget needs to read gym data. Create a shared UserDefaults:
   
   ```swift
   // SharedDataService.swift
   import Foundation
   
   struct WidgetData: Codable {
       let currentStreak: Int
       let todayStatus: String? // "went", "no_gym", or nil
       let lastUpdated: Date
   }
   
   class SharedDataService {
       static let shared = SharedDataService()
       private let defaults = UserDefaults(suiteName: "group.com.wegogym.shared")
       
       func saveWidgetData(_ data: WidgetData) {
           if let encoded = try? JSONEncoder().encode(data) {
               defaults?.set(encoded, forKey: "widgetData")
           }
       }
       
       func loadWidgetData() -> WidgetData? {
           guard let data = defaults?.data(forKey: "widgetData"),
                 let decoded = try? JSONDecoder().decode(WidgetData.self, from: data) else {
               return nil
           }
           return decoded
       }
   }
   ```

4. **Widget Implementation**
   
   ```swift
   // WeGoGymWidget.swift
   import WidgetKit
   import SwiftUI
   
   struct Provider: TimelineProvider {
       func placeholder(in context: Context) -> StreakEntry {
           StreakEntry(date: Date(), streak: 0, todayStatus: nil)
       }
       
       func getSnapshot(in context: Context, completion: @escaping (StreakEntry) -> ()) {
           let data = SharedDataService.shared.loadWidgetData()
           let entry = StreakEntry(
               date: Date(),
               streak: data?.currentStreak ?? 0,
               todayStatus: data?.todayStatus
           )
           completion(entry)
       }
       
       func getTimeline(in context: Context, completion: @escaping (Timeline<StreakEntry>) -> ()) {
           let data = SharedDataService.shared.loadWidgetData()
           let entry = StreakEntry(
               date: Date(),
               streak: data?.currentStreak ?? 0,
               todayStatus: data?.todayStatus
           )
           let timeline = Timeline(entries: [entry], policy: .atEnd)
           completion(timeline)
       }
   }
   
   struct StreakEntry: TimelineEntry {
       let date: Date
       let streak: Int
       let todayStatus: String?
   }
   
   struct WeGoGymWidgetEntryView: View {
       var entry: Provider.Entry
       
       var body: some View {
           VStack(spacing: 4) {
               Text("🔥")
                   .font(.title)
               Text("\(entry.streak)")
                   .font(.largeTitle)
                   .fontWeight(.black)
               Text("day streak")
                   .font(.caption)
                   .foregroundColor(.secondary)
           }
           .containerBackground(.fill.tertiary, for: .widget)
       }
   }
   
   @main
   struct WeGoGymWidget: Widget {
       let kind: String = "WeGoGymWidget"
       
       var body: some WidgetConfiguration {
           StaticConfiguration(kind: kind, provider: Provider()) { entry in
               WeGoGymWidgetEntryView(entry: entry)
           }
           .configurationDisplayName("Gym Streak")
           .description("Track your current gym streak")
           .supportedFamilies([.systemSmall, .systemMedium])
       }
   }
   ```

## Android Implementation

### Prerequisites
- Android Studio
- Minimum SDK 26

### Steps

1. **Create Widget Provider**
   
   ```kotlin
   // GymStreakWidget.kt
   class GymStreakWidget : AppWidgetProvider() {
       override fun onUpdate(
           context: Context,
           appWidgetManager: AppWidgetManager,
           appWidgetIds: IntArray
       ) {
           for (appWidgetId in appWidgetIds) {
               updateAppWidget(context, appWidgetManager, appWidgetId)
           }
       }
       
       private fun updateAppWidget(
           context: Context,
           appWidgetManager: AppWidgetManager,
           appWidgetId: Int
       ) {
           val prefs = context.getSharedPreferences("widget_data", Context.MODE_PRIVATE)
           val streak = prefs.getInt("streak", 0)
           
           val views = RemoteViews(context.packageName, R.layout.gym_streak_widget)
           views.setTextViewText(R.id.streak_count, streak.toString())
           
           appWidgetManager.updateAppWidget(appWidgetId, views)
       }
   }
   ```

2. **Register in Manifest**
   
   ```xml
   <receiver android:name=".GymStreakWidget">
       <intent-filter>
           <action android:name="android.appwidget.action.APPWIDGET_UPDATE" />
       </intent-filter>
       <meta-data
           android:name="android.appwidget.provider"
           android:resource="@xml/gym_streak_widget_info" />
   </receiver>
   ```

## React Native Integration

Create a native module to update widgets from the app:

```typescript
// services/WidgetService.ts
import { NativeModules, Platform } from 'react-native';

const { WidgetBridge } = NativeModules;

export class WidgetService {
  static async updateWidget(streak: number, todayStatus?: string): Promise<void> {
    if (Platform.OS === 'ios' && WidgetBridge?.updateWidget) {
      WidgetBridge.updateWidget(streak, todayStatus);
    } else if (Platform.OS === 'android' && WidgetBridge?.updateWidget) {
      WidgetBridge.updateWidget(streak, todayStatus);
    }
  }
}
```

## Notes

- Widgets require native code and ejecting from Expo managed workflow
- Consider using `expo-dev-client` for local development with native modules
- iOS widgets refresh based on system policies, not real-time
- Android widgets need explicit `AppWidgetManager.updateAppWidget()` calls

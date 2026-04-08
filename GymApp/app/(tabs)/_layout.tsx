import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../context/ThemeContext';

type IconName = keyof typeof Ionicons.glyphMap;

export default function TabLayout() {
  const colors = useColors();

  const renderTabIcon = (name: IconName, focused: boolean) => (
    <Ionicons
      name={name}
      size={24}
      color={focused ? colors.primary : colors.textMuted}
      accessibilityElementsHidden
    />
  );

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.tabBarBg,
          borderTopColor: colors.tabBarBorder,
          borderTopWidth: 1,
          height: Platform.OS === 'web' ? 60 : 72,
          paddingBottom: Platform.OS === 'web' ? 8 : 10,
          paddingTop: 8,
          ...(Platform.OS === 'web'
            ? {
                position: 'fixed' as const,
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 100,
              }
            : {}),
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          marginTop: 2,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: 'Today',
          tabBarAccessibilityLabel: 'Today tab - log your gym session',
          tabBarIcon: ({ focused }) => renderTabIcon(focused ? 'home' : 'home-outline', focused),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          tabBarLabel: 'Calendar',
          tabBarAccessibilityLabel: 'Calendar tab - view your gym history',
          tabBarIcon: ({ focused }) => renderTabIcon(focused ? 'calendar' : 'calendar-outline', focused),
        }}
      />
      <Tabs.Screen
        name="summary"
        options={{
          tabBarLabel: 'Summary',
          tabBarAccessibilityLabel: 'Summary tab - view your monthly stats',
          tabBarIcon: ({ focused }) => renderTabIcon(focused ? 'stats-chart' : 'stats-chart-outline', focused),
        }}
      />
      <Tabs.Screen
        name="templates"
        options={{
          tabBarLabel: 'Templates',
          tabBarAccessibilityLabel: 'Templates tab - manage workout templates',
          tabBarIcon: ({ focused }) => renderTabIcon(focused ? 'list' : 'list-outline', focused),
        }}
      />
      <Tabs.Screen
        name="achievements"
        options={{
          tabBarLabel: 'Badges',
          tabBarAccessibilityLabel: 'Achievements tab - view your unlocked badges',
          tabBarIcon: ({ focused }) => renderTabIcon(focused ? 'trophy' : 'trophy-outline', focused),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarLabel: 'Settings',
          tabBarAccessibilityLabel: 'Settings tab - configure app options',
          tabBarIcon: ({ focused }) => renderTabIcon(focused ? 'settings' : 'settings-outline', focused),
        }}
      />
    </Tabs>
  );
}

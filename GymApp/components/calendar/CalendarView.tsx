import React, { useState } from 'react';
import { ScrollView, StyleSheet, View, RefreshControl, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCalendarViewModel } from '../../viewModels/CalendarViewModel';
import CalendarHeader from '../../components/calendar/CalendarHeader';
import CalendarGrid from '../../components/calendar/CalendarGrid';
import DayDetailSheet from '../../components/calendar/DayDetailSheet';
import AddSessionSheet from '../../components/calendar/AddSessionSheet';
import { useColors, useTheme } from '../../context/ThemeContext';
import { useGymStore } from '../../context/GymStore';
import { cardSurfaceStyle, screenContentStyle } from '../../constants/DesignSystem';
import EmptyState from '../shared/EmptyState';

export default function CalendarView() {
  const colors = useColors();
  const { settings } = useTheme();
  const refreshing = useGymStore((state) => state.refreshing);
  const storeRefresh = useGymStore((state) => state.refresh);
  const [showAddSession, setShowAddSession] = useState(false);
  
  const {
    currentMonth,
    entries,
    monthLabel,
    selectedDateKey,
    showDayDetail,
    goToPrevMonth,
    goToNextMonth,
    openDayDetail,
    closeDayDetail,
    getEntryForDate,
    refresh,
  } = useCalendarViewModel();

  const [year, month] = currentMonth.split('-').map(Number);
  const selectedEntry = selectedDateKey ? (getEntryForDate(selectedDateKey) ?? null) : null;

  const handleRefresh = () => {
    storeRefresh(settings.resetHour, settings.resetMinute);
    refresh();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        accessibilityRole="scrollbar"
        accessibilityLabel="Calendar view"
      >
        <CalendarHeader
          monthLabel={monthLabel}
          subtitle="Tap a day to view or edit its session"
          onPrev={goToPrevMonth}
          onNext={goToNextMonth}
        />

        <View 
          style={[styles.calendarCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}
          accessibilityRole="grid"
          accessibilityLabel={`Calendar for ${monthLabel}`}
        >
          <CalendarGrid
            year={year}
            month={month - 1}
            entries={entries}
            onDayTap={openDayDetail}
          />
        </View>

        {entries.length === 0 && (
          <EmptyState
            iconName="calendar-clear-outline"
            title="No sessions this month"
            description="Add a custom session or log from Home to fill out your calendar."
            actionLabel="Add Session"
            onAction={() => setShowAddSession(true)}
          />
        )}
      </ScrollView>

      <DayDetailSheet
        visible={showDayDetail}
        dateKey={selectedDateKey || ''}
        entry={selectedEntry}
        onClose={closeDayDetail}
        onEntryUpdated={async () => {
          await storeRefresh(settings.resetHour, settings.resetMinute);
          await refresh();
          closeDayDetail();
        }}
      />

      <AddSessionSheet
        visible={showAddSession}
        onClose={() => setShowAddSession(false)}
        onSaved={async () => {
          await storeRefresh(settings.resetHour, settings.resetMinute);
          await refresh();
          setShowAddSession(false);
        }}
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => setShowAddSession(true)}
        accessibilityLabel="Add custom session"
        accessibilityHint="Opens the add session sheet"
        accessibilityRole="button"
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    ...screenContentStyle,
  },
  calendarCard: {
    ...cardSurfaceStyle,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});

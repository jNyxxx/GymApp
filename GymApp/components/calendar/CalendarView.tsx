import React from 'react';
import { ScrollView, StyleSheet, View, RefreshControl } from 'react-native';
import { useCalendarViewModel } from '../../viewModels/CalendarViewModel';
import CalendarHeader from '../../components/calendar/CalendarHeader';
import CalendarGrid from '../../components/calendar/CalendarGrid';
import DayDetailSheet from '../../components/calendar/DayDetailSheet';
import { useColors, useTheme } from '../../context/ThemeContext';
import { useGymStore } from '../../context/GymStore';

export default function CalendarView() {
  const colors = useColors();
  const { settings } = useTheme();
  const refreshing = useGymStore((state) => state.refreshing);
  const storeRefresh = useGymStore((state) => state.refresh);
  
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
    storeRefresh(settings.resetHour);
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
          subtitle="Tap a day to view the session you picked"
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
      </ScrollView>

      <DayDetailSheet
        visible={showDayDetail}
        dateKey={selectedDateKey || ''}
        entry={selectedEntry}
        onClose={closeDayDetail}
        onEntryUpdated={async () => {
          await refresh();
          closeDayDetail();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 24,
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 80,
    gap: 20,
  },
  calendarCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
  },
});

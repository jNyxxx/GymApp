import React, { useRef } from 'react';
import { ScrollView, StyleSheet, View, RefreshControl } from 'react-native';
import { useCalendarViewModel } from '../../viewModels/CalendarViewModel';
import CalendarHeader from '../../components/calendar/CalendarHeader';
import CalendarGrid from '../../components/calendar/CalendarGrid';
import DayDetailSheet from '../../components/calendar/DayDetailSheet';
import { useColors, useTheme } from '../../context/ThemeContext';
import { useGymStore } from '../../context/GymStore';
import { cardSurfaceStyle, screenContentStyle } from '../../constants/DesignSystem';

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
    storeRefresh(settings.resetHour, settings.resetMinute);
    refresh();
  };

  // Swipe gesture for month navigation
  const swipeThreshold = 100;
  const touchStartRef = useRef({ x: 0, y: 0, time: 0 });
  const isNavigatingRef = useRef(false);

  const handleTouchStart = (e: any) => {
    touchStartRef.current = { x: e.nativeEvent.pageX, y: e.nativeEvent.pageY, time: Date.now() };
  };

  const handleTouchEnd = (e: any) => {
    if (isNavigatingRef.current) return;

    const dx = e.nativeEvent.pageX - touchStartRef.current.x;
    const dy = e.nativeEvent.pageY - touchStartRef.current.y;
    const duration = Date.now() - touchStartRef.current.time;

    // Only trigger on deliberate horizontal swipes (not quick taps)
    if (duration > 100 && Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > swipeThreshold) {
      isNavigatingRef.current = true;
      if (dx > 0) {
        goToPrevMonth();
      } else {
        goToNextMonth();
      }
      setTimeout(() => { isNavigatingRef.current = false; }, 500);
    }
  };

  return (
    <View
      style={[styles.container, { backgroundColor: colors.bg }]}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    ...screenContentStyle,
    flexGrow: 1,
    justifyContent: 'center',
  },
  calendarCard: {
    ...cardSurfaceStyle,
  },
});

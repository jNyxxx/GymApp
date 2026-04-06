import React from 'react';
import { ScrollView, StyleSheet, ActivityIndicator, View, Text, RefreshControl } from 'react-native';
import { useSummaryViewModel } from '../../viewModels/SummaryViewModel';
import CalendarHeader from '../../components/calendar/CalendarHeader';
import SummaryCard from '../../components/summary/SummaryCard';
import MostTrainedSplitCard from '../../components/summary/MostTrainedSplitCard';
import WeeklyBreakdownCard from '../../components/summary/WeeklyBreakdownCard';
import StoryCard from '../../components/summary/StoryCard';
import { useColors, useTheme } from '../../context/ThemeContext';
import { useGymStore } from '../../context/GymStore';

export default function SummaryView() {
  const colors = useColors();
  const { settings } = useTheme();
  const refreshing = useGymStore((state) => state.refreshing);
  const storeRefresh = useGymStore((state) => state.refresh);
  
  const {
    stats,
    allEntries,
    currentMonth,
    loading,
    monthLabel,
    goToPrevMonth,
    goToNextMonth,
    refresh,
  } = useSummaryViewModel();

  const handleRefresh = () => {
    storeRefresh(settings.resetHour);
    refresh();
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!stats) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: colors.bg }]}>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No data available</Text>
      </View>
    );
  }

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
      accessibilityRole="scrollbar"
      accessibilityLabel="Monthly summary"
    >
      <CalendarHeader
        monthLabel="Monthly summary"
        subtitle={`${monthLabel} performance · split trends`}
        onPrev={goToPrevMonth}
        onNext={goToNextMonth}
      />

      <SummaryCard stats={stats} />
      <MostTrainedSplitCard stats={stats} />
      <WeeklyBreakdownCard stats={stats} entries={allEntries} monthKey={currentMonth} />
      <StoryCard stats={stats} />
    </ScrollView>
  );
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
    gap: 16,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
});

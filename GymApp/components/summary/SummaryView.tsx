import React from 'react';
import { ScrollView, StyleSheet, ActivityIndicator, View, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useSummaryViewModel } from '../../viewModels/SummaryViewModel';
import CalendarHeader from '../../components/calendar/CalendarHeader';
import SummaryCard from '../../components/summary/SummaryCard';
import MostTrainedSplitCard from '../../components/summary/MostTrainedSplitCard';
import WeeklyBreakdownCard from '../../components/summary/WeeklyBreakdownCard';
import AttendanceChartCard from '../../components/summary/AttendanceChartCard';
import SplitDistributionCard from '../../components/summary/SplitDistributionCard';
import StoryCard from '../../components/summary/StoryCard';
import ProgressionInsightsCard from '../../components/summary/ProgressionInsightsCard';
import { useColors, useTheme } from '../../context/ThemeContext';
import { useGymStore } from '../../context/GymStore';
import { screenContentStyle } from '../../constants/DesignSystem';
import EmptyState from '../shared/EmptyState';

export default function SummaryView() {
  const colors = useColors();
  const { settings } = useTheme();
  const refreshing = useGymStore((state) => state.refreshing);
  const storeRefresh = useGymStore((state) => state.refresh);

  const {
    stats,
    progressionInsights,
    allEntries,
    currentMonth,
    loading,
    monthLabel,
    goToPrevMonth,
    goToNextMonth,
    refresh,
  } = useSummaryViewModel();

  const handleRefresh = () => {
    storeRefresh(settings.resetHour, settings.resetMinute);
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
        <EmptyState
          iconName="stats-chart-outline"
          title="No summary data yet"
          description="Log your first gym session to unlock monthly insights and trends."
          actionLabel="Log a Session"
          onAction={() => router.push('/(tabs)/index')}
          style={styles.emptyStateCard}
        />
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
        monthLabel={monthLabel}
        subtitle="Performance and split trends"
        onPrev={goToPrevMonth}
        onNext={goToNextMonth}
      />

      <SummaryCard stats={stats} />
      {progressionInsights && <ProgressionInsightsCard insights={progressionInsights} />}
      <AttendanceChartCard entries={allEntries} monthKey={currentMonth} />
      <SplitDistributionCard entries={allEntries} monthKey={currentMonth} />
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
    ...screenContentStyle,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  emptyStateCard: {
    width: '100%',
  },
});

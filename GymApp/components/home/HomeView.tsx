import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  RefreshControl,
} from 'react-native';
import { useHomeViewModel } from '../../viewModels/HomeViewModel';
import { useGymStore } from '../../context/GymStore';
import { useTheme } from '../../context/ThemeContext';
import GreetingHeader from '../../components/home/GreetingHeader';
import TodayStatusCard from '../../components/home/TodayStatusCard';
import ActionButtonsCard from '../../components/home/ActionButtonsCard';
import SplitPickerSheet from '../../components/home/SplitPickerSheet';
import StreakCard from '../../components/home/StreakCard';
import MonthlyProgressCard from '../../components/home/MonthlyProgressCard';
import MonthlyStoryCard from '../../components/home/MonthlyStoryCard';
import { HomeScreenSkeleton } from '../../components/shared/Skeleton';
import AchievementToast from '../../components/shared/AchievementToast';
import { Achievement } from '../../models/Achievement';
import { AchievementService } from '../../services/AchievementService';
import { GymLogService } from '../../services/GymLogService';
import { useColors } from '../../context/ThemeContext';

export default function HomeView() {
  const colors = useColors();
  const { settings } = useTheme();
    const {
    todayEntry,
    loading,
    showSplitPicker,
    currentStreak,
    bestStreak,
    monthlyStats,
    daysInMonth,
    confirmAndSaveWentGym,
    confirmAndSaveNoGym,
    openSplitPicker,
    closeSplitPicker,
    refresh,
  } = useHomeViewModel();

  // Initialize store
  const initialize = useGymStore((state) => state.initialize);
  const refreshing = useGymStore((state) => state.refreshing);
  const storeRefresh = useGymStore((state) => state.refresh);

  // Achievement toast state
  const [achievementToShow, setAchievementToShow] = useState<Achievement | null>(null);
  const [showAchievementToast, setShowAchievementToast] = useState(false);

  useEffect(() => {
    initialize(settings.resetHour, settings.resetMinute);
  }, [initialize, settings.resetHour]);

  // Check for new achievements when todayEntry changes
  useEffect(() => {
    const checkAchievements = async () => {
      if (todayEntry) {
        const entries = await GymLogService.getAllEntries();
        const newAchievements = await AchievementService.checkAchievements(entries);
        if (newAchievements.length > 0) {
          // Show the first new achievement
          setAchievementToShow(newAchievements[0]);
          setShowAchievementToast(true);
        }
      }
    };
    checkAchievements();
  }, [todayEntry?.id]);

  const handleRefresh = () => {
    storeRefresh(settings.resetHour, settings.resetMinute);
    refresh();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <ScrollView
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
        accessibilityLabel="Home screen content"
      >
        {loading ? (
          <HomeScreenSkeleton />
        ) : (
          <>
            <GreetingHeader />
            <TodayStatusCard entry={todayEntry} />
            <ActionButtonsCard
              entry={todayEntry}
              onWentGym={openSplitPicker}
              onNoGym={confirmAndSaveNoGym}
            />
            <StreakCard currentStreak={currentStreak} bestStreak={bestStreak} />

            {monthlyStats && (
              <MonthlyProgressCard
                gymDays={monthlyStats.totalGymDays}
                totalDays={daysInMonth}
                noGymDays={monthlyStats.totalNoGymDays}
                mostTrainedSplit={monthlyStats.mostTrainedSplit || undefined}
              />
            )}

            {monthlyStats && <MonthlyStoryCard stats={monthlyStats} />}
          </>
        )}
      </ScrollView>

      <SplitPickerSheet
        visible={showSplitPicker}
        onSelect={confirmAndSaveWentGym}
        onClose={closeSplitPicker}
        currentSplit={todayEntry?.split}
        currentNotes={todayEntry?.notes}
      />

      <AchievementToast
        achievement={achievementToShow}
        visible={showAchievementToast}
        onHide={() => {
          setShowAchievementToast(false);
          setAchievementToShow(null);
        }}
      />
    </View>
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
    paddingBottom: 96,
    gap: 16,
  },
});

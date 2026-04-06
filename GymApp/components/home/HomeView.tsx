import React, { useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Modal,
  TouchableOpacity,
  Text,
  SafeAreaView,
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
import { useColors } from '../../context/ThemeContext';

export default function HomeView() {
  const colors = useColors();
  const { settings } = useTheme();
  const {
    todayEntry,
    loading,
    showSplitPicker,
    showOverwriteConfirm,
    currentStreak,
    bestStreak,
    monthlyStats,
    daysInMonth,
    confirmAndSaveWentGym,
    confirmAndSaveNoGym,
    openSplitPicker,
    closeSplitPicker,
    closeOverwriteConfirm,
    refresh,
  } = useHomeViewModel();

  // Initialize store
  const initialize = useGymStore((state) => state.initialize);
  const refreshing = useGymStore((state) => state.refreshing);
  const storeRefresh = useGymStore((state) => state.refresh);

  useEffect(() => {
    initialize(settings.resetHour);
  }, [initialize, settings.resetHour]);

  const handleRefresh = () => {
    storeRefresh(settings.resetHour);
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

      {/* Overwrite Confirmation Modal */}
      <Modal
        visible={showOverwriteConfirm}
        transparent
        animationType="fade"
        onRequestClose={closeOverwriteConfirm}
        accessibilityViewIsModal
      >
        <SafeAreaView style={[styles.overlay, { backgroundColor: colors.overlay }]}>
          <TouchableOpacity 
            style={styles.backdrop} 
            activeOpacity={1} 
            onPress={closeOverwriteConfirm}
            accessibilityLabel="Close dialog"
            accessibilityRole="button"
          />
          <View 
            style={[styles.confirmCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}
            accessibilityRole="alert"
          >
            <Text style={[styles.confirmTitle, { color: colors.text }]}>Already logged today</Text>
            <Text style={[styles.confirmText, { color: colors.textSecondary }]}>
              You already have a session logged for today. Do you want to overwrite it?
            </Text>
            <View style={styles.confirmActions}>
              <TouchableOpacity
                style={[styles.confirmCancel, { backgroundColor: colors.gray }]}
                onPress={closeOverwriteConfirm}
                accessibilityRole="button"
                accessibilityLabel="Cancel"
              >
                <Text style={[styles.confirmCancelText, { color: colors.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmOverwrite, { backgroundColor: colors.primary }]}
                onPress={() => {
                  closeOverwriteConfirm();
                  openSplitPicker();
                }}
                accessibilityRole="button"
                accessibilityLabel="Overwrite existing entry"
              >
                <Text style={styles.confirmOverwriteText}>Overwrite</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      <SplitPickerSheet
        visible={showSplitPicker}
        onSelect={confirmAndSaveWentGym}
        onClose={closeSplitPicker}
        currentSplit={todayEntry?.split}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingTop: 12,
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 80,
    gap: 16,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    flex: 1,
  },
  confirmCard: {
    marginHorizontal: 40,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    gap: 16,
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  confirmText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  confirmActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  confirmCancel: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  confirmCancelText: {
    fontSize: 15,
    fontWeight: '700',
  },
  confirmOverwrite: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  confirmOverwriteText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#000',
  },
});

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Modal, SafeAreaView } from 'react-native';
import { useColors } from '../../context/ThemeContext';
import { Achievement, ACHIEVEMENTS, UnlockedAchievement } from '../../models/Achievement';
import { AchievementService } from '../../services/AchievementService';

export default function AchievementsView() {
  const colors = useColors();
  const [unlockedEntries, setUnlockedEntries] = useState<UnlockedAchievement[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [selectedUnlockDate, setSelectedUnlockDate] = useState<string | null>(null);

  const loadAchievements = async () => {
    const unlocked = await AchievementService.getUnlocked();
    setUnlockedEntries(unlocked);
  };

  useEffect(() => {
    loadAchievements();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAchievements();
    setRefreshing(false);
  };

  const unlockedIds = new Set(unlockedEntries.map((e) => e.achievementId));
  const unlockedCount = unlockedIds.size;
  const totalCount = ACHIEVEMENTS.length;
  const progressPercent = Math.round((unlockedCount / totalCount) * 100);

  // Group achievements by category
  const categories: { [key: string]: Achievement[] } = {
    streak: [],
    milestone: [],
    consistency: [],
    special: [],
  };

  for (const achievement of ACHIEVEMENTS) {
    categories[achievement.category].push(achievement);
  }

  const categoryLabels: { [key: string]: string } = {
    streak: '🔥 Streaks',
    milestone: '🏆 Milestones',
    consistency: '📈 Consistency',
    special: '⭐ Special',
  };

  const handleAchievementPress = (achievement: Achievement) => {
    const entry = unlockedEntries.find((e) => e.achievementId === achievement.id);
    setSelectedAchievement(achievement);
    setSelectedUnlockDate(entry?.unlockedAt || null);
  };

  const formatUnlockDate = (isoDate: string): string => {
    const date = new Date(isoDate);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
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
      >
        <Text style={[styles.pageTitle, { color: colors.text }]}>Achievements</Text>
        <Text style={[styles.pageSubtitle, { color: colors.textSecondary }]}>
          Track your gym milestones
        </Text>

        {/* Progress Overview */}
        <View style={[styles.progressCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
          <View style={styles.progressHeader}>
            <Text style={[styles.progressTitle, { color: colors.text }]}>Your Progress</Text>
            <Text style={[styles.progressCount, { color: colors.primary }]}>
              {unlockedCount}/{totalCount}
            </Text>
          </View>
          <View style={[styles.progressBarBg, { backgroundColor: colors.progressBarBg }]}>
            <View 
              style={[
                styles.progressBarFill, 
                { backgroundColor: colors.primary, width: `${progressPercent}%` }
              ]} 
            />
          </View>
          <Text style={[styles.progressText, { color: colors.textSecondary }]}>
            {progressPercent}% completed — {totalCount - unlockedCount} remaining
          </Text>
        </View>

        {/* Achievement Categories */}
        {Object.entries(categories).map(([category, achievements]) => (
          <View key={category} style={styles.categorySection}>
            <Text style={[styles.categoryTitle, { color: colors.text }]}>
              {categoryLabels[category]}
            </Text>
            <View style={styles.achievementsGrid}>
              {achievements.map((achievement) => {
                const isUnlocked = unlockedIds.has(achievement.id);
                return (
                  <TouchableOpacity
                    key={achievement.id}
                    style={[
                      styles.achievementCard,
                      { backgroundColor: colors.cardBg, borderColor: colors.cardBorder },
                      isUnlocked && { borderColor: colors.primary + '50' },
                    ]}
                    onPress={() => handleAchievementPress(achievement)}
                  >
                    <Text style={[styles.achievementEmoji, !isUnlocked && styles.lockedEmoji]}>
                      {isUnlocked ? achievement.emoji : '🔒'}
                    </Text>
                    <Text
                      style={[
                        styles.achievementTitle,
                        { color: isUnlocked ? colors.text : colors.textMuted },
                      ]}
                      numberOfLines={2}
                    >
                      {achievement.title}
                    </Text>
                    {isUnlocked && (
                      <View style={[styles.unlockedBadge, { backgroundColor: colors.primaryGlow }]}>
                        <Text style={[styles.unlockedText, { color: colors.primary }]}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Achievement Detail Modal */}
      <Modal
        visible={!!selectedAchievement}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedAchievement(null)}
      >
        <SafeAreaView style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
          <TouchableOpacity 
            style={styles.modalBackdrop} 
            activeOpacity={1} 
            onPress={() => setSelectedAchievement(null)} 
          />
          {selectedAchievement && (
            <View style={[styles.modalContent, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
              <Text style={styles.modalEmoji}>{selectedAchievement.emoji}</Text>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {selectedAchievement.title}
              </Text>
              
              <View style={[styles.divider, { backgroundColor: colors.cardBorder }]} />
              
              <View style={styles.modalSection}>
                <Text style={[styles.modalLabel, { color: colors.textMuted }]}>HOW TO UNLOCK</Text>
                <Text style={[styles.modalDescription, { color: colors.textSecondary }]}>
                  {selectedAchievement.description}
                </Text>
              </View>

              {selectedUnlockDate && (
                <View style={[styles.unlockedInfo, { backgroundColor: colors.successBg }]}>
                  <Text style={[styles.unlockedLabel, { color: colors.success }]}>
                    ✓ Unlocked on {formatUnlockDate(selectedUnlockDate)}
                  </Text>
                </View>
              )}

              {!selectedUnlockDate && (
                <View style={[styles.lockedInfo, { backgroundColor: colors.cardBgAlt }]}>
                  <Text style={[styles.lockedLabel, { color: colors.textSecondary }]}>
                    🔒 Not yet unlocked
                  </Text>
                  <Text style={[styles.lockedHint, { color: colors.textMuted }]}>
                    Keep going! You'll get there.
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.closeButton, { backgroundColor: colors.primary }]}
                onPress={() => setSelectedAchievement(null)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          )}
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 100,
    gap: 20,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: '800',
  },
  pageSubtitle: {
    fontSize: 13,
    marginTop: -12,
  },
  progressCard: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    gap: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  progressCount: {
    fontSize: 18,
    fontWeight: '800',
  },
  progressBarBg: {
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  progressText: {
    fontSize: 13,
  },
  categorySection: {
    gap: 12,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  achievementCard: {
    width: '30%',
    aspectRatio: 0.9,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    gap: 8,
  },
  achievementEmoji: {
    fontSize: 32,
  },
  lockedEmoji: {
    fontSize: 24,
    opacity: 0.5,
  },
  achievementTitle: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 14,
  },
  unlockedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unlockedText: {
    fontSize: 12,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    width: '85%',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    alignItems: 'center',
    gap: 16,
  },
  modalEmoji: {
    fontSize: 64,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  divider: {
    height: 1,
    width: '100%',
  },
  modalSection: {
    width: '100%',
    gap: 6,
  },
  modalLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  modalDescription: {
    fontSize: 15,
    lineHeight: 22,
  },
  unlockedInfo: {
    width: '100%',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  unlockedLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  lockedInfo: {
    width: '100%',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    gap: 4,
  },
  lockedLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  lockedHint: {
    fontSize: 12,
  },
  closeButton: {
    width: '100%',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#000',
  },
});

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useColors } from '../../context/ThemeContext';
import { ACHIEVEMENTS } from '../../models/Achievement';
import { AchievementService } from '../../services/AchievementService';
import Chip from '../shared/Chip';
import { cardSurfaceStyle } from '../../constants/DesignSystem';

export default function AchievementsCard() {
  const colors = useColors();
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set());
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    const unlocked = await AchievementService.getUnlocked();
    setUnlockedIds(new Set(unlocked.map((a) => a.achievementId)));
  };

  const unlockedCount = unlockedIds.size;
  const totalCount = ACHIEVEMENTS.length;

  // Sort achievements: unlocked first, then by category
  const sortedAchievements = [...ACHIEVEMENTS].sort((a, b) => {
    const aUnlocked = unlockedIds.has(a.id);
    const bUnlocked = unlockedIds.has(b.id);
    if (aUnlocked !== bUnlocked) return bUnlocked ? 1 : -1;
    return 0;
  });

  const displayedAchievements = showAll ? sortedAchievements : sortedAchievements.slice(0, 6);

  return (
    <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Achievements</Text>
        <Chip
          label={`${unlockedCount}/${totalCount}`}
          compact
          backgroundColor={colors.primaryGlow}
          textColor={colors.primary}
        />
      </View>

      <View style={styles.grid}>
        {displayedAchievements.map((achievement) => {
          const isUnlocked = unlockedIds.has(achievement.id);
          return (
            <View
              key={achievement.id}
              style={[
                styles.achievementItem,
                { backgroundColor: colors.cardBgAlt, borderColor: colors.cardBorder },
                !isUnlocked && styles.lockedItem,
              ]}
            >
              <Text style={[styles.emoji, !isUnlocked && styles.lockedEmoji]}>
                {isUnlocked ? achievement.emoji : '🔒'}
              </Text>
              <Text
                style={[
                  styles.achievementTitle,
                  { color: isUnlocked ? colors.text : colors.textMuted },
                ]}
                numberOfLines={1}
              >
                {achievement.title}
              </Text>
            </View>
          );
        })}
      </View>

      {ACHIEVEMENTS.length > 6 && (
        <TouchableOpacity
          style={[styles.showMoreButton, { backgroundColor: colors.cardBgAlt }]}
          onPress={() => setShowAll(!showAll)}
        >
          <Text style={[styles.showMoreText, { color: colors.primary }]}>
            {showAll ? 'Show less' : `Show all (${ACHIEVEMENTS.length})`}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    ...cardSurfaceStyle,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  achievementItem: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    gap: 6,
    padding: 8,
  },
  lockedItem: {
    opacity: 0.5,
  },
  emoji: {
    fontSize: 24,
  },
  lockedEmoji: {
    fontSize: 18,
  },
  achievementTitle: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  showMoreButton: {
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  showMoreText: {
    fontSize: 14,
    fontWeight: '700',
  },
});

import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import PrimaryButton from '../shared/PrimaryButton';
import { GymEntry } from '../../models/GymEntry';
import { GymStatus } from '../../models/GymStatus';
import { useColors } from '../../context/ThemeContext';
import { cardSurfaceStyle, sectionHeadingTextStyle } from '../../constants/DesignSystem';

interface ActionButtonsCardProps {
  entry: GymEntry | null;
  canQuickLogToday: boolean;
  onWentGym: () => void;
  onNoGym: () => void;
}

export default function ActionButtonsCard({
  entry,
  canQuickLogToday,
  onWentGym,
  onNoGym,
}: ActionButtonsCardProps) {
  const colors = useColors();
  const isNoGym = entry?.status === GymStatus.NO_GYM;

  return (
    <View 
      style={[styles.container, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}
      accessibilityRole="group"
      accessibilityLabel="Quick logging actions"
      accessibilityHint="Use these actions to log today's gym status"
    >
      <Text style={[styles.label, { color: colors.textMuted }]}>Quick actions</Text>
      <PrimaryButton
        title={canQuickLogToday ? "We Go Gym" : "Already Logged"}
        onPress={onWentGym}
        variant="primary"
        style={{ opacity: canQuickLogToday ? 1 : 0.7 }}
        accessibilityLabel={canQuickLogToday ? "Log gym session" : "Already logged session today"}
        accessibilityHint={canQuickLogToday ? "Opens the split picker to log your workout" : "Session is already logged. Open today's session card to edit it."}
      />
      <PrimaryButton
        title="No Gym"
        onPress={onNoGym}
        variant="secondary"
        style={{ opacity: canQuickLogToday ? 1 : 0.7 }}
        accessibilityLabel={isNoGym ? "Log rest day (already logged today)" : "Log rest day"}
        accessibilityHint={canQuickLogToday ? "Marks today as a rest day" : "Session is already logged. Open today's session card to edit it."}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...cardSurfaceStyle,
    width: '100%',
    gap: 12,
  },
  label: sectionHeadingTextStyle,
});

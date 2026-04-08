import React from 'react';
import { View, StyleSheet, Alert, Text } from 'react-native';
import PrimaryButton from '../shared/PrimaryButton';
import { GymEntry } from '../../models/GymEntry';
import { GymStatus } from '../../models/GymStatus';
import { useColors } from '../../context/ThemeContext';

interface ActionButtonsCardProps {
  entry: GymEntry | null;
  onWentGym: () => void;
  onNoGym: () => void;
}

export default function ActionButtonsCard({ entry, onWentGym, onNoGym }: ActionButtonsCardProps) {
  const colors = useColors();
  const isNoGym = entry?.status === GymStatus.NO_GYM;
  const alreadyLogged = !!entry;

  const handleWentGymPress = () => {
    if (alreadyLogged) {
      // Button disabled - show alert
      Alert.alert(
        'Already Logged',
        'You already logged a session today! Tap your session card above to edit it.',
        [{ text: 'OK' }]
      );
    } else {
      onWentGym();
    }
  };

  const handleNoGymPress = () => {
    if (alreadyLogged) {
      Alert.alert(
        'Already Logged',
        'You already logged a session today! Tap your session card above to edit it.',
        [{ text: 'OK' }]
      );
    } else {
      onNoGym();
    }
  };

  return (
    <View 
      style={[styles.container, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}
      accessibilityRole="group"
      accessibilityLabel="Quick logging actions"
      accessibilityHint="Use these actions to log today's gym status"
    >
      <Text style={[styles.label, { color: colors.textMuted }]}>Quick actions</Text>
      <PrimaryButton
        title={alreadyLogged ? "Already Logged" : "We Go Gym"}
        onPress={handleWentGymPress}
        variant="primary"
        style={{ opacity: alreadyLogged ? 0.7 : 1 }}
        accessibilityLabel={alreadyLogged ? "Already logged session today" : "Log gym session"}
        accessibilityHint={alreadyLogged ? "Session is already logged. Open today's session card to edit it." : "Opens the split picker to log your workout"}
      />
      <PrimaryButton
        title="No Gym"
        onPress={handleNoGymPress}
        variant="secondary"
        style={{ opacity: alreadyLogged ? 0.7 : 1 }}
        accessibilityLabel={isNoGym ? "Log rest day (already logged today)" : "Log rest day"}
        accessibilityHint={alreadyLogged ? "Session is already logged. Open today's session card to edit it." : "Marks today as a rest day"}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    width: '100%',
    gap: 12,
  },
  label: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    fontWeight: '700',
  },
});

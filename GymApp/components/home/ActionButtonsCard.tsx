import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useColors } from '../../context/ThemeContext';
import PrimaryButton from '../shared/PrimaryButton';
import { GymEntry } from '../../models/GymEntry';
import { GymStatus } from '../../models/GymStatus';

interface ActionButtonsCardProps {
  entry: GymEntry | null;
  onWentGym: () => void;
  onNoGym: () => void;
}

export default function ActionButtonsCard({ entry, onWentGym, onNoGym }: ActionButtonsCardProps) {
  const colors = useColors();
  const isWent = entry?.status === GymStatus.WENT;
  const isNoGym = entry?.status === GymStatus.NO_GYM;

  return (
    <View 
      style={styles.container}
      accessibilityRole="group"
      accessibilityLabel="Gym logging actions"
    >
      <PrimaryButton
        title="WE GO GYM"
        onPress={onWentGym}
        variant="primary"
        style={{ marginBottom: 10 }}
        accessibilityLabel={isWent ? "Log gym session (already logged today)" : "Log gym session"}
        accessibilityHint="Opens workout split picker to log your gym session"
      />
      <PrimaryButton
        title="NO GYM"
        onPress={onNoGym}
        variant="secondary"
        accessibilityLabel={isNoGym ? "Log rest day (already logged today)" : "Log rest day"}
        accessibilityHint="Marks today as a rest day"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 0,
  },
});

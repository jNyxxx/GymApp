import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColors } from '../../context/ThemeContext';
import { GymEntry } from '../../models/GymEntry';
import { GymStatus } from '../../models/GymStatus';
import SplitIcon from '../shared/SplitIcon';

interface TodayStatusCardProps {
  entry: GymEntry | null;
}

export default function TodayStatusCard({ entry }: TodayStatusCardProps) {
  const colors = useColors();

  if (!entry) {
    return (
      <View style={[styles.container, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
        <Text style={[styles.label, { color: colors.textMuted }]}>Today Status</Text>
        <View style={styles.emptyRow}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Not logged yet</Text>
        </View>
      </View>
    );
  }

  const isWent = entry.status === GymStatus.WENT;
  const loggedTime = entry.loggedAt
    ? new Date(entry.loggedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    : '';

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.cardBg, borderColor: colors.cardBorder },
        isWent && { borderColor: colors.primaryBorder },
      ]}
    >
      <Text style={[styles.label, { color: colors.textMuted }]}>Today Status</Text>

      <View style={styles.statusRow}>
        <View style={styles.statusLeft}>
          <Text style={[styles.statusText, { color: colors.text }]}>
            {isWent ? 'Went to gym' : 'No gym'}
          </Text>
          {loggedTime && (
            <Text style={[styles.timeText, { color: colors.textSecondary }]}>
              Logged at {loggedTime} · Session saved
            </Text>
          )}
        </View>
        {isWent && (
          <View style={[styles.checkCircle, { backgroundColor: colors.primaryGlow, borderColor: colors.primaryBorder }]}>
            <Text style={[styles.checkText, { color: colors.primary }]}>✓</Text>
          </View>
        )}
      </View>

      {isWent && entry.split && (
        <SplitIcon split={entry.split} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    gap: 14,
  },
  label: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    fontWeight: '700',
  },
  emptyRow: {
    paddingVertical: 8,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '600',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statusLeft: {
    flex: 1,
  },
  statusText: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  timeText: {
    fontSize: 13,
    fontWeight: '500',
  },
  checkCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  checkText: {
    fontSize: 18,
    fontWeight: '800',
  },
});

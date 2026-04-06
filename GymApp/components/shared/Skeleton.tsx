import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useColors } from '../../context/ThemeContext';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: object;
}

/**
 * A shimmer skeleton loader component for loading states.
 * Provides better perceived performance than spinners.
 */
export function Skeleton({ 
  width = '100%', 
  height = 20, 
  borderRadius = 8,
  style 
}: SkeletonProps) {
  const colors = useColors();
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: colors.gray,
          opacity,
        },
        style,
      ]}
      accessibilityLabel="Loading"
      accessibilityRole="progressbar"
    />
  );
}

/**
 * Skeleton for the greeting header area
 */
export function GreetingHeaderSkeleton() {
  return (
    <View style={skeletonStyles.greetingContainer}>
      <Skeleton width={200} height={28} borderRadius={6} />
      <Skeleton width={120} height={16} borderRadius={4} style={{ marginTop: 8 }} />
    </View>
  );
}

/**
 * Skeleton for the status card
 */
export function StatusCardSkeleton() {
  const colors = useColors();
  return (
    <View style={[skeletonStyles.card, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
      <View style={skeletonStyles.statusRow}>
        <Skeleton width={60} height={60} borderRadius={30} />
        <View style={skeletonStyles.statusText}>
          <Skeleton width={100} height={20} borderRadius={4} />
          <Skeleton width={150} height={14} borderRadius={4} style={{ marginTop: 6 }} />
        </View>
      </View>
    </View>
  );
}

/**
 * Skeleton for action buttons
 */
export function ActionButtonsSkeleton() {
  const colors = useColors();
  return (
    <View style={[skeletonStyles.card, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
      <View style={skeletonStyles.buttonsRow}>
        <Skeleton width="48%" height={56} borderRadius={16} />
        <Skeleton width="48%" height={56} borderRadius={16} />
      </View>
    </View>
  );
}

/**
 * Skeleton for streak card
 */
export function StreakCardSkeleton() {
  const colors = useColors();
  return (
    <View style={[skeletonStyles.card, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
      <Skeleton width={80} height={12} borderRadius={4} style={{ marginBottom: 12 }} />
      <View style={skeletonStyles.streakRow}>
        <View style={skeletonStyles.streakItem}>
          <Skeleton width={50} height={32} borderRadius={6} />
          <Skeleton width={60} height={12} borderRadius={4} style={{ marginTop: 4 }} />
        </View>
        <View style={skeletonStyles.streakItem}>
          <Skeleton width={50} height={32} borderRadius={6} />
          <Skeleton width={60} height={12} borderRadius={4} style={{ marginTop: 4 }} />
        </View>
      </View>
    </View>
  );
}

/**
 * Skeleton for monthly progress
 */
export function MonthlyProgressSkeleton() {
  const colors = useColors();
  return (
    <View style={[skeletonStyles.card, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
      <Skeleton width={120} height={12} borderRadius={4} style={{ marginBottom: 12 }} />
      <Skeleton width="100%" height={8} borderRadius={4} style={{ marginBottom: 12 }} />
      <View style={skeletonStyles.statsRow}>
        <Skeleton width={60} height={24} borderRadius={12} />
        <Skeleton width={60} height={24} borderRadius={12} />
        <Skeleton width={60} height={24} borderRadius={12} />
      </View>
    </View>
  );
}

/**
 * Full home screen skeleton
 */
export function HomeScreenSkeleton() {
  return (
    <View style={skeletonStyles.container}>
      <GreetingHeaderSkeleton />
      <StatusCardSkeleton />
      <ActionButtonsSkeleton />
      <StreakCardSkeleton />
      <MonthlyProgressSkeleton />
    </View>
  );
}

const skeletonStyles = StyleSheet.create({
  container: {
    gap: 16,
    paddingTop: 12,
  },
  greetingContainer: {
    paddingVertical: 8,
  },
  card: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  statusText: {
    flex: 1,
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  streakRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  streakItem: {
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
});

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useColors } from '../../context/ThemeContext';
import { Achievement } from '../../models/Achievement';

interface AchievementToastProps {
  achievement: Achievement | null;
  visible: boolean;
  onHide: () => void;
}

export default function AchievementToast({ achievement, visible, onHide }: AchievementToastProps) {
  const colors = useColors();
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible && achievement) {
      // Slide in
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-hide after 3 seconds
      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: -100,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          onHide();
        });
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [visible, achievement]);

  if (!achievement) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: colors.cardBg,
          borderColor: colors.primary,
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <Text style={styles.emoji}>{achievement.emoji}</Text>
      <View style={styles.textContainer}>
        <Text style={[styles.label, { color: colors.primary }]}>Achievement Unlocked!</Text>
        <Text style={[styles.title, { color: colors.text }]}>{achievement.title}</Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          {achievement.description}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  emoji: {
    fontSize: 32,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
  },
  description: {
    fontSize: 13,
    marginTop: 2,
  },
});

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColors } from '../../context/ThemeContext';

interface BarChartProps {
  data: { label: string; value: number }[];
  maxValue?: number;
  height?: number;
  barColor?: string;
  showLabels?: boolean;
}

/**
 * Simple bar chart component built with native Views.
 * No external dependencies required.
 */
export default function SimpleBarChart({
  data,
  maxValue,
  height = 120,
  barColor,
  showLabels = true,
}: BarChartProps) {
  const colors = useColors();
  const max = maxValue || Math.max(...data.map((d) => d.value), 1);
  const chartColor = barColor || colors.primary;

  return (
    <View style={styles.container}>
      <View style={[styles.chartArea, { height }]}>
        {data.map((item, index) => {
          const barHeight = (item.value / max) * height;
          return (
            <View key={index} style={styles.barContainer}>
              <View style={styles.barWrapper}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: barHeight,
                      backgroundColor: chartColor,
                    },
                  ]}
                />
              </View>
              {showLabels && (
                <Text style={[styles.label, { color: colors.textMuted }]} numberOfLines={1}>
                  {item.label}
                </Text>
              )}
            </View>
          );
        })}
      </View>
      {/* Value labels above bars */}
      <View style={[styles.valueLabels, { height }]}>
        {data.map((item, index) => {
          const barHeight = (item.value / max) * height;
          return (
            <View key={index} style={styles.barContainer}>
              <View style={[styles.barWrapper, { justifyContent: 'flex-end', paddingBottom: barHeight + 4 }]}>
                {item.value > 0 && (
                  <Text style={[styles.valueLabel, { color: colors.text }]}>{item.value}</Text>
                )}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  chartArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
  },
  barWrapper: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: '70%',
    maxWidth: 40,
    borderRadius: 6,
    minHeight: 4,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 6,
    textAlign: 'center',
  },
  valueLabels: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: 8,
  },
  valueLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
});

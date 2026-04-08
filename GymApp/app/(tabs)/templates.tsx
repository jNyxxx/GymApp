import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { useColors } from '../../context/ThemeContext';
import TemplatesView from '../../components/templates/TemplatesView';

export default function TemplatesTab() {
  const colors = useColors();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <TemplatesView />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { useTheme } from '../hooks/useTheme';

export function SessionControls({ isRunning, isPaused, onPause, onEnd }) {
  const theme = useTheme();
  if (!isRunning) return <View />;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.btn, { backgroundColor: theme.accentDim, borderColor: theme.accentBorder }]}
        onPress={onPause}
        activeOpacity={0.8}
      >
        <Text style={[styles.btnPrimaryText, { color: theme.accent }]}>
          {isPaused ? '▶  resume' : '⏸  pause'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.btn, styles.btnDanger]}
        onPress={onEnd}
        activeOpacity={0.8}
      >
        <Text style={styles.btnDangerText}>✕  end session</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  btn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    marginHorizontal: 4,
  },
  btnPrimaryText: {
    fontSize: 13,
    fontWeight: '600',
  },
  btnDanger: {
    backgroundColor: Colors.dangerDim,
    borderColor: Colors.dangerBorder,
  },
  btnDangerText: {
    color: Colors.danger,
    fontSize: 13,
    fontWeight: '600',
  },
});

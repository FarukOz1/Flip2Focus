import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';

export function SessionControls({ isRunning, isPaused, onPause, onEnd }) {
  if (!isRunning) return <View />;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.btn, styles.btnPrimary]}
        onPress={onPause}
        activeOpacity={0.8}
      >
        <Text style={styles.btnPrimaryText}>
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
  btnPrimary: {
    backgroundColor: Colors.accentDim,
    borderColor: Colors.accentBorder,
  },
  btnPrimaryText: {
    color: Colors.accent,
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
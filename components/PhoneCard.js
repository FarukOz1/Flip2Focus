import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  Animated,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Colors } from '../constants/colors';
import { useTheme } from '../hooks/useTheme';
import { FlameBorderOverlay } from './FlameBorderOverlay';

export function PhoneCard({
  isFlipped,
  remainingSeconds,
  selectedDuration,
  sessionNumber,
  onPress,
}) {
  const theme = useTheme();
  const flipAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(flipAnim, {
      toValue: isFlipped ? 1 : 0,
      friction: 8,
      tension: 60,
      useNativeDriver: true,
    }).start();
  }, [isFlipped]);

  const frontRotate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const backRotate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const timeStr =
    String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');

  const total = selectedDuration * 60;
  const progressPct = Math.max(0, Math.round((1 - remainingSeconds / total) * 100));

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={styles.container}>
      {/* FRONT */}
      <Animated.View
        style={[
          styles.face,
          styles.front,
          { transform: [{ rotateY: frontRotate }], backfaceVisibility: 'hidden' },
        ]}
      >
        <FlameBorderOverlay />
        <View style={styles.phoneIconWrap}>
          <Text style={styles.phoneEmoji}>📱</Text>
        </View>
        <Text style={styles.frontTitle}>Ready to Focus?</Text>
        <Text style={styles.frontSub}>
          Flip your phone face-down{'\n'}to start a focus session
        </Text>
        <View style={[styles.hintBadge, { backgroundColor: theme.accentDim, borderColor: theme.accentBorder }]}>
          <Text style={[styles.hintText, { color: theme.accent }]}>↷  tap to flip & start</Text>
        </View>
      </Animated.View>

      {/* BACK */}
      <Animated.View
        style={[
          styles.face,
          styles.back,
          {
            backgroundColor: theme.focusBg,
            borderColor: theme.accentBorder,
            transform: [{ rotateY: backRotate }],
            backfaceVisibility: 'hidden',
          },
        ]}
      >
        <FlameBorderOverlay />
        <View style={[styles.focusBadge, { backgroundColor: theme.accentFaint, borderColor: theme.accentBorder }]}>
          <View style={[styles.pulseDot, { backgroundColor: theme.accent }]} />
          <Text style={[styles.focusBadgeText, { color: theme.accent }]}>DEEP FOCUS</Text>
        </View>

        <View style={styles.timerBlock}>
          <Text style={[styles.timerLabel, { color: theme.accentText }]}>TIME FOCUSED</Text>
          <Text style={[styles.timerTime, { color: theme.accent }]}>{timeStr}</Text>
          <Text style={[styles.sessionLabel, { color: theme.accentText }]}>session {sessionNumber}</Text>
        </View>

        <View style={styles.progressBlock}>
          <View style={[styles.progressBg, { backgroundColor: theme.accentFaint }]}>
            <View style={[styles.progressFg, { width: progressPct + '%', backgroundColor: theme.accent }]} />
          </View>
          <Text style={[styles.progressPct, { color: theme.accentText }]}>{progressPct}%</Text>
        </View>

        <Text style={[styles.backHint, { color: theme.accentText }]}>tap to end session</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 260,
    borderRadius: 20,
  },
  face: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  front: {
    backgroundColor: Colors.surface,
    borderWidth: 0.5,
    borderColor: Colors.border2,
  },
  back: {
    borderWidth: 1,
    justifyContent: 'space-between',
    paddingVertical: 22,
  },
  phoneIconWrap: {
    width: 72, height: 72,
    backgroundColor: Colors.surface2,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: Colors.border2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  phoneEmoji: { fontSize: 28 },
  frontTitle: {
    fontSize: 22, fontWeight: '700',
    color: Colors.text, textAlign: 'center', marginBottom: 6,
  },
  frontSub: {
    fontSize: 13, color: Colors.textMuted,
    textAlign: 'center', lineHeight: 20, marginBottom: 14,
  },
  hintBadge: {
    borderWidth: 0.5, borderRadius: 8,
    paddingHorizontal: 14, paddingVertical: 7,
  },
  hintText: { fontSize: 12, fontWeight: '500' },
  focusBadge: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 0.5, borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 6,
  },
  pulseDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  focusBadgeText: { fontSize: 11, letterSpacing: 1.5, fontWeight: '600' },
  timerBlock: { alignItems: 'center' },
  timerLabel: { fontSize: 10, letterSpacing: 2, fontWeight: '600', marginBottom: 4 },
  timerTime: { fontSize: 64, fontWeight: '800', letterSpacing: -3, lineHeight: 72 },
  sessionLabel: { fontSize: 11, marginTop: 2 },
  progressBlock: {
    flexDirection: 'row', alignItems: 'center',
    width: '100%', paddingHorizontal: 8,
  },
  progressBg: {
    flex: 1, height: 3, borderRadius: 2,
    overflow: 'hidden', marginRight: 10,
  },
  progressFg: { height: '100%', borderRadius: 2 },
  progressPct: { fontSize: 11, minWidth: 30, textAlign: 'right' },
  backHint: { fontSize: 11 },
});

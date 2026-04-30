import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  Animated,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Colors } from '../constants/colors';

export function PhoneCard({
  isFlipped,
  remainingSeconds,
  selectedDuration,
  sessionNumber,
  onPress,
}) {
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
        <View style={styles.phoneIconWrap}>
          <Text style={styles.phoneEmoji}>📱</Text>
        </View>
        <Text style={styles.frontTitle}>Ready to Focus?</Text>
        <Text style={styles.frontSub}>
          Flip your phone face-down{'\n'}to start a focus session
        </Text>
        <View style={styles.hintBadge}>
          <Text style={styles.hintText}>↷  tap to flip & start</Text>
        </View>
      </Animated.View>

      {/* BACK */}
      <Animated.View
        style={[
          styles.face,
          styles.back,
          { transform: [{ rotateY: backRotate }], backfaceVisibility: 'hidden' },
        ]}
      >
        <View style={styles.focusBadge}>
          <View style={styles.pulseDot} />
          <Text style={styles.focusBadgeText}>DEEP FOCUS</Text>
        </View>

        <View style={styles.timerBlock}>
          <Text style={styles.timerLabel}>TIME FOCUSED</Text>
          <Text style={styles.timerTime}>{timeStr}</Text>
          <Text style={styles.sessionLabel}>session {sessionNumber}</Text>
        </View>

        <View style={styles.progressBlock}>
          <View style={styles.progressBg}>
            <View style={[styles.progressFg, { width: progressPct + '%' }]} />
          </View>
          <Text style={styles.progressPct}>{progressPct}%</Text>
        </View>

        <Text style={styles.backHint}>tap to end session</Text>
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
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
    backgroundColor: '#0d1503',
    borderWidth: 1,
    borderColor: Colors.accentBorder,
    justifyContent: 'space-between',
    paddingVertical: 22,
  },
  phoneIconWrap: {
    width: 72,
    height: 72,
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
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 6,
  },
  frontSub: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 14,
  },
  hintBadge: {
    backgroundColor: Colors.accentDim,
    borderWidth: 0.5,
    borderColor: Colors.accentBorder,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  hintText: {
    fontSize: 12,
    color: Colors.accent,
    fontWeight: '500',
  },
  focusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(200,245,66,0.1)',
    borderWidth: 0.5,
    borderColor: Colors.accentBorder,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.accent,
    marginRight: 6,
  },
  focusBadgeText: {
    fontSize: 11,
    color: Colors.accent,
    letterSpacing: 1.5,
    fontWeight: '600',
  },
  timerBlock: {
    alignItems: 'center',
  },
  timerLabel: {
    fontSize: 10,
    letterSpacing: 2,
    color: 'rgba(200,245,66,0.5)',
    fontWeight: '600',
    marginBottom: 4,
  },
  timerTime: {
    fontSize: 64,
    fontWeight: '800',
    color: Colors.accent,
    letterSpacing: -3,
    lineHeight: 72,
  },
  sessionLabel: {
    fontSize: 11,
    color: 'rgba(200,245,66,0.4)',
    marginTop: 2,
  },
  progressBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 8,
  },
  progressBg: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(200,245,66,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
    marginRight: 10,
  },
  progressFg: {
    height: '100%',
    backgroundColor: Colors.accent,
    borderRadius: 2,
  },
  progressPct: {
    fontSize: 11,
    color: 'rgba(200,245,66,0.5)',
    minWidth: 30,
    textAlign: 'right',
  },
  backHint: {
    fontSize: 11,
    color: 'rgba(200,245,66,0.35)',
  },
});
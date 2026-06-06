import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Animated,
  TouchableOpacity, Platform, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../hooks/useTheme';

export function FlipFocusMode({ visible, remainingSeconds, selectedDuration, onEnd }) {
  const theme = useTheme();
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: visible ? 1 : 0,
      duration: 700,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.02, duration: 2000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.95, duration: 2000, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [visible]);

  const minutes  = Math.floor(remainingSeconds / 60);
  const seconds  = remainingSeconds % 60;
  const timeStr  = String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');
  const progress = Math.max(0, 1 - remainingSeconds / (selectedDuration * 60));

  if (!visible) return null;

  // Tema gradyanı: yukarıdan hafif renkli, aşağıya tamamen karanlık
  const gradientColors = [theme.gradientColors[0], theme.flipBg];

  return (
    <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.flipBg} />

      {/* Tema gradyanı */}
      <LinearGradient
        colors={gradientColors}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.6 }}
      />

      {/* İnce progress — ekranın üstü */}
      <View style={[styles.progressBarWrap, { backgroundColor: theme.accentFaint }]}>
        <View style={[styles.progressBar, { width: `${progress * 100}%`, backgroundColor: theme.accent }]} />
      </View>

      <View style={styles.center}>
        <Animated.View style={{ transform: [{ scale: pulseAnim }], alignItems: 'center' }}>
          <Text style={[styles.timerTime, { color: theme.accentText }]}>{timeStr}</Text>
          <Text style={[styles.timerSub, { color: theme.accentFaint }]}>odaklanıyorsun</Text>
        </Animated.View>

        <Text style={styles.hint}>Telefonu çevirerek bitir</Text>
      </View>

      {/* Gizli acil çıkış — 3sn bas */}
      <TouchableOpacity style={styles.emergencyBtn} onLongPress={onEnd} delayLongPress={3000}>
        <Text style={[styles.emergencyText, { color: theme.accentFaint }]}>· · ·</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 998,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBarWrap: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 2,
  },
  progressBar: { height: 2 },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  timerTime: {
    fontSize: 72,
    fontWeight: '200',
    letterSpacing: -2,
    lineHeight: 80,
  },
  timerSub: {
    fontSize: 12,
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginTop: 8,
  },
  hint: {
    position: 'absolute',
    bottom: -110,
    fontSize: 11,
    color: 'rgba(255,255,255,0.1)',
    letterSpacing: 0.5,
  },
  emergencyBtn: {
    position: 'absolute',
    bottom: Platform.OS === 'android' ? 32 : 48,
    alignSelf: 'center',
    padding: 16,
  },
  emergencyText: {
    fontSize: 18,
    letterSpacing: 4,
  },
});

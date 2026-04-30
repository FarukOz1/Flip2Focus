import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Animated,
  TouchableOpacity, Dimensions, Platform, StatusBar,
} from 'react-native';
import { Colors } from '../constants/colors';

const { width: W, height: H } = Dimensions.get('window');

// Titreyen minimal sayaç — dikkat dağıtmaz
export function FlipFocusMode({ visible, remainingSeconds, selectedDuration, onEnd }) {
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: visible ? 1 : 0,
      duration: 600,
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

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const timeStr = String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');
  const progress = Math.max(0, 1 - remainingSeconds / (selectedDuration * 60));

  if (!visible) return null;

  return (
    <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* Sadece sayaç — minimalist */}
      <View style={styles.center}>
        {/* İnce progress çizgisi — ekranın üstünde */}
        <View style={styles.progressBarWrap}>
          <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
        </View>

        <Animated.View style={{ transform: [{ scale: pulseAnim }], alignItems: 'center' }}>
          <Text style={styles.timerTime}>{timeStr}</Text>
          <Text style={styles.timerSub}>odaklanıyorsun</Text>
        </Animated.View>

        {/* Telefonu geri çevir ipucu */}
        <Text style={styles.hint}>
          Telefonu çevirerek bitir
        </Text>
      </View>

      {/* Gizli acil çıkış — 3sn bas */}
      <TouchableOpacity style={styles.emergencyBtn} onLongPress={onEnd} delayLongPress={3000}>
        <Text style={styles.emergencyText}>· · ·</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: '#000000',
    zIndex: 998,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBarWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(200,245,66,0.08)',
  },
  progressBar: {
    height: 2,
    backgroundColor: Colors.accent,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  timerTime: {
    fontSize: 72,
    fontWeight: '200',  // çok ince — minimal
    color: 'rgba(200,245,66,0.7)',
    letterSpacing: -2,
    lineHeight: 80,
  },
  timerSub: {
    fontSize: 12,
    color: 'rgba(200,245,66,0.2)',
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginTop: 8,
  },
  hint: {
    position: 'absolute',
    bottom: -120,
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
    color: 'rgba(255,255,255,0.08)',
    letterSpacing: 4,
  },
});
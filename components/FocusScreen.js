import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Animated,
  TouchableOpacity, Dimensions, Platform, StatusBar,
} from 'react-native';
import { Colors } from '../constants/colors';

const { width: W, height: H } = Dimensions.get('window');

const MESSAGES = [
  'Derin odakta kal.',
  'Dikkatini koru.',
  'Şu an önemli olan bu.',
  'Her saniye sayılır.',
  'Akışa gir.',
  'Sadece bu an.',
];

// Yüzen parçacık
function Particle({ delay, x, size, duration }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { toValue: 1, duration, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);
  const translateY = anim.interpolate({ inputRange: [0,1], outputRange: [H * 0.85, -20] });
  const opacity    = anim.interpolate({ inputRange: [0, 0.1, 0.85, 1], outputRange: [0, 0.5, 0.2, 0] });
  return (
    <Animated.View style={{
      position: 'absolute', left: x,
      width: size, height: size, borderRadius: size / 2,
      backgroundColor: Colors.accent,
      transform: [{ translateY }], opacity,
    }} />
  );
}

const PARTICLES = [
  { delay: 0,    x: W*0.08, size: 3, duration: 7000 },
  { delay: 1500, x: W*0.25, size: 5, duration: 8500 },
  { delay: 700,  x: W*0.45, size: 3, duration: 6500 },
  { delay: 2200, x: W*0.65, size: 4, duration: 9000 },
  { delay: 400,  x: W*0.82, size: 3, duration: 7500 },
];

export function FocusScreen({
  visible,
  remainingSeconds,
  selectedDuration,
  sessionNumber,
  isPaused,
  onPause,
  onEnd,
}) {
  const slideAnim  = useRef(new Animated.Value(H)).current;
  const pulseAnim  = useRef(new Animated.Value(1)).current;
  const msgOpacity = useRef(new Animated.Value(1)).current;
  const [msgIdx, setMsgIdx] = useState(0);

  // Slide up/down
  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: visible ? 0 : H,
      friction: 9, tension: 55,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  // Timer pulse
  useEffect(() => {
    if (!visible || isPaused) { pulseAnim.setValue(1); return; }
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1.03, duration: 1200, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1,    duration: 1200, useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [visible, isPaused]);

  // Mesaj rotasyonu
  useEffect(() => {
    if (!visible) return;
    const iv = setInterval(() => {
      Animated.timing(msgOpacity, { toValue: 0, duration: 400, useNativeDriver: true }).start(() => {
        setMsgIdx((i) => (i + 1) % MESSAGES.length);
        Animated.timing(msgOpacity, { toValue: 1, duration: 400, useNativeDriver: true }).start();
      });
    }, 7000);
    return () => clearInterval(iv);
  }, [visible]);

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const timeStr = String(minutes).padStart(2,'0') + ':' + String(seconds).padStart(2,'0');
  const total   = selectedDuration * 60;
  const progress = Math.max(0, Math.min(1, 1 - remainingSeconds / total));
  const pct = Math.round(progress * 100);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.overlay, { transform: [{ translateY: slideAnim }] }]}>
      <StatusBar barStyle="light-content" backgroundColor="#050a01" />

      {/* Parçacıklar */}
      {PARTICLES.map((p, i) => <Particle key={i} {...p} />)}

      {/* Üst bar */}
      <View style={styles.topBar}>
        <View style={styles.livePill}>
          <View style={styles.liveDot} />
          <Text style={styles.livePillText}>SESSION {sessionNumber}</Text>
        </View>
        <TouchableOpacity style={styles.endBtn} onPress={onEnd} activeOpacity={0.8}>
          <Text style={styles.endBtnText}>Bitir</Text>
        </TouchableOpacity>
      </View>

      {/* Progress çizgisi */}
      <View style={styles.progressWrap}>
        <View style={[styles.progressFg, { width: `${pct}%` }]} />
      </View>

      {/* Timer */}
      <View style={styles.center}>
        <Text style={styles.timerLabel}>
          {isPaused ? 'DURAKLATILDI' : 'ODAKLANIYORSUN'}
        </Text>
        <Animated.Text style={[styles.timerTime, { transform: [{ scale: pulseAnim }] }]}>
          {timeStr}
        </Animated.Text>
        <Text style={styles.timerPct}>{pct}% tamamlandı</Text>
      </View>

      {/* Mesaj */}
      <Animated.Text style={[styles.focusMsg, { opacity: msgOpacity }]}>
        {MESSAGES[msgIdx]}
      </Animated.Text>

      {/* Pause butonu */}
      <TouchableOpacity
        style={[styles.pauseBtn, isPaused && styles.pauseBtnActive]}
        onPress={onPause}
        activeOpacity={0.85}
      >
        <Text style={styles.pauseBtnText}>
          {isPaused ? '▶  Devam Et' : '⏸  Duraklat'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.flipHint}>Telefonu çevirerek de bitirebilirsin</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: '#050a01',
    zIndex: 999,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 32) : 52,
    paddingBottom: 36,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 14,
  },
  livePill: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(200,245,66,0.07)',
    borderWidth: 0.5, borderColor: Colors.accentBorder,
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6,
  },
  liveDot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: Colors.accent, marginRight: 7,
  },
  livePillText: {
    fontSize: 11, color: Colors.accent,
    fontWeight: '700', letterSpacing: 1.5,
  },
  endBtn: {
    backgroundColor: 'rgba(255,92,92,0.1)',
    borderWidth: 0.5, borderColor: 'rgba(255,92,92,0.3)',
    borderRadius: 10, paddingHorizontal: 16, paddingVertical: 7,
  },
  endBtnText: { color: Colors.danger, fontSize: 13, fontWeight: '600' },

  progressWrap: {
    width: '100%', height: 2,
    backgroundColor: 'rgba(200,245,66,0.07)',
    borderRadius: 1, marginBottom: 0, overflow: 'hidden',
  },
  progressFg: {
    height: 2, backgroundColor: Colors.accent, borderRadius: 1,
  },

  center: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
  },
  timerLabel: {
    fontSize: 10, letterSpacing: 3,
    color: 'rgba(200,245,66,0.4)', fontWeight: '700',
    marginBottom: 8, textTransform: 'uppercase',
  },
  timerTime: {
    fontSize: 76, fontWeight: '800',
    color: Colors.accent, letterSpacing: -5, lineHeight: 82,
  },
  timerPct: {
    fontSize: 12, color: 'rgba(200,245,66,0.3)',
    marginTop: 10,
  },

  focusMsg: {
    fontSize: 15, color: 'rgba(200,245,66,0.35)',
    fontStyle: 'italic', textAlign: 'center',
    marginBottom: 24,
  },

  pauseBtn: {
    width: '100%',
    backgroundColor: 'rgba(200,245,66,0.07)',
    borderWidth: 0.5, borderColor: Colors.accentBorder,
    borderRadius: 16, paddingVertical: 17,
    alignItems: 'center', marginBottom: 14,
  },
  pauseBtnActive: { backgroundColor: 'rgba(200,245,66,0.14)' },
  pauseBtnText: {
    color: Colors.accent, fontSize: 16, fontWeight: '700', letterSpacing: 0.5,
  },

  flipHint: {
    fontSize: 11, color: 'rgba(255,255,255,0.12)', textAlign: 'center',
  },
});
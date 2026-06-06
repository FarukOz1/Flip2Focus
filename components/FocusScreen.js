import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Animated,
  TouchableOpacity, Dimensions, Platform, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/colors';
import { useTheme } from '../hooks/useTheme';

const { width: W, height: H } = Dimensions.get('window');

// ── Parçacık seti tanımları ─────────────────────────────────────
// rotation: statik açı (yaprak için), spark: yüksek parlaklık (kor için)
const PARTICLE_SETS = {
  // Default: yukarı yüzen noktalar — hafif yatay sürüklenmeyle
  default: [
    { delay: 0,    x: W*0.08, size: 3, duration: 7000,  driftAmount: 10, rotation: 0, spark: false },
    { delay: 1500, x: W*0.25, size: 5, duration: 8500,  driftAmount: 7,  rotation: 0, spark: false },
    { delay: 700,  x: W*0.45, size: 3, duration: 6500,  driftAmount: 12, rotation: 0, spark: false },
    { delay: 2200, x: W*0.65, size: 4, duration: 9000,  driftAmount: 8,  rotation: 0, spark: false },
    { delay: 400,  x: W*0.82, size: 3, duration: 7500,  driftAmount: 9,  rotation: 0, spark: false },
  ],
  // Leaf (Forest): oval yapraklar sallana sallana düşer
  leaf: [
    { delay: 0,    x: W*0.12, size: 7,  duration: 12000, driftAmount: 40, rotation: 22,  spark: false },
    { delay: 2200, x: W*0.32, size: 10, duration: 14000, driftAmount: 52, rotation: -18, spark: false },
    { delay: 900,  x: W*0.52, size: 6,  duration: 10000, driftAmount: 32, rotation: 35,  spark: false },
    { delay: 3800, x: W*0.70, size: 9,  duration: 13000, driftAmount: 44, rotation: -28, spark: false },
    { delay: 1400, x: W*0.86, size: 7,  duration: 11500, driftAmount: 36, rotation: 15,  spark: false },
    { delay: 5000, x: W*0.04, size: 5,  duration: 9500,  driftAmount: 26, rotation: -40, spark: false },
    { delay: 2700, x: W*0.60, size: 8,  duration: 12500, driftAmount: 48, rotation: 30,  spark: false },
  ],
  // Wave (Ocean): farklı büyüklükte noktalar dalgalanır
  wave: [
    { delay: 0,    x: W*0.04, size: 4,  duration: 5500,  driftAmount: 70, rotation: 0,   spark: false },
    { delay: 700,  x: W*0.18, size: 6,  duration: 7000,  driftAmount: 80, rotation: 0,   spark: false },
    { delay: 1400, x: W*0.34, size: 3,  duration: 5000,  driftAmount: 62, rotation: 0,   spark: false },
    { delay: 2100, x: W*0.50, size: 8,  duration: 8000,  driftAmount: 75, rotation: 0,   spark: false },
    { delay: 2800, x: W*0.66, size: 3,  duration: 6000,  driftAmount: 68, rotation: 0,   spark: false },
    { delay: 3500, x: W*0.82, size: 5,  duration: 6500,  driftAmount: 85, rotation: 0,   spark: false },
    { delay: 500,  x: W*0.42, size: 4,  duration: 5200,  driftAmount: 58, rotation: 0,   spark: false },
    { delay: 4200, x: W*0.92, size: 6,  duration: 7500,  driftAmount: 72, rotation: 0,   spark: false },
  ],
  // Ember (Sunset): kor parçaları — hafif sürüklenmeyle daha gerçekçi ateş
  ember: [
    { delay: 0,    x: W*0.10, size: 2,  duration: 3200,  driftAmount: 5,  rotation: 0, spark: false },
    { delay: 300,  x: W*0.24, size: 3,  duration: 4200,  driftAmount: 8,  rotation: 0, spark: true  },
    { delay: 600,  x: W*0.38, size: 2,  duration: 2900,  driftAmount: 4,  rotation: 0, spark: false },
    { delay: 900,  x: W*0.52, size: 4,  duration: 4800,  driftAmount: 10, rotation: 0, spark: true  },
    { delay: 1200, x: W*0.66, size: 2,  duration: 3500,  driftAmount: 6,  rotation: 0, spark: false },
    { delay: 1500, x: W*0.80, size: 3,  duration: 3000,  driftAmount: 5,  rotation: 0, spark: false },
    { delay: 200,  x: W*0.30, size: 2,  duration: 5500,  driftAmount: 7,  rotation: 0, spark: false },
    { delay: 1800, x: W*0.62, size: 3,  duration: 4500,  driftAmount: 9,  rotation: 0, spark: true  },
    { delay: 2100, x: W*0.17, size: 2,  duration: 3800,  driftAmount: 4,  rotation: 0, spark: false },
    { delay: 2400, x: W*0.74, size: 2,  duration: 3100,  driftAmount: 6,  rotation: 0, spark: false },
  ],
};

// ── Parçacık bileşeni ─────────────────────────────────────────────
function Particle({ delay, x, size, duration, accent, mode, driftAmount, rotation, spark }) {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const driftAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(floatAnim, { toValue: 1, duration, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    );
    floatLoop.start();

    if (driftAmount > 0) {
      const driftLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(driftAnim, { toValue: 1,  duration: duration * 0.44, useNativeDriver: true }),
          Animated.timing(driftAnim, { toValue: -1, duration: duration * 0.44, useNativeDriver: true }),
        ])
      );
      driftLoop.start();
    }

    return () => {
      floatAnim.stopAnimation();
      driftAnim.stopAnimation();
    };
  }, []);

  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: mode === 'leaf' ? [-40, H * 0.95] : [H * 0.9, -30],
  });

  // Per-mode opacity eğrisi
  const opacity =
    mode === 'ember'
      ? floatAnim.interpolate({
          inputRange:  [0, 0.05, 0.45, 0.75, 1],
          outputRange: [0, spark ? 1.0 : 0.75, 0.25, 0.08, 0],
        })
      : mode === 'leaf'
      ? floatAnim.interpolate({
          // hafif parıltı efekti: yaprak dönerken ışığı yakalar
          inputRange:  [0, 0.08, 0.28, 0.48, 0.68, 0.88, 1],
          outputRange: [0, 0.65, 0.38, 0.58, 0.32, 0.18, 0],
        })
      : mode === 'wave'
      ? floatAnim.interpolate({
          inputRange:  [0, 0.12, 0.55, 0.88, 1],
          outputRange: [0, 0.5,  0.38, 0.12, 0],
        })
      : // default — biraz daha parlak
        floatAnim.interpolate({
          inputRange:  [0, 0.12, 0.85, 1],
          outputRange: [0, 0.7,  0.22, 0],
        });

  const transforms = [{ translateY }];

  if (driftAmount > 0) {
    transforms.push({
      translateX: driftAnim.interpolate({
        inputRange: [-1, 1],
        outputRange: [-driftAmount, driftAmount],
      }),
    });
  }

  if (mode === 'leaf' && rotation !== 0) {
    transforms.push({ rotate: `${rotation}deg` });
  }

  // Wave: baloncuklar yüzerken büyür (derinlik hissi)
  if (mode === 'wave') {
    transforms.push({
      scale: floatAnim.interpolate({
        inputRange:  [0, 0.15, 0.85, 1],
        outputRange: [0.4, 0.65, 1.35, 1.6],
      }),
    });
  }

  const pW = mode === 'leaf' ? size * 2.2 : mode === 'ember' && spark ? size * 0.8 : size;
  const pH = mode === 'leaf' ? size        : mode === 'ember' && spark ? size * 2.5 : size;
  const bR = mode === 'leaf' ? size * 0.5  : size / 2;

  return (
    <Animated.View style={{
      position: 'absolute',
      left: x,
      width: pW,
      height: pH,
      borderRadius: bR,
      backgroundColor: accent,
      transform: transforms,
      opacity,
    }} />
  );
}

// ── FocusScreen ─────────────────────────────────────────────────
export function FocusScreen({
  visible,
  remainingSeconds,
  selectedDuration,
  sessionNumber,
  isPaused,
  onPause,
  onEnd,
}) {
  const theme = useTheme();
  const slideAnim  = useRef(new Animated.Value(H)).current;
  const pulseAnim  = useRef(new Animated.Value(1)).current;
  const msgOpacity = useRef(new Animated.Value(1)).current;
  const glowAnim   = useRef(new Animated.Value(0)).current;
  const [msgIdx, setMsgIdx] = useState(0);

  const particleMode = theme.particleMode ?? 'default';
  const particles    = PARTICLE_SETS[particleMode] ?? PARTICLE_SETS.default;
  const messages     = theme.messages;

  // Slide up/down
  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: visible ? 0 : H,
      friction: 9, tension: 55,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  // Ambient orb — tema renginde yavaş nefes
  useEffect(() => {
    if (!visible) return;
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(glowAnim, { toValue: 1, duration: 5500, useNativeDriver: true }),
      Animated.timing(glowAnim, { toValue: 0, duration: 5500, useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
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

  // Mesaj rotasyonu — tema değişince sıfırla
  useEffect(() => { setMsgIdx(0); }, [particleMode]);

  useEffect(() => {
    if (!visible) return;
    const iv = setInterval(() => {
      Animated.timing(msgOpacity, { toValue: 0, duration: 400, useNativeDriver: true }).start(() => {
        setMsgIdx((i) => (i + 1) % messages.length);
        Animated.timing(msgOpacity, { toValue: 1, duration: 400, useNativeDriver: true }).start();
      });
    }, 7000);
    return () => clearInterval(iv);
  }, [visible, messages]);

  const minutes  = Math.floor(remainingSeconds / 60);
  const seconds  = remainingSeconds % 60;
  const timeStr  = String(minutes).padStart(2,'0') + ':' + String(seconds).padStart(2,'0');
  const total    = selectedDuration * 60;
  const progress = Math.max(0, Math.min(1, 1 - remainingSeconds / total));
  const pct      = Math.round(progress * 100);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.overlay, { transform: [{ translateY: slideAnim }] }]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.gradientColors[1]} />

      {/* Tema gradyanı — atmosfer */}
      <LinearGradient
        colors={theme.gradientColors}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      {/* Ambient breathing orb */}
      <Animated.View
        pointerEvents="none"
        style={{
          position: 'absolute',
          width: W * 1.5,
          height: W * 1.5,
          borderRadius: W * 0.75,
          backgroundColor: theme.glowColor ?? theme.accent,
          top: H * 0.04,
          alignSelf: 'center',
          opacity: glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.025, 0.07] }),
        }}
      />

      {/* Tema parçacıkları */}
      {particles.map((p, i) => (
        <Particle key={i} {...p} accent={theme.accent} mode={particleMode} />
      ))}

      {/* Üst bar */}
      <View style={styles.topBar}>
        <View style={[styles.livePill, { backgroundColor: theme.accentFaint, borderColor: theme.accentBorder }]}>
          <View style={[styles.liveDot, { backgroundColor: theme.accent }]} />
          <Text style={[styles.livePillText, { color: theme.accent }]}>SESSION {sessionNumber}</Text>
        </View>
        <TouchableOpacity style={styles.endBtn} onPress={onEnd} activeOpacity={0.8}>
          <Text style={styles.endBtnText}>Bitir</Text>
        </TouchableOpacity>
      </View>

      {/* Progress çizgisi */}
      <View style={[styles.progressWrap, { backgroundColor: theme.accentFaint }]}>
        <View style={[styles.progressFg, { width: `${pct}%`, backgroundColor: theme.accent }]} />
      </View>

      {/* Timer */}
      <View style={styles.center}>
        <Text style={[styles.timerLabel, { color: theme.accentText }]}>
          {isPaused ? 'DURAKLATILDI' : 'ODAKLANIYORSUN'}
        </Text>
        <Animated.Text style={[styles.timerTime, { color: theme.accent, transform: [{ scale: pulseAnim }] }]}>
          {timeStr}
        </Animated.Text>
        <Text style={[styles.timerPct, { color: theme.accentText }]}>{pct}% tamamlandı</Text>
      </View>

      {/* Tema mesajı */}
      <Animated.Text style={[styles.focusMsg, { color: theme.accentText, opacity: msgOpacity }]}>
        {messages[msgIdx]}
      </Animated.Text>

      {/* Pause butonu */}
      <TouchableOpacity
        style={[
          styles.pauseBtn,
          { backgroundColor: theme.accentFaint, borderColor: theme.accentBorder },
          isPaused && { backgroundColor: theme.accentDim },
        ]}
        onPress={onPause}
        activeOpacity={0.85}
      >
        <Text style={[styles.pauseBtnText, { color: theme.accent }]}>
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
    borderWidth: 0.5,
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, marginRight: 7 },
  livePillText: { fontSize: 11, fontWeight: '700', letterSpacing: 1.5 },
  endBtn: {
    backgroundColor: 'rgba(255,92,92,0.1)',
    borderWidth: 0.5, borderColor: 'rgba(255,92,92,0.3)',
    borderRadius: 10, paddingHorizontal: 16, paddingVertical: 7,
  },
  endBtnText: { color: Colors.danger, fontSize: 13, fontWeight: '600' },

  progressWrap: { width: '100%', height: 2, borderRadius: 1, overflow: 'hidden' },
  progressFg:   { height: 2, borderRadius: 1 },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  timerLabel: {
    fontSize: 10, letterSpacing: 3,
    fontWeight: '700', marginBottom: 8, textTransform: 'uppercase',
  },
  timerTime: {
    fontSize: 76, fontWeight: '800', letterSpacing: -5, lineHeight: 82,
  },
  timerPct: { fontSize: 12, marginTop: 10 },

  focusMsg: {
    fontSize: 15, fontStyle: 'italic',
    textAlign: 'center', marginBottom: 24,
  },

  pauseBtn: {
    width: '100%', borderWidth: 0.5,
    borderRadius: 16, paddingVertical: 17,
    alignItems: 'center', marginBottom: 14,
  },
  pauseBtnText: { fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },

  flipHint: { fontSize: 11, color: 'rgba(255,255,255,0.12)', textAlign: 'center' },
});

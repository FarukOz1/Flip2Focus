import React, { useCallback, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  Platform, Animated, StatusBar,
} from 'react-native';

import { Colors } from '../constants/colors';
import { useSessionStore, XP_REWARDS } from '../store/sessionStore';
import { useTheme } from '../hooks/useTheme';
import { useFlipDetector } from '../hooks/useFlipDetector';
import { useTimer } from '../hooks/useTimer';
import { useNotifications, sendSessionCompleteNotification } from '../hooks/useNotifications';
import { PhoneCard } from '../components/PhoneCard';
import { DurationSelector } from '../components/DurationSelector';
import { SessionControls } from '../components/SessionControls';
import { StatsRow } from '../components/StatsRow';
import { SessionLog } from '../components/SessionLog';
import { XPStore } from '../components/XPStore';
import { FocusScreen } from '../components/FocusScreen';       // tap modu
import { FlipFocusMode } from '../components/FlipFocusMode';   // flip modu
import { DiamondSparkles } from '../components/DiamondSparkles';

const triggerHaptic = async (type = 'medium') => {
  try {
    const Haptics = require('expo-haptics');
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      if (type === 'success') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else if (type === 'warning') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } else {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    }
  } catch (_) {}
};

export default function HomeScreen() {
  const isFlipped        = useSessionStore((s) => s.isFlipped);
  const isRunning        = useSessionStore((s) => s.isRunning);
  const isPaused         = useSessionStore((s) => s.isPaused);
  const selectedDuration = useSessionStore((s) => s.selectedDuration);
  const remainingSeconds = useSessionStore((s) => s.remainingSeconds);
  const elapsedSeconds   = useSessionStore((s) => s.elapsedSeconds);
  const sessionNumber    = useSessionStore((s) => s.sessionNumber);
  const totalFocusedToday = useSessionStore((s) => s.totalFocusedToday);
  const sessionsToday    = useSessionStore((s) => s.sessionsToday);
  const totalXPToday     = useSessionStore((s) => s.totalXPToday);
  const totalXP          = useSessionStore((s) => s.totalXP);
  const spentXP          = useSessionStore((s) => s.spentXP);
  const streak           = useSessionStore((s) => s.streak);
  const sessionLog       = useSessionStore((s) => s.sessionLog);
  const startSession     = useSessionStore((s) => s.startSession);
  const endSession       = useSessionStore((s) => s.endSession);
  const togglePause      = useSessionStore((s) => s.togglePause);
  const setDuration      = useSessionStore((s) => s.setDuration);

  const activeBadge = useSessionStore((s) => s.activeBadge);
  const availableXP = totalXP - spentXP;

  const theme = useTheme();
  const activeBadgeIcon = activeBadge ? XP_REWARDS.find((r) => r.id === activeBadge)?.icon : null;

  // Hangi modda? 'none' | 'tap' | 'flip'
  const [focusMode, setFocusMode] = useState('none');
  const [storeVisible, setStoreVisible] = useState(false);

  useNotifications({ isRunning, elapsedSeconds });

  // Toast
  const toastAnim    = useRef(new Animated.Value(0)).current;
  const toastMsg     = useRef('');
  const toastTimeout = useRef(null);

  const showToast = useCallback((msg) => {
    toastMsg.current = msg;
    clearTimeout(toastTimeout.current);
    Animated.spring(toastAnim, { toValue: 1, useNativeDriver: true, friction: 8 }).start();
    toastTimeout.current = setTimeout(() => {
      Animated.timing(toastAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start();
    }, 3000);
  }, [toastAnim]);

  // Tamamlandı
  const handleComplete = useCallback(() => {
    const result = endSession(true);
    triggerHaptic('success');
    setFocusMode('none');
    showToast('Session tamamlandı! +' + result.xp + ' XP 🎯');
    sendSessionCompleteNotification(result.xp);
  }, [endSession, showToast]);

  // Bitirildi
  const handleEnd = useCallback(() => {
    const result = endSession(false);
    triggerHaptic('warning');
    setFocusMode('none');
    if (result.tooShort) {
      showToast('Çok kısa! En az 1 dakika odaklan.');
    } else {
      showToast('Session bitirildi — ' + result.elapsed + ' dk loglandı');
    }
  }, [endSession, showToast]);

  // Kart tap
  const handleCardTap = useCallback(() => {
    if (!isRunning) {
      startSession();
      triggerHaptic();
      setFocusMode('tap');          // → FocusScreen (pomodoro)
      showToast('Odak başladı!');
    } else if (focusMode === 'tap') {
      setFocusMode('none');         // geri dön
    } else {
      setFocusMode('tap');          // tekrar aç
    }
  }, [isRunning, focusMode, startSession, showToast]);

  // Duraklat
  const handlePause = useCallback(() => {
    togglePause();
    triggerHaptic();
    showToast(isPaused ? 'Devam ediyor' : 'Duraklatıldı');
  }, [togglePause, isPaused, showToast]);

  // Flip dedektörü
  useFlipDetector({
    enabled: true,
    onFlipDown: useCallback(() => {
      if (!isRunning) {
        startSession();
        triggerHaptic();
        setFocusMode('flip');       // → FlipFocusMode (siyah, minimal)
        showToast('Telefon çevrildi — odak başladı!');
      }
    }, [isRunning, startSession, showToast]),
    onFlipUp: useCallback(() => {
      if (isRunning) {
        handleEnd();                // session biter, her iki mod da kapanır
      }
    }, [isRunning, handleEnd]),
  });

  useTimer({ onComplete: handleComplete });

  const toastTranslate = toastAnim.interpolate({
    inputRange: [0, 1], outputRange: [80, 0],
  });

  return (
    <View style={[styles.safe, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.bg} />
      {/* Tema header glow */}
      <View style={[styles.headerGlow, { backgroundColor: theme.headerGlow }]} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>
            <Text style={[styles.logoAccent, { color: theme.accent }]}>flip</Text>
            <Text style={styles.logoWhite}>2focus</Text>
          </Text>
          <View style={styles.headerRight}>
            {activeBadgeIcon && (
              <View style={[styles.streakBadge, styles.badgePill]}>
                <Text style={styles.badgeIcon}>{activeBadgeIcon}</Text>
              </View>
            )}
            <View style={styles.streakBadge}>
              <Text style={styles.streakFire}>🔥</Text>
              <Text style={styles.streakText}>{streak} gün</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <PhoneCard
            isFlipped={isFlipped}
            remainingSeconds={remainingSeconds}
            selectedDuration={selectedDuration}
            sessionNumber={sessionNumber}
            onPress={handleCardTap}
          />
        </View>

        <View style={styles.section}>
          <DurationSelector
            selected={selectedDuration}
            onSelect={setDuration}
            disabled={isRunning}
          />
        </View>

        <View style={styles.section}>
          <SessionControls
            isRunning={isRunning}
            isPaused={isPaused}
            onPause={handlePause}
            onEnd={handleEnd}
          />
        </View>

        <View style={styles.section}>
          <StatsRow
            focused={totalFocusedToday}
            sessions={sessionsToday}
            xp={totalXPToday}
            totalXP={totalXP}
            availableXP={availableXP}
            onOpenStore={() => setStoreVisible(true)}
          />
        </View>

        <View style={styles.section}>
          <SessionLog sessions={sessionLog} />
        </View>
      </ScrollView>

      {/* Toast */}
      <Animated.View
        style={[styles.toast, { opacity: toastAnim, transform: [{ translateY: toastTranslate }] }]}
        pointerEvents="none"
      >
        <Text style={styles.toastText}>{toastMsg.current}</Text>
      </Animated.View>

      {/* TAP MODU — pomodoro tam ekran */}
      <FocusScreen
        visible={focusMode === 'tap'}
        remainingSeconds={remainingSeconds}
        selectedDuration={selectedDuration}
        sessionNumber={sessionNumber}
        isPaused={isPaused}
        onPause={handlePause}
        onEnd={handleEnd}
      />

      {/* FLIP MODU — minimal siyah ekran */}
      <FlipFocusMode
        visible={focusMode === 'flip'}
        remainingSeconds={remainingSeconds}
        selectedDuration={selectedDuration}
        onEnd={handleEnd}
      />

      <DiamondSparkles active={activeBadge === 'badge_diamond'} />
      <XPStore visible={storeVisible} onClose={() => setStoreVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.bg,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 32 : 52,
  },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 56 },
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 20,
  },
  logo: { fontSize: 20, fontWeight: '800', letterSpacing: -0.5 },
  logoAccent: { color: Colors.accent, fontSize: 20, fontWeight: '800' },
  logoWhite:  { color: Colors.text,   fontSize: 20, fontWeight: '800' },
  headerRight: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
  },
  streakBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 0.5, borderColor: Colors.border2,
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6,
  },
  badgePill: {
    paddingHorizontal: 10,
  },
  badgeIcon: { fontSize: 16 },
  streakFire: { fontSize: 13, marginRight: 5 },
  streakText: { fontSize: 12, color: Colors.textMuted, fontWeight: '600' },
  section: { marginBottom: 16 },
  headerGlow: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 160,
    pointerEvents: 'none',
  },
  toast: {
    position: 'absolute', bottom: 36, alignSelf: 'center',
    backgroundColor: Colors.surface2,
    borderWidth: 0.5, borderColor: Colors.border2,
    borderRadius: 12, paddingHorizontal: 20, paddingVertical: 11,
    maxWidth: '88%', zIndex: 100,
  },
  toastText: {
    fontSize: 13, color: Colors.text,
    fontWeight: '500', textAlign: 'center',
  },
});
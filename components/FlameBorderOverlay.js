import React, { useRef, useEffect } from 'react';
import { Animated, Easing, StyleSheet } from 'react-native';
import { useSessionStore } from '../store/sessionStore';

// 15 saniyelik döngü: 2s yanma + 2.5s sönme + 10.5s uyku
const FADE_IN  = 2000;
const FADE_OUT = 2500;
const REST     = 6500;

export function FlameBorderOverlay() {
  const activeBadge = useSessionStore((s) => s.activeBadge);
  const active      = activeBadge === 'badge_flame';

  const glowAnim = useRef(new Animated.Value(0)).current;
  const loopRef  = useRef(null);

  useEffect(() => {
    if (!active) {
      loopRef.current?.stop();
      glowAnim.setValue(0);
      return;
    }

    loopRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1, duration: FADE_IN,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0, duration: FADE_OUT,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.delay(REST),
      ])
    );
    loopRef.current.start();

    return () => { loopRef.current?.stop(); };
  }, [active]);

  if (!active) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.glow, { opacity: glowAnim }]}
    />
  );
}

const styles = StyleSheet.create({
  glow: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: '#ff6a00',
    shadowColor: '#ff4500',
    shadowOpacity: 1,
    shadowRadius: 10,
  },
});

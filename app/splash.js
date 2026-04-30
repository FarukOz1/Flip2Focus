import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Animated, Platform, StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../constants/colors';

export default function SplashScreen() {
  const logoScale   = useRef(new Animated.Value(0.6)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const tagOpacity  = useRef(new Animated.Value(0)).current;
  const dotAnim     = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Logo giriş
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale,   { toValue: 1, friction: 6, tension: 80, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
      Animated.timing(tagOpacity, { toValue: 1, duration: 500, delay: 100, useNativeDriver: true }),
    ]).start();

    // Dot pulse loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(dotAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(dotAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
      ])
    ).start();

    // 2.4sn sonra onboarding veya ana ekrana yönlendir
    const timer = setTimeout(async () => {
      try {
        const seen = await AsyncStorage.getItem('onboarding_done');
        router.replace(seen ? '/' : '/onboarding');
      } catch {
        router.replace('/');
      }
    }, 2400);

    return () => clearTimeout(timer);
  }, []);

  const dotScale = dotAnim.interpolate({ inputRange: [0,1], outputRange: [1, 1.3] });
  const dotOpacity = dotAnim.interpolate({ inputRange: [0,1], outputRange: [0.4, 1] });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />

      {/* Arka plan ışıma */}
      <View style={styles.glow} />

      {/* Logo */}
      <Animated.View style={{ transform: [{ scale: logoScale }], opacity: logoOpacity, alignItems: 'center' }}>
        <View style={styles.iconWrap}>
          <Text style={styles.iconText}>📱</Text>
          <Animated.View style={[styles.iconDot, { transform: [{ scale: dotScale }], opacity: dotOpacity }]} />
        </View>
        <Text style={styles.logoText}>
          <Text style={styles.logoAccent}>flip</Text>
          <Text style={styles.logoWhite}>2focus</Text>
        </Text>
      </Animated.View>

      {/* Tagline */}
      <Animated.Text style={[styles.tagline, { opacity: tagOpacity }]}>
        Telefonu çevir. Odaklan. Kazan.
      </Animated.Text>

      {/* Alt versiyon */}
      <Text style={styles.version}>v1.0</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 60,
  },
  glow: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(200,245,66,0.04)',
    top: '30%',
    alignSelf: 'center',
  },
  iconWrap: {
    width: 88,
    height: 88,
    backgroundColor: Colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.accentBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  iconText: { fontSize: 36 },
  iconDot: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.accent,
  },
  logoText: { fontSize: 32, fontWeight: '800', letterSpacing: -1 },
  logoAccent: { color: Colors.accent, fontSize: 32, fontWeight: '800' },
  logoWhite:  { color: Colors.text,   fontSize: 32, fontWeight: '800' },
  tagline: {
    fontSize: 14,
    color: Colors.textMuted,
    marginTop: 16,
    letterSpacing: 0.3,
  },
  version: {
    position: 'absolute',
    bottom: 32,
    fontSize: 11,
    color: Colors.textDim,
  },
});
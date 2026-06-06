import React, { useRef, useEffect, useState } from 'react';
import { Animated, Dimensions, View, Text, StyleSheet } from 'react-native';

const { width: W, height: H } = Dimensions.get('window');

const CHARS = ['✦', '✧', '◆', '✦', '✧', '✦', '◆'];
const SIZES = [9, 11, 8, 12, 9, 10, 8];

function SingleSparkle({ index }) {
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim   = useRef(new Animated.Value(0.2)).current;
  const [pos, setPos] = useState({
    x: 20 + Math.random() * (W - 40),
    y: 80 + Math.random() * (H - 160),
  });

  useEffect(() => {
    let cancelled = false;

    const runLoop = () => {
      if (cancelled) return;

      const waitMs = 5000 + index * 1700 + Math.random() * 9000;

      const tid = setTimeout(() => {
        if (cancelled) return;

        setPos({
          x: 20 + Math.random() * (W - 40),
          y: 80 + Math.random() * (H - 160),
        });

        Animated.sequence([
          Animated.parallel([
            Animated.timing(opacityAnim, {
              toValue: 0.55 + Math.random() * 0.35,
              duration: 380,
              useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
              toValue: 1,
              friction: 4,
              tension: 90,
              useNativeDriver: true,
            }),
          ]),
          Animated.delay(280 + Math.random() * 320),
          Animated.parallel([
            Animated.timing(opacityAnim, {
              toValue: 0,
              duration: 550,
              useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
              toValue: 0.2,
              duration: 550,
              useNativeDriver: true,
            }),
          ]),
        ]).start(({ finished }) => {
          if (finished && !cancelled) runLoop();
        });
      }, waitMs);

      return tid;
    };

    runLoop();

    return () => {
      cancelled = true;
      opacityAnim.stopAnimation();
      scaleAnim.stopAnimation();
    };
  }, []);

  return (
    <Animated.Text
      style={[
        styles.sparkle,
        {
          left: pos.x,
          top: pos.y,
          fontSize: SIZES[index],
          opacity: opacityAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      {CHARS[index]}
    </Animated.Text>
  );
}

export function DiamondSparkles({ active }) {
  if (!active) return null;
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {CHARS.map((_, i) => (
        <SingleSparkle key={i} index={i} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  sparkle: {
    position: 'absolute',
    color: '#ddf0ff',
    fontWeight: '300',
  },
});

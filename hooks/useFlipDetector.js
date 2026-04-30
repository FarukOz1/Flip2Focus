import { useEffect, useRef, useState } from 'react';
import { Accelerometer } from 'expo-sensors';

// Expo akselerometre GERÇEK değerleri (test edildi):
// Ekran YUKARI bakarken  → z ≈ -1
// Ekran AŞAĞI bakarken  → z ≈ +1
//
// FACE DOWN (ekran yere bakıyor) → z > +0.55  → SESSION BAŞLAT
// FACE UP   (ekran göğe bakıyor) → z < -0.55  → SESSION BİTİR

const FACE_DOWN_Z      =  0.55;  // z BU DEĞERİN ÜSTÜNDE = yüzüstü = başlat
const FACE_UP_Z        = -0.55;  // z BU DEĞERİN ALTINDA = yüz yukarı = bitir
const REQUIRED_SAMPLES =  5;     // 5 × 100ms = 500ms kararlılık
const INTERVAL_MS      =  100;

export function useFlipDetector({ onFlipDown, onFlipUp, enabled = true }) {
  const [isFaceDown, setIsFaceDown] = useState(false);

  const isFaceDownRef = useRef(false);
  const countDown     = useRef(0);
  const countUp       = useRef(0);
  const subRef        = useRef(null);
  const onDownRef     = useRef(onFlipDown);
  const onUpRef       = useRef(onFlipUp);

  useEffect(() => { onDownRef.current = onFlipDown; }, [onFlipDown]);
  useEffect(() => { onUpRef.current   = onFlipUp;   }, [onFlipUp]);

  useEffect(() => {
    if (!enabled) {
      subRef.current?.remove();
      subRef.current = null;
      countDown.current = 0;
      countUp.current   = 0;
      return;
    }

    Accelerometer.setUpdateInterval(INTERVAL_MS);

    subRef.current = Accelerometer.addListener(({ z }) => {
      if (!isFaceDownRef.current) {
        // Şu an yüz yukarı — ekran aşağı geçişi bekle
        if (z > FACE_DOWN_Z) {
          countDown.current += 1;
          countUp.current    = 0;
          if (countDown.current >= REQUIRED_SAMPLES) {
            countDown.current     = 0;
            isFaceDownRef.current = true;
            setIsFaceDown(true);
            onDownRef.current?.();  // SESSION BAŞLAT
          }
        } else {
          countDown.current = 0;
        }
      } else {
        // Şu an yüzüstü — ekran yukarı geçişi bekle
        if (z < FACE_UP_Z) {
          countUp.current   += 1;
          countDown.current  = 0;
          if (countUp.current >= REQUIRED_SAMPLES) {
            countUp.current       = 0;
            isFaceDownRef.current = false;
            setIsFaceDown(false);
            onUpRef.current?.();    // SESSION BİTİR
          }
        } else {
          countUp.current = 0;
        }
      }
    });

    return () => {
      subRef.current?.remove();
      subRef.current    = null;
      countDown.current = 0;
      countUp.current   = 0;
    };
  }, [enabled]);

  return { isFaceDown };
}
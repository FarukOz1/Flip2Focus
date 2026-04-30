import { useEffect, useRef } from 'react';
import { useSessionStore } from '../store/sessionStore';

export function useTimer({ onComplete }) {
  const intervalRef = useRef(null);
  const { isRunning, isPaused, tick } = useSessionStore();

  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        const done = tick();
        if (done) {
          clearInterval(intervalRef.current);
          onComplete?.();
        }
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning, isPaused]);
}
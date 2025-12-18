import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
  Vibration,
} from "react-native";
import { Accelerometer } from "expo-sensors";
import * as Haptics from "expo-haptics";
import { StatusBar } from "expo-status-bar";
import { Timer, RotateCcw, Plus, Minus } from "lucide-react-native";

export default function FlipToFocus() {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [initialTime, setInitialTime] = useState(25 * 60);
  const [timerState, setTimerState] = useState("idle");
  const [isFaceDown, setIsFaceDown] = useState(false);
  const [sensorData, setSensorData] = useState({ x: 0, y: 0, z: 0 });

  const timerRef = useRef(null);
  const previousFaceDownRef = useRef(false);
  const hasCompletedRef = useRef(false);

  useEffect(() => {
    let subscription = null;

    const setupAccelerometer = async () => {
      if (Platform.OS === "web") {
        console.log("Accelerometer not available on web");
        return;
      }

      try {
        await Accelerometer.setUpdateInterval(500);

        subscription = Accelerometer.addListener((data) => {
          setSensorData(data);

          const newFaceDown = data.z < -0.5;
          const faceUp = data.z > 0.3;

          if (newFaceDown && !previousFaceDownRef.current) {
            setIsFaceDown(true);
            previousFaceDownRef.current = true;
          } else if (faceUp && previousFaceDownRef.current) {
            setIsFaceDown(false);
            previousFaceDownRef.current = false;
          }
        });
      } catch (err) {
        console.error("Accelerometer error:", err);
      }
    };

    setupAccelerometer();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (isFaceDown) {
      setTimerState((prevState) => {
        if (prevState === "running") {
          console.log("Pausing timer (flipped face down)");
          triggerHaptic();
          return "paused";
        }
        return prevState;
      });
    } else {
      setTimerState((prevState) => {
        if (prevState === "idle" || prevState === "paused") {
          console.log("Starting timer (flipped face up)");
          hasCompletedRef.current = false;
          triggerHaptic();
          return "running";
        }
        return prevState;
      });
    }
  }, [isFaceDown]);

  useEffect(() => {
    if (timerState === "running") {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setTimerState("idle");
            if (!hasCompletedRef.current) {
              triggerCompletionFeedback();
              hasCompletedRef.current = true;
            }
            return initialTime;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [timerState, initialTime]);

  const triggerHaptic = () => {
    if (Platform.OS === "web") return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      console.log("Haptics not available, using vibration");
      Vibration.vibrate(100);
    }
  };

  const triggerCompletionFeedback = () => {
    if (Platform.OS === "web") return;

    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => Vibration.vibrate([0, 200, 100, 200]), 100);
    } catch {
      Vibration.vibrate([0, 200, 100, 200, 100, 200]);
    }
  };

  const handleReset = () => {
    setTimeLeft(initialTime);
    setTimerState("idle");
    hasCompletedRef.current = false;
    triggerHaptic();
  };

  const adjustTime = (minutes) => {
    const newTime = Math.max(1, Math.floor(initialTime / 60) + minutes) * 60;
    setInitialTime(newTime);
    if (timerState === "idle") {
      setTimeLeft(newTime);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  if (timerState === "running") {
    return (
      <View style={styles.amoledContainer}>
        <StatusBar style="light" />
        <Text style={styles.amoledTimer}>{formatTime(timeLeft)}</Text>
        <Text style={styles.amoledHint}>Focus Mode</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Timer size={32} color="#6B8E7F" strokeWidth={2.5} />
        <Text style={styles.title}>Flip to Focus</Text>
      </View>

      <View style={styles.timerContainer}>
        <Text style={styles.timer}>{formatTime(timeLeft)}</Text>

        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusDot,
              timerState === "running" && styles.statusDotActive,
            ]}
          />
          <Text style={styles.statusText}>
            {timerState === "idle"
              ? "Ready"
              : timerState === "running"
              ? "Focusing"
              : "Paused"}
          </Text>
        </View>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.timeButton}
          onPress={() => adjustTime(-5)}
          disabled={timerState !== "idle"}
        >
          <Minus size={24} color={timerState === "idle" ? "#6B8E7F" : "#CBD5E0"} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.resetButton, timerState === "idle" && styles.resetButtonDisabled]}
          onPress={handleReset}
          disabled={timerState === "idle"}
        >
          <RotateCcw size={24} color={timerState === "idle" ? "#CBD5E0" : "#FFFFFF"} />
          <Text
            style={[
              styles.resetButtonText,
              timerState === "idle" && styles.resetButtonTextDisabled,
            ]}
          >
            Reset
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.timeButton}
          onPress={() => adjustTime(5)}
          disabled={timerState !== "idle"}
        >
          <Plus size={24} color={timerState === "idle" ? "#6B8E7F" : "#CBD5E0"} />
        </TouchableOpacity>
      </View>

      <View style={styles.instructionContainer}>
        <View style={styles.instructionCard}>
          <Text style={styles.instructionTitle}>How it works</Text>
          <Text style={styles.instructionText}>
            Flip your phone face down to start the timer
          </Text>
          <Text style={styles.instructionText}>Flip it back up to pause</Text>
        </View>
      </View>

      {Platform.OS !== "web" && (
        <View style={styles.debugContainer}>
          <Text style={styles.debugText}>
            z: {sensorData.z.toFixed(2)} {isFaceDown ? "📱" : "📲"}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F9F4",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: "center",
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#4A5568",
    letterSpacing: -0.5,
  },
  timerContainer: {
    alignItems: "center",
    gap: 20,
    marginTop: -40,
  },
  timer: {
    fontSize: 92,
    fontWeight: "700",
    color: "#6B8E7F",
    letterSpacing: -2,
    fontVariant: ["tabular-nums"],
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#CBD5E0",
  },
  statusDotActive: {
    backgroundColor: "#A4C3B2",
  },
  statusText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#718096",
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    marginTop: 20,
  },
  timeButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#A4C3B2",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  resetButtonDisabled: {
    backgroundColor: "#E2E8F0",
  },
  resetButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  resetButtonTextDisabled: {
    color: "#CBD5E0",
  },
  instructionContainer: {
    width: "100%",
    marginTop: 20,
  },
  instructionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  instructionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#4A5568",
    marginBottom: 12,
  },
  instructionText: {
    fontSize: 15,
    color: "#718096",
    lineHeight: 22,
    marginBottom: 6,
  },
  debugContainer: {
    marginTop: 20,
  },
  debugText: {
    fontSize: 12,
    color: "#A0AEC0",
    fontWeight: "500",
  },
  amoledContainer: {
    flex: 1,
    backgroundColor: "#000000",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
  },
  amoledTimer: {
    fontSize: 64,
    fontWeight: "300",
    color: "#404040",
    letterSpacing: -1,
    fontVariant: ["tabular-nums"],
  },
  amoledHint: {
    fontSize: 14,
    fontWeight: "500",
    color: "#303030",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
});

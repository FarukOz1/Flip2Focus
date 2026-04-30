import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';

// Expo Go'da expo-notifications kısıtlı — graceful fallback
let Notifications = null;
try {
  Notifications = require('expo-notifications');
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
} catch (_) {}

// ─── İzin ────────────────────────────────────────────────────
export async function requestNotificationPermission() {
  if (!Notifications) return false;
  try {
    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === 'granted') return true;
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch {
    return false;
  }
}

// ─── Günlük hatırlatmalar ────────────────────────────────────
export async function scheduleReminderNotifications() {
  if (!Notifications) return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Sabah 09:00
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'flip2focus 🎯',
        body: 'Bugün henüz odaklanmadın. Bir session başlatmaya ne dersin?',
        sound: true,
      },
      trigger: { hour: 9, minute: 0, repeats: true },
    });

    // Akşam 20:00
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'flip2focus 🌙',
        body: 'Günü bitirmeden önce bir odak seansı! Streakini koru.',
        sound: true,
      },
      trigger: { hour: 20, minute: 0, repeats: true },
    });
  } catch (e) {
    console.warn('Bildirim planlama hatası:', e);
  }
}

// ─── Yarım session bildirimi — 10dk sonra ────────────────────
// Uygulama arka plana geçtiğinde çağrılır.
// Kullanıcı geri dönerse iptal edilir.
const INCOMPLETE_NOTIF_ID_KEY = 'incomplete_session_notif';

export async function scheduleIncompleteSessionReminder(elapsedMinutes) {
  if (!Notifications) return;
  try {
    // Varsa önceki yarım-session bildirimini iptal et
    await cancelIncompleteSessionReminder();

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Yarım kalan session var! 🔄',
        body: elapsedMinutes > 0
          ? `${elapsedMinutes} dakika odaklanmıştın. Kaldığın yerden devam et!`
          : 'Başlatmak üzere olduğun bir session vardı. Devam etmeye ne dersin?',
        sound: true,
        data: { type: 'incomplete_session' },
      },
      trigger: { seconds: 10 * 60 }, // 10 dakika sonra
    });

    // ID'yi sakla ki geri dönünce iptal edebilelim
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.setItem(INCOMPLETE_NOTIF_ID_KEY, id);
    } catch (_) {}
  } catch (e) {
    console.warn('Yarım session bildirim hatası:', e);
  }
}

export async function cancelIncompleteSessionReminder() {
  if (!Notifications) return;
  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const id = await AsyncStorage.getItem(INCOMPLETE_NOTIF_ID_KEY);
    if (id) {
      await Notifications.cancelScheduledNotificationAsync(id);
      await AsyncStorage.removeItem(INCOMPLETE_NOTIF_ID_KEY);
    }
  } catch (_) {}
}

// ─── Session tamamlanma tebriği ──────────────────────────────
export async function sendSessionCompleteNotification(xp) {
  if (!Notifications) return;
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Harika iş! 🏆',
        body: `Odak seansını tamamladın ve +${xp} XP kazandın!`,
        sound: true,
      },
      trigger: null, // anlık
    });
  } catch (e) {
    console.warn('Tebrik bildirim hatası:', e);
  }
}

// ─── Ana hook ────────────────────────────────────────────────
// isRunning: timer şu an çalışıyor mu?
// elapsedSeconds: şimdiye kadar geçen saniye
export function useNotifications({ isRunning, elapsedSeconds }) {
  const appState = useRef(AppState.currentState);

  // İlk yüklemede izin al ve günlük bildirimleri planla
  useEffect(() => {
    (async () => {
      const granted = await requestNotificationPermission();
      if (granted) await scheduleReminderNotifications();
    })();

    if (!Notifications) return;
    const responseSub = Notifications.addNotificationResponseReceivedListener(() => {
      // Kullanıcı bildirime tıkladı — ileride: session başlat
    });
    return () => responseSub.remove();
  }, []);

  // AppState değişimini izle:
  // active → background/inactive: yarım session varsa 10dk sonra bildir
  // background → active: kullanıcı döndü, bildirimi iptal et
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextState) => {
      const wasActive = appState.current === 'active';
      const isNowBackground =
        nextState === 'background' || nextState === 'inactive';
      const isNowActive = nextState === 'active';

      if (wasActive && isNowBackground) {
        // Uygulama arka plana geçti
        if (isRunning) {
          // Aktif session var — 10dk sonra hatırlat
          const mins = Math.floor(elapsedSeconds / 60);
          await scheduleIncompleteSessionReminder(mins);
        }
      }

      if (isNowActive) {
        // Kullanıcı geri döndü — planlanmış bildirimi iptal et
        await cancelIncompleteSessionReminder();
      }

      appState.current = nextState;
    });

    return () => subscription.remove();
  }, [isRunning, elapsedSeconds]);
}
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'flip2focus_v2';

// XP hesaplama — tamamlanmamışsa gerçek saniye bazlı
const calcXP = (seconds, completed) => {
  const mins = seconds / 60;
  if (!completed) return Math.max(0, Math.floor(mins * 0.5));
  if (mins >= 45) return Math.round(mins * 3);
  if (mins >= 25) return Math.round(mins * 2);
  return Math.round(mins);
};

// XP ile açılabilecek ödüller
export const XP_REWARDS = [
  { id: 'theme_forest',   cost: 100,  icon: '🌲', name: 'Forest Theme',      desc: 'Koyu yeşil odak teması',        type: 'theme'  },
  { id: 'theme_ocean',    cost: 150,  icon: '🌊', name: 'Ocean Theme',       desc: 'Derin mavi dinginlik teması',    type: 'theme'  },
  { id: 'theme_sunset',   cost: 200,  icon: '🌅', name: 'Sunset Theme',      desc: 'Turuncu-mor gün batımı teması', type: 'theme'  },
  { id: 'sound_rain',     cost: 80,   icon: '🌧️', name: 'Rain Sounds',       desc: 'Odak sırasında yağmur sesi',    type: 'sound'  },
  { id: 'sound_forest',   cost: 80,   icon: '🍃', name: 'Forest Sounds',     desc: 'Doğa sesleri ile çalış',        type: 'sound'  },
  { id: 'sound_cafe',     cost: 120,  icon: '☕', name: 'Café Ambiance',     desc: 'Kahve dükkanı ortamı',          type: 'sound'  },
  { id: 'badge_flame',    cost: 50,   icon: '🔥', name: 'Flame Badge',       desc: 'Profil rozeti',                 type: 'badge'  },
  { id: 'badge_diamond',  cost: 300,  icon: '💎', name: 'Diamond Badge',     desc: 'Nadir koleksiyoncu rozeti',     type: 'badge'  },
  { id: 'extra_reminder', cost: 60,   icon: '🔔', name: 'Smart Reminders',   desc: '3 ekstra günlük hatırlatma',    type: 'feature'},
  { id: 'session_notes',  cost: 90,   icon: '📝', name: 'Session Notes',     desc: 'Oturuma not ekle özelliği',     type: 'feature'},
  { id: 'weekly_report',  cost: 110,  icon: '📊', name: 'Weekly Report',     desc: 'Haftalık detaylı analiz',       type: 'feature'},
  { id: 'custom_duration',cost: 70,   icon: '⏱️', name: 'Custom Duration',   desc: 'Dakika dakika süre ayarı',      type: 'feature'},
];

export const useSessionStore = create((set, get) => ({
  // Timer state
  isFlipped: false,
  isRunning: false,
  isPaused: false,
  selectedDuration: 25,       // dakika (float destekli)
  remainingSeconds: 25 * 60,
  elapsedSeconds: 0,          // FIX: gerçek geçen süreyi saniye bazında tut
  sessionStart: null,
  sessionNumber: 1,

  // Stats — günlük
  totalFocusedToday: 0,       // dakika
  sessionsToday: 0,
  totalXPToday: 0,

  // Stats — genel
  totalXP: 0,                 // birikimli toplam XP
  spentXP: 0,                 // harcanan XP
  allTimeFocused: 0,          // toplam dakika
  streak: 0,                  // ardışık gün
  lastActiveDate: null,       // streak için son aktif gün
  lastSessionDate: null,      // persist için

  // Açılan ödüller
  unlockedRewards: [],

  // Kişiselleştirme
  activeTheme: 'default',
  activeSound: null,
  activeBadge: null,

  // Session log
  sessionLog: [],

  // ── Actions ────────────────────────────────────────────────

  setDuration: (mins) => {
    if (get().isRunning) return;
    set({ selectedDuration: mins, remainingSeconds: Math.round(mins * 60) });
  },

  startSession: () => {
    const { selectedDuration } = get();
    set({
      isFlipped: true,
      isRunning: true,
      isPaused: false,
      sessionStart: Date.now(),
      remainingSeconds: Math.round(selectedDuration * 60),
      elapsedSeconds: 0,
    });
  },

  tick: () => {
    const { remainingSeconds, isPaused, elapsedSeconds } = get();
    if (isPaused) return false;
    const next = remainingSeconds - 1;
    set({ remainingSeconds: next, elapsedSeconds: elapsedSeconds + 1 });
    return next <= 0;
  },

  togglePause: () => {
    set((s) => ({ isPaused: !s.isPaused }));
  },

  endSession: (completed = false) => {
    const {
      elapsedSeconds, selectedDuration, sessionNumber, sessionLog,
      lastActiveDate, streak,
      totalFocusedToday, sessionsToday, totalXPToday,
      totalXP, allTimeFocused,
    } = get();

    // FIX: 60 saniyeden az ise kaydetme
    if (!completed && elapsedSeconds < 60) {
      set({
        isFlipped: false,
        isRunning: false,
        isPaused: false,
        remainingSeconds: Math.round(selectedDuration * 60),
        elapsedSeconds: 0,
        sessionStart: null,
      });
      return { elapsed: 0, xp: 0, tooShort: true };
    }

    const actualSeconds = completed ? Math.round(selectedDuration * 60) : elapsedSeconds;
    const elapsedMins = actualSeconds / 60;
    const xp = calcXP(actualSeconds, completed);

    const now = new Date();
    const timeStr =
      now.getHours().toString().padStart(2, '0') + ':' +
      now.getMinutes().toString().padStart(2, '0');
    const todayStr = now.toDateString();

    // Streak hesapla — ardışık gün girişi
    let newStreak = streak;
    if (lastActiveDate !== todayStr) {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      if (lastActiveDate === yesterday.toDateString()) {
        newStreak = streak + 1; // ardışık gün
      } else {
        newStreak = 1; // sıfırla, yeni başlangıç
      }
    }

    const entry = {
      id: Date.now(),
      seconds: actualSeconds,
      mins: Math.round(elapsedMins * 10) / 10,
      completed,
      time: timeStr,
      xp,
      date: todayStr,
    };

    const newState = {
      isFlipped: false,
      isRunning: false,
      isPaused: false,
      remainingSeconds: Math.round(selectedDuration * 60),
      elapsedSeconds: 0,
      sessionStart: null,
      sessionLog: [entry, ...sessionLog].slice(0, 100),
      totalFocusedToday: totalFocusedToday + elapsedMins,
      sessionsToday: sessionsToday + (completed ? 1 : 0),
      totalXPToday: totalXPToday + xp,
      totalXP: totalXP + xp,
      allTimeFocused: allTimeFocused + elapsedMins,
      streak: newStreak,
      lastActiveDate: todayStr,
      lastSessionDate: todayStr,
      sessionNumber: completed ? sessionNumber + 1 : sessionNumber,
    };

    set(newState);
    get().persist();
    return { elapsed: Math.round(elapsedMins), seconds: actualSeconds, xp, completed };
  },

  // XP harcama
  unlockReward: (rewardId) => {
    const { totalXP, spentXP, unlockedRewards } = get();
    const reward = XP_REWARDS.find((r) => r.id === rewardId);
    if (!reward) return false;
    if (unlockedRewards.includes(rewardId)) return false;
    const availableXP = totalXP - spentXP;
    if (availableXP < reward.cost) return false;

    set({
      spentXP: spentXP + reward.cost,
      unlockedRewards: [...unlockedRewards, rewardId],
    });
    get().persist();
    return true;
  },

  getAvailableXP: () => {
    const { totalXP, spentXP } = get();
    return totalXP - spentXP;
  },

  // ── Kişiselleştirme aksiyonları ────────────────────────────
  setTheme: (themeId) => {
    set({ activeTheme: themeId });
    get().persist();
  },

  setActiveSound: (soundId) => {
    set({ activeSound: soundId });
    get().persist();
  },

  setActiveBadge: (badgeId) => {
    set({ activeBadge: badgeId });
    get().persist();
  },

  // ── Geliştirici aksiyonları ─────────────────────────────────
  devAddXP: (amount) => {
    const { totalXP } = get();
    set({ totalXP: totalXP + amount });
    get().persist();
  },

  devRemoveXP: (amount) => {
    const { totalXP, spentXP } = get();
    // mevcut XP'nin altına inemez (satın alınanları korur)
    const newTotal = Math.max(spentXP, totalXP - amount);
    set({ totalXP: newTotal });
    get().persist();
  },

  devResetRewards: () => {
    set({ spentXP: 0, unlockedRewards: [] });
    get().persist();
  },

  // Persist
  persist: async () => {
    const s = get();
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({
        streak: s.streak,
        lastActiveDate: s.lastActiveDate,
        lastSessionDate: s.lastSessionDate,
        allTimeFocused: s.allTimeFocused,
        totalXP: s.totalXP,
        spentXP: s.spentXP,
        unlockedRewards: s.unlockedRewards,
        activeTheme: s.activeTheme,
        activeSound: s.activeSound,
        activeBadge: s.activeBadge,
        sessionLog: s.sessionLog,
        sessionNumber: s.sessionNumber,
        totalFocusedToday: s.totalFocusedToday,
        sessionsToday: s.sessionsToday,
        totalXPToday: s.totalXPToday,
      }));
    } catch (e) {
      console.warn('Persist failed:', e);
    }
  },

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const d = JSON.parse(raw);
      const todayStr = new Date().toDateString();
      const isToday = d.lastSessionDate === todayStr;

      set({
        streak: d.streak ?? 0,
        lastActiveDate: d.lastActiveDate ?? null,
        lastSessionDate: d.lastSessionDate ?? null,
        allTimeFocused: d.allTimeFocused ?? 0,
        totalXP: d.totalXP ?? 0,
        spentXP: d.spentXP ?? 0,
        unlockedRewards: d.unlockedRewards ?? [],
        activeTheme: d.activeTheme ?? 'default',
        activeSound: d.activeSound ?? null,
        activeBadge: d.activeBadge ?? null,
        sessionLog: d.sessionLog ?? [],
        sessionNumber: d.sessionNumber ?? 1,
        totalFocusedToday: isToday ? (d.totalFocusedToday ?? 0) : 0,
        sessionsToday: isToday ? (d.sessionsToday ?? 0) : 0,
        totalXPToday: isToday ? (d.totalXPToday ?? 0) : 0,
      });
    } catch (e) {
      console.warn('Hydrate failed:', e);
    }
  },
}));
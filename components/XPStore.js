import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  Platform,
  StatusBar,
} from 'react-native';
import { Colors } from '../constants/colors';
import { THEMES } from '../constants/themes';
import { useSessionStore, XP_REWARDS } from '../store/sessionStore';
import { useTheme } from '../hooks/useTheme';

const CATEGORIES = [
  { key: 'all',     label: 'Tümü' },
  { key: 'theme',   label: '🎨 Temalar' },
  { key: 'sound',   label: '🎵 Sesler' },
  { key: 'badge',   label: '🏅 Rozetler' },
  { key: 'feature', label: '⚡ Özellikler' },
];

export function XPStore({ visible, onClose }) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [confirmReward, setConfirmReward] = useState(null);
  const [devOpen, setDevOpen] = useState(false);

  const totalXP         = useSessionStore((s) => s.totalXP);
  const spentXP         = useSessionStore((s) => s.spentXP);
  const unlockedRewards = useSessionStore((s) => s.unlockedRewards);
  const unlockReward    = useSessionStore((s) => s.unlockReward);
  const devAddXP        = useSessionStore((s) => s.devAddXP);
  const devRemoveXP     = useSessionStore((s) => s.devRemoveXP);
  const devResetRewards = useSessionStore((s) => s.devResetRewards);
  const activeTheme     = useSessionStore((s) => s.activeTheme);
  const activeSound     = useSessionStore((s) => s.activeSound);
  const activeBadge     = useSessionStore((s) => s.activeBadge);
  const setTheme        = useSessionStore((s) => s.setTheme);
  const setActiveSound  = useSessionStore((s) => s.setActiveSound);
  const setActiveBadge  = useSessionStore((s) => s.setActiveBadge);

  const theme = useTheme();
  const availableXP = totalXP - spentXP;

  const renderUnlockedAction = (reward) => {
    if (reward.type === 'theme') {
      const isActive = activeTheme === reward.id;
      return (
        <TouchableOpacity
          style={[styles.actionBtn, isActive && { backgroundColor: theme.accentDim, borderColor: theme.accentBorder }]}
          onPress={() => setTheme(isActive ? 'default' : reward.id)}
          activeOpacity={0.8}
        >
          <Text style={[styles.actionBtnText, isActive && { color: theme.accent }]}>
            {isActive ? '✓ Aktif' : 'Seç'}
          </Text>
        </TouchableOpacity>
      );
    }
    if (reward.type === 'sound') {
      const isActive = activeSound === reward.id;
      return (
        <TouchableOpacity
          style={[styles.actionBtn, isActive && { backgroundColor: theme.accentDim, borderColor: theme.accentBorder }]}
          onPress={() => setActiveSound(isActive ? null : reward.id)}
          activeOpacity={0.8}
        >
          <Text style={[styles.actionBtnText, isActive && { color: theme.accent }]}>
            {isActive ? '♫ Aktif' : 'Seç'}
          </Text>
        </TouchableOpacity>
      );
    }
    if (reward.type === 'badge') {
      const isActive = activeBadge === reward.id;
      return (
        <TouchableOpacity
          style={[styles.actionBtn, isActive && { backgroundColor: theme.accentDim, borderColor: theme.accentBorder }]}
          onPress={() => setActiveBadge(isActive ? null : reward.id)}
          activeOpacity={0.8}
        >
          <Text style={[styles.actionBtnText, isActive && { color: theme.accent }]}>
            {isActive ? '✓ Takıldı' : 'Tak'}
          </Text>
        </TouchableOpacity>
      );
    }
    // feature
    return (
      <View style={[styles.unlockedBadge, { backgroundColor: theme.accentDim, borderColor: theme.accentBorder }]}>
        <Text style={[styles.unlockedBadgeText, { color: theme.accent }]}>⚡ Aktif</Text>
      </View>
    );
  };

  const filtered = activeCategory === 'all'
    ? XP_REWARDS
    : XP_REWARDS.filter((r) => r.type === activeCategory);

  const handleUnlock = (reward) => {
    if (unlockedRewards.includes(reward.id)) return;
    if (availableXP < reward.cost) return;
    setConfirmReward(reward);
  };

  const confirmUnlock = () => {
    if (!confirmReward) return;
    unlockReward(confirmReward.id);
    setConfirmReward(null);
  };

  const topPad = Platform.OS === 'android'
    ? (StatusBar.currentHeight || 32)
    : 52;

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={[styles.container, { paddingTop: topPad }]}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>XP Mağazası</Text>
            <Text style={styles.subtitle}>XP kazanarak özellikleri aç</Text>
          </View>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.8}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* XP Balance */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceCol}>
            <Text style={styles.balanceLabel}>Mevcut XP</Text>
            <Text style={[styles.balanceValueAccent, { color: theme.accent }]}>{availableXP}</Text>
          </View>
          <View style={styles.balanceDivider} />
          <View style={styles.balanceCol}>
            <Text style={styles.balanceLabel}>Toplam</Text>
            <Text style={styles.balanceValue}>{totalXP}</Text>
          </View>
          <View style={styles.balanceDivider} />
          <View style={styles.balanceCol}>
            <Text style={styles.balanceLabel}>Harcanan</Text>
            <Text style={styles.balanceValueMuted}>{spentXP}</Text>
          </View>
        </View>

        {/* XP kazanma ipuçları */}
        <View style={[styles.tipsCard, { backgroundColor: theme.accentDim, borderColor: theme.accentBorder }]}>
          <Text style={[styles.tipsTitle, { color: theme.accent }]}>XP Nasıl Kazanılır?</Text>
          <Text style={[styles.tipsText, { color: theme.accentText }]}>
            5 dk → 5 XP  ·  25 dk → 50 XP  ·  45 dk → 135 XP  ·  60 dk → 180 XP
          </Text>
          <Text style={[styles.tipsText, { color: theme.accentText }]}>Tamamlanan session = 2–3x bonus XP!</Text>
        </View>

        {/* Kategori filtresi */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.catScroll}
          contentContainerStyle={styles.catContent}
        >
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.key;
            return (
              <TouchableOpacity
                key={cat.key}
                style={[
                  styles.catBtn,
                  isActive && { backgroundColor: theme.accentDim, borderColor: theme.accentBorder },
                ]}
                onPress={() => setActiveCategory(cat.key)}
                activeOpacity={0.75}
              >
                <Text style={[styles.catText, isActive && { color: theme.accent, fontWeight: '600' }]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Geliştirici Paneli */}
        <TouchableOpacity
          style={styles.devToggle}
          onPress={() => setDevOpen((v) => !v)}
          activeOpacity={0.75}
        >
          <Text style={styles.devToggleText}>🛠️ Geliştirici  {devOpen ? '▲' : '▼'}</Text>
        </TouchableOpacity>

        {devOpen && (
          <View style={styles.devPanel}>
            <Text style={styles.devLabel}>XP Ekle</Text>
            <View style={styles.devRow}>
              {[50, 100, 500].map((amt) => (
                <TouchableOpacity
                  key={`add_${amt}`}
                  style={styles.devBtnGreen}
                  onPress={() => devAddXP(amt)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.devBtnTextGreen}>+{amt}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.devLabel, { marginTop: 10 }]}>XP Çıkar</Text>
            <View style={styles.devRow}>
              {[50, 100].map((amt) => (
                <TouchableOpacity
                  key={`rem_${amt}`}
                  style={styles.devBtnRed}
                  onPress={() => devRemoveXP(amt)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.devBtnTextRed}>−{amt}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.devBtnReset}
              onPress={devResetRewards}
              activeOpacity={0.8}
            >
              <Text style={styles.devBtnTextReset}>🔄 Tüm Alımları Sıfırla</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Ödül listesi */}
        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {filtered.map((reward, i) => {
            const unlocked  = unlockedRewards.includes(reward.id);
            const canAfford = availableXP >= reward.cost;

            return (
              <TouchableOpacity
                key={reward.id}
                style={[
                  styles.rewardCard,
                  unlocked && styles.rewardCardUnlocked,
                  !canAfford && !unlocked && styles.rewardCardLocked,
                  i < filtered.length - 1 && styles.rewardCardMargin,
                ]}
                onPress={unlocked ? undefined : () => handleUnlock(reward)}
                disabled={!unlocked && !canAfford}
                activeOpacity={0.8}
              >
                <View style={styles.iconWrap}>
                  <Text style={styles.rewardIcon}>{reward.icon}</Text>
                  {reward.type === 'theme' && THEMES[reward.id] && (
                    <View style={[styles.themeDot, { backgroundColor: THEMES[reward.id].accent }]} />
                  )}
                </View>
                <View style={styles.rewardInfo}>
                  <Text style={[styles.rewardName, unlocked && { color: theme.accent }]}>
                    {reward.name}
                  </Text>
                  <Text style={styles.rewardDesc}>{reward.desc}</Text>
                </View>
                <View style={styles.rewardRight}>
                  {unlocked ? renderUnlockedAction(reward) : (
                    <View style={[styles.costBadge, !canAfford && styles.costBadgeLocked]}>
                      <Text style={[styles.costText, !canAfford && styles.costTextLocked]}>
                        {reward.cost} XP
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Confirm Modal */}
      <Modal visible={!!confirmReward} transparent animationType="fade">
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmCard}>
            <Text style={styles.confirmIcon}>{confirmReward?.icon}</Text>
            <Text style={styles.confirmTitle}>{confirmReward?.name}</Text>
            <Text style={styles.confirmDesc}>
              {confirmReward?.cost} XP harcayarak bu özelliği açmak istiyor musun?
            </Text>
            <Text style={styles.confirmBalance}>
              Mevcut XP: {availableXP}  →  Sonrası: {availableXP - (confirmReward?.cost || 0)}
            </Text>
            <View style={styles.confirmBtns}>
              <TouchableOpacity
                style={styles.confirmCancel}
                onPress={() => setConfirmReward(null)}
                activeOpacity={0.8}
              >
                <Text style={styles.confirmCancelText}>Vazgeç</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmOk, { backgroundColor: theme.accentDim, borderColor: theme.accentBorder }]}
                onPress={confirmUnlock}
                activeOpacity={0.8}
              >
                <Text style={[styles.confirmOkText, { color: theme.accent }]}>Aç!</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    backgroundColor: Colors.surface,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: Colors.border2,
  },
  closeBtnText: {
    color: Colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },

  // Balance
  balanceCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderWidth: 0.5,
    borderColor: Colors.border2,
    borderRadius: 14,
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 16,
    alignItems: 'center',
  },
  balanceCol: {
    flex: 1,
    alignItems: 'center',
  },
  balanceDivider: {
    width: 0.5,
    height: 36,
    backgroundColor: Colors.border2,
    marginHorizontal: 4,
  },
  balanceLabel: {
    fontSize: 9,
    color: Colors.textMuted,
    letterSpacing: 1,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  balanceValueAccent: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.accent,
  },
  balanceValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  balanceValueMuted: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textMuted,
  },

  // Tips
  tipsCard: {
    backgroundColor: Colors.accentDim,
    borderWidth: 0.5,
    borderColor: Colors.accentBorder,
    borderRadius: 10,
    marginHorizontal: 20,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  tipsTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.accent,
    marginBottom: 4,
  },
  tipsText: {
    fontSize: 11,
    color: 'rgba(200,245,66,0.7)',
    lineHeight: 17,
  },

  // Category navbar — key fix: height + overflow visible
  catScroll: {
    flexGrow: 0,
    marginBottom: 12,
  },
  catContent: {
    paddingHorizontal: 20,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  catBtn: {
    backgroundColor: Colors.surface,
    borderWidth: 0.5,
    borderColor: Colors.border2,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    minHeight: 36,
    justifyContent: 'center',
  },
  catBtnActive: {
    backgroundColor: Colors.accentDim,
    borderColor: Colors.accentBorder,
  },
  catText: {
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  catTextActive: {
    color: Colors.accent,
    fontWeight: '600',
  },

  // Reward list
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  rewardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 0.5,
    borderColor: Colors.border2,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  rewardCardUnlocked: {
    borderColor: Colors.accentBorder,
    backgroundColor: 'rgba(200,245,66,0.04)',
  },
  rewardCardLocked: {
    opacity: 0.6,
  },
  iconWrap: {
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 32,
  },
  rewardIcon: {
    fontSize: 26,
    textAlign: 'center',
  },
  themeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 3,
  },
  actionBtn: {
    backgroundColor: Colors.surface2,
    borderWidth: 0.5,
    borderColor: Colors.border2,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  actionBtnText: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  rewardInfo: {
    flex: 1,
  },
  rewardName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 3,
  },
  rewardNameUnlocked: {
    color: Colors.accent,
  },
  rewardDesc: {
    fontSize: 11,
    color: Colors.textMuted,
    lineHeight: 16,
  },
  rewardRight: {
    marginLeft: 10,
  },
  costBadge: {
    backgroundColor: Colors.accentDim,
    borderWidth: 0.5,
    borderColor: Colors.accentBorder,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  costBadgeLocked: {
    backgroundColor: Colors.surface2,
    borderColor: Colors.border,
  },
  costText: {
    fontSize: 11,
    color: Colors.accent,
    fontWeight: '700',
  },
  costTextLocked: {
    color: Colors.textMuted,
  },
  unlockedBadge: {
    backgroundColor: 'rgba(200,245,66,0.1)',
    borderWidth: 0.5,
    borderColor: Colors.accentBorder,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  unlockedBadgeText: {
    fontSize: 11,
    color: Colors.accent,
    fontWeight: '700',
  },

  // Dev panel
  devToggle: {
    marginHorizontal: 20,
    marginBottom: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(255,200,0,0.08)',
    borderWidth: 0.5,
    borderColor: 'rgba(255,200,0,0.3)',
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  devToggleText: {
    fontSize: 12,
    color: 'rgba(255,200,0,0.8)',
    fontWeight: '600',
  },
  devPanel: {
    marginHorizontal: 20,
    marginBottom: 10,
    backgroundColor: 'rgba(255,200,0,0.05)',
    borderWidth: 0.5,
    borderColor: 'rgba(255,200,0,0.25)',
    borderRadius: 12,
    padding: 14,
  },
  devLabel: {
    fontSize: 10,
    color: 'rgba(255,200,0,0.6)',
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  devRow: {
    flexDirection: 'row',
    gap: 8,
  },
  devBtnGreen: {
    backgroundColor: 'rgba(100,220,100,0.12)',
    borderWidth: 0.5,
    borderColor: 'rgba(100,220,100,0.4)',
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  devBtnTextGreen: {
    color: '#6fdc6f',
    fontSize: 13,
    fontWeight: '700',
  },
  devBtnRed: {
    backgroundColor: 'rgba(220,80,80,0.12)',
    borderWidth: 0.5,
    borderColor: 'rgba(220,80,80,0.4)',
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  devBtnTextRed: {
    color: '#e06060',
    fontSize: 13,
    fontWeight: '700',
  },
  devBtnReset: {
    marginTop: 10,
    backgroundColor: 'rgba(180,120,0,0.12)',
    borderWidth: 0.5,
    borderColor: 'rgba(180,120,0,0.35)',
    borderRadius: 8,
    paddingVertical: 9,
    alignItems: 'center',
  },
  devBtnTextReset: {
    color: 'rgba(255,180,50,0.85)',
    fontSize: 12,
    fontWeight: '600',
  },

  // Confirm modal
  confirmOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  confirmCard: {
    backgroundColor: Colors.surface,
    borderWidth: 0.5,
    borderColor: Colors.border2,
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    width: '100%',
  },
  confirmIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  confirmTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 8,
  },
  confirmDesc: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 8,
  },
  confirmBalance: {
    fontSize: 12,
    color: Colors.accent,
    fontWeight: '600',
    marginBottom: 24,
  },
  confirmBtns: {
    flexDirection: 'row',
    width: '100%',
  },
  confirmCancel: {
    flex: 1,
    backgroundColor: Colors.surface2,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 0.5,
    borderColor: Colors.border2,
  },
  confirmCancelText: {
    color: Colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  confirmOk: {
    flex: 1,
    backgroundColor: Colors.accentDim,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: Colors.accentBorder,
  },
  confirmOkText: {
    color: Colors.accent,
    fontSize: 14,
    fontWeight: '700',
  },
});
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
import { useSessionStore, XP_REWARDS } from '../store/sessionStore';

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

  const totalXP         = useSessionStore((s) => s.totalXP);
  const spentXP         = useSessionStore((s) => s.spentXP);
  const unlockedRewards = useSessionStore((s) => s.unlockedRewards);
  const unlockReward    = useSessionStore((s) => s.unlockReward);

  const availableXP = totalXP - spentXP;

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
            <Text style={styles.balanceValueAccent}>{availableXP}</Text>
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
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>XP Nasıl Kazanılır?</Text>
          <Text style={styles.tipsText}>
            5 dk → 5 XP  ·  25 dk → 50 XP  ·  45 dk → 135 XP  ·  60 dk → 180 XP
          </Text>
          <Text style={styles.tipsText}>Tamamlanan session = 2–3x bonus XP!</Text>
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
                style={[styles.catBtn, isActive && styles.catBtnActive]}
                onPress={() => setActiveCategory(cat.key)}
                activeOpacity={0.75}
              >
                <Text style={[styles.catText, isActive && styles.catTextActive]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

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
                onPress={() => handleUnlock(reward)}
                disabled={unlocked || !canAfford}
                activeOpacity={0.8}
              >
                <Text style={styles.rewardIcon}>{reward.icon}</Text>
                <View style={styles.rewardInfo}>
                  <Text style={[styles.rewardName, unlocked && styles.rewardNameUnlocked]}>
                    {reward.name}
                  </Text>
                  <Text style={styles.rewardDesc}>{reward.desc}</Text>
                </View>
                <View style={styles.rewardRight}>
                  {unlocked ? (
                    <View style={styles.unlockedBadge}>
                      <Text style={styles.unlockedBadgeText}>✓ Açık</Text>
                    </View>
                  ) : (
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
                style={styles.confirmOk}
                onPress={confirmUnlock}
                activeOpacity={0.8}
              >
                <Text style={styles.confirmOkText}>Aç!</Text>
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
  rewardIcon: {
    fontSize: 26,
    marginRight: 12,
    minWidth: 32,
    textAlign: 'center',
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
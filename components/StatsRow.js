import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';

function StatCard({ label, value, sub, accent }) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, accent && styles.valueAccent]}>
        {typeof value === 'number' ? Math.floor(value) : value}
      </Text>
      <Text style={styles.sub}>{sub}</Text>
    </View>
  );
}

export function StatsRow({ focused, sessions, xp, totalXP, availableXP, onOpenStore }) {
  return (
    <View>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionLabel}>BUGÜN</Text>
        <TouchableOpacity style={styles.storeBtn} onPress={onOpenStore}>
          <Text style={styles.storeBtnText}>🛍️ XP Mağazası</Text>
          <View style={styles.xpPill}>
            <Text style={styles.xpPillText}>{availableXP} XP</Text>
          </View>
        </TouchableOpacity>
      </View>
      <View style={styles.row}>
        <StatCard label="ODAK" value={focused} sub="dakika" />
        <View style={styles.gap} />
        <StatCard label="SESSION" value={sessions} sub="tamamlandı" />
        <View style={styles.gap} />
        <StatCard label="BUGÜN XP" value={xp} sub="kazanıldı" accent />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 10,
    letterSpacing: 2,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  storeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 0.5,
    borderColor: Colors.border2,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  storeBtnText: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '500',
    marginRight: 6,
  },
  xpPill: {
    backgroundColor: Colors.accentDim,
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  xpPillText: {
    fontSize: 10,
    color: Colors.accent,
    fontWeight: '700',
  },
  row: { flexDirection: 'row' },
  gap: { width: 10 },
  card: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderWidth: 0.5,
    borderColor: Colors.border2,
    borderRadius: 12,
    padding: 14,
  },
  label: {
    fontSize: 9,
    letterSpacing: 1.5,
    color: Colors.textMuted,
    fontWeight: '600',
    marginBottom: 4,
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    lineHeight: 28,
  },
  valueAccent: { color: Colors.accent },
  sub: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 2,
  },
});
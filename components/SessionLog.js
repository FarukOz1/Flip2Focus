import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';

function formatDuration(mins, seconds) {
  if (seconds !== undefined && seconds < 60) {
    return seconds + 'sn';
  }
  const m = Math.floor(mins);
  const s = Math.round((mins - m) * 60);
  if (s > 0) return m + 'dk ' + s + 'sn';
  return m + ' dk';
}

function SessionItem({ mins, seconds, completed, time, xp, isLast }) {
  const durStr = formatDuration(mins, seconds);
  return (
    <View style={[styles.item, !isLast && styles.itemBorder]}>
      <View style={[styles.dot, !completed && styles.dotDim]} />
      <Text style={styles.dur}>{durStr}</Text>
      <Text style={styles.time}>{time} · {completed ? 'tamamlandı' : 'erken bitti'}</Text>
      <View style={[styles.xpBadge, xp === 0 && styles.xpBadgeDim]}>
        <Text style={[styles.xpText, xp === 0 && styles.xpTextDim]}>
          {xp > 0 ? '+' + xp + ' xp' : '0 xp'}
        </Text>
      </View>
    </View>
  );
}

export function SessionLog({ sessions }) {
  return (
    <View style={styles.panel}>
      <View style={styles.header}>
        <Text style={styles.headerLabel}>SESSION LOG</Text>
        <Text style={styles.headerCount}>
          {sessions.length} session{sessions.length !== 1 ? '' : ''}
        </Text>
      </View>
      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {sessions.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              Henüz session yok.{'\n'}Telefonu çevirerek odaklanmaya başla.
            </Text>
          </View>
        ) : (
          sessions.slice(0, 15).map((s, i) => (
            <SessionItem
              key={s.id}
              {...s}
              isLast={i === Math.min(sessions.length, 15) - 1}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: Colors.surface,
    borderWidth: 0.5,
    borderColor: Colors.border2,
    borderRadius: 14,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  headerLabel: {
    fontSize: 10,
    letterSpacing: 1.5,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  headerCount: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  list: { maxHeight: 240 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 14,
  },
  itemBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.accent,
    marginRight: 10,
  },
  dotDim: { backgroundColor: 'rgba(200,245,66,0.25)' },
  dur: {
    fontSize: 12,
    color: Colors.text,
    fontWeight: '600',
    minWidth: 52,
    marginRight: 6,
  },
  time: {
    fontSize: 11,
    color: Colors.textMuted,
    flex: 1,
  },
  xpBadge: {
    backgroundColor: Colors.accentDim,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  xpBadgeDim: {
    backgroundColor: Colors.surface2,
  },
  xpText: {
    fontSize: 10,
    color: Colors.accent,
    fontWeight: '600',
  },
  xpTextDim: { color: Colors.textMuted },
  empty: {
    padding: 28,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});
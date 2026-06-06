import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Colors } from '../constants/colors';
import { useTheme } from '../hooks/useTheme';

const PRESETS = [5, 15, 25, 45, 60, 90];

export function DurationSelector({ selected, onSelect, disabled }) {
  const theme = useTheme();
  const [customMode, setCustomMode] = useState(false);
  const [customVal, setCustomVal] = useState('');

  const handleCustomSubmit = () => {
    const num = parseInt(customVal, 10);
    if (!isNaN(num) && num >= 1 && num <= 180) {
      onSelect(num);
      setCustomMode(false);
      setCustomVal('');
    }
  };

  const isPreset = PRESETS.includes(selected);

  return (
    <View>
      <View style={styles.labelRow}>
        <Text style={styles.label}>SESSION DURATION</Text>
        <TouchableOpacity
          onPress={() => !disabled && setCustomMode(!customMode)}
          disabled={disabled}
        >
          <Text style={[styles.customToggle, customMode && { color: theme.accent }]}>
            {customMode ? 'presets' : '+ custom'}
          </Text>
        </TouchableOpacity>
      </View>

      {customMode ? (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.customRow}>
            <TextInput
              style={[styles.customInput, { color: theme.accent }]}
              placeholder="1–180"
              placeholderTextColor={Colors.textMuted}
              keyboardType="number-pad"
              value={customVal}
              onChangeText={setCustomVal}
              maxLength={3}
              returnKeyType="done"
              onSubmitEditing={handleCustomSubmit}
              autoFocus
            />
            <Text style={styles.customUnit}>dakika</Text>
            <TouchableOpacity
              style={[styles.customConfirm, { backgroundColor: theme.accentDim, borderColor: theme.accentBorder }]}
              onPress={handleCustomSubmit}
              activeOpacity={0.8}
            >
              <Text style={[styles.customConfirmText, { color: theme.accent }]}>Ayarla</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.quickRow}>
            {[10, 20, 30, 40, 50].map((m, i) => (
              <TouchableOpacity
                key={m}
                style={[styles.quickBtn, i < 4 && styles.quickBtnMargin]}
                onPress={() => { onSelect(m); setCustomMode(false); }}
                activeOpacity={0.75}
              >
                <Text style={styles.quickBtnText}>{m}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </KeyboardAvoidingView>
      ) : (
        <View style={styles.row}>
          {PRESETS.map((mins, index) => {
            const isActive = selected === mins;
            return (
              <TouchableOpacity
                key={mins}
                style={[
                  styles.btn,
                  isActive && { backgroundColor: theme.accentDim, borderColor: theme.accentBorder },
                  index < PRESETS.length - 1 && styles.btnMargin,
                ]}
                onPress={() => onSelect(mins)}
                disabled={disabled}
                activeOpacity={0.75}
              >
                <Text style={[styles.btnText, isActive && { color: theme.accent }]}>
                  {mins}
                </Text>
                <Text style={[styles.btnSub, isActive && { color: theme.accentText }]}>
                  min
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {!isPreset && !customMode && (
        <View style={styles.selectedCustom}>
          <Text style={styles.selectedCustomText}>
            Özel süre: <Text style={{ color: theme.accent }}>{selected} dakika</Text>
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 10, letterSpacing: 2,
    color: Colors.textMuted, fontWeight: '600',
  },
  customToggle: {
    fontSize: 11, color: Colors.textMuted, fontWeight: '500',
  },
  row: { flexDirection: 'row' },
  btn: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderWidth: 0.5,
    borderColor: Colors.border2,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  btnMargin: { marginRight: 6 },
  btnText: {
    fontSize: 13, color: Colors.textMuted,
    fontWeight: '700', lineHeight: 16,
  },
  btnSub: { fontSize: 9, color: Colors.textDim },

  customRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 0.5, borderColor: Colors.border2,
    borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10,
    marginBottom: 8,
  },
  customInput: {
    fontSize: 28, fontWeight: '700',
    minWidth: 60, padding: 0,
  },
  customUnit: {
    fontSize: 13, color: Colors.textMuted,
    marginLeft: 6, flex: 1,
  },
  customConfirm: {
    borderWidth: 0.5, borderRadius: 8,
    paddingHorizontal: 14, paddingVertical: 7,
  },
  customConfirmText: { fontSize: 12, fontWeight: '600' },
  quickRow: { flexDirection: 'row', marginBottom: 4 },
  quickBtn: {
    flex: 1,
    backgroundColor: Colors.surface2,
    borderRadius: 8, paddingVertical: 7,
    alignItems: 'center',
    borderWidth: 0.5, borderColor: Colors.border,
  },
  quickBtnMargin: { marginRight: 6 },
  quickBtnText: { fontSize: 12, color: Colors.textMuted, fontWeight: '500' },
  selectedCustom: { marginTop: 6, paddingHorizontal: 4 },
  selectedCustomText: { fontSize: 11, color: Colors.textMuted },
});

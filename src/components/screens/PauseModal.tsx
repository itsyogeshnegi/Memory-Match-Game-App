// Pause Modal Component

import React from 'react';
import { StyleSheet, View, Text, Modal, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import { Button } from '../common/Button';

interface PauseModalProps {
  visible: boolean;
  onResume: () => void;
  onRestart: () => void;
  onQuitToMenu: () => void;
  hapticsEnabled: boolean;
  onToggleHaptics: (val: boolean) => void;
  soundEnabled: boolean;
  onToggleSound: (val: boolean) => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  visible,
  onResume,
  onRestart,
  onQuitToMenu,
  hapticsEnabled,
  onToggleHaptics,
  soundEnabled,
  onToggleSound,
}) => {
  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Ionicons name="pause" size={26} color={Colors.primaryLight} />
            </View>
            <Text style={styles.title}>MATCH PAUSED</Text>
          </View>

          {/* Quick Settings Toggles */}
          <View style={styles.settingsSection}>
            <View style={styles.toggleRow}>
              <View style={styles.toggleLabelRow}>
                <Ionicons name="hardware-chip-outline" size={18} color={Colors.textSecondary} />
                <Text style={styles.toggleLabel}>Haptic Feedback</Text>
              </View>
              <Switch
                value={hapticsEnabled}
                onValueChange={onToggleHaptics}
                trackColor={{ false: Colors.surfaceBorder, true: Colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.toggleRow}>
              <View style={styles.toggleLabelRow}>
                <Ionicons name="volume-high-outline" size={18} color={Colors.textSecondary} />
                <Text style={styles.toggleLabel}>Audio Cues</Text>
              </View>
              <Switch
                value={soundEnabled}
                onValueChange={onToggleSound}
                trackColor={{ false: Colors.surfaceBorder, true: Colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <Button
              title="RESUME MATCH"
              onPress={onResume}
              variant="primary"
              size="medium"
              icon="play"
              fullWidth
              style={styles.actionSpacing}
            />

            <Button
              title="RESTART MATCH"
              onPress={onRestart}
              variant="ghost"
              size="medium"
              icon="refresh"
              fullWidth
              style={styles.actionSpacing}
            />

            <Button
              title="QUIT TO MAIN MENU"
              onPress={onQuitToMenu}
              variant="danger"
              size="medium"
              icon="home-outline"
              fullWidth
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 7, 15, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: Colors.surface,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: Colors.surfaceBorder,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 1,
  },
  settingsSection: {
    width: '100%',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 16,
    padding: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  toggleLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleLabel: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 10,
  },
  actions: {
    width: '100%',
  },
  actionSpacing: {
    marginBottom: 10,
  },
});

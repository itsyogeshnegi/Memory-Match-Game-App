// Pass The Device Privacy Overlay for P2P Mode
// Prevents accidental information leaks between human players.

import React from 'react';
import { StyleSheet, View, Text, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import { Button } from '../common/Button';

interface PassDeviceOverlayProps {
  visible: boolean;
  targetPlayerName: string;
  onConfirmReady: () => void;
}

export const PassDeviceOverlay: React.FC<PassDeviceOverlayProps> = ({
  visible,
  targetPlayerName,
  onConfirmReady,
}) => {
  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.overlay}>
        <LinearGradient
          colors={['#0F172A', '#1E1B4B', '#090D16']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.container}
        >
          {/* Privacy Shield Icon */}
          <View style={styles.iconCircle}>
            <Ionicons name="phone-portrait" size={54} color={Colors.primaryLight} />
            <View style={styles.lockBadge}>
              <Ionicons name="lock-closed" size={18} color="#FFFFFF" />
            </View>
          </View>

          {/* Heading and Target Player */}
          <Text style={styles.subTitle}>TURN TRANSITION</Text>
          <Text style={styles.title}>PASS THE DEVICE TO</Text>
          <Text style={styles.playerName}>{targetPlayerName.toUpperCase()}</Text>

          <Text style={styles.privacyNote}>
            Hand the device to {targetPlayerName}. The board is securely hidden to prevent any
            spoilers.
          </Text>

          {/* Ready Confirmation */}
          <View style={styles.buttonContainer}>
            <Button
              title="I AM READY • REVEAL BOARD"
              onPress={onConfirmReady}
              variant="primary"
              size="large"
              icon="play-circle"
              fullWidth
            />
          </View>
        </LinearGradient>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#000000',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderWidth: 2,
    borderColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    position: 'relative',
  },
  lockBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#0F172A',
  },
  subTitle: {
    color: Colors.textMuted,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 8,
  },
  title: {
    color: Colors.textSecondary,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
  },
  playerName: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginTop: 4,
    marginBottom: 16,
    textAlign: 'center',
  },
  privacyNote: {
    color: Colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 290,
    marginBottom: 40,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 340,
  },
});

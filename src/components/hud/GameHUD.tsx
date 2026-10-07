// Complete Game HUD component

import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PlayerId, PlayerProfile } from '../../types/game';
import { Colors } from '../../theme/colors';
import { PlayerScoreCard } from './PlayerScoreCard';
import { HapticsService } from '../../services/haptics';

interface GameHUDProps {
  player1: PlayerProfile;
  player2OrAI: PlayerProfile;
  activePlayerId: PlayerId;
  totalTimeSeconds: number;
  onPausePress: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  player1,
  player2OrAI,
  activePlayerId,
  totalTimeSeconds,
  onPausePress,
}) => {
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  const handlePause = () => {
    HapticsService.cardTap();
    onPausePress();
  };

  return (
    <View style={styles.container}>
      {/* Player 1 Card */}
      <PlayerScoreCard
        player={player1}
        isActive={activePlayerId === 'PLAYER_1'}
        align="left"
      />

      {/* Center Controls: Timer & Pause */}
      <View style={styles.centerSection}>
        <Pressable onPress={handlePause} style={styles.pauseButton}>
          <Ionicons name="pause" size={18} color={Colors.textSecondary} />
        </Pressable>
        <View style={styles.timerContainer}>
          <Ionicons name="time-outline" size={12} color={Colors.textMuted} style={styles.timerIcon} />
          <Text style={styles.timerText}>{formatTime(totalTimeSeconds)}</Text>
        </View>
      </View>

      {/* Opponent Card (Player 2 or AI) */}
      <PlayerScoreCard
        player={player2OrAI}
        isActive={activePlayerId === player2OrAI.id}
        align="right"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 6,
    width: '100%',
  },
  centerSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  pauseButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timerIcon: {
    marginRight: 3,
  },
  timerText: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
});

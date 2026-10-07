// HUD Player Card showing score, pairs matched, combo, and active turn halo

import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PlayerProfile } from '../../types/game';
import { Colors } from '../../theme/colors';
import { ComboBadge } from './ComboBadge';

interface PlayerScoreCardProps {
  player: PlayerProfile;
  isActive: boolean;
  align?: 'left' | 'right';
}

export const PlayerScoreCard: React.FC<PlayerScoreCardProps> = ({
  player,
  isActive,
  align = 'left',
}) => {
  const isRight = align === 'right';

  return (
    <View
      style={[
        styles.container,
        isActive && styles.activeContainer,
        { borderColor: isActive ? player.color : Colors.surfaceBorder },
      ]}
    >
      <View
        style={[
          styles.innerRow,
          isRight && styles.innerRowReverse,
        ]}
      >
        {/* Avatar Icon */}
        <View
          style={[
            styles.avatarBadge,
            { backgroundColor: `${player.color}25`, borderColor: player.color },
          ]}
        >
          <Ionicons name={player.avatar as any} size={20} color={player.color} />
        </View>

        {/* Info & Score */}
        <View style={[styles.infoColumn, isRight && styles.infoColumnRight]}>
          <View style={styles.nameRow}>
            <Text
              numberOfLines={1}
              style={[
                styles.playerName,
                isActive && { color: player.color, fontWeight: '800' },
              ]}
            >
              {player.name}
            </Text>
            {isActive && <View style={[styles.activeDot, { backgroundColor: player.color }]} />}
          </View>

          <View style={styles.statsRow}>
            <Text style={styles.scoreText}>{player.score.toLocaleString()}</Text>
            <Text style={styles.pairsBadge}>{player.pairsMatched} pairs</Text>
          </View>
        </View>
      </View>

      {/* Combo streak badge */}
      {player.currentCombo > 1 && (
        <View style={styles.comboWrapper}>
          <ComboBadge combo={player.currentCombo} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginHorizontal: 4,
    minHeight: 64,
    justifyContent: 'center',
  },
  activeContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
    backgroundColor: Colors.surfaceElevated,
  },
  innerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  innerRowReverse: {
    flexDirection: 'row-reverse',
  },
  avatarBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoColumn: {
    marginLeft: 8,
    flex: 1,
  },
  infoColumnRight: {
    marginLeft: 0,
    marginRight: 8,
    alignItems: 'flex-end',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playerName: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    maxWidth: 90,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginLeft: 4,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 2,
  },
  scoreText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '800',
    marginRight: 6,
  },
  pairsBadge: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  comboWrapper: {
    position: 'absolute',
    top: -10,
    alignSelf: 'center',
  },
});

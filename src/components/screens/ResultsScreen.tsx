// Results Screen with Winner Celebration and detailed Match Stats

import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { GameResult, PlayerId } from '../../types/game';
import { AchievementItem } from '../../types/storage';
import { Colors } from '../../theme/colors';
import { Button } from '../common/Button';
import { ParticleBurst } from '../common/ParticleBurst';
import { HapticsService } from '../../services/haptics';
import { ScoringSystem } from '../../engine/ScoringSystem';

interface ResultsScreenProps {
  result: GameResult;
  newAchievements: AchievementItem[];
  onRematch: () => void;
  onHome: () => void;
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({
  result,
  newAchievements,
  onRematch,
  onHome,
}) => {
  const [particlesActive, setParticlesActive] = useState(true);

  const isTie = result.winnerId === 'TIE';
  const winnerPlayer = !isTie ? result.players[result.winnerId as PlayerId] : null;

  useEffect(() => {
    HapticsService.victoryCelebration();
  }, []);

  const opponentId = result.mode === 'AI' ? 'AI' : 'PLAYER_2';
  const p1 = result.players.PLAYER_1;
  const p2OrAI = result.players[opponentId];

  const p1Accuracy = ScoringSystem.calculateAccuracy(p1.pairsMatched, p1.moves);
  const p2Accuracy = ScoringSystem.calculateAccuracy(p2OrAI.pairsMatched, p2OrAI.moves);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins}m ${remainder < 10 ? '0' : ''}${remainder}s`;
  };

  return (
    <View style={styles.container}>
      <ParticleBurst active={particlesActive} count={35} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* WINNER HEADER */}
        <View style={styles.winnerSection}>
          <View style={styles.trophyWrapper}>
            <LinearGradient
              colors={isTie ? Colors.primaryGradient : Colors.goldGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.trophyCircle}
            >
              <Ionicons
                name={isTie ? 'sparkles' : 'trophy'}
                size={48}
                color="#FFFFFF"
              />
            </LinearGradient>
          </View>

          <Text style={styles.resultHeading}>
            {isTie ? "IT'S A DEAD TIE!" : 'MATCH WINNER!'}
          </Text>
          <Text style={styles.winnerNameText}>
            {result.winnerName.toUpperCase()}
          </Text>

          {result.isNewHighScore && (
            <View style={styles.highScoreBadge}>
              <Ionicons name="star" size={14} color="#FFF" style={{ marginRight: 4 }} />
              <Text style={styles.highScoreText}>NEW PERSONAL HIGH SCORE!</Text>
            </View>
          )}
        </View>

        {/* NEW ACHIEVEMENTS ALERT */}
        {newAchievements.length > 0 && (
          <View style={styles.achievementsCard}>
            <View style={styles.achievementsCardHeader}>
              <Ionicons name="ribbon" size={20} color={Colors.gold} />
              <Text style={styles.achievementsCardTitle}>ACHIEVEMENT UNLOCKED!</Text>
            </View>
            {newAchievements.map((ach) => (
              <View key={ach.id} style={styles.achItem}>
                <Ionicons name={ach.icon as any} size={22} color={Colors.gold} style={styles.achIcon} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.achTitle}>{ach.title}</Text>
                  <Text style={styles.achDesc}>{ach.description}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* COMPARATIVE SCOREBOARD */}
        <View style={styles.statsCard}>
          <Text style={styles.statsCardTitle}>MATCH SUMMARY</Text>

          {/* Players side-by-side comparison */}
          <View style={styles.comparisonRow}>
            {/* Player 1 */}
            <View style={styles.comparisonCol}>
              <View
                style={[
                  styles.playerBadge,
                  result.winnerId === 'PLAYER_1' && styles.winnerHighlight,
                  { borderColor: p1.color },
                ]}
              >
                <Text numberOfLines={1} style={[styles.playerBadgeName, { color: p1.color }]}>
                  {p1.name}
                </Text>
                <Text style={styles.playerScoreLarge}>{p1.score.toLocaleString()}</Text>
              </View>
            </View>

            <View style={styles.vsDivider}>
              <Text style={styles.vsText}>VS</Text>
            </View>

            {/* Opponent */}
            <View style={styles.comparisonCol}>
              <View
                style={[
                  styles.playerBadge,
                  result.winnerId === opponentId && styles.winnerHighlight,
                  { borderColor: p2OrAI.color },
                ]}
              >
                <Text numberOfLines={1} style={[styles.playerBadgeName, { color: p2OrAI.color }]}>
                  {p2OrAI.name}
                </Text>
                <Text style={styles.playerScoreLarge}>{p2OrAI.score.toLocaleString()}</Text>
              </View>
            </View>
          </View>

          {/* Metric comparison rows */}
          <View style={styles.metricsContainer}>
            <View style={styles.metricRow}>
              <Text style={styles.metricValue}>{p1.pairsMatched}</Text>
              <Text style={styles.metricLabel}>Pairs Matched</Text>
              <Text style={styles.metricValue}>{p2OrAI.pairsMatched}</Text>
            </View>

            <View style={styles.metricRow}>
              <Text style={styles.metricValue}>{p1.moves}</Text>
              <Text style={styles.metricLabel}>Moves / Turns</Text>
              <Text style={styles.metricValue}>{p2OrAI.moves}</Text>
            </View>

            <View style={styles.metricRow}>
              <Text style={styles.metricValue}>{p1Accuracy}%</Text>
              <Text style={styles.metricLabel}>Accuracy</Text>
              <Text style={styles.metricValue}>{p2Accuracy}%</Text>
            </View>

            <View style={styles.metricRow}>
              <Text style={styles.metricValue}>{p1.bestCombo}x</Text>
              <Text style={styles.metricLabel}>Best Combo</Text>
              <Text style={styles.metricValue}>{p2OrAI.bestCombo}x</Text>
            </View>
          </View>

          <View style={styles.timeRow}>
            <Ionicons name="time-outline" size={16} color={Colors.textMuted} style={{ marginRight: 6 }} />
            <Text style={styles.timeText}>Match Duration: {formatTime(result.totalTimeSeconds)}</Text>
          </View>
        </View>

        {/* ACTION BUTTONS */}
        <View style={styles.actionButtons}>
          <Button
            title="PLAY AGAIN (REMATCH)"
            onPress={onRematch}
            variant="primary"
            size="large"
            icon="refresh"
            fullWidth
            style={styles.btnSpacing}
          />

          <Button
            title="MAIN MENU"
            onPress={onHome}
            variant="ghost"
            size="medium"
            icon="home"
            fullWidth
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 48,
    alignItems: 'center',
  },
  winnerSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  trophyWrapper: {
    marginBottom: 16,
  },
  trophyCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
  resultHeading: {
    color: Colors.textMuted,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 4,
  },
  winnerNameText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 1,
    textAlign: 'center',
  },
  highScoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gold,
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 12,
    marginTop: 10,
  },
  highScoreText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  achievementsCard: {
    width: '100%',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
  },
  achievementsCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  achievementsCardTitle: {
    color: Colors.gold,
    fontSize: 13,
    fontWeight: '800',
    marginLeft: 8,
    letterSpacing: 1,
  },
  achItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  achIcon: {
    marginRight: 12,
  },
  achTitle: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  achDesc: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  statsCard: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    borderRadius: 20,
    padding: 18,
    marginBottom: 24,
  },
  statsCardTitle: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
    textAlign: 'center',
    marginBottom: 16,
  },
  comparisonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  comparisonCol: {
    flex: 1,
  },
  playerBadge: {
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 10,
    alignItems: 'center',
  },
  winnerHighlight: {
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
  },
  playerBadgeName: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  playerScoreLarge: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
  },
  vsDivider: {
    paddingHorizontal: 8,
  },
  vsText: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '900',
  },
  metricsContainer: {
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceBorder,
    paddingTop: 12,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 7,
  },
  metricValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    width: 60,
    textAlign: 'center',
  },
  metricLabel: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceBorder,
    paddingTop: 10,
  },
  timeText: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  actionButtons: {
    width: '100%',
  },
  btnSpacing: {
    marginBottom: 12,
  },
});

// Career Statistics and High Scores Screen

import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GameStatistics, HighScoreEntry } from '../../types/storage';
import { StorageService } from '../../services/storage';
import { Colors } from '../../theme/colors';
import { HapticsService } from '../../services/haptics';

interface StatisticsScreenProps {
  onBack: () => void;
}

export const StatisticsScreen: React.FC<StatisticsScreenProps> = ({ onBack }) => {
  const [stats, setStats] = useState<GameStatistics | null>(null);
  const [highScores, setHighScores] = useState<HighScoreEntry[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const s = await StorageService.getStatistics();
    const hs = await StorageService.getHighScores();
    setStats(s);
    setHighScores(hs);
  };

  const formatTime = (secs: number) => {
    const hours = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins} mins`;
  };

  const winRate =
    stats && stats.totalGamesPlayed > 0
      ? Math.round((stats.totalMatchesWonP1 / stats.totalGamesPlayed) * 100)
      : 0;

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Pressable
          onPress={() => {
            HapticsService.cardTap();
            onBack();
          }}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>CAREER STATS</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* OVERVIEW METRICS GRID */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Ionicons name="game-controller" size={24} color={Colors.primaryLight} />
            <Text style={styles.metricNumber}>{stats?.totalGamesPlayed || 0}</Text>
            <Text style={styles.metricLabel}>Games Played</Text>
          </View>

          <View style={styles.metricCard}>
            <Ionicons name="trophy" size={24} color={Colors.gold} />
            <Text style={styles.metricNumber}>{winRate}%</Text>
            <Text style={styles.metricLabel}>P1 Win Rate</Text>
          </View>

          <View style={styles.metricCard}>
            <Ionicons name="flame" size={24} color={Colors.secondary} />
            <Text style={styles.metricNumber}>{stats?.highestComboOverall || 0}x</Text>
            <Text style={styles.metricLabel}>Max Combo</Text>
          </View>

          <View style={styles.metricCard}>
            <Ionicons name="star" size={24} color={Colors.emerald} />
            <Text style={styles.metricNumber}>{stats?.highestSingleGameScore || 0}</Text>
            <Text style={styles.metricLabel}>Best Score</Text>
          </View>
        </View>

        {/* DETAILED STATS */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>MATCH RECORD</Text>

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Player 1 Wins</Text>
            <Text style={[styles.statValue, { color: Colors.player1 }]}>
              {stats?.totalMatchesWonP1 || 0}
            </Text>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Player 2 Wins</Text>
            <Text style={[styles.statValue, { color: Colors.player2 }]}>
              {stats?.totalMatchesWonP2 || 0}
            </Text>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>AI Wins</Text>
            <Text style={[styles.statValue, { color: Colors.aiPlayer }]}>
              {stats?.totalMatchesWonAI || 0}
            </Text>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Total Play Time</Text>
            <Text style={styles.statValue}>{formatTime(stats?.totalTimeSeconds || 0)}</Text>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Total Pairs Matched</Text>
            <Text style={styles.statValue}>{stats?.totalPairsMatchedOverall || 0}</Text>
          </View>
        </View>

        {/* AI DIFFICULTY BREAKDOWN */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>DUELS VS AI BOT</Text>
          {(['EASY', 'MEDIUM', 'HARD', 'EXPERT'] as const).map((diff) => {
            const playerWins = stats?.playerWinsVsAIByDifficulty[diff] || 0;
            const aiWins = stats?.aiWinsByDifficulty[diff] || 0;

            return (
              <View key={diff} style={styles.diffRow}>
                <Text style={styles.diffLabel}>{diff}</Text>
                <Text style={styles.diffScore}>
                  <Text style={{ color: Colors.player1 }}>{playerWins}</Text>
                  {' - '}
                  <Text style={{ color: Colors.aiPlayer }}>{aiWins}</Text>
                </Text>
              </View>
            );
          })}
        </View>

        {/* TOP HIGH SCORES LEADERBOARD */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>TOP HIGH SCORES</Text>

          {highScores.length === 0 ? (
            <Text style={styles.emptyText}>No games recorded yet. Play a match to set a record!</Text>
          ) : (
            highScores.slice(0, 10).map((entry, index) => (
              <View key={entry.id} style={styles.scoreRow}>
                <View style={styles.rankBadge}>
                  <Text style={styles.rankText}>#{index + 1}</Text>
                </View>
                <View style={styles.scoreInfo}>
                  <Text style={styles.scoreWinner}>{entry.winnerName}</Text>
                  <Text style={styles.scoreMeta}>
                    {entry.mode} • {entry.pairCount} pairs • {entry.accuracy}% acc
                  </Text>
                </View>
                <Text style={styles.scoreNumber}>{entry.score.toLocaleString()}</Text>
              </View>
            ))
          )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceBorder,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  metricCard: {
    width: '48%',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  metricNumber: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    marginTop: 8,
  },
  metricLabel: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  sectionCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    borderRadius: 18,
    padding: 18,
    marginBottom: 18,
  },
  sectionHeader: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 14,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceBorder,
  },
  statLabel: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  diffRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceBorder,
  },
  diffLabel: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  diffScore: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    marginVertical: 14,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceBorder,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rankText: {
    color: Colors.primaryLight,
    fontSize: 12,
    fontWeight: '800',
  },
  scoreInfo: {
    flex: 1,
  },
  scoreWinner: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  scoreMeta: {
    color: Colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  scoreNumber: {
    color: Colors.gold,
    fontSize: 16,
    fontWeight: '900',
  },
});

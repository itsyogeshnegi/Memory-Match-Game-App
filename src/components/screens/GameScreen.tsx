// Main Game Screen: Coordinates GameEngine, BoardGrid, HUD, Overlays, and Events

import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, Text, SafeAreaView, Platform } from 'react-native';
import { GameConfig, GameResult } from '../../types/game';
import { GameEngine, GameEngineSnapshot } from '../../engine/GameEngine';
import { getTheme } from '../../theme/themes';
import { Colors } from '../../theme/colors';
import { GameHUD } from '../hud/GameHUD';
import { BoardGrid } from '../game/BoardGrid';
import { AIThinkingBanner } from '../hud/AIThinkingBanner';
import { PassDeviceOverlay } from '../game/PassDeviceOverlay';
import { PauseModal } from './PauseModal';
import { ParticleBurst } from '../common/ParticleBurst';
import { HapticsService } from '../../services/haptics';
import { StorageService } from '../../services/storage';
import { AchievementService } from '../../services/achievements';
import { ScoringSystem } from '../../engine/ScoringSystem';
import { AIController, AIThinkingState } from '../../ai/AIController';

interface GameScreenProps {
  config: GameConfig;
  onGameComplete: (result: GameResult, newAchievements: any[]) => void;
  onQuitToMenu: () => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({
  config,
  onGameComplete,
  onQuitToMenu,
}) => {
  const engineRef = useRef<GameEngine | null>(null);
  const [snapshot, setSnapshot] = useState<GameEngineSnapshot | null>(null);
  const [aiThinking, setAiThinking] = useState<AIThinkingState>({
    isThinking: false,
    step: 'IDLE',
    currentDelayMs: 0,
  });
  const [matchParticlesActive, setMatchParticlesActive] = useState<boolean>(false);
  const [hapticsEnabled, setHapticsEnabled] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Initialize engine
  useEffect(() => {
    const engine = new GameEngine(config);
    engineRef.current = engine;

    // Attach AI thinking listener if mode is AI
    if (config.mode === 'AI') {
      const aiCtrl = engine.getController('AI') as AIController | undefined;
      if (aiCtrl) {
        aiCtrl.setThinkingCallback((state) => {
          setAiThinking(state);
        });
      }
    }

    // Subscribe to engine state updates
    const unsubscribe = engine.subscribe((snap) => {
      setSnapshot(snap);

      // Trigger match celebratory particles & haptics
      if (snap.lastMoveWasMatch === true) {
        setMatchParticlesActive(true);
        HapticsService.matchSuccess();
        setTimeout(() => setMatchParticlesActive(false), 900);
      } else if (snap.lastMoveWasMatch === false) {
        HapticsService.mismatch();
      }

      // Handle Game Complete
      if (snap.state === 'RESULTS' && snap.result) {
        handleFinalResults(snap.result);
      }
    });

    // Start match
    engine.start();

    // Load haptics/audio settings
    StorageService.getSettings().then((s) => {
      setHapticsEnabled(s.hapticsEnabled);
      setSoundEnabled(s.soundEnabled);
      HapticsService.setEnabled(s.hapticsEnabled);
    });

    return () => {
      engine.dispose();
      engineRef.current = null;
    };
  }, []);

  const handleFinalResults = async (result: GameResult) => {
    // Record High Score
    const humanWinner = result.winnerId === 'PLAYER_1' || result.winnerId === 'PLAYER_2';
    const topScore = Math.max(
      result.players.PLAYER_1.score,
      result.players.PLAYER_2.score
    );

    const highScoreRes = await StorageService.recordHighScore({
      mode: result.mode,
      pairCount: result.pairCount,
      aiDifficulty: result.aiDifficulty,
      score: topScore,
      winnerName: result.winnerName,
      winnerId: result.winnerId,
      accuracy: ScoringSystem.calculateAccuracy(
        result.players.PLAYER_1.pairsMatched,
        result.players.PLAYER_1.moves
      ),
      moves: result.players.PLAYER_1.moves,
      date: result.date,
      durationSeconds: result.totalTimeSeconds,
    });

    result.isNewHighScore = highScoreRes.isNewHighScore;

    // Update Career Statistics
    const updatedStats = await StorageService.updateStatistics((prev) => {
      const p1 = result.players.PLAYER_1;
      const p2 = result.players.PLAYER_2;
      const ai = result.players.AI;

      const newPlayed = prev.totalGamesPlayed + 1;
      const newTime = prev.totalTimeSeconds + result.totalTimeSeconds;
      const p1Won = result.winnerId === 'PLAYER_1';
      const p2Won = result.winnerId === 'PLAYER_2';
      const aiWon = result.winnerId === 'AI';
      const tie = result.winnerId === 'TIE';

      const diff = result.aiDifficulty;

      return {
        ...prev,
        totalGamesPlayed: newPlayed,
        totalTimeSeconds: newTime,
        totalMatchesWonP1: prev.totalMatchesWonP1 + (p1Won ? 1 : 0),
        totalMatchesWonP2: prev.totalMatchesWonP2 + (p2Won ? 1 : 0),
        totalMatchesWonAI: prev.totalMatchesWonAI + (aiWon ? 1 : 0),
        totalTies: prev.totalTies + (tie ? 1 : 0),
        totalPairsMatchedOverall:
          prev.totalPairsMatchedOverall + p1.pairsMatched + p2.pairsMatched + ai.pairsMatched,
        highestSingleGameScore: Math.max(
          prev.highestSingleGameScore,
          p1.score,
          p2.score,
          ai.score
        ),
        highestComboOverall: Math.max(
          prev.highestComboOverall,
          p1.bestCombo,
          p2.bestCombo,
          ai.bestCombo
        ),
        totalMovesOverall: prev.totalMovesOverall + p1.moves + p2.moves + ai.moves,
        totalSuccessfulPairsOverall:
          prev.totalSuccessfulPairsOverall + p1.pairsMatched + p2.pairsMatched + ai.pairsMatched,
        aiWinsByDifficulty: {
          ...prev.aiWinsByDifficulty,
          ...(diff && aiWon ? { [diff]: prev.aiWinsByDifficulty[diff] + 1 } : {}),
        },
        playerWinsVsAIByDifficulty: {
          ...prev.playerWinsVsAIByDifficulty,
          ...(diff && p1Won ? { [diff]: prev.playerWinsVsAIByDifficulty[diff] + 1 } : {}),
        },
      };
    });

    // Evaluate Achievements
    const newAchievements = await AchievementService.evaluateGameResults(
      result,
      updatedStats
    );

    onGameComplete(result, newAchievements);
  };

  if (!snapshot) return null;

  const currentTheme = getTheme(config.themeId);
  const opponent = config.mode === 'AI' ? snapshot.players.AI : snapshot.players.PLAYER_2;

  const handleCardPress = (index: number) => {
    if (!engineRef.current) return;
    engineRef.current.flipCard(index);
  };

  const handlePause = () => {
    engineRef.current?.pause();
  };

  const handleResume = () => {
    engineRef.current?.resume();
  };

  const handleRestart = () => {
    engineRef.current?.restart();
  };

  const handleConfirmPassDevice = () => {
    engineRef.current?.confirmPassDevice();
  };

  const isHumanTurn =
    snapshot.state === 'PLAYER_TURN' && snapshot.activePlayerId !== 'AI';

  return (
    <SafeAreaView style={styles.container}>
      {/* MATCH PARTICLES */}
      <ParticleBurst active={matchParticlesActive} count={20} />

      {/* TOP HUD */}
      <GameHUD
        player1={snapshot.players.PLAYER_1}
        player2OrAI={opponent}
        activePlayerId={snapshot.activePlayerId}
        totalTimeSeconds={snapshot.totalTimeSeconds}
        onPausePress={handlePause}
      />

      {/* STATUS & AI THINKING BANNER */}
      <View style={styles.statusBar}>
        {snapshot.config.mode === 'AI' && aiThinking.isThinking ? (
          <AIThinkingBanner visible={true} step={aiThinking.step} />
        ) : (
          <View style={styles.turnIndicatorRow}>
            <View
              style={[
                styles.turnDot,
                {
                  backgroundColor:
                    snapshot.activePlayerId === 'PLAYER_1'
                      ? snapshot.players.PLAYER_1.color
                      : opponent.color,
                },
              ]}
            />
            <Text style={styles.turnText}>
              {snapshot.activePlayerId === 'PLAYER_1'
                ? `${snapshot.players.PLAYER_1.name}'s Turn`
                : `${opponent.name}'s Turn`}
            </Text>
          </View>
        )}
      </View>

      {/* BOARD CARDS GRID */}
      <BoardGrid
        cards={snapshot.board}
        columns={snapshot.gridColumns}
        rows={snapshot.gridRows}
        theme={currentTheme}
        onCardPress={handleCardPress}
        disabled={!isHumanTurn}
      />

      {/* PREVIEW BANNER OVERLAY */}
      {snapshot.state === 'PREVIEW' && (
        <View style={styles.previewNotice}>
          <Text style={styles.previewNoticeText}>MEMORIZE THE CARDS!</Text>
        </View>
      )}

      {/* COUNTDOWN OVERLAY */}
      {snapshot.state === 'COUNTDOWN' && (
        <View style={styles.countdownNotice}>
          <Text style={styles.countdownNoticeText}>GET READY!</Text>
        </View>
      )}

      {/* P2P PASS DEVICE OVERLAY */}
      <PassDeviceOverlay
        visible={snapshot.isPassDeviceRequired}
        targetPlayerName={snapshot.passDeviceTargetName}
        onConfirmReady={handleConfirmPassDevice}
      />

      {/* PAUSE MODAL */}
      <PauseModal
        visible={snapshot.state === 'PAUSED'}
        onResume={handleResume}
        onRestart={handleRestart}
        onQuitToMenu={onQuitToMenu}
        hapticsEnabled={hapticsEnabled}
        onToggleHaptics={(val) => {
          setHapticsEnabled(val);
          HapticsService.setEnabled(val);
          StorageService.saveSettings({ hapticsEnabled: val });
        }}
        soundEnabled={soundEnabled}
        onToggleSound={(val) => {
          setSoundEnabled(val);
          StorageService.saveSettings({ soundEnabled: val });
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: Platform.OS === 'android' ? 24 : 0,
  },
  statusBar: {
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  turnIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingVertical: 5,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  turnDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  turnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  previewNotice: {
    position: 'absolute',
    top: '45%',
    alignSelf: 'center',
    backgroundColor: 'rgba(236, 72, 153, 0.9)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  previewNoticeText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  countdownNotice: {
    position: 'absolute',
    top: '45%',
    alignSelf: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.9)',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  countdownNoticeText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 2,
  },
});

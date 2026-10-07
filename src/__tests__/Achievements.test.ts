// Unit tests for AchievementService

import { AchievementService, INITIAL_ACHIEVEMENTS } from '../services/achievements';
import { GameResult } from '../types/game';
import { GameStatistics } from '../types/storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(null),
  multiRemove: jest.fn().mockResolvedValue(null),
}));

describe('AchievementService', () => {
  const createMockResult = (overrides?: Partial<GameResult>): GameResult => ({
    winnerId: 'PLAYER_1',
    winnerName: 'Player 1',
    players: {
      PLAYER_1: {
        id: 'PLAYER_1',
        name: 'Player 1',
        isAI: false,
        score: 1600,
        pairsMatched: 6,
        moves: 7,
        currentCombo: 4,
        bestCombo: 4,
        avatar: 'person',
        color: '#38BDF8',
      },
      PLAYER_2: {
        id: 'PLAYER_2',
        name: 'Player 2',
        isAI: false,
        score: 0,
        pairsMatched: 0,
        moves: 0,
        currentCombo: 0,
        bestCombo: 0,
        avatar: 'person',
        color: '#F472B6',
      },
      AI: {
        id: 'AI',
        name: 'AI (EXPERT)',
        isAI: true,
        score: 800,
        pairsMatched: 2,
        moves: 4,
        currentCombo: 1,
        bestCombo: 1,
        avatar: 'chip',
        color: '#A78BFA',
      },
    },
    totalTurns: 11,
    totalTimeSeconds: 35,
    mode: 'AI',
    pairCount: 8,
    aiDifficulty: 'EXPERT',
    date: new Date().toISOString(),
    isNewHighScore: true,
    ...overrides,
  });

  const createMockStats = (): GameStatistics => ({
    totalGamesPlayed: 1,
    totalTimeSeconds: 35,
    totalMatchesWonP1: 1,
    totalMatchesWonP2: 0,
    totalMatchesWonAI: 0,
    totalTies: 0,
    totalPairsMatchedOverall: 6,
    highestSingleGameScore: 1600,
    highestComboOverall: 4,
    totalMovesOverall: 7,
    totalSuccessfulPairsOverall: 6,
    aiWinsByDifficulty: { EASY: 0, MEDIUM: 0, HARD: 0, EXPERT: 0 },
    playerWinsVsAIByDifficulty: { EASY: 0, MEDIUM: 0, HARD: 0, EXPERT: 1 },
  });

  test('unlocks first_win, expert_slayer, speed_demon, combo_fury for high performing match', async () => {
    const unlocked = await AchievementService.evaluateGameResults(
      createMockResult(),
      createMockStats()
    );

    const unlockedIds = unlocked.map((u) => u.id);
    expect(unlockedIds).toContain('first_win');
    expect(unlockedIds).toContain('expert_slayer');
    expect(unlockedIds).toContain('speed_demon');
    expect(unlockedIds).toContain('combo_fury');
    expect(unlockedIds).toContain('score_legend');
  });

  test('returns all initial achievements when storage is empty', async () => {
    const list = await AchievementService.getAllAchievements();
    expect(list.length).toBe(INITIAL_ACHIEVEMENTS.length);
  });
});

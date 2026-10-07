// Storage types for High Scores, Statistics, Achievements, and Settings

import { AIDifficulty, BoardPairCount, GameMode, PlayerId } from './game';

export interface HighScoreEntry {
  id: string;
  mode: GameMode;
  pairCount: BoardPairCount;
  aiDifficulty?: AIDifficulty;
  score: number;
  winnerName: string;
  winnerId: PlayerId | 'TIE';
  accuracy: number;
  moves: number;
  date: string;
  durationSeconds: number;
}

export interface GameStatistics {
  totalGamesPlayed: number;
  totalTimeSeconds: number;
  totalMatchesWonP1: number;
  totalMatchesWonP2: number;
  totalMatchesWonAI: number;
  totalTies: number;
  totalPairsMatchedOverall: number;
  highestSingleGameScore: number;
  highestComboOverall: number;
  totalMovesOverall: number;
  totalSuccessfulPairsOverall: number;
  aiWinsByDifficulty: Record<AIDifficulty, number>;
  playerWinsVsAIByDifficulty: Record<AIDifficulty, number>;
}

export interface AchievementItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string | null; // ISO string if unlocked, else null
  progress: number; // 0 to 1
  isSecret?: boolean;
}

export interface UserSettings {
  hapticsEnabled: boolean;
  soundEnabled: boolean;
  themeId: string;
  previewDurationSeconds: number;
  player1DefaultName: string;
  player2DefaultName: string;
}

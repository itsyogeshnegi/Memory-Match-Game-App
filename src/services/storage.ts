// Local Storage Service for Memory Match
// Manages high scores, statistics, achievements, and user settings with AsyncStorage.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameStatistics, HighScoreEntry, UserSettings, AchievementItem } from '../types/storage';
import { DEFAULT_THEME_ID } from '../theme/themes';

const STORAGE_KEYS = {
  HIGH_SCORES: '@memory_match_high_scores',
  STATISTICS: '@memory_match_statistics',
  SETTINGS: '@memory_match_settings',
  ACHIEVEMENTS: '@memory_match_achievements',
};

const DEFAULT_SETTINGS: UserSettings = {
  hapticsEnabled: true,
  soundEnabled: true,
  themeId: DEFAULT_THEME_ID,
  previewDurationSeconds: 1,
  player1DefaultName: 'Player 1',
  player2DefaultName: 'Player 2',
};

const DEFAULT_STATISTICS: GameStatistics = {
  totalGamesPlayed: 0,
  totalTimeSeconds: 0,
  totalMatchesWonP1: 0,
  totalMatchesWonP2: 0,
  totalMatchesWonAI: 0,
  totalTies: 0,
  totalPairsMatchedOverall: 0,
  highestSingleGameScore: 0,
  highestComboOverall: 0,
  totalMovesOverall: 0,
  totalSuccessfulPairsOverall: 0,
  aiWinsByDifficulty: {
    EASY: 0,
    MEDIUM: 0,
    HARD: 0,
    EXPERT: 0,
  },
  playerWinsVsAIByDifficulty: {
    EASY: 0,
    MEDIUM: 0,
    HARD: 0,
    EXPERT: 0,
  },
};

export class StorageService {
  /**
   * Retrieves user settings or default if not set.
   */
  public static async getSettings(): Promise<UserSettings> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!data) return DEFAULT_SETTINGS;
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  /**
   * Saves updated user settings.
   */
  public static async saveSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
    try {
      const current = await this.getSettings();
      const updated = { ...current, ...settings };
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
      return updated;
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  /**
   * Retrieves high scores list.
   */
  public static async getHighScores(): Promise<HighScoreEntry[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.HIGH_SCORES);
      if (!data) return [];
      const list: HighScoreEntry[] = JSON.parse(data);
      return list.sort((a, b) => b.score - a.score);
    } catch {
      return [];
    }
  }

  /**
   * Adds new score record and checks if it qualifies as top 20 high score.
   */
  public static async recordHighScore(
    entry: Omit<HighScoreEntry, 'id'>
  ): Promise<{ isNewHighScore: boolean; rank: number }> {
    try {
      const scores = await this.getHighScores();
      const newEntry: HighScoreEntry = {
        ...entry,
        id: `score-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      };

      scores.push(newEntry);
      scores.sort((a, b) => b.score - a.score);

      const rank = scores.findIndex((s) => s.id === newEntry.id) + 1;
      const isTopTen = rank <= 10;

      // Keep top 50 records
      const trimmed = scores.slice(0, 50);
      await AsyncStorage.setItem(STORAGE_KEYS.HIGH_SCORES, JSON.stringify(trimmed));

      return { isNewHighScore: isTopTen, rank };
    } catch {
      return { isNewHighScore: false, rank: 0 };
    }
  }

  /**
   * Retrieves career game statistics.
   */
  public static async getStatistics(): Promise<GameStatistics> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.STATISTICS);
      if (!data) return DEFAULT_STATISTICS;
      return { ...DEFAULT_STATISTICS, ...JSON.parse(data) };
    } catch {
      return DEFAULT_STATISTICS;
    }
  }

  /**
   * Updates career game statistics with results of a completed match.
   */
  public static async updateStatistics(
    updater: (prev: GameStatistics) => GameStatistics
  ): Promise<GameStatistics> {
    try {
      const current = await this.getStatistics();
      const updated = updater(current);
      await AsyncStorage.setItem(STORAGE_KEYS.STATISTICS, JSON.stringify(updated));
      return updated;
    } catch {
      return DEFAULT_STATISTICS;
    }
  }

  /**
   * Retrieves unlocked achievements.
   */
  public static async getAchievements(): Promise<AchievementItem[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
      if (!data) return [];
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  /**
   * Saves achievements.
   */
  public static async saveAchievements(items: AchievementItem[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(items));
    } catch {
      // silently handle storage error
    }
  }

  /**
   * Completely clears user game data (for testing / reset).
   */
  public static async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.HIGH_SCORES,
        STORAGE_KEYS.STATISTICS,
        STORAGE_KEYS.SETTINGS,
        STORAGE_KEYS.ACHIEVEMENTS,
      ]);
    } catch {
      // ignore
    }
  }
}

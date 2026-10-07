// Achievement definitions, progress evaluation, and unlocking system

import { AchievementItem, GameStatistics } from '../types/storage';
import { GameResult } from '../types/game';
import { StorageService } from './storage';
import { ScoringSystem } from '../engine/ScoringSystem';

export const INITIAL_ACHIEVEMENTS: AchievementItem[] = [
  {
    id: 'first_win',
    title: 'First Spark',
    description: 'Win your first game in either AI or P2P mode.',
    icon: 'trophy',
    unlockedAt: null,
    progress: 0,
  },
  {
    id: 'combo_sparks',
    title: 'Double Trouble',
    description: 'Pull off a 2x match combo in a single game.',
    icon: 'flame',
    unlockedAt: null,
    progress: 0,
  },
  {
    id: 'combo_fury',
    title: 'Combo Maestro',
    description: 'Reach an incredible 4x consecutive match combo.',
    icon: 'flash',
    unlockedAt: null,
    progress: 0,
  },
  {
    id: 'laser_focus',
    title: 'Laser Focus',
    description: 'Finish a match with 75% or higher accuracy.',
    icon: 'eye',
    unlockedAt: null,
    progress: 0,
  },
  {
    id: 'expert_slayer',
    title: 'AI Grandmaster Slayer',
    description: 'Outsmart and defeat the Expert difficulty AI.',
    icon: 'hardware-chip',
    unlockedAt: null,
    progress: 0,
  },
  {
    id: 'titan_board',
    title: 'Colossal Mind',
    description: 'Conquer the 12-pair (24 cards) grand board.',
    icon: 'grid',
    unlockedAt: null,
    progress: 0,
  },
  {
    id: 'speed_demon',
    title: 'Speed Demon',
    description: 'Finish an entire match in under 45 seconds.',
    icon: 'timer',
    unlockedAt: null,
    progress: 0,
  },
  {
    id: 'p2p_rivalry',
    title: 'Couch Champion',
    description: 'Complete a local P2P same-device multiplayer match.',
    icon: 'people',
    unlockedAt: null,
    progress: 0,
  },
  {
    id: 'score_legend',
    title: 'High Score Titan',
    description: 'Surpass 1,500 points in a single match.',
    icon: 'star',
    unlockedAt: null,
    progress: 0,
  },
];

export class AchievementService {
  /**
   * Initializes or fetches all achievements from storage.
   */
  public static async getAllAchievements(): Promise<AchievementItem[]> {
    const stored = await StorageService.getAchievements();
    if (!stored || stored.length === 0) {
      await StorageService.saveAchievements(INITIAL_ACHIEVEMENTS);
      return INITIAL_ACHIEVEMENTS;
    }

    // Merge any newly introduced achievements
    const storedMap = new Map(stored.map((a) => [a.id, a]));
    const merged = INITIAL_ACHIEVEMENTS.map((initial) => {
      const existing = storedMap.get(initial.id);
      return existing || initial;
    });

    return merged;
  }

  /**
   * Checks for any newly unlocked achievements based on completed game result and statistics.
   * Returns array of newly unlocked achievement items.
   */
  public static async evaluateGameResults(
    result: GameResult,
    stats: GameStatistics
  ): Promise<AchievementItem[]> {
    const list = await this.getAllAchievements();
    const newlyUnlocked: AchievementItem[] = [];
    const nowIso = new Date().toISOString();

    const humanWinner = result.winnerId === 'PLAYER_1' || result.winnerId === 'PLAYER_2';
    const p1 = result.players.PLAYER_1;
    const p1Accuracy = ScoringSystem.calculateAccuracy(p1.pairsMatched, p1.moves);
    const highestGameScore = Math.max(
      result.players.PLAYER_1.score,
      result.players.PLAYER_2.score,
      result.players.AI.score
    );

    for (const achievement of list) {
      if (achievement.unlockedAt) continue; // already unlocked

      let unlockConditionMet = false;

      switch (achievement.id) {
        case 'first_win':
          unlockConditionMet = humanWinner || stats.totalMatchesWonP1 > 0;
          break;

        case 'combo_sparks':
          unlockConditionMet = p1.bestCombo >= 2 || stats.highestComboOverall >= 2;
          break;

        case 'combo_fury':
          unlockConditionMet = p1.bestCombo >= 4 || stats.highestComboOverall >= 4;
          break;

        case 'laser_focus':
          unlockConditionMet = p1Accuracy >= 75 && p1.moves >= 3;
          break;

        case 'expert_slayer':
          unlockConditionMet =
            result.mode === 'AI' &&
            result.aiDifficulty === 'EXPERT' &&
            result.winnerId === 'PLAYER_1';
          break;

        case 'titan_board':
          unlockConditionMet = result.pairCount === 12;
          break;

        case 'speed_demon':
          unlockConditionMet = result.totalTimeSeconds > 0 && result.totalTimeSeconds <= 45;
          break;

        case 'p2p_rivalry':
          unlockConditionMet = result.mode === 'P2P';
          break;

        case 'score_legend':
          unlockConditionMet = highestGameScore >= 1500;
          break;
      }

      if (unlockConditionMet) {
        achievement.unlockedAt = nowIso;
        achievement.progress = 1.0;
        newlyUnlocked.push(achievement);
      }
    }

    if (newlyUnlocked.length > 0) {
      await StorageService.saveAchievements(list);
    }

    return newlyUnlocked;
  }
}

// Central Scoring System for Memory Match

import { AIDifficulty, BoardPairCount, GameMode } from '../types/game';

export interface ScoreCalculationParams {
  combo: number; // current combo streak (1 = first match, 2 = 2nd in a row, etc.)
  elapsedTurnMs: number; // time taken to make this match in milliseconds
  boardPairCount: BoardPairCount;
  mode: GameMode;
  aiDifficulty?: AIDifficulty;
}

export interface ScoreAward {
  basePoints: number;
  comboMultiplier: number;
  comboBonusPoints: number;
  speedBonusPoints: number;
  difficultyMultiplier: number;
  boardMultiplier: number;
  totalPointsAwarded: number;
}

export class ScoringSystem {
  public static readonly BASE_MATCH_POINTS = 100;
  public static readonly MAX_SPEED_BONUS_WINDOW_MS = 5000;
  public static readonly MAX_SPEED_BONUS_POINTS = 50;

  /**
   * Difficulty multipliers for AI mode.
   */
  public static getDifficultyMultiplier(difficulty?: AIDifficulty): number {
    switch (difficulty) {
      case 'EASY':
        return 1.0;
      case 'MEDIUM':
        return 1.25;
      case 'HARD':
        return 1.5;
      case 'EXPERT':
        return 2.0;
      default:
        return 1.0;
    }
  }

  /**
   * Board size multipliers to reward completing larger, more complex boards.
   */
  public static getBoardMultiplier(pairCount: BoardPairCount): number {
    switch (pairCount) {
      case 3:
        return 1.0;
      case 6:
        return 1.2;
      case 8:
        return 1.4;
      case 12:
        return 1.6;
      default:
        return 1.0;
    }
  }

  /**
   * Calculates combo multiplier based on streak count.
   * Combo 1 = 1.0x, Combo 2 = 1.5x, Combo 3 = 2.0x, Combo 4 = 2.5x...
   */
  public static getComboMultiplier(combo: number): number {
    if (combo <= 1) return 1.0;
    return 1.0 + (combo - 1) * 0.5;
  }

  /**
   * Calculates speed bonus based on reaction time.
   */
  public static getSpeedBonus(elapsedTurnMs: number): number {
    if (elapsedTurnMs <= 0) return this.MAX_SPEED_BONUS_POINTS;
    if (elapsedTurnMs >= this.MAX_SPEED_BONUS_WINDOW_MS) return 0;

    const remainingWindow = this.MAX_SPEED_BONUS_WINDOW_MS - elapsedTurnMs;
    const fraction = remainingWindow / this.MAX_SPEED_BONUS_WINDOW_MS;
    return Math.round(fraction * this.MAX_SPEED_BONUS_POINTS);
  }

  /**
   * Computes the complete score award for a successful match.
   */
  public static calculateMatchScore(params: ScoreCalculationParams): ScoreAward {
    const basePoints = this.BASE_MATCH_POINTS;
    const comboMultiplier = this.getComboMultiplier(params.combo);
    const speedBonusPoints = this.getSpeedBonus(params.elapsedTurnMs);
    const difficultyMultiplier =
      params.mode === 'AI' ? this.getDifficultyMultiplier(params.aiDifficulty) : 1.0;
    const boardMultiplier = this.getBoardMultiplier(params.boardPairCount);

    // Raw points before scale
    const rawMatchPoints = Math.round(basePoints * comboMultiplier) + speedBonusPoints;
    const comboBonusPoints = Math.round(basePoints * (comboMultiplier - 1.0));

    // Total scaled points
    const totalPointsAwarded = Math.round(
      rawMatchPoints * difficultyMultiplier * boardMultiplier
    );

    return {
      basePoints,
      comboMultiplier,
      comboBonusPoints,
      speedBonusPoints,
      difficultyMultiplier,
      boardMultiplier,
      totalPointsAwarded,
    };
  }

  /**
   * Calculates accuracy percentage.
   */
  public static calculateAccuracy(pairsMatched: number, totalMoves: number): number {
    if (totalMoves <= 0) return 0;
    const raw = (pairsMatched / totalMoves) * 100;
    return Math.min(100, Math.round(raw));
  }
}

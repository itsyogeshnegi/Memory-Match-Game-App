// Unit tests for ScoringSystem

import { ScoringSystem } from '../engine/ScoringSystem';

describe('ScoringSystem', () => {
  test('base match award with combo 1 and zero speed bonus', () => {
    const award = ScoringSystem.calculateMatchScore({
      combo: 1,
      elapsedTurnMs: 10000, // over 5s => 0 speed bonus
      boardPairCount: 3, // 1.0x board scale
      mode: 'P2P',
    });

    expect(award.basePoints).toBe(100);
    expect(award.comboMultiplier).toBe(1.0);
    expect(award.speedBonusPoints).toBe(0);
    expect(award.totalPointsAwarded).toBe(100);
  });

  test('combo scaling increases points consecutively', () => {
    const combo1 = ScoringSystem.calculateMatchScore({
      combo: 1,
      elapsedTurnMs: 5000,
      boardPairCount: 3,
      mode: 'P2P',
    });

    const combo2 = ScoringSystem.calculateMatchScore({
      combo: 2,
      elapsedTurnMs: 5000,
      boardPairCount: 3,
      mode: 'P2P',
    });

    const combo3 = ScoringSystem.calculateMatchScore({
      combo: 3,
      elapsedTurnMs: 5000,
      boardPairCount: 3,
      mode: 'P2P',
    });

    expect(combo1.comboMultiplier).toBe(1.0);
    expect(combo2.comboMultiplier).toBe(1.5);
    expect(combo3.comboMultiplier).toBe(2.0);

    expect(combo2.totalPointsAwarded).toBeGreaterThan(combo1.totalPointsAwarded);
    expect(combo3.totalPointsAwarded).toBeGreaterThan(combo2.totalPointsAwarded);
  });

  test('speed bonus awards up to 50 points for fast flips', () => {
    const instant = ScoringSystem.getSpeedBonus(0);
    const halfSpeed = ScoringSystem.getSpeedBonus(2500);
    const slow = ScoringSystem.getSpeedBonus(6000);

    expect(instant).toBe(50);
    expect(halfSpeed).toBe(25);
    expect(slow).toBe(0);
  });

  test('AI difficulty multipliers scale points appropriately', () => {
    const easy = ScoringSystem.calculateMatchScore({
      combo: 1,
      elapsedTurnMs: 5000,
      boardPairCount: 3,
      mode: 'AI',
      aiDifficulty: 'EASY',
    });

    const expert = ScoringSystem.calculateMatchScore({
      combo: 1,
      elapsedTurnMs: 5000,
      boardPairCount: 3,
      mode: 'AI',
      aiDifficulty: 'EXPERT',
    });

    expect(easy.difficultyMultiplier).toBe(1.0);
    expect(expert.difficultyMultiplier).toBe(2.0);
    expect(expert.totalPointsAwarded).toBe(easy.totalPointsAwarded * 2);
  });

  test('accuracy calculation percentage', () => {
    expect(ScoringSystem.calculateAccuracy(0, 0)).toBe(0);
    expect(ScoringSystem.calculateAccuracy(3, 3)).toBe(100);
    expect(ScoringSystem.calculateAccuracy(3, 6)).toBe(50);
    expect(ScoringSystem.calculateAccuracy(5, 7)).toBe(71);
  });
});

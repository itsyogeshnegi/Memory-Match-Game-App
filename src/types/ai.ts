// AI Memory and Decision Types

export { AIDifficulty } from './game';
import { AIDifficulty } from './game';

/**
 * Legitimate observation of a card by the AI.
 * Stored only when a card is revealed on the board during gameplay.
 */
export interface ObservedCard {
  cardId: string;
  pairKey: string;
  index: number;
  lastTurnObserved: number; // turn counter when this was observed
  confidence: number; // 0.0 to 1.0 (drops over time unless refreshed)
}

/**
 * Tuning parameters for each AI difficulty level.
 */
export interface AIDifficultyProfile {
  difficulty: AIDifficulty;
  /** Probability of remembering a card upon seeing it (0.0 to 1.0) */
  initialMemoryRetention: number;
  /** Rate at which memory fades per turn without re-observation (0.0 to 1.0) */
  memoryDecayPerTurn: number;
  /** Probability of making a mistake even when a pair is known in memory */
  mistakeProbability: number;
  /** Reaction delay range in milliseconds */
  minReactionDelayMs: number;
  maxReactionDelayMs: number;
  /** Description for UI */
  label: string;
  description: string;
  badgeColor: string;
}

export interface AIDecisionResult {
  cardIndex: number;
  reason: 'KNOWN_PAIR_START' | 'KNOWN_PAIR_MATCH' | 'EXPLORATION' | 'MISTAKE_EXPLORATION';
  delayMs: number;
}

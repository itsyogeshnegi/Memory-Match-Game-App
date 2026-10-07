// AI Memory Subsystem
// Tracks ONLY legitimately observed cards. NEVER inspects hidden board state.

import { AIDifficulty, AIDifficultyProfile, ObservedCard } from '../types/ai';

export const AI_DIFFICULTY_PROFILES: Record<AIDifficulty, AIDifficultyProfile> = {
  EASY: {
    difficulty: 'EASY',
    initialMemoryRetention: 0.45,
    memoryDecayPerTurn: 0.25,
    mistakeProbability: 0.35,
    minReactionDelayMs: 950,
    maxReactionDelayMs: 1350,
    label: 'Novice Bot',
    description: 'Casual player. Frequently forgets cards and makes whimsical guesses.',
    badgeColor: '#10B981',
  },
  MEDIUM: {
    difficulty: 'MEDIUM',
    initialMemoryRetention: 0.72,
    memoryDecayPerTurn: 0.12,
    mistakeProbability: 0.15,
    minReactionDelayMs: 750,
    maxReactionDelayMs: 1050,
    label: 'Tactical Bot',
    description: 'Attentive player. Remembers most recent cards with occasional lapses.',
    badgeColor: '#F59E0B',
  },
  HARD: {
    difficulty: 'HARD',
    initialMemoryRetention: 0.92,
    memoryDecayPerTurn: 0.04,
    mistakeProbability: 0.03,
    minReactionDelayMs: 600,
    maxReactionDelayMs: 850,
    label: 'Mastermind Bot',
    description: 'Sharp memory. Rarely forgets, actively capitalizes on opponent mistakes.',
    badgeColor: '#EF4444',
  },
  EXPERT: {
    difficulty: 'EXPERT',
    initialMemoryRetention: 1.0,
    memoryDecayPerTurn: 0.0,
    mistakeProbability: 0.0,
    minReactionDelayMs: 450,
    maxReactionDelayMs: 700,
    label: 'Grandmaster Bot',
    description: 'Flawless recall of all revealed cards. Perfectly fair, zero cheating.',
    badgeColor: '#A855F7',
  },
};

export class AIMemory {
  private readonly profile: AIDifficultyProfile;
  // Keyed by board card index
  private observedCards: Map<number, ObservedCard> = new Map();
  private randomFn: () => number;

  constructor(difficulty: AIDifficulty, randomFn: () => number = Math.random) {
    this.profile = AI_DIFFICULTY_PROFILES[difficulty];
    this.randomFn = randomFn;
  }

  /**
   * Records legitimate observation of a revealed card.
   * Based on difficulty, AI might fail to retain it or remember it with confidence.
   */
  public observeCard(
    card: { cardId: string; pairKey: string; index: number },
    currentTurn: number
  ): boolean {
    const roll = this.randomFn();
    const remembers = roll <= this.profile.initialMemoryRetention;

    if (!remembers) {
      // Memory slip: did not register in memory
      return false;
    }

    this.observedCards.set(card.index, {
      cardId: card.cardId,
      pairKey: card.pairKey,
      index: card.index,
      lastTurnObserved: currentTurn,
      confidence: 1.0,
    });

    return true;
  }

  /**
   * Simulates memory decay over passing turns.
   * Expert never decays (decay rate 0.0).
   */
  public advanceTurn(currentTurn: number): void {
    if (this.profile.memoryDecayPerTurn <= 0) return;

    for (const [index, obs] of Array.from(this.observedCards.entries())) {
      const turnsElapsed = currentTurn - obs.lastTurnObserved;
      if (turnsElapsed > 0) {
        obs.confidence -= this.profile.memoryDecayPerTurn * turnsElapsed;
        if (obs.confidence <= 0.15 || this.randomFn() < 0.2) {
          // Card forgotten from memory
          this.observedCards.delete(index);
        }
      }
    }
  }

  /**
   * Removes matched cards so AI no longer considers them.
   */
  public forgetIndices(indices: number[]): void {
    for (const idx of indices) {
      this.observedCards.delete(idx);
    }
  }

  /**
   * Returns pairs where BOTH twin cards are currently in AI memory.
   */
  public getKnownPairs(): Array<{ pairKey: string; indices: [number, number] }> {
    const grouped = new Map<string, number[]>();

    for (const obs of this.observedCards.values()) {
      const list = grouped.get(obs.pairKey) || [];
      list.push(obs.index);
      grouped.set(obs.pairKey, list);
    }

    const result: Array<{ pairKey: string; indices: [number, number] }> = [];
    for (const [pairKey, indices] of grouped.entries()) {
      if (indices.length >= 2) {
        result.push({ pairKey, indices: [indices[0], indices[1]] });
      }
    }

    return result;
  }

  /**
   * Given a pairKey, checks if AI remembers the matching twin card at another index.
   */
  public findKnownMatch(pairKey: string, excludeIndex: number): number | null {
    for (const obs of this.observedCards.values()) {
      if (obs.pairKey === pairKey && obs.index !== excludeIndex) {
        return obs.index;
      }
    }
    return null;
  }

  /**
   * Returns observation for a specific index, or null if unknown / forgotten.
   */
  public getObservation(index: number): ObservedCard | null {
    return this.observedCards.get(index) || null;
  }

  /**
   * Returns all indices currently retained in memory.
   */
  public getKnownIndices(): number[] {
    return Array.from(this.observedCards.keys());
  }

  /**
   * Total number of cards currently remembered.
   */
  public get memoryCount(): number {
    return this.observedCards.size;
  }

  public get difficultyProfile(): AIDifficultyProfile {
    return this.profile;
  }

  /**
   * Clears all memory (for rematch / reset).
   */
  public clear(): void {
    this.observedCards.clear();
  }
}

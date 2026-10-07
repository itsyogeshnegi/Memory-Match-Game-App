// AI Decision Engine
// Makes strategic, human-like choices using legitimate memory.
// NEVER inspects hidden board state.

import { CardState } from '../types/game';
import { AIDecisionResult } from '../types/ai';
import { AIMemory } from './AIMemory';

export interface BoardCardStatus {
  index: number;
  state: CardState;
}

export interface FirstFlippedInfo {
  index: number;
  pairKey: string;
}

export class AIDecisionEngine {
  private memory: AIMemory;
  private randomFn: () => number;

  constructor(memory: AIMemory, randomFn: () => number = Math.random) {
    this.memory = memory;
    this.randomFn = randomFn;
  }

  /**
   * Generates natural reaction delay within difficulty range.
   */
  public getReactionDelay(): number {
    const { minReactionDelayMs, maxReactionDelayMs } = this.memory.difficultyProfile;
    const spread = maxReactionDelayMs - minReactionDelayMs;
    return Math.floor(minReactionDelayMs + this.randomFn() * spread);
  }

  /**
   * Decides which card to flip.
   *
   * @param boardStatuses Public status of each card on board (HIDDEN, REVEALED, MATCHED)
   * @param firstFlipped If AI already flipped 1st card this turn, its index and revealed pairKey
   */
  public decideCardToFlip(
    boardStatuses: BoardCardStatus[],
    firstFlipped: FirstFlippedInfo | null
  ): AIDecisionResult {
    const profile = this.memory.difficultyProfile;
    const delayMs = this.getReactionDelay();

    // 1. Gather all currently eligible cards (HIDDEN cards only)
    // If firstFlipped is provided, that card is already REVEALED and cannot be picked again
    const availableHiddenIndices = boardStatuses
      .filter((c) => c.state === 'HIDDEN' && (firstFlipped === null || c.index !== firstFlipped.index))
      .map((c) => c.index);

    if (availableHiddenIndices.length === 0) {
      throw new Error('No available cards to flip on board');
    }

    // Check if AI makes a mistake this action based on difficulty
    const makesMistake = this.randomFn() < profile.mistakeProbability;

    // SCENARIO A: Selecting SECOND card of the turn
    if (firstFlipped !== null) {
      // Does AI remember where the twin matching card is?
      const knownTwinIndex = this.memory.findKnownMatch(firstFlipped.pairKey, firstFlipped.index);

      // Verify that the remembered twin is actually still hidden and available
      const isTwinValidAndAvailable =
        knownTwinIndex !== null && availableHiddenIndices.includes(knownTwinIndex);

      if (isTwinValidAndAvailable && !makesMistake) {
        // AI accurately recalls the twin card!
        return {
          cardIndex: knownTwinIndex,
          reason: 'KNOWN_PAIR_MATCH',
          delayMs,
        };
      }

      // If AI doesn't know the twin (or made a mistake):
      // Smart exploration: pick an unknown hidden card rather than one it remembers that doesn't match
      return this.selectExplorationCard(availableHiddenIndices, delayMs, makesMistake);
    }

    // SCENARIO B: Selecting FIRST card of the turn
    const knownPairs = this.memory.getKnownPairs();
    // Filter to known pairs where BOTH cards are still available hidden cards
    const availableKnownPairs = knownPairs.filter((p) =>
      p.indices.every((idx) => availableHiddenIndices.includes(idx))
    );

    if (availableKnownPairs.length > 0 && !makesMistake) {
      // AI knows at least one full pair! Pick the first card of that pair
      const chosenPair = availableKnownPairs[0];
      return {
        cardIndex: chosenPair.indices[0],
        reason: 'KNOWN_PAIR_START',
        delayMs,
      };
    }

    // If no full pair is known or mistake occurred, explore a card
    return this.selectExplorationCard(availableHiddenIndices, delayMs, makesMistake);
  }

  /**
   * Explores the board by choosing an available hidden card.
   * Prefers cards not yet recorded in memory to maximize discovery.
   */
  private selectExplorationCard(
    availableIndices: number[],
    delayMs: number,
    makesMistake: boolean
  ): AIDecisionResult {
    const knownIndices = new Set(this.memory.getKnownIndices());

    // Separate into cards AI has never seen vs cards AI remembers
    const unrememberedIndices = availableIndices.filter((idx) => !knownIndices.has(idx));

    // If there are unremembered cards, pick one of them to maximize exploration
    const candidatePool = unrememberedIndices.length > 0 ? unrememberedIndices : availableIndices;

    const randomIndex = candidatePool[Math.floor(this.randomFn() * candidatePool.length)];

    return {
      cardIndex: randomIndex,
      reason: makesMistake ? 'MISTAKE_EXPLORATION' : 'EXPLORATION',
      delayMs,
    };
  }
}

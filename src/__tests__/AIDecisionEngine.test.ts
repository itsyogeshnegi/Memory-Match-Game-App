// Unit tests for AIDecisionEngine

import { AIDecisionEngine, BoardCardStatus } from '../ai/AIDecisionEngine';
import { AIMemory } from '../ai/AIMemory';

describe('AIDecisionEngine', () => {
  const createMockBoardStatus = (count: number): BoardCardStatus[] => {
    return Array.from({ length: count }, (_, i) => ({
      index: i,
      state: 'HIDDEN',
    }));
  };

  test('when EXPERT knows a pair, it chooses the first card of that known pair', () => {
    const memory = new AIMemory('EXPERT');
    memory.observeCard({ cardId: 'c-1', pairKey: 'sparkles', index: 1 }, 1);
    memory.observeCard({ cardId: 'c-4', pairKey: 'sparkles', index: 4 }, 1);

    const boardStatus = createMockBoardStatus(6);
    const engine = new AIDecisionEngine(memory);

    const decision = engine.decideCardToFlip(boardStatus, null);
    expect(decision.reason).toBe('KNOWN_PAIR_START');
    expect(decision.cardIndex).toBe(1);
  });

  test('when EXPERT flips card 1 and remembers matching twin, it chooses that twin', () => {
    const memory = new AIMemory('EXPERT');
    memory.observeCard({ cardId: 'c-2', pairKey: 'diamond', index: 2 }, 1);
    memory.observeCard({ cardId: 'c-5', pairKey: 'diamond', index: 5 }, 1);

    const boardStatus = createMockBoardStatus(6);
    // Card 2 is now revealed
    boardStatus[2].state = 'REVEALED';

    const engine = new AIDecisionEngine(memory);
    const decision = engine.decideCardToFlip(boardStatus, { index: 2, pairKey: 'diamond' });

    expect(decision.reason).toBe('KNOWN_PAIR_MATCH');
    expect(decision.cardIndex).toBe(5);
  });

  test('when AI has empty memory, it picks an available hidden card to explore', () => {
    const memory = new AIMemory('EXPERT');
    const boardStatus = createMockBoardStatus(6);
    const engine = new AIDecisionEngine(memory);

    const decision = engine.decideCardToFlip(boardStatus, null);
    expect(decision.reason).toBe('EXPLORATION');
    expect(decision.cardIndex).toBeGreaterThanOrEqual(0);
    expect(decision.cardIndex).toBeLessThan(6);
  });

  test('AI never picks an already MATCHED card', () => {
    const memory = new AIMemory('EXPERT');
    const boardStatus = createMockBoardStatus(4);
    boardStatus[0].state = 'MATCHED';
    boardStatus[1].state = 'MATCHED';
    boardStatus[2].state = 'MATCHED';
    // Only index 3 is HIDDEN

    const engine = new AIDecisionEngine(memory);
    const decision = engine.decideCardToFlip(boardStatus, null);

    expect(decision.cardIndex).toBe(3);
  });

  test('reaction delay falls within difficulty profile ranges', () => {
    const memory = new AIMemory('EXPERT');
    const engine = new AIDecisionEngine(memory);
    const delay = engine.getReactionDelay();

    expect(delay).toBeGreaterThanOrEqual(450);
    expect(delay).toBeLessThanOrEqual(700);
  });
});

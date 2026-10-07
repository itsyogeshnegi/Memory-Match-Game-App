// Unit tests for AIMemory

import { AIMemory } from '../ai/AIMemory';

describe('AIMemory', () => {
  test('EXPERT memory retains observed card with 100% confidence and zero decay', () => {
    const memory = new AIMemory('EXPERT');

    // Observe card 0
    const observed = memory.observeCard(
      { cardId: 'c-0', pairKey: 'star', index: 0 },
      1
    );

    expect(observed).toBe(true);
    expect(memory.memoryCount).toBe(1);
    expect(memory.getObservation(0)?.pairKey).toBe('star');

    // Simulate 5 passing turns
    memory.advanceTurn(5);
    expect(memory.memoryCount).toBe(1);
    expect(memory.getObservation(0)).not.toBeNull();
  });

  test('correctly identifies known pairs when both twin cards are observed', () => {
    const memory = new AIMemory('EXPERT');

    memory.observeCard({ cardId: 'c-0', pairKey: 'planet', index: 0 }, 1);
    expect(memory.getKnownPairs().length).toBe(0);

    // Observe partner twin card at index 3
    memory.observeCard({ cardId: 'c-3', pairKey: 'planet', index: 3 }, 2);
    const knownPairs = memory.getKnownPairs();

    expect(knownPairs.length).toBe(1);
    expect(knownPairs[0].pairKey).toBe('planet');
    expect(knownPairs[0].indices).toEqual([0, 3]);
  });

  test('findKnownMatch finds partner card but excludes the current card itself', () => {
    const memory = new AIMemory('EXPERT');

    memory.observeCard({ cardId: 'c-2', pairKey: 'rocket', index: 2 }, 1);
    memory.observeCard({ cardId: 'c-5', pairKey: 'rocket', index: 5 }, 1);

    expect(memory.findKnownMatch('rocket', 2)).toBe(5);
    expect(memory.findKnownMatch('rocket', 5)).toBe(2);
    expect(memory.findKnownMatch('unknown_key', 2)).toBeNull();
  });

  test('removes matched cards when forgetIndices is invoked', () => {
    const memory = new AIMemory('EXPERT');

    memory.observeCard({ cardId: 'c-0', pairKey: 'moon', index: 0 }, 1);
    memory.observeCard({ cardId: 'c-1', pairKey: 'moon', index: 1 }, 1);
    expect(memory.memoryCount).toBe(2);

    memory.forgetIndices([0, 1]);
    expect(memory.memoryCount).toBe(0);
    expect(memory.getObservation(0)).toBeNull();
    expect(memory.getKnownPairs().length).toBe(0);
  });

  test('EASY memory drops retention based on random roll', () => {
    // Inject deterministic random function returning 0.9 (above easy 0.45 threshold)
    const failingMemory = new AIMemory('EASY', () => 0.9);
    const observed = failingMemory.observeCard(
      { cardId: 'c-0', pairKey: 'sun', index: 0 },
      1
    );

    expect(observed).toBe(false);
    expect(failingMemory.memoryCount).toBe(0);
  });
});

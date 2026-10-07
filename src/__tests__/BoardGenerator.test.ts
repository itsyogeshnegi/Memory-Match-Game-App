// Unit tests for BoardGenerator

import { generateBoard, validateBoardIntegrity, getGridLayout, shuffleArray } from '../engine/BoardGenerator';
import { BoardPairCount } from '../types/game';

describe('BoardGenerator', () => {
  const pairCounts: BoardPairCount[] = [3, 6, 8, 12];

  test.each(pairCounts)('generates valid board for %i pairs with zero integrity errors', (pairCount) => {
    const layout = generateBoard(pairCount, 'cosmic');
    expect(layout.cards.length).toBe(pairCount * 2);
    expect(layout.pairCount).toBe(pairCount);
    expect(validateBoardIntegrity(layout.cards, pairCount)).toBe(true);
  });

  test('every card has exactly one matching twin with the same pairKey', () => {
    const layout = generateBoard(8, 'cyber');
    const pairKeyCounts = new Map<string, number>();

    for (const card of layout.cards) {
      pairKeyCounts.set(card.pairKey, (pairKeyCounts.get(card.pairKey) || 0) + 1);
    }

    expect(pairKeyCounts.size).toBe(8);
    for (const count of pairKeyCounts.values()) {
      expect(count).toBe(2);
    }
  });

  test('every card has a unique card ID', () => {
    const layout = generateBoard(12, 'arcane');
    const ids = new Set(layout.cards.map((c) => c.id));
    expect(ids.size).toBe(24);
  });

  test('all cards start in HIDDEN state', () => {
    const layout = generateBoard(6, 'prism');
    for (const card of layout.cards) {
      expect(card.state).toBe('HIDDEN');
    }
  });

  test('grid layout returns appropriate dimensions', () => {
    expect(getGridLayout(3)).toEqual({ columns: 3, rows: 2 });
    expect(getGridLayout(6)).toEqual({ columns: 3, rows: 4 });
    expect(getGridLayout(8)).toEqual({ columns: 4, rows: 4 });
    expect(getGridLayout(12)).toEqual({ columns: 4, rows: 6 });
  });

  test('shuffled arrays do not maintain identical order across multiple runs', () => {
    const seed = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const shuffle1 = shuffleArray(seed);
    const shuffle2 = shuffleArray(seed);
    // At least one shuffle should differ from original with high probability
    expect(shuffle1.join(',') !== seed.join(',') || shuffle2.join(',') !== seed.join(',')).toBe(true);
  });
});

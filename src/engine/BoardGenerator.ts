// Board Generator for Memory Match

import { BoardPairCount, CardModel } from '../types/game';
import { getTheme } from '../theme/themes';

export interface BoardLayout {
  cards: CardModel[];
  columns: number;
  rows: number;
  pairCount: BoardPairCount;
}

/**
 * Fisher-Yates shuffle algorithm guaranteeing unbiased randomization.
 */
export function shuffleArray<T>(array: T[], randomFn: () => number = Math.random): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(randomFn() * (i + 1));
    const temp = result[i];
    result[i] = result[j];
    result[j] = temp;
  }
  return result;
}

/**
 * Generates an optimal responsive grid layout based on pair count.
 */
export function getGridLayout(pairCount: BoardPairCount): { columns: number; rows: number } {
  switch (pairCount) {
    case 3:
      return { columns: 3, rows: 2 }; // 6 cards
    case 6:
      return { columns: 3, rows: 4 }; // 12 cards
    case 8:
      return { columns: 4, rows: 4 }; // 16 cards
    case 12:
      return { columns: 4, rows: 6 }; // 24 cards
    default:
      return { columns: 4, rows: 4 };
  }
}

/**
 * Generates a validated board with guaranteed pairs, no duplicates, and randomized order.
 */
export function generateBoard(
  pairCount: BoardPairCount,
  themeId: string = 'cosmic',
  randomFn: () => number = Math.random
): BoardLayout {
  const theme = getTheme(themeId);
  const totalCards = pairCount * 2;

  if (theme.items.length < pairCount) {
    throw new Error(
      `Theme "${theme.name}" only has ${theme.items.length} items, but ${pairCount} pairs requested.`
    );
  }

  // Pick unique items from the theme for this game
  const shuffledThemeItems = shuffleArray(theme.items, randomFn);
  const selectedItems = shuffledThemeItems.slice(0, pairCount);

  // Create two matching cards for each chosen item
  const unassignedCards: Array<Omit<CardModel, 'id' | 'index' | 'state'>> = [];

  for (const item of selectedItems) {
    // Partner 1
    unassignedCards.push({
      pairKey: item.key,
      symbol: item.symbol,
      title: item.title,
      color: item.color,
    });
    // Partner 2
    unassignedCards.push({
      pairKey: item.key,
      symbol: item.symbol,
      title: item.title,
      color: item.color,
    });
  }

  // Shuffle the positions of all cards
  const shuffledCards = shuffleArray(unassignedCards, randomFn);

  // Assign unique IDs, exact indices, and initial HIDDEN state
  const cards: CardModel[] = shuffledCards.map((card, index) => ({
    ...card,
    id: `card-${index}-${card.pairKey}-${Math.floor(randomFn() * 100000)}`,
    index,
    state: 'HIDDEN',
  }));

  const { columns, rows } = getGridLayout(pairCount);

  return {
    cards,
    columns,
    rows,
    pairCount,
  };
}

/**
 * Validates integrity of a generated board.
 * Returns true if valid, or throws an error with detailed explanation.
 */
export function validateBoardIntegrity(cards: CardModel[], pairCount: BoardPairCount): boolean {
  if (cards.length !== pairCount * 2) {
    throw new Error(`Invalid card count: expected ${pairCount * 2}, got ${cards.length}`);
  }

  const idSet = new Set<string>();
  const pairCounts = new Map<string, number>();

  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];

    if (card.index !== i) {
      throw new Error(`Card index mismatch at position ${i}: card has index ${card.index}`);
    }

    if (idSet.has(card.id)) {
      throw new Error(`Duplicate card ID detected: ${card.id}`);
    }
    idSet.add(card.id);

    pairCounts.set(card.pairKey, (pairCounts.get(card.pairKey) || 0) + 1);
  }

  if (pairCounts.size !== pairCount) {
    throw new Error(`Expected ${pairCount} unique pairs, but found ${pairCounts.size}`);
  }

  for (const [key, count] of pairCounts.entries()) {
    if (count !== 2) {
      throw new Error(`Pair key "${key}" has ${count} occurrences instead of exactly 2`);
    }
  }

  return true;
}

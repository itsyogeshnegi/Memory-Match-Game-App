// Game Types and Interfaces for Memory Match

export type GameMode = 'AI' | 'P2P';

export type AIDifficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';

export type BoardPairCount = 3 | 6 | 8 | 12;

export type CardState = 'HIDDEN' | 'REVEALED' | 'MATCHED' | 'FLIPPING';

export type EngineState =
  | 'MENU'
  | 'SETUP'
  | 'PREVIEW'
  | 'COUNTDOWN'
  | 'PLAYER_TURN'
  | 'AI_TURN'
  | 'CHECKING_MATCH'
  | 'TURN_TRANSITION'
  | 'PAUSED'
  | 'GAME_COMPLETE'
  | 'RESULTS';

export interface CardModel {
  id: string; // unique card id (e.g. 'card-0', 'card-1')
  pairKey: string; // identifier matching partner card (e.g. 'cosmic-star')
  index: number; // position on board: 0 to (totalCards - 1)
  symbol: string; // icon or glyph representation
  title: string; // descriptive name
  color: string; // accent color for card icon
  state: CardState;
}

export type PlayerId = 'PLAYER_1' | 'PLAYER_2' | 'AI';

export interface PlayerProfile {
  id: PlayerId;
  name: string;
  isAI: boolean;
  score: number;
  pairsMatched: number;
  moves: number; // total turn attempts (two card flips)
  currentCombo: number;
  bestCombo: number;
  avatar: string;
  color: string;
}

export interface GameConfig {
  mode: GameMode;
  pairCount: BoardPairCount;
  aiDifficulty?: AIDifficulty;
  player1Name: string;
  player2Name?: string;
  previewDurationSeconds: number; // 0, 1, 2, 3 seconds preview before game starts
  themeId: string;
}

export interface MoveRecord {
  turnNumber: number;
  playerId: PlayerId;
  firstCardId: string;
  secondCardId: string;
  isMatch: boolean;
  scoreAwarded: number;
  combo: number;
  timestamp: number;
}

export interface GameResult {
  winnerId: PlayerId | 'TIE';
  winnerName: string;
  players: Record<PlayerId, PlayerProfile>;
  totalTurns: number;
  totalTimeSeconds: number;
  mode: GameMode;
  pairCount: BoardPairCount;
  aiDifficulty?: AIDifficulty;
  date: string;
  isNewHighScore: boolean;
}

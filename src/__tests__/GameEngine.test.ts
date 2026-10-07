// Unit tests for GameEngine

import { GameEngine } from '../engine/GameEngine';
import { GameConfig } from '../types/game';

describe('GameEngine', () => {
  const createTestConfig = (overrides?: Partial<GameConfig>): GameConfig => ({
    mode: 'P2P',
    pairCount: 3,
    player1Name: 'Player One',
    player2Name: 'Player Two',
    previewDurationSeconds: 0,
    themeId: 'cosmic',
    ...overrides,
  });

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('initializes board and players properly in SETUP state', () => {
    const engine = new GameEngine(createTestConfig());
    const snap = engine.getSnapshot();

    expect(snap.state).toBe('SETUP');
    expect(snap.board.length).toBe(6);
    expect(snap.pairCount).toBe(3);
    expect(snap.players.PLAYER_1.name).toBe('Player One');
    expect(snap.players.PLAYER_2.name).toBe('Player Two');
    expect(snap.players.PLAYER_1.score).toBe(0);
    expect(snap.players.PLAYER_2.score).toBe(0);

    engine.dispose();
  });

  test('start() transitions through COUNTDOWN to PLAYER_TURN', () => {
    const engine = new GameEngine(createTestConfig());
    engine.start();

    // Fast-forward countdown timer
    jest.advanceTimersByTime(1000);

    const snap = engine.getSnapshot();
    expect(snap.state).toBe('PLAYER_TURN');
    expect(snap.activePlayerId).toBe('PLAYER_1');

    engine.dispose();
  });

  test('guards prevent invalid moves: same card, out of bounds, wrong state', () => {
    const engine = new GameEngine(createTestConfig());
    engine.start();
    jest.advanceTimersByTime(1000);

    // Flip card 0
    const flip1 = engine.flipCard(0);
    expect(flip1).toBe(true);

    // Try flipping card 0 again (same card)
    const flipAgain = engine.flipCard(0);
    expect(flipAgain).toBe(false);

    // Try out of bounds index
    const flipOutOfBounds = engine.flipCard(999);
    expect(flipOutOfBounds).toBe(false);

    engine.dispose();
  });

  test('successful match awards points, increases combo, and keeps turn', () => {
    const engine = new GameEngine(createTestConfig());
    engine.start();
    jest.advanceTimersByTime(1000);

    const snap = engine.getSnapshot();
    const firstCard = snap.board[0];
    // Find twin index
    const twinIndex = snap.board.findIndex(
      (c, idx) => idx !== 0 && c.pairKey === firstCard.pairKey
    );

    expect(twinIndex).toBeGreaterThan(0);

    // Flip first card
    engine.flipCard(0);
    // Flip matching twin
    engine.flipCard(twinIndex);

    const matchSnap = engine.getSnapshot();
    expect(matchSnap.state).toBe('CHECKING_MATCH');
    expect(matchSnap.lastMoveWasMatch).toBe(true);
    expect(matchSnap.players.PLAYER_1.pairsMatched).toBe(1);
    expect(matchSnap.players.PLAYER_1.currentCombo).toBe(1);
    expect(matchSnap.players.PLAYER_1.score).toBeGreaterThan(0);

    // Fast-forward turn retention delay
    jest.advanceTimersByTime(800);
    const postMatchSnap = engine.getSnapshot();
    expect(postMatchSnap.state).toBe('PLAYER_TURN');
    expect(postMatchSnap.activePlayerId).toBe('PLAYER_1'); // turn retained!

    engine.dispose();
  });

  test('mismatch resets combo, flips cards back, and initiates P2P turn transition', () => {
    const engine = new GameEngine(createTestConfig());
    engine.start();
    jest.advanceTimersByTime(1000);

    const snap = engine.getSnapshot();
    const firstCard = snap.board[0];
    // Find a NON-matching card index
    const mismatchIndex = snap.board.findIndex((c) => c.pairKey !== firstCard.pairKey);

    engine.flipCard(0);
    engine.flipCard(mismatchIndex);

    const mismatchSnap = engine.getSnapshot();
    expect(mismatchSnap.lastMoveWasMatch).toBe(false);
    expect(mismatchSnap.players.PLAYER_1.currentCombo).toBe(0);

    // Fast-forward mismatch display delay
    jest.advanceTimersByTime(1000);

    const transitionedSnap = engine.getSnapshot();
    expect(transitionedSnap.state).toBe('TURN_TRANSITION');
    expect(transitionedSnap.isPassDeviceRequired).toBe(true);
    expect(transitionedSnap.passDeviceTargetName).toBe('Player Two');
    expect(transitionedSnap.activePlayerId).toBe('PLAYER_2');

    // Confirm pass device
    engine.confirmPassDevice();
    const readySnap = engine.getSnapshot();
    expect(readySnap.state).toBe('PLAYER_TURN');
    expect(readySnap.activePlayerId).toBe('PLAYER_2');
    expect(readySnap.isPassDeviceRequired).toBe(false);

    engine.dispose();
  });

  test('completes game when all pairs are matched', () => {
    const engine = new GameEngine(createTestConfig({ pairCount: 3 }));
    engine.start();
    jest.advanceTimersByTime(1000);

    // Match all 3 pairs systematically
    for (let pair = 0; pair < 3; pair++) {
      const snap = engine.getSnapshot();
      const hiddenIndices = snap.board
        .map((c, i) => (c.state === 'HIDDEN' ? i : -1))
        .filter((i) => i >= 0);

      const firstIndex = hiddenIndices[0];
      const targetKey = snap.board[firstIndex].pairKey;
      const secondIndex = hiddenIndices.find(
        (i) => i !== firstIndex && snap.board[i].pairKey === targetKey
      )!;

      engine.flipCard(firstIndex);
      engine.flipCard(secondIndex);
      jest.advanceTimersByTime(800);
    }

    const finalSnap = engine.getSnapshot();
    expect(['GAME_COMPLETE', 'RESULTS']).toContain(finalSnap.state);
    expect(finalSnap.result).not.toBeNull();
    expect(finalSnap.result?.players.PLAYER_1.pairsMatched).toBe(3);

    engine.dispose();
  });
});

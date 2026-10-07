// Central GameEngine for Memory Match
// Manages board, matching logic, turn transitions, scoring, and controllers.

import {
  BoardPairCount,
  CardModel,
  EngineState,
  GameConfig,
  GameResult,
  MoveRecord,
  PlayerId,
  PlayerProfile,
} from '../types/game';
import { generateBoard, validateBoardIntegrity } from './BoardGenerator';
import { ScoringSystem, ScoreAward } from './ScoringSystem';
import { PlayerController } from '../controllers/types';
import { HumanController } from '../controllers/HumanController';
import { AIController } from '../ai/AIController';

export interface GameEngineSnapshot {
  state: EngineState;
  board: CardModel[];
  pairCount: BoardPairCount;
  gridColumns: number;
  gridRows: number;
  players: Record<PlayerId, PlayerProfile>;
  activePlayerId: PlayerId;
  flippedCardIndices: number[];
  lastScoreAward: ScoreAward | null;
  lastMoveWasMatch: boolean | null;
  turnNumber: number;
  totalTimeSeconds: number;
  config: GameConfig;
  result: GameResult | null;
  isPassDeviceRequired: boolean;
  passDeviceTargetName: string;
}

export type SnapshotListener = (snapshot: GameEngineSnapshot) => void;

export class GameEngine {
  private config: GameConfig;
  private state: EngineState = 'SETUP';
  private stateBeforePause: EngineState = 'SETUP';
  private board: CardModel[] = [];
  private gridColumns: number = 3;
  private gridRows: number = 2;
  private players: Record<PlayerId, PlayerProfile>;
  private activePlayerId: PlayerId = 'PLAYER_1';
  private controllers: Map<PlayerId, PlayerController> = new Map();
  private flippedCardIndices: number[] = [];
  private lastScoreAward: ScoreAward | null = null;
  private lastMoveWasMatch: boolean | null = null;
  private turnNumber: number = 1;
  private turnStartTimeMs: number = Date.now();
  private gameStartTimeMs: number = 0;
  private totalElapsedSeconds: number = 0;
  private elapsedTimerId: any = null;
  private previewTimerId: any = null;
  private mismatchTimerId: any = null;
  private listeners: Set<SnapshotListener> = new Set();
  private result: GameResult | null = null;
  private isPassDeviceRequired: boolean = false;
  private passDeviceTargetName: string = '';
  private isDisposed: boolean = false;

  constructor(config: GameConfig) {
    this.config = config;

    // Initialize players
    this.players = {
      PLAYER_1: {
        id: 'PLAYER_1',
        name: config.player1Name || 'Player 1',
        isAI: false,
        score: 0,
        pairsMatched: 0,
        moves: 0,
        currentCombo: 0,
        bestCombo: 0,
        avatar: 'person',
        color: '#38BDF8',
      },
      PLAYER_2: {
        id: 'PLAYER_2',
        name: config.player2Name || 'Player 2',
        isAI: false,
        score: 0,
        pairsMatched: 0,
        moves: 0,
        currentCombo: 0,
        bestCombo: 0,
        avatar: 'person-add',
        color: '#F472B6',
      },
      AI: {
        id: 'AI',
        name: `AI (${config.aiDifficulty || 'MEDIUM'})`,
        isAI: true,
        score: 0,
        pairsMatched: 0,
        moves: 0,
        currentCombo: 0,
        bestCombo: 0,
        avatar: 'hardware-chip',
        color: '#A78BFA',
      },
    };

    this.initializeControllers();
    this.setupBoard();
  }

  private initializeControllers(): void {
    // Dispose previous
    this.controllers.forEach((c) => c.dispose());
    this.controllers.clear();

    const p1 = new HumanController('PLAYER_1');
    this.controllers.set('PLAYER_1', p1);

    if (this.config.mode === 'AI') {
      const difficulty = this.config.aiDifficulty || 'MEDIUM';
      const ai = new AIController(difficulty);
      this.controllers.set('AI', ai);
    } else {
      const p2 = new HumanController('PLAYER_2');
      this.controllers.set('PLAYER_2', p2);
    }
  }

  private setupBoard(): void {
    const layout = generateBoard(this.config.pairCount, this.config.themeId);
    validateBoardIntegrity(layout.cards, this.config.pairCount);

    this.board = layout.cards;
    this.gridColumns = layout.columns;
    this.gridRows = layout.rows;
  }

  /**
   * Starts the game session.
   */
  public start(): void {
    this.gameStartTimeMs = Date.now();
    this.startElapsedTimer();

    if (this.config.previewDurationSeconds > 0) {
      // PREVIEW STATE: reveal all cards temporarily
      this.state = 'PREVIEW';
      this.board = this.board.map((c) => ({ ...c, state: 'REVEALED' }));
      this.notifyListeners();

      this.previewTimerId = setTimeout(() => {
        if (this.isDisposed) return;
        this.board = this.board.map((c) => ({ ...c, state: 'HIDDEN' }));
        this.beginCountdown();
      }, this.config.previewDurationSeconds * 1000);
    } else {
      this.beginCountdown();
    }
  }

  private beginCountdown(): void {
    this.state = 'COUNTDOWN';
    this.notifyListeners();

    // 1-second countdown transition into starting player turn
    setTimeout(() => {
      if (this.isDisposed) return;
      this.activePlayerId = 'PLAYER_1';
      this.transitionToPlayerTurn('PLAYER_1');
    }, 800);
  }

  private transitionToPlayerTurn(playerId: PlayerId): void {
    this.activePlayerId = playerId;
    this.flippedCardIndices = [];
    this.turnStartTimeMs = Date.now();

    const controller = this.controllers.get(playerId);

    if (playerId === 'AI') {
      this.state = 'AI_TURN';
      this.notifyListeners();
      if (controller) {
        controller.onTurnStart(this);
        const aiCtrl = controller as AIController;
        aiCtrl.requestFirstCardSelection(
          this.board.map((c) => ({ index: c.index, state: c.state }))
        );
      }
    } else {
      this.state = 'PLAYER_TURN';
      this.notifyListeners();
      if (controller) {
        controller.onTurnStart(this);
      }
    }
  }

  /**
   * Attempts to flip card at given index.
   * Returns true if accepted, false if rejected due to state or guards.
   */
  public flipCard(cardIndex: number): boolean {
    // State Guard: Must be active turn
    if (this.state !== 'PLAYER_TURN' && this.state !== 'AI_TURN') {
      return false;
    }

    // Index Guard
    if (cardIndex < 0 || cardIndex >= this.board.length) {
      return false;
    }

    const card = this.board[cardIndex];

    // Card State Guard: Must be HIDDEN
    if (card.state !== 'HIDDEN') {
      return false;
    }

    // Duplicate Guard
    if (this.flippedCardIndices.includes(cardIndex)) {
      return false;
    }

    // Third-card Guard
    if (this.flippedCardIndices.length >= 2) {
      return false;
    }

    // Accept flip: update card to REVEALED
    card.state = 'REVEALED';
    this.flippedCardIndices.push(cardIndex);

    // AI legitimate observation:
    // If AI is in the game, it observes this card now that it is visible
    if (this.config.mode === 'AI') {
      const aiController = this.controllers.get('AI') as AIController | undefined;
      if (aiController) {
        aiController.getMemory().observeCard(
          { cardId: card.id, pairKey: card.pairKey, index: card.index },
          this.turnNumber
        );
      }
    }

    this.notifyListeners();

    // Check if this was card 1 or card 2
    if (this.flippedCardIndices.length === 1) {
      // First card flipped
      if (this.activePlayerId === 'AI') {
        const aiCtrl = this.controllers.get('AI') as AIController;
        aiCtrl.requestSecondCardSelection(
          this.board.map((c) => ({ index: c.index, state: c.state })),
          { index: card.index, pairKey: card.pairKey }
        );
      }
      return true;
    }

    // Second card flipped: Evaluate Match!
    this.handleSecondCardFlipped();
    return true;
  }

  private handleSecondCardFlipped(): void {
    this.state = 'CHECKING_MATCH';
    const [firstIndex, secondIndex] = this.flippedCardIndices;
    const card1 = this.board[firstIndex];
    const card2 = this.board[secondIndex];
    const activePlayer = this.players[this.activePlayerId];

    // Increment player move counter
    activePlayer.moves += 1;
    const elapsedTurnMs = Date.now() - this.turnStartTimeMs;

    const isMatch = card1.pairKey === card2.pairKey;
    this.lastMoveWasMatch = isMatch;

    if (isMatch) {
      // MATCH FOUND
      card1.state = 'MATCHED';
      card2.state = 'MATCHED';
      activePlayer.pairsMatched += 1;
      activePlayer.currentCombo += 1;
      if (activePlayer.currentCombo > activePlayer.bestCombo) {
        activePlayer.bestCombo = activePlayer.currentCombo;
      }

      // Calculate score
      const scoreAward = ScoringSystem.calculateMatchScore({
        combo: activePlayer.currentCombo,
        elapsedTurnMs,
        boardPairCount: this.config.pairCount,
        mode: this.config.mode,
        aiDifficulty: this.config.aiDifficulty,
      });

      activePlayer.score += scoreAward.totalPointsAwarded;
      this.lastScoreAward = scoreAward;

      // Forget matched cards from AI memory
      if (this.config.mode === 'AI') {
        const aiCtrl = this.controllers.get('AI') as AIController | undefined;
        if (aiCtrl) {
          aiCtrl.getMemory().forgetIndices([firstIndex, secondIndex]);
        }
      }

      this.notifyListeners();

      // Check if all pairs are matched
      const totalMatched = Object.values(this.players).reduce(
        (sum, p) => sum + p.pairsMatched,
        0
      );

      if (totalMatched >= this.config.pairCount) {
        // GAME COMPLETE
        this.completeGame();
        return;
      }

      // Player keeps turn on match!
      setTimeout(() => {
        if (this.isDisposed || this.state === 'PAUSED') return;
        this.flippedCardIndices = [];
        this.turnStartTimeMs = Date.now();
        this.transitionToPlayerTurn(this.activePlayerId);
      }, 700);
    } else {
      // MISMATCH
      activePlayer.currentCombo = 0;
      this.lastScoreAward = null;
      this.notifyListeners();

      // Cards remain visible briefly for observation, then flip back
      this.mismatchTimerId = setTimeout(() => {
        if (this.isDisposed || this.state === 'PAUSED') return;
        card1.state = 'HIDDEN';
        card2.state = 'HIDDEN';
        this.flippedCardIndices = [];

        // Memory decay advance
        if (this.config.mode === 'AI') {
          const aiCtrl = this.controllers.get('AI') as AIController | undefined;
          if (aiCtrl) {
            aiCtrl.getMemory().advanceTurn(this.turnNumber);
          }
        }

        this.turnNumber += 1;
        this.switchTurn();
      }, 950);
    }
  }

  private switchTurn(): void {
    const previousController = this.controllers.get(this.activePlayerId);
    if (previousController) {
      previousController.onTurnEnd();
    }

    if (this.config.mode === 'AI') {
      const nextPlayerId: PlayerId = this.activePlayerId === 'PLAYER_1' ? 'AI' : 'PLAYER_1';
      this.transitionToPlayerTurn(nextPlayerId);
    } else {
      // P2P SAME DEVICE: Pass the device curtain!
      const nextPlayerId: PlayerId =
        this.activePlayerId === 'PLAYER_1' ? 'PLAYER_2' : 'PLAYER_1';
      this.activePlayerId = nextPlayerId;
      this.isPassDeviceRequired = true;
      this.passDeviceTargetName = this.players[nextPlayerId].name;
      this.state = 'TURN_TRANSITION';
      this.notifyListeners();
    }
  }

  /**
   * Called by Pass Device screen when incoming player confirms "I am ready".
   */
  public confirmPassDevice(): void {
    if (this.state !== 'TURN_TRANSITION') return;
    this.isPassDeviceRequired = false;
    this.transitionToPlayerTurn(this.activePlayerId);
  }

  private completeGame(): void {
    this.stopElapsedTimer();
    this.state = 'GAME_COMPLETE';

    let winnerId: PlayerId | 'TIE' = 'TIE';
    let winnerName = "It's a Tie!";

    const opponentId: PlayerId = this.config.mode === 'AI' ? 'AI' : 'PLAYER_2';
    const p1Score = this.players.PLAYER_1.score;
    const opponentScore = this.players[opponentId].score;

    if (p1Score > opponentScore) {
      winnerId = 'PLAYER_1';
      winnerName = this.players.PLAYER_1.name;
    } else if (opponentScore > p1Score) {
      winnerId = opponentId;
      winnerName = this.players[opponentId].name;
    }

    this.result = {
      winnerId,
      winnerName,
      players: { ...this.players },
      totalTurns: this.turnNumber,
      totalTimeSeconds: this.totalElapsedSeconds,
      mode: this.config.mode,
      pairCount: this.config.pairCount,
      aiDifficulty: this.config.aiDifficulty,
      date: new Date().toISOString(),
      isNewHighScore: false,
    };

    this.notifyListeners();

    // Transition to RESULTS view after celebration
    setTimeout(() => {
      if (this.isDisposed) return;
      this.state = 'RESULTS';
      this.notifyListeners();
    }, 1200);
  }

  public pause(): void {
    if (this.state === 'PAUSED' || this.state === 'GAME_COMPLETE' || this.state === 'RESULTS') {
      return;
    }
    this.stateBeforePause = this.state;
    this.state = 'PAUSED';
    this.stopElapsedTimer();

    // Pause timers
    if (this.previewTimerId) clearTimeout(this.previewTimerId);
    if (this.mismatchTimerId) clearTimeout(this.mismatchTimerId);

    const aiCtrl = this.controllers.get('AI') as AIController | undefined;
    if (aiCtrl) aiCtrl.pause();

    this.notifyListeners();
  }

  public resume(): void {
    if (this.state !== 'PAUSED') return;
    this.state = this.stateBeforePause;
    this.startElapsedTimer();
    this.turnStartTimeMs = Date.now();

    if (this.state === 'AI_TURN') {
      const aiCtrl = this.controllers.get('AI') as AIController | undefined;
      if (aiCtrl) {
        if (this.flippedCardIndices.length === 0) {
          aiCtrl.requestFirstCardSelection(
            this.board.map((c) => ({ index: c.index, state: c.state }))
          );
        } else if (this.flippedCardIndices.length === 1) {
          const firstCard = this.board[this.flippedCardIndices[0]];
          aiCtrl.requestSecondCardSelection(
            this.board.map((c) => ({ index: c.index, state: c.state })),
            { index: firstCard.index, pairKey: firstCard.pairKey }
          );
        }
      }
    }

    this.notifyListeners();
  }

  public restart(): void {
    this.disposeTimers();
    this.flippedCardIndices = [];
    this.lastScoreAward = null;
    this.lastMoveWasMatch = null;
    this.turnNumber = 1;
    this.totalElapsedSeconds = 0;
    this.result = null;
    this.isPassDeviceRequired = false;

    // Reset player scores & stats
    Object.values(this.players).forEach((p) => {
      p.score = 0;
      p.pairsMatched = 0;
      p.moves = 0;
      p.currentCombo = 0;
      p.bestCombo = 0;
    });

    this.initializeControllers();
    this.setupBoard();
    this.start();
  }

  private startElapsedTimer(): void {
    this.stopElapsedTimer();
    this.elapsedTimerId = setInterval(() => {
      this.totalElapsedSeconds += 1;
      this.notifyListeners();
    }, 1000);
  }

  private stopElapsedTimer(): void {
    if (this.elapsedTimerId) {
      clearInterval(this.elapsedTimerId);
      this.elapsedTimerId = null;
    }
  }

  private disposeTimers(): void {
    this.stopElapsedTimer();
    if (this.previewTimerId) {
      clearTimeout(this.previewTimerId);
      this.previewTimerId = null;
    }
    if (this.mismatchTimerId) {
      clearTimeout(this.mismatchTimerId);
      this.mismatchTimerId = null;
    }
  }

  public subscribe(listener: SnapshotListener): () => void {
    this.listeners.add(listener);
    listener(this.getSnapshot());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    const snap = this.getSnapshot();
    for (const listener of this.listeners) {
      listener(snap);
    }
  }

  public getSnapshot(): GameEngineSnapshot {
    return {
      state: this.state,
      board: [...this.board],
      pairCount: this.config.pairCount,
      gridColumns: this.gridColumns,
      gridRows: this.gridRows,
      players: {
        PLAYER_1: { ...this.players.PLAYER_1 },
        PLAYER_2: { ...this.players.PLAYER_2 },
        AI: { ...this.players.AI },
      },
      activePlayerId: this.activePlayerId,
      flippedCardIndices: [...this.flippedCardIndices],
      lastScoreAward: this.lastScoreAward ? { ...this.lastScoreAward } : null,
      lastMoveWasMatch: this.lastMoveWasMatch,
      turnNumber: this.turnNumber,
      totalTimeSeconds: this.totalElapsedSeconds,
      config: { ...this.config },
      result: this.result ? { ...this.result } : null,
      isPassDeviceRequired: this.isPassDeviceRequired,
      passDeviceTargetName: this.passDeviceTargetName,
    };
  }

  public getController(playerId: PlayerId): PlayerController | undefined {
    return this.controllers.get(playerId);
  }

  public dispose(): void {
    this.isDisposed = true;
    this.disposeTimers();
    this.controllers.forEach((c) => c.dispose());
    this.controllers.clear();
    this.listeners.clear();
  }
}

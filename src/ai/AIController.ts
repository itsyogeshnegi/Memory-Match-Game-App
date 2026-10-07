// AI Controller
// Orchestrates AI turns, thinking delays, and automated card flips.

import { AIDifficulty, PlayerId } from '../types/game';
import { IGameEngine, PlayerController } from '../controllers/types';
import { AIMemory } from './AIMemory';
import { AIDecisionEngine, BoardCardStatus, FirstFlippedInfo } from './AIDecisionEngine';

export interface AIThinkingState {
  isThinking: boolean;
  step: 'WAITING_FIRST_CARD' | 'WAITING_SECOND_CARD' | 'IDLE';
  currentDelayMs: number;
}

export type AIThinkingCallback = (state: AIThinkingState) => void;

export class AIController implements PlayerController {
  public readonly id: PlayerId = 'AI';
  public readonly isAI: boolean = true;
  private memory: AIMemory;
  private decisionEngine: AIDecisionEngine;
  private engine: IGameEngine | null = null;
  private activeTimerId: any = null;
  private onThinkingStateChange: AIThinkingCallback | null = null;
  private isDisposed: boolean = false;
  private isTurnActive: boolean = false;

  constructor(
    difficulty: AIDifficulty,
    randomFn: () => number = Math.random,
    onThinkingChange?: AIThinkingCallback
  ) {
    this.memory = new AIMemory(difficulty, randomFn);
    this.decisionEngine = new AIDecisionEngine(this.memory, randomFn);
    this.onThinkingStateChange = onThinkingChange || null;
  }

  public getMemory(): AIMemory {
    return this.memory;
  }

  public setThinkingCallback(cb: AIThinkingCallback | null): void {
    this.onThinkingStateChange = cb;
  }

  private updateThinking(
    isThinking: boolean,
    step: AIThinkingState['step'],
    currentDelayMs: number = 0
  ): void {
    if (this.onThinkingStateChange) {
      this.onThinkingStateChange({ isThinking, step, currentDelayMs });
    }
  }

  public onTurnStart(engine: IGameEngine): void {
    this.engine = engine;
    this.isTurnActive = true;
    this.clearTimer();
  }

  public onTurnEnd(): void {
    this.isTurnActive = false;
    this.engine = null;
    this.clearTimer();
    this.updateThinking(false, 'IDLE');
  }

  /**
   * Called by the GameEngine when it is ready for AI to pick its first card.
   */
  public requestFirstCardSelection(boardStatuses: BoardCardStatus[]): void {
    if (!this.isTurnActive || !this.engine || this.isDisposed) return;

    this.clearTimer();
    const decision = this.decisionEngine.decideCardToFlip(boardStatuses, null);
    this.updateThinking(true, 'WAITING_FIRST_CARD', decision.delayMs);

    this.activeTimerId = setTimeout(() => {
      if (!this.isTurnActive || !this.engine || this.isDisposed) return;
      this.updateThinking(false, 'WAITING_FIRST_CARD');
      this.engine.flipCard(decision.cardIndex);
    }, decision.delayMs);
  }

  /**
   * Called by the GameEngine when the first card has been flipped and is visible.
   */
  public requestSecondCardSelection(
    boardStatuses: BoardCardStatus[],
    firstFlipped: FirstFlippedInfo
  ): void {
    if (!this.isTurnActive || !this.engine || this.isDisposed) return;

    this.clearTimer();
    const decision = this.decisionEngine.decideCardToFlip(boardStatuses, firstFlipped);
    this.updateThinking(true, 'WAITING_SECOND_CARD', decision.delayMs);

    this.activeTimerId = setTimeout(() => {
      if (!this.isTurnActive || !this.engine || this.isDisposed) return;
      this.updateThinking(false, 'IDLE');
      this.engine.flipCard(decision.cardIndex);
    }, decision.delayMs);
  }

  /**
   * Pauses any active timer if the game is paused.
   */
  public pause(): void {
    this.clearTimer();
    this.updateThinking(false, 'IDLE');
  }

  private clearTimer(): void {
    if (this.activeTimerId !== null) {
      clearTimeout(this.activeTimerId);
      this.activeTimerId = null;
    }
  }

  public dispose(): void {
    this.isDisposed = true;
    this.isTurnActive = false;
    this.clearTimer();
    this.updateThinking(false, 'IDLE');
    this.memory.clear();
    this.engine = null;
  }
}

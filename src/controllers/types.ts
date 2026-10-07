// Player Controller Interface

import { PlayerId } from '../types/game';

export interface IGameEngine {
  flipCard(cardIndex: number): boolean;
}

export interface PlayerController {
  readonly id: PlayerId;
  readonly isAI: boolean;
  onTurnStart(engine: IGameEngine): void;
  onTurnEnd(): void;
  dispose(): void;
}

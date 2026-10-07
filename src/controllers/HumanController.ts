// Human Player Controller

import { PlayerId } from '../types/game';
import { IGameEngine, PlayerController } from './types';

export class HumanController implements PlayerController {
  public readonly id: PlayerId;
  public readonly isAI: boolean = false;
  private currentEngine: IGameEngine | null = null;

  constructor(id: PlayerId) {
    this.id = id;
  }

  public onTurnStart(engine: IGameEngine): void {
    this.currentEngine = engine;
  }

  public onTurnEnd(): void {
    this.currentEngine = null;
  }

  public handleCardTap(index: number): boolean {
    if (!this.currentEngine) return false;
    return this.currentEngine.flipCard(index);
  }

  public dispose(): void {
    this.currentEngine = null;
  }
}

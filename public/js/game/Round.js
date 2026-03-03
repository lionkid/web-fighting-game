import { States } from './FighterStateMachine.js';

const ROUND_TIME = 99; // seconds
const COUNTDOWN_TICKS = 180; // 3 seconds
const ROUND_END_DELAY = 120; // 2 seconds

export const RoundPhase = {
  COUNTDOWN: 'COUNTDOWN',
  ACTIVE: 'ACTIVE',
  ROUND_END: 'ROUND_END',
};

export class Round {
  constructor(fighters) {
    this.fighters = fighters;
    this.phase = RoundPhase.COUNTDOWN;
    this.timer = ROUND_TIME;
    this.tickCount = 0;
    this.countdownTick = 0;
    this.endDelayTick = 0;
    this.winner = -1; // 0, 1, or -1 for draw
    this.message = '';
  }

  get countdown() {
    return Math.ceil((COUNTDOWN_TICKS - this.countdownTick) / 60);
  }

  get isOver() {
    return this.phase === RoundPhase.ROUND_END && this.endDelayTick >= ROUND_END_DELAY;
  }

  update() {
    this.tickCount++;

    if (this.phase === RoundPhase.COUNTDOWN) {
      this.countdownTick++;
      if (this.countdownTick >= COUNTDOWN_TICKS) {
        this.phase = RoundPhase.ACTIVE;
      }
      return;
    }

    if (this.phase === RoundPhase.ROUND_END) {
      this.endDelayTick++;
      return;
    }

    // ACTIVE phase
    // Decrement timer
    if (this.tickCount % 60 === 0 && this.timer > 0) {
      this.timer--;
    }

    // Check KO
    const f1KO = this.fighters[0].sm.state === States.KO;
    const f2KO = this.fighters[1].sm.state === States.KO;

    if (f1KO || f2KO || this.timer <= 0) {
      this.phase = RoundPhase.ROUND_END;
      this.endDelayTick = 0;

      if (f1KO && f2KO) {
        this.winner = -1;
        this.message = 'DOUBLE KO!';
      } else if (f1KO) {
        this.winner = 1;
        this.message = 'P2 WINS!';
      } else if (f2KO) {
        this.winner = 0;
        this.message = 'P1 WINS!';
      } else {
        // Time out - higher HP wins
        if (this.fighters[0].hp > this.fighters[1].hp) {
          this.winner = 0;
          this.message = 'TIME! P1 WINS!';
        } else if (this.fighters[1].hp > this.fighters[0].hp) {
          this.winner = 1;
          this.message = 'TIME! P2 WINS!';
        } else {
          this.winner = -1;
          this.message = 'TIME! DRAW!';
        }
      }
    }
  }
}

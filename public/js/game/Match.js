import { Round, RoundPhase } from './Round.js';

const WINS_NEEDED = 2;
const P1_START_X = 350;
const P2_START_X = 930;

export const MatchPhase = {
  COUNTDOWN: 'COUNTDOWN',
  ACTIVE: 'ACTIVE',
  ROUND_END: 'ROUND_END',
  MATCH_END: 'MATCH_END',
};

export class Match {
  constructor(fighters) {
    this.fighters = fighters;
    this.roundWins = [0, 0];
    this.currentRound = null;
    this.matchOver = false;
    this.matchWinner = -1;
    this.matchMessage = '';

    this.startNewRound();
  }

  startNewRound() {
    // Reset fighters
    this.fighters[0].reset(P1_START_X);
    this.fighters[1].reset(P2_START_X);
    this.fighters[0].facing = 1;
    this.fighters[1].facing = -1;

    this.currentRound = new Round(this.fighters);
  }

  get phase() {
    if (this.matchOver) return MatchPhase.MATCH_END;
    if (!this.currentRound) return MatchPhase.COUNTDOWN;

    const rp = this.currentRound.phase;
    if (rp === RoundPhase.COUNTDOWN) return MatchPhase.COUNTDOWN;
    if (rp === RoundPhase.ROUND_END) return MatchPhase.ROUND_END;
    return MatchPhase.ACTIVE;
  }

  get stateInfo() {
    if (this.matchOver) {
      return {
        phase: MatchPhase.MATCH_END,
        message: this.matchMessage,
      };
    }
    if (!this.currentRound) return { phase: MatchPhase.COUNTDOWN, countdown: 3 };

    const rp = this.currentRound.phase;
    if (rp === RoundPhase.COUNTDOWN) {
      return {
        phase: MatchPhase.COUNTDOWN,
        countdown: this.currentRound.countdown,
      };
    }
    if (rp === RoundPhase.ROUND_END) {
      return {
        phase: MatchPhase.ROUND_END,
        message: this.currentRound.message,
      };
    }
    return { phase: MatchPhase.ACTIVE };
  }

  get timer() {
    return this.currentRound ? this.currentRound.timer : 99;
  }

  get isActive() {
    return this.currentRound?.phase === RoundPhase.ACTIVE && !this.matchOver;
  }

  update() {
    if (this.matchOver || !this.currentRound) return;

    this.currentRound.update();

    if (this.currentRound.isOver) {
      // Record round result
      if (this.currentRound.winner >= 0) {
        this.roundWins[this.currentRound.winner]++;
      }

      // Check match win
      if (this.roundWins[0] >= WINS_NEEDED) {
        this.matchOver = true;
        this.matchWinner = 0;
        this.matchMessage = 'P1 WINS THE MATCH!';
      } else if (this.roundWins[1] >= WINS_NEEDED) {
        this.matchOver = true;
        this.matchWinner = 1;
        this.matchMessage = 'P2 WINS THE MATCH!';
      } else {
        this.startNewRound();
      }
    }
  }

  restart() {
    this.roundWins = [0, 0];
    this.matchOver = false;
    this.matchWinner = -1;
    this.matchMessage = '';
    this.startNewRound();
  }
}

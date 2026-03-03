export const States = {
  IDLE: 'idle',
  WALK: 'walk',
  JUMP: 'jump',
  ATTACK: 'attack',
  BLOCK: 'block',
  HITSTUN: 'hitstun',
  BLOCKSTUN: 'blockstun',
  KO: 'ko',
};

const TRANSITIONS = {
  [States.IDLE]:      [States.WALK, States.JUMP, States.ATTACK, States.BLOCK, States.HITSTUN, States.KO],
  [States.WALK]:      [States.IDLE, States.JUMP, States.ATTACK, States.BLOCK, States.HITSTUN, States.KO],
  [States.JUMP]:      [States.IDLE, States.ATTACK, States.HITSTUN, States.KO],
  [States.ATTACK]:    [States.IDLE, States.HITSTUN, States.KO],
  [States.BLOCK]:     [States.IDLE, States.BLOCKSTUN, States.HITSTUN, States.KO],
  [States.HITSTUN]:   [States.IDLE, States.KO],
  [States.BLOCKSTUN]: [States.IDLE, States.KO],
  [States.KO]:        [],
};

export class FighterStateMachine {
  constructor() {
    this.state = States.IDLE;
    this.stateTimer = 0;
    this.attackPhase = null;    // 'startup' | 'active' | 'recovery'
    this.attackData = null;
    this.hasHit = false;        // prevent multi-hit per attack
  }

  canTransition(newState) {
    return TRANSITIONS[this.state]?.includes(newState) ?? false;
  }

  transition(newState) {
    if (!this.canTransition(newState)) return false;
    this.state = newState;
    this.stateTimer = 0;
    if (newState !== States.ATTACK) {
      this.attackPhase = null;
      this.attackData = null;
      this.hasHit = false;
    }
    return true;
  }

  forceState(newState) {
    this.state = newState;
    this.stateTimer = 0;
    this.attackPhase = null;
    this.attackData = null;
    this.hasHit = false;
  }

  tick() {
    this.stateTimer++;
  }

  startAttack(attackData) {
    if (!this.canTransition(States.ATTACK)) return false;
    this.state = States.ATTACK;
    this.stateTimer = 0;
    this.attackPhase = 'startup';
    this.attackData = attackData;
    this.hasHit = false;
    return true;
  }

  updateAttack() {
    if (this.state !== States.ATTACK || !this.attackData) return;

    const { startup, active, recovery } = this.attackData;
    const t = this.stateTimer;

    if (t < startup) {
      this.attackPhase = 'startup';
    } else if (t < startup + active) {
      this.attackPhase = 'active';
    } else if (t < startup + active + recovery) {
      this.attackPhase = 'recovery';
    } else {
      this.transition(States.IDLE);
    }
  }

  get isGroundActionable() {
    return this.state === States.IDLE || this.state === States.WALK;
  }

  get isAttackActive() {
    return this.state === States.ATTACK && this.attackPhase === 'active';
  }
}

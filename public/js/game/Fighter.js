import { FighterStateMachine, States } from './FighterStateMachine.js';
import { FIGHTER_DEFAULTS, ATTACKS } from './FighterData.js';
import { GROUND_Y, STAGE_LEFT, STAGE_RIGHT } from '../rendering/Renderer.js';

export class Fighter {
  constructor(playerIndex, startX) {
    this.playerIndex = playerIndex;
    this.x = startX;
    this.y = GROUND_Y;
    this.prevX = startX;
    this.prevY = GROUND_Y;
    this.vx = 0;
    this.vy = 0;
    this.width = FIGHTER_DEFAULTS.width;
    this.height = FIGHTER_DEFAULTS.height;
    this.facing = playerIndex === 0 ? 1 : -1;
    this.hp = FIGHTER_DEFAULTS.maxHP;
    this.maxHP = FIGHTER_DEFAULTS.maxHP;
    this.sm = new FighterStateMachine();
    this._stunDuration = 0;

    // Blocking
    this.blockZone = null;  // 'up', 'mid', 'down'

    // Combo/special
    this.chargeTimer = 0;
    this.comboCount = 0;
    this.comboTimer = 0;

    // Projectiles owned by this fighter
    this.projectiles = [];

    // Visual feedback
    this.hitFlashTimer = 0;
    this.damagePreview = 0;
    this.damagePreviewTimer = 0;
  }

  get onGround() {
    return this.y >= GROUND_Y;
  }

  get hurtbox() {
    return {
      x: this.x - this.width / 2,
      y: this.y - this.height,
      w: this.width,
      h: this.height,
    };
  }

  get activeHitbox() {
    if (!this.sm.isAttackActive || !this.sm.attackData) return null;
    const hb = this.sm.attackData.hitbox;
    return {
      x: this.x + hb.xOff * this.facing - (this.facing === -1 ? hb.w : 0),
      y: this.y + hb.yOff,
      w: hb.w,
      h: hb.h,
    };
  }

  handleInput(input) {
    if (this.sm.state === States.KO) return;

    // Block
    if (input.block && this.sm.isGroundActionable && this.onGround) {
      this.sm.transition(States.BLOCK);
      // Block zone follows directional input
      if (input.down) this.blockZone = 'down';
      else if (input.up) this.blockZone = 'up';
      else this.blockZone = 'mid';
      return;
    }
    if (this.sm.state === States.BLOCK && input.block) {
      if (input.down) this.blockZone = 'down';
      else if (input.up) this.blockZone = 'up';
      else this.blockZone = 'mid';
      return;
    }
    if (this.sm.state === States.BLOCK && !input.block) {
      this.sm.transition(States.IDLE);
    }

    // Can't act during hitstun/blockstun/attack
    if (this.sm.state === States.HITSTUN || this.sm.state === States.BLOCKSTUN) return;
    if (this.sm.state === States.ATTACK) return;

    // Attacks
    if (input.attackUp) {
      this.sm.startAttack(ATTACKS.up);
      return;
    }
    if (input.attackMid) {
      this.sm.startAttack(ATTACKS.mid);
      return;
    }
    if (input.attackDown) {
      this.sm.startAttack(ATTACKS.down);
      return;
    }

    // Jump
    if (input.up && this.onGround) {
      this.sm.transition(States.JUMP);
      this.vy = FIGHTER_DEFAULTS.jumpVelocity;
      return;
    }

    // Walk
    if (input.left || input.right) {
      if (this.sm.isGroundActionable) {
        this.sm.transition(States.WALK);
      }
      if (input.left) this.vx = -FIGHTER_DEFAULTS.walkSpeed;
      if (input.right) this.vx = FIGHTER_DEFAULTS.walkSpeed;
    } else if (this.sm.state === States.WALK) {
      this.sm.transition(States.IDLE);
    }
  }

  update() {
    this.prevX = this.x;
    this.prevY = this.y;

    // State machine tick
    this.sm.tick();
    this.sm.updateAttack();

    // Hitstun/blockstun expiry
    if (this.sm.state === States.HITSTUN && this.sm.stateTimer >= this._stunDuration) {
      this.sm.transition(States.IDLE);
    }
    if (this.sm.state === States.BLOCKSTUN && this.sm.stateTimer >= this._stunDuration) {
      this.sm.transition(States.IDLE);
    }

    // Physics
    if (!this.onGround) {
      this.vy += FIGHTER_DEFAULTS.gravity;
    }

    this.x += this.vx;
    this.y += this.vy;

    // Ground collision
    if (this.y >= GROUND_Y) {
      this.y = GROUND_Y;
      this.vy = 0;
      if (this.sm.state === States.JUMP) {
        this.sm.transition(States.IDLE);
      }
    }

    // Stage boundaries
    const halfW = this.width / 2;
    if (this.x - halfW < STAGE_LEFT) this.x = STAGE_LEFT + halfW;
    if (this.x + halfW > STAGE_RIGHT) this.x = STAGE_RIGHT - halfW;

    // Friction on ground
    if (this.onGround && this.sm.state !== States.WALK) {
      this.vx *= FIGHTER_DEFAULTS.friction;
      if (Math.abs(this.vx) < 0.1) this.vx = 0;
    }

    // Combo timer decay
    if (this.comboTimer > 0) {
      this.comboTimer--;
      if (this.comboTimer <= 0) this.comboCount = 0;
    }

    // Visual timers
    if (this.hitFlashTimer > 0) this.hitFlashTimer--;
    if (this.damagePreviewTimer > 0) {
      this.damagePreviewTimer--;
      if (this.damagePreviewTimer <= 0) this.damagePreview = 0;
    }

    // Update projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.x += p.vx;
      p.lifetime--;
      if (p.lifetime <= 0 || p.x < STAGE_LEFT - 50 || p.x > STAGE_RIGHT + 50) {
        this.projectiles.splice(i, 1);
      }
    }
  }

  takeDamage(damage, knockbackDir, knockback, hitstun) {
    this.hp -= damage;
    this._stunDuration = hitstun;
    this.vx = knockbackDir * knockback;

    this.hitFlashTimer = 6;
    this.damagePreview = damage;
    this.damagePreviewTimer = 60;

    if (this.hp <= 0) {
      this.hp = 0;
      this.sm.forceState(States.KO);
      this.vx = knockbackDir * knockback * 1.5;
      this.vy = -8;
    } else {
      this.sm.forceState(States.HITSTUN);
    }
  }

  takeBlockDamage(chipDamage, knockbackDir, blockstun) {
    this.hp -= chipDamage;
    this._stunDuration = blockstun;
    this.vx = knockbackDir * 2;
    this.sm.forceState(States.BLOCKSTUN);

    if (this.hp <= 0) {
      this.hp = 0;
      this.sm.forceState(States.KO);
    }
  }

  updateFacing(opponent) {
    if (this.sm.state === States.ATTACK || this.sm.state === States.HITSTUN) return;
    this.facing = opponent.x > this.x ? 1 : -1;
  }

  reset(startX) {
    this.x = startX;
    this.y = GROUND_Y;
    this.prevX = startX;
    this.prevY = GROUND_Y;
    this.vx = 0;
    this.vy = 0;
    this.hp = this.maxHP;
    this.sm.forceState(States.IDLE);
    this._stunDuration = 0;
    this.blockZone = null;
    this.chargeTimer = 0;
    this.comboCount = 0;
    this.comboTimer = 0;
    this.projectiles = [];
    this.hitFlashTimer = 0;
    this.damagePreview = 0;
    this.damagePreviewTimer = 0;
  }
}

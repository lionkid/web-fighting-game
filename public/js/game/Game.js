import { Fighter } from './Fighter.js';
import { CombatSystem } from './CombatSystem.js';
import { PhysicsSystem } from './PhysicsSystem.js';
import { ComboDetector } from './ComboDetector.js';
import { Match, MatchPhase } from './Match.js';
import { ATTACKS, CHARGE_LEVELS } from './FighterData.js';
import { States } from './FighterStateMachine.js';

export class Game {
  constructor(inputManager) {
    this.inputManager = inputManager;
    this.fighters = [new Fighter(0, 350), new Fighter(1, 930)];
    this.combat = new CombatSystem();
    this.physics = new PhysicsSystem();
    this.comboDetectors = [new ComboDetector(), new ComboDetector()];
    this.match = new Match(this.fighters);
    this.debugHitboxes = false;
    this.tick = 0;

    // Charge tracking
    this.chargeState = [
      { charging: false, attackZone: null, timer: 0 },
      { charging: false, attackZone: null, timer: 0 },
    ];

    // Projectile spawn queue (avoids setTimeout in game logic)
    this.projectileQueue = [];

    // Restart listener
    this._onRestart = (e) => {
      if (e.code === 'Enter' && this.match.matchOver) {
        this.match.restart();
        this.comboDetectors.forEach(cd => cd.reset());
        this.chargeState = [
          { charging: false, attackZone: null, timer: 0 },
          { charging: false, attackZone: null, timer: 0 },
        ];
        this.projectileQueue = [];
      }
      if (e.code === 'Backquote') {
        this.debugHitboxes = !this.debugHitboxes;
      }
    };
    window.addEventListener('keydown', this._onRestart);
  }

  update(dt) {
    this.tick++;
    this.match.update();

    if (!this.match.isActive) return { hitEvents: [] };

    // Process projectile spawn queue
    for (let i = this.projectileQueue.length - 1; i >= 0; i--) {
      const pq = this.projectileQueue[i];
      pq.delay--;
      if (pq.delay <= 0) {
        const f = pq.fighter;
        if (f.sm.state !== States.KO) {
          f.projectiles.push({
            x: f.x + 40 * f.facing,
            y: f.y - 70,
            vx: pq.data.speed * f.facing,
            w: pq.data.hitbox.w,
            h: pq.data.hitbox.h,
            damage: pq.data.damage,
            zone: pq.data.zone,
            knockback: pq.data.knockback,
            hitstun: pq.data.hitstun,
            blockstun: pq.data.blockstun,
            chipDamage: pq.data.chipDamage,
            lifetime: pq.data.active,
          });
        }
        this.projectileQueue.splice(i, 1);
      }
    }

    // Poll inputs
    for (let i = 0; i < 2; i++) {
      const input = this.inputManager.poll(i);
      const fighter = this.fighters[i];

      // Record inputs for combo detection
      this.comboDetectors[i].record(input, fighter.facing, this.tick);

      // Check special moves first
      const special = this.comboDetectors[i].checkSpecial(input, this.tick);
      if (special && fighter.sm.isGroundActionable) {
        this._executeSpecial(fighter, special);
        continue;
      }

      // Charge attack handling
      if (input.special && (input.attackUp || input.attackMid || input.attackDown) && !this.chargeState[i].charging) {
        const zone = input.attackUp ? 'up' : input.attackMid ? 'mid' : 'down';
        this.chargeState[i] = { charging: true, attackZone: zone, timer: 0 };
        continue;
      }
      if (this.chargeState[i].charging) {
        if (input.special) {
          this.chargeState[i].timer++;
          continue;
        } else {
          this._releaseCharged(fighter, this.chargeState[i]);
          this.chargeState[i] = { charging: false, attackZone: null, timer: 0 };
          continue;
        }
      }

      fighter.handleInput(input);
    }

    // Update fighters
    for (const f of this.fighters) {
      f.update();
    }

    // Auto-face opponent
    this.fighters[0].updateFacing(this.fighters[1]);
    this.fighters[1].updateFacing(this.fighters[0]);

    // Push collision
    this.physics.resolvePushCollision(this.fighters[0], this.fighters[1]);

    // Combat checks
    this.combat.checkHit(this.fighters[0], this.fighters[1]);
    this.combat.checkHit(this.fighters[1], this.fighters[0]);

    // Projectile checks
    this.combat.checkProjectileHits(this.fighters[0], this.fighters[1]);
    this.combat.checkProjectileHits(this.fighters[1], this.fighters[0]);

    const hitEvents = this.combat.flushEvents();
    return { hitEvents };
  }

  _executeSpecial(fighter, special) {
    const data = special.data;
    if (data.type === 'projectile') {
      fighter.sm.startAttack({
        startup: data.startup,
        active: 1,
        recovery: data.recovery,
        damage: 0,
        zone: data.zone,
        hitbox: { xOff: 999, yOff: 999, w: 0, h: 0 },
      });
      this.projectileQueue.push({
        fighter,
        data,
        delay: data.startup,
      });
    } else {
      fighter.sm.startAttack(data);
    }
  }

  _releaseCharged(fighter, chargeState) {
    if (!fighter.sm.isGroundActionable) return;

    const baseAttack = ATTACKS[chargeState.attackZone];
    if (!baseAttack) return;

    // Determine charge level
    let multiplier = 1;
    let unblockable = false;
    for (let i = CHARGE_LEVELS.length - 1; i >= 0; i--) {
      if (chargeState.timer >= CHARGE_LEVELS[i].time) {
        multiplier = CHARGE_LEVELS[i].multiplier;
        unblockable = CHARGE_LEVELS[i].unblockable || false;
        break;
      }
    }

    // Create charged version of the attack
    const chargedAttack = {
      ...baseAttack,
      damage: Math.round(baseAttack.damage * multiplier),
      knockback: baseAttack.knockback * (1 + (multiplier - 1) * 0.5),
      unblockable,
      // Slightly longer startup for charged attacks
      startup: baseAttack.startup + 4,
    };

    fighter.sm.startAttack(chargedAttack);
  }

  get state() {
    return {
      fighters: this.fighters,
      roundWins: this.match.roundWins,
      timer: this.match.timer,
      matchState: this.match.stateInfo,
      debugHitboxes: this.debugHitboxes,
    };
  }
}

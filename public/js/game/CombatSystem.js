import { States } from './FighterStateMachine.js';

export class CombatSystem {
  constructor() {
    this.hitEvents = []; // collected per tick for effects
  }

  aabbOverlap(a, b) {
    return a.x < b.x + b.w &&
           a.x + a.w > b.x &&
           a.y < b.y + b.h &&
           a.y + a.h > b.y;
  }

  checkHit(attacker, defender) {
    if (attacker.sm.state !== States.ATTACK) return;
    if (!attacker.sm.isAttackActive) return;
    if (attacker.sm.hasHit) return;

    const hitbox = attacker.activeHitbox;
    if (!hitbox) return;

    const hurtbox = defender.hurtbox;
    if (!this.aabbOverlap(hitbox, hurtbox)) return;

    // Hit connected
    attacker.sm.hasHit = true;
    const atk = attacker.sm.attackData;
    const knockbackDir = attacker.facing;

    // Check blocking
    if (defender.sm.state === States.BLOCK && !atk.unblockable) {
      if (defender.blockZone === atk.zone) {
        // Correct block — chip damage
        defender.takeBlockDamage(atk.chipDamage, knockbackDir, atk.blockstun);
        this.hitEvents.push({
          type: 'block',
          x: (hitbox.x + hitbox.w / 2),
          y: (hitbox.y + hitbox.h / 2),
          zone: atk.zone,
        });
        return;
      }
      // Wrong zone block — full damage
    }

    // Full hit
    defender.takeDamage(atk.damage, knockbackDir, atk.knockback, atk.hitstun);

    // Launch for uppercut-type attacks
    if (atk.launchVelocity) {
      defender.vy = atk.launchVelocity;
    }

    // Combo tracking
    attacker.comboCount++;
    attacker.comboTimer = 90; // 1.5 seconds to continue combo

    this.hitEvents.push({
      type: 'hit',
      x: (hitbox.x + hitbox.w / 2),
      y: (hitbox.y + hitbox.h / 2),
      damage: atk.damage,
      zone: atk.zone,
      combo: attacker.comboCount,
    });
  }

  checkProjectileHits(attacker, defender) {
    for (let i = attacker.projectiles.length - 1; i >= 0; i--) {
      const p = attacker.projectiles[i];
      const projBox = { x: p.x - p.w / 2, y: p.y - p.h / 2, w: p.w, h: p.h };
      const hurtbox = defender.hurtbox;

      if (this.aabbOverlap(projBox, hurtbox)) {
        const knockbackDir = p.vx > 0 ? 1 : -1;

        if (defender.sm.state === States.BLOCK && defender.blockZone === p.zone) {
          defender.takeBlockDamage(p.chipDamage, knockbackDir, p.blockstun);
          this.hitEvents.push({ type: 'block', x: p.x, y: p.y, zone: p.zone });
        } else {
          defender.takeDamage(p.damage, knockbackDir, p.knockback, p.hitstun);
          this.hitEvents.push({ type: 'hit', x: p.x, y: p.y, damage: p.damage, zone: p.zone, combo: 0 });
        }

        attacker.projectiles.splice(i, 1);
      }
    }
  }

  flushEvents() {
    const events = this.hitEvents;
    this.hitEvents = [];
    return events;
  }
}

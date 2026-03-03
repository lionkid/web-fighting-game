// Frame data is in ticks (1 tick = 1/60s)
// hitbox offsets are relative to fighter position (center-bottom)

export const FIGHTER_DEFAULTS = {
  width: 60,
  height: 120,
  walkSpeed: 5,
  jumpVelocity: -14,
  maxHP: 1000,
  gravity: 0.6,
  friction: 0.85,
  pushback: 4,
};

// Attacks: { startup, active, recovery, damage, zone, hitbox, knockback, hitstun, blockstun, chipDamage }
export const ATTACKS = {
  up: {
    startup: 12,
    active: 4,
    recovery: 18,
    damage: 150,
    zone: 'up',
    hitbox: { xOff: 30, yOff: -110, w: 60, h: 40 },
    knockback: 6,
    hitstun: 20,
    blockstun: 12,
    chipDamage: 20,
  },
  mid: {
    startup: 7,
    active: 4,
    recovery: 12,
    damage: 100,
    zone: 'mid',
    hitbox: { xOff: 25, yOff: -80, w: 65, h: 35 },
    knockback: 5,
    hitstun: 15,
    blockstun: 8,
    chipDamage: 12,
  },
  down: {
    startup: 4,
    active: 3,
    recovery: 8,
    damage: 60,
    zone: 'down',
    hitbox: { xOff: 20, yOff: -35, w: 70, h: 30 },
    knockback: 3,
    hitstun: 10,
    blockstun: 6,
    chipDamage: 8,
  },
};

// Special moves: input sequences (directions relative to facing opponent)
export const SPECIAL_MOVES = {
  fireball: {
    sequence: ['down', 'forward', 'attackMid'],
    startup: 15,
    active: 60,   // projectile lifetime
    recovery: 12,
    damage: 120,
    zone: 'mid',
    type: 'projectile',
    speed: 8,
    hitbox: { xOff: 40, yOff: -70, w: 40, h: 30 },
    knockback: 7,
    hitstun: 18,
    blockstun: 10,
    chipDamage: 15,
  },
  uppercut: {
    sequence: ['forward', 'down', 'forward', 'attackUp'],
    startup: 5,
    active: 8,
    recovery: 24,
    damage: 200,
    zone: 'up',
    type: 'melee',
    hitbox: { xOff: 20, yOff: -130, w: 50, h: 60 },
    knockback: 10,
    hitstun: 25,
    blockstun: 15,
    chipDamage: 25,
    launchVelocity: -12,
  },
  sweep: {
    sequence: ['down', 'back', 'attackDown'],
    startup: 8,
    active: 5,
    recovery: 18,
    damage: 90,
    zone: 'down',
    type: 'melee',
    hitbox: { xOff: 15, yOff: -20, w: 80, h: 25 },
    knockback: 4,
    hitstun: 30,  // knockdown
    blockstun: 10,
    chipDamage: 10,
  },
};

// Charged attack multipliers
export const CHARGE_LEVELS = [
  { time: 30, multiplier: 1.5 },   // 0.5s
  { time: 60, multiplier: 2.0 },   // 1.0s
  { time: 90, multiplier: 3.0, unblockable: true }, // 1.5s
];

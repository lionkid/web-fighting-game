// Phase 2: State serialization for network sync
export class StateSync {
  static serializeInput(input) {
    // Pack booleans into a single byte for efficiency
    let flags = 0;
    if (input.left) flags |= 1;
    if (input.right) flags |= 2;
    if (input.up) flags |= 4;
    if (input.down) flags |= 8;
    if (input.attackUp) flags |= 16;
    if (input.attackMid) flags |= 32;
    if (input.attackDown) flags |= 64;
    if (input.block) flags |= 128;
    if (input.special) flags |= 256;
    return flags;
  }

  static deserializeInput(flags) {
    return {
      left: !!(flags & 1),
      right: !!(flags & 2),
      up: !!(flags & 4),
      down: !!(flags & 8),
      attackUp: !!(flags & 16),
      attackMid: !!(flags & 32),
      attackDown: !!(flags & 64),
      block: !!(flags & 128),
      special: !!(flags & 256),
    };
  }

  static serializeFighter(fighter) {
    return {
      x: Math.round(fighter.x),
      y: Math.round(fighter.y),
      vx: Math.round(fighter.vx * 10) / 10,
      vy: Math.round(fighter.vy * 10) / 10,
      hp: fighter.hp,
      state: fighter.sm.state,
      facing: fighter.facing,
    };
  }
}

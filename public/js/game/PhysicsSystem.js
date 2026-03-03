import { FIGHTER_DEFAULTS } from './FighterData.js';

export class PhysicsSystem {
  // Push fighters apart so they can't overlap
  resolvePushCollision(f1, f2) {
    const halfW1 = f1.width / 2;
    const halfW2 = f2.width / 2;
    const minDist = halfW1 + halfW2;

    const dx = f2.x - f1.x;
    const overlap = minDist - Math.abs(dx);

    if (overlap > 0) {
      // Only push if they're vertically overlapping
      const topA = f1.y - f1.height;
      const topB = f2.y - f2.height;
      const vertOverlap = !(f1.y < topB || f2.y < topA);

      if (vertOverlap) {
        const push = overlap / 2;
        if (dx > 0) {
          f1.x -= push;
          f2.x += push;
        } else {
          f1.x += push;
          f2.x -= push;
        }
      }
    }
  }
}

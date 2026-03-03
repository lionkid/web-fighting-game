import { SPECIAL_MOVES } from './FighterData.js';

const INPUT_WINDOW = 30; // ticks

export class ComboDetector {
  constructor() {
    this.history = []; // { direction, tick }
  }

  record(input, facing, tick) {
    // Translate to relative directions (forward/back based on facing)
    if (input.down) this.history.push({ dir: 'down', tick });
    if (input.left) {
      this.history.push({ dir: facing === 1 ? 'back' : 'forward', tick });
    }
    if (input.right) {
      this.history.push({ dir: facing === -1 ? 'back' : 'forward', tick });
    }

    // Trim old entries
    this.history = this.history.filter(h => tick - h.tick < INPUT_WINDOW);
  }

  checkSpecial(input, tick) {
    // Check attack triggers
    let attackType = null;
    if (input.attackUp) attackType = 'attackUp';
    else if (input.attackMid) attackType = 'attackMid';
    else if (input.attackDown) attackType = 'attackDown';

    if (!attackType) return null;

    // Try to match each special
    for (const [name, special] of Object.entries(SPECIAL_MOVES)) {
      const seq = special.sequence;
      // Last element should match the attack
      if (seq[seq.length - 1] !== attackType) continue;

      // Check if preceding directions exist in order within the window
      const dirs = seq.slice(0, -1);
      if (this._matchSequence(dirs, tick)) {
        this.history = []; // consume
        return { name, data: special };
      }
    }

    return null;
  }

  _matchSequence(dirs, tick) {
    const recent = this.history.filter(h => tick - h.tick < INPUT_WINDOW);
    let searchFrom = 0;

    for (const dir of dirs) {
      let found = false;
      for (let i = searchFrom; i < recent.length; i++) {
        if (recent[i].dir === dir) {
          searchFrom = i + 1;
          found = true;
          break;
        }
      }
      if (!found) return false;
    }
    return true;
  }

  reset() {
    this.history = [];
  }
}

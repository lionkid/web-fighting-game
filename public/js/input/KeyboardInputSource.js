export class KeyboardInputSource {
  constructor(keyMap) {
    this.keyMap = keyMap;
    this.keysDown = new Set();
    this.keysPressed = new Set();

    this._onKeyDown = (e) => {
      if (Object.values(this.keyMap).includes(e.code)) {
        e.preventDefault();
        if (!this.keysDown.has(e.code)) {
          this.keysPressed.add(e.code);
        }
        this.keysDown.add(e.code);
      }
    };

    this._onKeyUp = (e) => {
      if (Object.values(this.keyMap).includes(e.code)) {
        e.preventDefault();
        this.keysDown.delete(e.code);
      }
    };

    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);
  }

  poll() {
    const snapshot = {
      left: this.keysDown.has(this.keyMap.left),
      right: this.keysDown.has(this.keyMap.right),
      up: this.keysPressed.has(this.keyMap.up),
      down: this.keysDown.has(this.keyMap.down),
      attackUp: this.keysPressed.has(this.keyMap.attackUp),
      attackMid: this.keysPressed.has(this.keyMap.attackMid),
      attackDown: this.keysPressed.has(this.keyMap.attackDown),
      block: this.keysDown.has(this.keyMap.block),
      special: this.keysDown.has(this.keyMap.special),
    };

    // consume edge-triggered inputs
    this.keysPressed.clear();
    return snapshot;
  }

  destroy() {
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup', this._onKeyUp);
  }
}

// P1: WASD + R/T/Y attacks + F block + G special
export const P1_KEYS = {
  left: 'KeyA',
  right: 'KeyD',
  up: 'KeyW',
  down: 'KeyS',
  attackUp: 'KeyR',
  attackMid: 'KeyT',
  attackDown: 'KeyY',
  block: 'KeyF',
  special: 'KeyG',
};

// P2: Arrows + Numpad 7/8/9 attacks + Numpad 4 block + Numpad 5 special
export const P2_KEYS = {
  left: 'ArrowLeft',
  right: 'ArrowRight',
  up: 'ArrowUp',
  down: 'ArrowDown',
  attackUp: 'Numpad7',
  attackMid: 'Numpad8',
  attackDown: 'Numpad9',
  block: 'Numpad4',
  special: 'Numpad5',
};
